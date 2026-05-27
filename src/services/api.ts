export type ApiEnvelope<T> = {
  err: number
  msg: string
  status: number
  data: T
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`
  }

  return '/api'
}

function getAuthToken() {
  const configuredToken = import.meta.env.VITE_API_TOKEN?.trim()

  if (configuredToken) {
    return configuredToken
  }

  if (typeof window === 'undefined') {
    return ''
  }

  return (
    window.localStorage.getItem('farmacia.authToken') ||
    window.localStorage.getItem('authToken') ||
    ''
  )
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const baseUrl = resolveApiBaseUrl()
  const requestUrl = new URL(
    `${baseUrl}${path}`,
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  )

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        requestUrl.searchParams.set(key, String(value))
      }
    })
  }

  if (baseUrl.startsWith('http')) {
    return requestUrl.toString()
  }

  return `${requestUrl.pathname}${requestUrl.search}`
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  })

  const token = getAuthToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path, query), {
      method: 'GET',
      headers,
    })
  } catch (_error) {
    throw new ApiError('Nao foi possivel conectar com a API do backend.')
  }

  let payload: ApiEnvelope<T> | null = null

  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch (_error) {
    payload = null
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.msg || `Falha na API (${response.status}).`,
      payload?.status || response.status,
    )
  }

  return payload?.data as T
}

async function requestWithBody<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  })

  const token = getAuthToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (_error) {
    throw new ApiError('Nao foi possivel conectar com a API do backend.')
  }

  let payload: ApiEnvelope<T> | null = null

  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch (_error) {
    payload = null
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.msg || `Falha na API (${response.status}).`,
      payload?.status || response.status,
    )
  }

  return payload?.data as T
}

export function apiPost<T>(path: string, body?: unknown) {
  return requestWithBody<T>('POST', path, body)
}

export function apiPut<T>(path: string, body?: unknown) {
  return requestWithBody<T>('PUT', path, body)
}

export function apiDelete<T>(path: string) {
  return requestWithBody<T>('DELETE', path)
}
