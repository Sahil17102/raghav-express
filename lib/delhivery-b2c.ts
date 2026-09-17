type Json = Record<string, unknown>;

export class DelhiveryError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const text = (value: unknown, field: string) => {
  const result = String(value ?? "").trim();
  if (!result) throw new DelhiveryError(400, `${field} is required`);
  return result;
};
const pin = (value: unknown, field = "pincode") => {
  const result = text(value, field);
  if (!/^\d{6}$/.test(result)) throw new DelhiveryError(400, `${field} must be a 6-digit pincode`);
  return result;
};
const positive = (value: unknown, field: string, max?: number) => {
  const result = Number(value);
  if (!Number.isFinite(result) || result <= 0 || (max && result > max))
    throw new DelhiveryError(400, `${field} must be a positive number${max ? ` up to ${max}` : ""}`);
  return result;
};

const config = () => {
  const token = process.env.DELHIVERY_B2C_TOKEN?.trim();
  if (!token) throw new DelhiveryError(503, "DELHIVERY_B2C_TOKEN is not configured");
  const production = process.env.DELHIVERY_B2C_ENV?.toLowerCase() === "production";
  return {
    token,
    base: (process.env.DELHIVERY_B2C_API_BASE ||
      (production ? "https://track.delhivery.com" : "https://staging-express.delhivery.com")
    ).replace(/\/$/, ""),
    pickupLocation: process.env.DELHIVERY_B2C_PICKUP_LOCATION?.trim(),
  };
};

async function request(path: string, init: RequestInit = {}, query?: Record<string, unknown>) {
  const { token, base } = config();
  const url = new URL(`${base}${path}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", Authorization: `Token ${token}`, ...init.headers },
    signal: AbortSignal.timeout(65000),
  });
  const raw = await response.text();
  let data: unknown = raw;
  try { data = raw ? JSON.parse(raw) : {}; } catch { /* Delhivery sometimes returns plain text. */ }
  if (!response.ok) {
    const message = typeof data === "object" && data && "message" in data ? String((data as Json).message) : raw;
    throw new DelhiveryError(response.status, message || `Delhivery returned HTTP ${response.status}`);
  }
  return data;
}

const json = (path: string, method: string, body: unknown) => request(path, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const manifest = (body: Json, mode?: "MPS" | "RVP_QC") => {
  const inputShipments = Array.isArray(body.shipments) ? body.shipments : [];
  if (!inputShipments.length) throw new DelhiveryError(400, "shipments must be a non-empty array");
  const pickupName = String((body.pickup_location as Json | undefined)?.name || config().pickupLocation || "").trim();
  if (!pickupName) throw new DelhiveryError(400, "pickup_location.name is required");
  const shipments = inputShipments.map((entry, index) => {
    const shipment = entry as Json;
    const payment = text(shipment.payment_mode, `shipments[${index}].payment_mode`);
    if (!["COD", "Prepaid", "Pickup", "REPL"].includes(payment))
      throw new DelhiveryError(400, `shipments[${index}].payment_mode is invalid`);
    const normalized: Json = {
      ...shipment,
      name: text(shipment.name, `shipments[${index}].name`),
      order: text(shipment.order, `shipments[${index}].order`),
      phone: text(shipment.phone, `shipments[${index}].phone`),
      add: text(shipment.add, `shipments[${index}].add`),
      pin: pin(shipment.pin, `shipments[${index}].pin`),
      payment_mode: payment,
    };
    if (payment === "COD") normalized.cod_amount = positive(shipment.cod_amount, `shipments[${index}].cod_amount`);
    if (mode === "MPS") {
      normalized.shipment_type = "MPS";
      normalized.waybill = text(shipment.waybill, `shipments[${index}].waybill`);
      normalized.master_id = text(shipment.master_id, `shipments[${index}].master_id`);
      normalized.mps_children = positive(shipment.mps_children, `shipments[${index}].mps_children`);
    }
    if (mode === "RVP_QC") {
      normalized.payment_mode = "Pickup";
      normalized.qc_type = "param";
      if (!Array.isArray(shipment.custom_qc) || !shipment.custom_qc.length || shipment.custom_qc.length > 2)
        throw new DelhiveryError(400, `shipments[${index}].custom_qc must contain 1 or 2 items`);
    }
    return normalized;
  });
  return { shipments, pickup_location: { name: pickupName } };
};

export async function handleDelhiveryB2C(method: string, segments: string[], url: URL, body: Json) {
  const path = segments.join("/");
  if (method === "GET" && path.startsWith("serviceability/")) {
    const pincode = pin(segments[1]);
    const data = await request("/c/api/pin-codes/json/", {}, { filter_codes: pincode });
    const rows = (data as Json)?.delivery_codes;
    const serviceable = Array.isArray(rows) && rows.some((row) => {
      const postal = (row as Json)?.postal_code as Json | undefined;
      return String(postal?.remarks || "").trim().toLowerCase() !== "embargo";
    });
    return { data, serviceable };
  }
  if (method === "GET" && path.startsWith("heavy-serviceability/"))
    return { data: await request("/api/dc/fetch/serviceability/pincode", {}, { product_type: "Heavy", pincode: pin(segments[1]) }) };
  if (method === "GET" && path === "tat")
    return { data: await request("/api/dc/expected_tat", {}, Object.fromEntries(url.searchParams)) };
  if (method === "GET" && path === "waybills") {
    const count = positive(url.searchParams.get("count"), "count", 10000);
    return { data: await request("/waybill/api/bulk/json/", {}, { token: config().token, count }) };
  }
  if (method === "GET" && path === "waybill")
    return { data: await request("/waybill/api/fetch/json/", {}, { token: config().token }) };
  if (method === "GET" && path === "shipments/track")
    return { data: await request("/api/v1/packages/json/", {}, { waybill: text(url.searchParams.get("waybill"), "waybill"), ref_ids: url.searchParams.get("ref_ids") || "" }) };
  if (method === "GET" && path === "shipping-cost")
    return { data: await request("/api/kinko/v1/invoice/charges/.json", {}, Object.fromEntries(url.searchParams)) };
  if (method === "GET" && path === "shipments/label")
    return { data: await request("/api/p/packing_slip", {}, { wbns: text(url.searchParams.get("waybill"), "waybill"), pdf: url.searchParams.get("pdf") || "true", pdf_size: url.searchParams.get("pdf_size") || "A4" }) };
  if (method === "GET" && path === "documents/download")
    return { data: await request("/api/rest/fetch/pkg/document/", {}, { doc_type: text(url.searchParams.get("doc_type"), "doc_type"), waybill: text(url.searchParams.get("waybill"), "waybill") }) };
  if (method === "GET" && segments[0] === "ndr" && segments[2] === "status")
    return { data: await request(`/api/cmu/get_bulk_upl/${encodeURIComponent(text(segments[1], "uplId"))}`, {}, { verbose: url.searchParams.get("verbose") || "true" }) };
  if (method === "POST" && path === "pickup-requests") return { data: await json("/fm/request/new/", "POST", body) };
  if (method === "POST" && path === "warehouses") return { data: await json("/api/backend/clientwarehouse/create/", "POST", body) };
  if (method === "POST" && path === "warehouses/update") return { data: await json("/api/backend/clientwarehouse/edit/", "POST", body) };
  if (method === "POST" && ["shipments", "shipments/mps", "shipments/rvp-qc"].includes(path)) {
    const payload = manifest(body, path.endsWith("mps") ? "MPS" : path.endsWith("rvp-qc") ? "RVP_QC" : undefined);
    const form = new URLSearchParams({ format: "json", data: JSON.stringify(payload) });
    return { data: await request("/api/cmu/create.json", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form }) };
  }
  if (method === "POST" && path === "shipments/edit") return { data: await json("/api/p/edit", "POST", body) };
  if (method === "POST" && path === "shipments/cancel") return { data: await json("/api/p/edit", "POST", { waybill: text(body.waybill, "waybill"), cancellation: "true" }) };
  if (method === "POST" && path === "ndr/actions") return { data: await json("/api/p/update", "POST", body) };
  if (method === "PUT" && segments[0] === "shipments" && segments[2] === "ewaybill")
    return { data: await json(`/api/rest/ewaybill/${encodeURIComponent(text(segments[1], "waybill"))}/`, "PUT", body) };
  throw new DelhiveryError(404, "Unknown Delhivery B2C operation");
}
