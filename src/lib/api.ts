export async function api<T>(path: string, body?: unknown, method?: string): Promise<T> {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem('sf-token')
  const admin = localStorage.getItem('sf-admin')
  if (token) headers.Authorization = `Bearer ${token}`
  if (admin) headers['x-admin-token'] = admin
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(path, {
    method: method || (body !== undefined ? 'POST' : 'GET'),
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'The tower glitched. Try that again.')
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }
  return data as T
}
