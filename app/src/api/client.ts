const API_URL = import.meta.env.VITE_API_URL;

type FetchOptions = RequestInit & {
  onUnauthorized?: () => void;
};

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (options.onUnauthorized) {
      options.onUnauthorized();
    }
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
