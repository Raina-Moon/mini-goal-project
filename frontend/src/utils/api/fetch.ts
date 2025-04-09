const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || `${options.method || "GET"} failed at ${endpoint}`
    );
  return data;
};
