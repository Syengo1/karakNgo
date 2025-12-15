import { NextResponse } from "next/server";
import { getMpesaToken } from "@/lib/mpesa";
import { formatPhoneNumberForMpesa } from "@/lib/utils"; // Reuse your existing utility

export async function POST(req: Request) {
  try {
    const { phone, amount, orderReference } = await req.json();

    // 1. Validation
    const formattedPhone = formatPhoneNumberForMpesa(phone);
    if (!formattedPhone) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // 2. Get Access Token
    const accessToken = await getMpesaToken();
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to authenticate with M-Pesa" }, { status: 500 });
    }

    // 3. Generate Timestamp & Password
    const date = new Date();
    const timestamp = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0") +
      date.getHours().toString().padStart(2, "0") +
      date.getMinutes().toString().padStart(2, "0") +
      date.getSeconds().toString().padStart(2, "0");

    const shortCode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    // 4. Send STK Push Request
    const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    
    const stkPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount), // Ensure integer
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL || "https://example.com/callback", // Ngrok needed for local
      AccountReference: "KarakAndGo",
      TransactionDesc: `Payment for Order ${orderReference}`,
    };

    const response = await fetch(stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const data = await response.json();

    if (data.ResponseCode === "0") {
      return NextResponse.json({ 
        success: true, 
        message: "STK Push sent successfully", 
        checkoutRequestID: data.CheckoutRequestID 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.errorMessage || "STK Push failed" 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("STK Push Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}