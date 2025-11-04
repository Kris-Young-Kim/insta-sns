/**
 * @file lib/utils/api-client.ts
 * @description API 호출 유틸리티 함수
 * 
 * 타임아웃, 에러 처리, 네트워크 오류 등을 포함한 안전한 API 호출 함수입니다.
 */

import { extractApiError, getErrorMessage, isNetworkError } from "./error-handler";

const DEFAULT_TIMEOUT = 10000; // 10초

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * 안전한 API 요청 함수
 * 
 * @param url - 요청 URL
 * @param options - fetch 옵션 및 타임아웃 설정
 * @returns 성공 시 { success: true, data: T }, 실패 시 { success: false, error: string }
 */
export async function apiRequest<T>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // 타임아웃이 설정된 경우 AbortSignal 추가
    const fetchOptions: RequestInit = {
      ...options,
      signal: controller.signal,
    };

    // 타임아웃 관련 옵션 제거 (fetch는 timeout을 지원하지 않음)
    delete (fetchOptions as { timeout?: number }).timeout;

    console.log("API 요청 시작:", { url, method: options?.method || "GET" });

    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);

    // JSON 파싱 시도
    let data: unknown;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // JSON이 아닌 경우 빈 객체로 처리
        data = {};
      }
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError);
      return {
        success: false,
        error: "서버 응답을 처리할 수 없습니다. 서버 오류가 발생했을 수 있습니다.",
      };
    }

    // 응답이 성공적이지 않은 경우
    if (!response.ok) {
      const errorMessage = extractApiError(response, data);
      console.error("API 에러 응답:", { status: response.status, error: errorMessage });
      return {
        success: false,
        error: errorMessage,
      };
    }

    // API 응답 구조 확인
    if (data && typeof data === "object" && "error" in data) {
      // API가 { error: "..." } 형식으로 응답한 경우
      const errorMessage = String(data.error);
      console.error("API 에러 응답:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // 성공 응답 처리
    if (data && typeof data === "object" && "success" in data) {
      // { success: true, data: T } 형식
      if (data.success === true && "data" in data) {
        console.log("API 요청 성공:", { url });
        return {
          success: true,
          data: data.data as T,
        };
      }

      // { success: false, error: "..." } 형식
      if (data.success === false && "error" in data) {
        return {
          success: false,
          error: String(data.error),
        };
      }

      // { success: true } 형식이지만 data가 없는 경우 (성공 응답)
      if (data.success === true) {
        console.log("API 요청 성공:", { url });
        return {
          success: true,
          data: data as T,
        };
      }
    }

    // 기타 성공 응답 (data가 직접 전달되는 경우)
    console.log("API 요청 성공:", { url });
    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortError (타임아웃)
    if (error instanceof Error && error.name === "AbortError") {
      console.error("API 요청 타임아웃:", { url, timeout });
      return {
        success: false,
        error: "요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.",
      };
    }

    // 네트워크 오류
    if (isNetworkError(error)) {
      console.error("네트워크 오류:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }

    // 기타 오류
    console.error("API 요청 오류:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * GET 요청 헬퍼 함수
 */
export async function apiGet<T>(
  url: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: "GET" });
}

/**
 * POST 요청 헬퍼 함수
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청 헬퍼 함수
 */
export async function apiDelete<T>(
  url: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: "DELETE" });
}

