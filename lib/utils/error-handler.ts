/**
 * @file lib/utils/error-handler.ts
 * @description 에러 핸들링 유틸리티
 * 
 * 네트워크 오류, 권한 오류, 빈 데이터 등 예외 상황을 처리하고
 * 사용자 친화적인 메시지를 제공합니다.
 */

/**
 * 에러 타입을 구분하여 사용자 친화적인 메시지 반환
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 타임아웃 오류
    if (
      error.name === "AbortError" ||
      error.message.includes("timeout") ||
      error.message.includes("시간이 초과")
    ) {
      return "요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.";
    }

    // 네트워크 오류
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      return "네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.";
    }

    // JSON 파싱 오류
    if (
      error.message.includes("JSON") ||
      error.message.includes("parse") ||
      error.message.includes("Unexpected token") ||
      error.message.includes("invalid json")
    ) {
      return "서버 응답을 처리할 수 없습니다. 서버 오류가 발생했을 수 있습니다.";
    }

    // 권한 오류
    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("인증") ||
      error.message.includes("권한")
    ) {
      return "로그인이 필요합니다. 다시 로그인해주세요.";
    }

    // 404 오류
    if (error.message.includes("404") || error.message.includes("찾을 수 없")) {
      return "요청한 내용을 찾을 수 없습니다.";
    }

    // 500 오류
    if (error.message.includes("500") || error.message.includes("서버")) {
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    // 기타 에러 메시지 반환
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

/**
 * API 응답에서 에러 추출
 */
export function extractApiError(response: Response, data?: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    return String(data.error);
  }

  switch (response.status) {
    case 401:
      return "로그인이 필요합니다.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청한 내용을 찾을 수 없습니다.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 네트워크 오류 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    );
  }
  return false;
}

/**
 * 타임아웃 오류 확인
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === "AbortError" ||
      error.message.includes("timeout") ||
      error.message.includes("시간이 초과")
    );
  }
  return false;
}

/**
 * JSON 파싱 오류 확인
 */
export function isJsonParseError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("JSON") ||
      error.message.includes("parse") ||
      error.message.includes("Unexpected token") ||
      error.message.includes("invalid json")
    );
  }
  return false;
}

/**
 * 권한 오류 확인
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Unauthorized") ||
      error.message.includes("인증") ||
      error.message.includes("권한") ||
      error.message.includes("401") ||
      error.message.includes("403")
    );
  }
  return false;
}

