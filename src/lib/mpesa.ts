export async function getMpesaToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  // Note: We use the 'sandbox' URL specifically
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  if (!key || !secret) {
    console.error("Missing M-Pesa Keys in .env.local");
    return null;
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store", // <--- CRITICAL: Prevents caching stale tokens
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("M-Pesa API Error:", response.status, errorBody);
      throw new Error("Failed to fetch M-Pesa token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("M-Pesa Token Logic Failed:", error);
    return null;
  }
}