import crypto from "crypto";

const BASE_URL = "https://api.clickpesa.com";

// In-memory token cache — resets on server restart, fine since token lasts 1h
let _tokenCache: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 30_000) {
    return _tokenCache.value;
  }

  const res = await fetch(`${BASE_URL}/third-parties/generate-token`, {
    method: "POST",
    headers: {
      "client-id": process.env.CLICKPESA_CLIENT_ID!,
      "api-key": process.env.CLICKPESA_API_KEY!,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickPesa auth failed (${res.status}): ${text}`);
  }

  const data: { token: string } = await res.json();
  // API returns "Bearer <token>" — strip prefix
  const raw = data.token.replace(/^Bearer\s+/i, "").trim();

  _tokenCache = { value: raw, expiresAt: Date.now() + 55 * 60 * 1000 };
  return raw;
}

export type ClickPesaStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "SETTLED" | "FAILED";

export interface UssdPushResult {
  id: string;
  status: ClickPesaStatus;
  channel: string;
  orderReference: string;
  collectedAmount: number;
  collectedCurrency: string;
  createdAt: string;
  clientId: string;
}

export interface PaymentRecord {
  id: string;
  status: ClickPesaStatus;
  paymentReference: string;
  orderReference: string;
  collectedAmount: number;
  collectedCurrency: string;
  message?: string;
  updatedAt: string;
  createdAt: string;
}

export async function initiateUssdPush(params: {
  amount: number;
  currency: "TZS";
  orderReference: string;
  phoneNumber: string;
}): Promise<UssdPushResult> {
  const token = await getToken();

  const res = await fetch(
    `${BASE_URL}/third-parties/payments/initiate-ussd-push-request`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(params.amount),
        currency: params.currency,
        orderReference: params.orderReference,
        phoneNumber: params.phoneNumber,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickPesa USSD push failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function queryPayments(orderReference: string): Promise<PaymentRecord[]> {
  const token = await getToken();

  const res = await fetch(
    `${BASE_URL}/third-parties/payments/${encodeURIComponent(orderReference)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`ClickPesa status query failed: ${res.status}`);
  }

  return res.json();
}

export async function generateCheckoutLink(params: {
  totalPrice: number;
  orderReference: string;
  orderCurrency: "TZS" | "USD";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  callbackUrl?: string;
}): Promise<{ checkoutLink: string; clientId: string }> {
  const token = await getToken();

  const body: Record<string, string> = {
    totalPrice: String(params.totalPrice),
    orderReference: params.orderReference,
    orderCurrency: params.orderCurrency,
  };
  if (params.customerName) body.customerName = params.customerName;
  if (params.customerEmail) body.customerEmail = params.customerEmail;
  if (params.customerPhone) body.customerPhone = params.customerPhone;
  if (params.description) body.description = params.description;
  if (params.callbackUrl) body.callbackUrl = params.callbackUrl;

  const res = await fetch(
    `${BASE_URL}/third-parties/checkout-link/generate-checkout-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickPesa checkout link failed (${res.status}): ${text}`);
  }

  return res.json();
}

// Verify HMAC-SHA256 checksum on incoming webhooks
export function verifyWebhookChecksum(
  payload: Record<string, unknown>,
  receivedChecksum: string,
  secret: string
): boolean {
  // Exclude checksum fields before hashing
  const { checksum: _c, checksumMethod: _m, ...rest } = payload;

  function deepSortKeys(val: unknown): unknown {
    if (Array.isArray(val)) return val.map(deepSortKeys);
    if (val !== null && typeof val === "object") {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(val as object).sort()) {
        sorted[k] = deepSortKeys((val as Record<string, unknown>)[k]);
      }
      return sorted;
    }
    return val;
  }

  const canonical = JSON.stringify(deepSortKeys(rest));
  const computed = crypto.createHmac("sha256", secret).update(canonical).digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(receivedChecksum, "hex")
    );
  } catch {
    return false;
  }
}

// Map ClickPesa channel name to our PaymentMethod enum value
export function channelToPaymentMethod(channel: string): string {
  const map: Record<string, string> = {
    "M-PESA": "MPESA",
    MPESA: "MPESA",
    "AIRTEL-MONEY": "AIRTEL_MONEY",
    "AIRTEL_MONEY": "AIRTEL_MONEY",
    "TIGO-PESA": "TIGO_PESA",
    "TIGO_PESA": "TIGO_PESA",
    HALOPESA: "HALOPESA",
    CARD: "CARD",
  };
  return map[channel.toUpperCase()] ?? "MPESA";
}
