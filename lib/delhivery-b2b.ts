type Json = Record<string, unknown>;

export class DelhiveryB2BError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

let cachedToken: { value: string; expiresAt: number } | undefined;

const required = (value: unknown, name: string) => {
  const result =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim()
      : '';
  if (!result) throw new DelhiveryB2BError(400, `${name} is required`);
  return result;
};

const config = () => {
  const production =
    process.env.DELHIVERY_B2B_ENV?.toLowerCase() === 'production';
  return {
    base: (
      process.env.DELHIVERY_B2B_API_BASE ||
      (production
        ? 'https://ltl-clients-api.delhivery.com'
        : 'https://ltl-clients-api-dev.delhivery.com')
    ).replace(/\/$/, ''),
    username: process.env.DELHIVERY_B2B_USERNAME?.trim(),
    password: process.env.DELHIVERY_B2B_PASSWORD?.trim(),
    token: process.env.DELHIVERY_B2B_TOKEN?.trim(),
  };
};

const parseResponse = async (response: Response) => {
  const raw = await response.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    /* Some document APIs return text. */
  }
  if (!response.ok) {
    const record =
      typeof data === 'object' && data ? (data as Json) : undefined;
    const candidate = record?.message || record?.detail || record?.error;
    const message =
      typeof candidate === 'string' || typeof candidate === 'number'
        ? String(candidate)
        : raw || `Delhivery returned HTTP ${response.status}`;
    throw new DelhiveryB2BError(response.status, message, data);
  }
  return data;
};

async function login(username?: string, password?: string) {
  const settings = config();
  const response = await fetch(`${settings.base}/ums/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: required(username || settings.username, 'username'),
      password: required(password || settings.password, 'password'),
    }),
    signal: AbortSignal.timeout(65000),
  });
  const data = (await parseResponse(response)) as Json;
  const candidate =
    data.jwt ||
    data.token ||
    data.access_token ||
    (data.data as Json | undefined)?.token;
  const token = typeof candidate === 'string' ? candidate.trim() : '';
  if (token)
    cachedToken = {
      value: token.replace(/^Bearer\s+/i, ''),
      expiresAt: Date.now() + 23 * 60 * 60 * 1000,
    };
  return data;
}

async function bearer() {
  const fixed = config().token;
  if (fixed) return fixed.replace(/^Bearer\s+/i, '');
  if (cachedToken && cachedToken.expiresAt > Date.now())
    return cachedToken.value;
  const data = await login();
  const candidate =
    data.jwt ||
    data.token ||
    data.access_token ||
    (data.data as Json | undefined)?.token;
  const token = typeof candidate === 'string' ? candidate.trim() : '';
  if (!token)
    throw new DelhiveryB2BError(
      502,
      'Delhivery login response did not contain a token',
      data,
    );
  return token.replace(/^Bearer\s+/i, '');
}

async function upstream(
  path: string,
  init: RequestInit = {},
  query?: URLSearchParams | Record<string, unknown>,
  authenticated = true,
) {
  const url = new URL(`${config().base}${path}`);
  const entries =
    query instanceof URLSearchParams
      ? query.entries()
      : Object.entries(query || {});
  for (const [key, value] of entries)
    if (value !== undefined && value !== null && value !== '')
      url.searchParams.set(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      );
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (authenticated) headers.set('Authorization', `Bearer ${await bearer()}`);
  const response = await fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(65000),
  });
  return parseResponse(response);
}

const json = (
  path: string,
  method: string,
  body: unknown,
  authenticated = true,
) =>
  upstream(
    path,
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    undefined,
    authenticated,
  );

const multipart = async (request: Request, body: Json) => {
  if (request.headers.get('content-type')?.includes('multipart/form-data'))
    return request.formData();
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    form.append(
      key,
      typeof value === 'string' ? value : (JSON.stringify(value) ?? ''),
    );
  }
  return form;
};

export async function handleDelhiveryB2B(request: Request, segments: string[]) {
  const method = request.method;
  const route = segments.join('/');
  const url = new URL(request.url);
  const contentType = request.headers.get('content-type') || '';
  const body =
    ['POST', 'PUT', 'PATCH'].includes(method) &&
    !contentType.includes('multipart/form-data')
      ? ((await request.json().catch(() => ({}))) as Json)
      : {};

  if (method === 'POST' && route === 'auth/forgot-password')
    return {
      data: await json(
        '/forgot-password',
        'POST',
        { username: required(body.username, 'username') },
        false,
      ),
    };
  if (method === 'POST' && route === 'auth/login')
    return {
      data: await login(
        body.username as string | undefined,
        body.password as string | undefined,
      ),
    };
  if (method === 'GET' && route === 'auth/logout') {
    const data = await upstream('/ums/logout');
    cachedToken = undefined;
    return { data };
  }
  if (
    method === 'GET' &&
    segments[0] === 'serviceability' &&
    segments.length === 2
  )
    return {
      data: await upstream(
        `/pincode-service/${encodeURIComponent(required(segments[1], 'pincode'))}`,
        {},
        url.searchParams,
      ),
    };
  if (method === 'GET' && route === 'tat')
    return {
      data: await upstream(
        '/tat/estimate',
        {},
        {
          origin_pin: required(
            url.searchParams.get('origin_pin'),
            'origin_pin',
          ),
          destination_pin: required(
            url.searchParams.get('destination_pin'),
            'destination_pin',
          ),
        },
      ),
    };
  if (method === 'POST' && route === 'freight/estimate')
    return { data: await json('/freight/estimate', 'POST', body) };
  if (method === 'GET' && route === 'freight/charges')
    return {
      data: await upstream(
        '/lrn/freight-breakup',
        {},
        { lrns: required(url.searchParams.get('lrns'), 'lrns') },
      ),
    };
  if (method === 'POST' && route === 'warehouses')
    return { data: await json('/client-warehouse/create/', 'POST', body) };
  if (method === 'PATCH' && route === 'warehouses')
    return { data: await json('/client-warehouse/update/', 'PATCH', body) };
  if (method === 'POST' && route === 'shipments')
    return {
      data: await upstream('/manifest', {
        method: 'POST',
        body: await multipart(request, body),
      }),
    };
  if (method === 'GET' && route === 'shipments/status')
    return {
      data: await upstream(
        '/manifest',
        {},
        { job_id: required(url.searchParams.get('job_id'), 'job_id') },
      ),
    };
  if (method === 'PUT' && segments[0] === 'shipments' && segments.length === 2)
    return {
      data: await upstream(
        `/lrn/update/${encodeURIComponent(required(segments[1], 'lrn'))}`,
        { method: 'PUT', body: await multipart(request, body) },
      ),
    };
  if (method === 'GET' && route === 'shipments/update/status')
    return {
      data: await upstream(
        '/lrn/update/status',
        {},
        { job_id: required(url.searchParams.get('job_id'), 'job_id') },
      ),
    };
  if (
    method === 'DELETE' &&
    segments[0] === 'shipments' &&
    segments.length === 2
  )
    return {
      data: await upstream(
        `/lrn/cancel/${encodeURIComponent(required(segments[1], 'lrn'))}`,
        { method: 'DELETE' },
      ),
    };
  if (method === 'GET' && route === 'shipments/track')
    return { data: await upstream('/lrn/track', {}, url.searchParams) };
  if (method === 'POST' && route === 'appointments')
    return { data: await json('/v2/appointments/lm', 'POST', body) };
  if (method === 'POST' && route === 'pickups')
    return { data: await json('/pickup_requests/', 'POST', body) };
  if (method === 'DELETE' && segments[0] === 'pickups' && segments.length === 2)
    return {
      data: await upstream(
        `/pickup_requests/${encodeURIComponent(required(segments[1], 'pickup_id'))}`,
        { method: 'DELETE' },
      ),
    };
  if (method === 'GET' && segments[0] === 'labels' && segments.length === 3)
    return {
      data: await upstream(
        `/label/get_urls/${encodeURIComponent(required(segments[1], 'size'))}/${encodeURIComponent(required(segments[2], 'lrn'))}`,
      ),
    };
  if (method === 'GET' && segments[0] === 'lr-copy' && segments.length === 2)
    return {
      data: await upstream(
        `/lr_copy/print/${encodeURIComponent(required(segments[1], 'lrn'))}`,
        {},
        url.searchParams,
      ),
    };
  if (
    method === 'POST' &&
    segments[0] === 'documents' &&
    segments[1] === 'generate' &&
    segments.length === 3
  )
    return {
      data: await json(
        `/generate/${encodeURIComponent(required(segments[2], 'doc_type'))}`,
        'POST',
        body,
      ),
    };
  if (
    method === 'GET' &&
    segments[0] === 'documents' &&
    segments[1] === 'generate' &&
    segments[3] === 'status' &&
    segments.length === 5
  )
    return {
      data: await upstream(
        `/generate/${encodeURIComponent(required(segments[2], 'doc_type'))}/status/${encodeURIComponent(required(segments[4], 'job_id'))}`,
      ),
    };
  if (method === 'GET' && route === 'documents/download')
    return { data: await upstream('/document/download', {}, url.searchParams) };
  throw new DelhiveryB2BError(404, 'Unknown Delhivery B2B operation');
}
