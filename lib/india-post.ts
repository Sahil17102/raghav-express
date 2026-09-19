type Json = Record<string, unknown>;

export class IndiaPostError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

let cachedToken: { value: string; expiresAt: number } | undefined;

const required = (value: unknown, field: string) => {
  const result =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim()
      : '';
  if (!result) throw new IndiaPostError(400, `${field} is required`);
  return result;
};

const pin = (value: unknown, field: string) => {
  const result = required(value, field);
  if (!/^\d{6}$/.test(result))
    throw new IndiaPostError(400, `${field} must be a 6-digit pincode`);
  return result;
};

const settings = () => ({
  base: (process.env.INDIA_POST_API_BASE || 'https://test.cept.gov.in').replace(
    /\/$/,
    '',
  ),
  username: process.env.INDIA_POST_USERNAME?.trim(),
  password: process.env.INDIA_POST_PASSWORD?.trim(),
  customerId: process.env.INDIA_POST_CUSTOMER_ID?.trim(),
  contractId: process.env.INDIA_POST_CONTRACT_ID?.trim(),
  dropoffOfficeId: process.env.INDIA_POST_DROPOFF_OFFICE_ID?.trim(),
  senderName: process.env.INDIA_POST_SENDER_NAME?.trim(),
  senderCompany: process.env.INDIA_POST_SENDER_COMPANY?.trim(),
  senderAddress: process.env.INDIA_POST_SENDER_ADDRESS?.trim(),
  senderCity: process.env.INDIA_POST_SENDER_CITY?.trim(),
  senderPincode: process.env.INDIA_POST_SENDER_PINCODE?.trim(),
  senderMobile: process.env.INDIA_POST_SENDER_MOBILE?.trim(),
});

const decode = async (response: Response) => {
  const raw = await response.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    /* Event download returns XML. */
  }
  if (!response.ok) {
    const record =
      typeof data === 'object' && data ? (data as Json) : undefined;
    const candidate = record?.message || record?.error;
    const message =
      typeof candidate === 'string'
        ? candidate
        : raw || `India Post returned HTTP ${response.status}`;
    throw new IndiaPostError(response.status, message, data);
  }
  return data;
};

async function login(username?: unknown, password?: unknown) {
  const config = settings();
  const response = await fetch(`${config.base}/beextcustomer/v1/access/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: required(username || config.username, 'username'),
      password: required(password || config.password, 'password'),
    }),
    signal: AbortSignal.timeout(65000),
  });
  const data = (await decode(response)) as Json;
  const tokenValue = (data.data as Json | undefined)?.access_token;
  const token = typeof tokenValue === 'string' ? tokenValue.trim() : '';
  const expiryValue = Number(
    (data.data as Json | undefined)?.expires_in || 3600,
  );
  if (token)
    cachedToken = {
      value: token,
      expiresAt: Date.now() + Math.max(60, expiryValue - 60) * 1000,
    };
  return data;
}

async function bearer() {
  if (cachedToken && cachedToken.expiresAt > Date.now())
    return cachedToken.value;
  const result = await login();
  const value = (result.data as Json | undefined)?.access_token;
  if (typeof value !== 'string' || !value.trim())
    throw new IndiaPostError(
      502,
      'India Post login response did not contain an access token',
      result,
    );
  return value.trim();
}

async function upstream(
  path: string,
  init: RequestInit = {},
  query?: URLSearchParams | Record<string, unknown>,
  authenticated = true,
) {
  const url = new URL(`${settings().base}${path}`);
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
  headers.set('Accept', 'application/json, application/xml, text/xml');
  if (authenticated) headers.set('Authorization', `Bearer ${await bearer()}`);
  return decode(
    await fetch(url, { ...init, headers, signal: AbortSignal.timeout(65000) }),
  );
}

const json = (path: string, method: string, body: unknown) =>
  upstream(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const tariffQuery = (url: URL) => {
  const query = new URLSearchParams(url.searchParams);
  const weight = Number(query.get('weight'));
  if (!Number.isInteger(weight) || weight < 1)
    throw new IndiaPostError(
      400,
      'weight must be a positive whole number in grams',
    );
  pin(query.get('source-pincode'), 'source-pincode');
  pin(query.get('destination-pincode'), 'destination-pincode');
  return query;
};

export async function handleIndiaPost(request: Request, segments: string[]) {
  const method = request.method;
  const route = segments.join('/');
  const url = new URL(request.url);
  const multipart = request.headers
    .get('content-type')
    ?.includes('multipart/form-data');
  const body =
    ['POST', 'PUT', 'PATCH'].includes(method) && !multipart
      ? ((await request.json().catch(() => ({}))) as Json)
      : {};

  if (method === 'POST' && route === 'auth/login')
    return { data: await login(body.username, body.password) };
  if (method === 'GET' && route === 'offices') {
    const query = new URLSearchParams({
      pincode: pin(url.searchParams.get('pincode'), 'pincode'),
      limit: url.searchParams.get('limit') || '50',
      'office-type': 'post',
    });
    return {
      data: await upstream(
        '/bemasterdata/v1/offices/limited-details',
        {},
        query,
      ),
    };
  }
  if (method === 'GET' && route === 'tariffs/speed-post')
    return {
      data: await upstream(
        '/beextcustomer/v1/speed-post/tariffs',
        {},
        tariffQuery(url),
      ),
    };
  if (method === 'GET' && route === 'tariffs/business-parcel')
    return {
      data: await upstream(
        '/beextcustomer/v1/business-parcel-tariff/calculate',
        {},
        tariffQuery(url),
      ),
    };
  if (method === 'GET' && route === 'tariffs/ddd-ndd')
    return {
      data: await upstream(
        '/beextcustomer/v1/ddd-ndd-tariff/calculate',
        {},
        tariffQuery(url),
      ),
    };
  if (method === 'GET' && route === 'tariffs/parspl')
    return {
      data: await upstream(
        '/beextcustomer/v1/parspl-tariff/calculate',
        {},
        tariffQuery(url),
      ),
    };
  if (method === 'POST' && route === 'bookings') {
    const articles = body.articles;
    if (
      !Array.isArray(articles) ||
      articles.length < 1 ||
      articles.length > 1000
    )
      throw new IndiaPostError(400, 'articles must contain 1 to 1000 items');
    const customerId = required(
      body.customer_id || settings().customerId,
      'customer_id',
    );
    const config = settings();
    const normalizedArticles = articles.map((value, index) => {
      if (!value || typeof value !== 'object')
        throw new IndiaPostError(400, `articles[${index}] must be an object`);
      const article = value as Json;
      return {
        ...article,
        bulk_customer_id: required(
          article.bulk_customer_id || customerId,
          `articles[${index}].bulk_customer_id`,
        ),
        contract_id: required(
          article.contract_id || config.contractId,
          `articles[${index}].contract_id`,
        ),
        barcode_no: required(
          article.barcode_no,
          `articles[${index}].barcode_no`,
        ),
        pickup_dropoff_office_id: Number(
          required(
            article.pickup_dropoff_office_id || config.dropoffOfficeId,
            `articles[${index}].pickup_dropoff_office_id`,
          ),
        ),
        sender_name: required(
          article.sender_name || config.senderName,
          `articles[${index}].sender_name`,
        ),
        sender_company:
          article.sender_company || config.senderCompany || config.senderName,
        sender_add_line_1: required(
          article.sender_add_line_1 || config.senderAddress,
          `articles[${index}].sender_add_line_1`,
        ),
        sender_city: required(
          article.sender_city || config.senderCity,
          `articles[${index}].sender_city`,
        ),
        sender_pincode: Number(
          pin(
            article.sender_pincode || config.senderPincode,
            `articles[${index}].sender_pincode`,
          ),
        ),
        sender_mobile_no: Number(
          required(
            article.sender_mobile_no || config.senderMobile,
            `articles[${index}].sender_mobile_no`,
          ),
        ),
      };
    });
    return {
      data: await json(
        `/beextcustomer/process-articles/${encodeURIComponent(customerId)}`,
        'POST',
        { articles: normalizedArticles },
      ),
    };
  }
  if (method === 'POST' && route === 'bookings/file') {
    if (!multipart)
      throw new IndiaPostError(
        400,
        'multipart/form-data with a file is required',
      );
    const form = await request.formData();
    const customerId = required(
      form.get('customer_id') || settings().customerId,
      'customer_id',
    );
    const file = form.get('file');
    if (!(file instanceof File) || !file.size)
      throw new IndiaPostError(400, 'file is required');
    const outgoing = new FormData();
    outgoing.set('file', file);
    return {
      data: await upstream(
        `/beextcustomer/process-articles-file/${encodeURIComponent(customerId)}`,
        { method: 'POST', body: outgoing },
      ),
    };
  }
  if (method === 'POST' && route === 'labels')
    return {
      data: await json('/beextcustomer/v1/label/create/domestic', 'POST', body),
    };
  if (method === 'POST' && route === 'events')
    return {
      data: await json('/beextcustomer/v1/event/download', 'POST', body),
    };
  if (method === 'POST' && route === 'tracking') {
    if (
      !Array.isArray(body.bulk) ||
      body.bulk.length < 1 ||
      body.bulk.length > 500
    )
      throw new IndiaPostError(
        400,
        'bulk must contain 1 to 500 article numbers',
      );
    return {
      data: await json('/beextcustomer/v1/tracking/bulk', 'POST', {
        bulk: body.bulk,
      }),
    };
  }
  throw new IndiaPostError(404, 'Unknown India Post operation');
}
