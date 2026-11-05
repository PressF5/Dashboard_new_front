const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("Не задана переменная NEXT_PUBLIC_API_BASE_URL");
}

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : null;
}

/**
 * Получение CSRF-токена.
 */
async function getCsrfToken(): Promise<string> {
  let token = getCookie(CSRF_COOKIE_NAME);

  if (token) {
    return token;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("Не удалось получить CSRF-токен", response.status);
  }

  token = getCookie(CSRF_COOKIE_NAME);

  if (!token) {
    throw new Error("CSRF-cookie не получена от сервера");
  }

  return token;
}

/**
 * Универсальный HTTP-клиент.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const csrfToken = await getCsrfToken();
    headers.set(CSRF_HEADER_NAME, csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Ошибка запроса: ${response.status}`;

    try {
      const errorData = await response.json();

      message =
        errorData.message || errorData.detail || errorData.error || message;
    } catch {
      // Ответ не содержит JSON с описанием ошибки.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
