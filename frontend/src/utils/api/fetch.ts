const API_URL = "http://localhost:5000/api";

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

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || `${options.method || "GET"} failed at ${endpoint}`
    );
  return data;
};
