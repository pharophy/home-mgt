export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const errorBody = (await response.json()) as { error?: unknown };
      if (typeof errorBody.error === "string" && errorBody.error.trim().length > 0) {
        message = errorBody.error;
      }
    } catch {
      // Ignore unreadable error bodies and keep the generic status message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
