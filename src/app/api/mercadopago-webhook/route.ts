import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");
    const id = searchParams.get("id");

    // 🔍 Caso venha via IPN (query params)
    if (topic === "payment" && id) {
      console.log("📩 IPN recebida:", { topic, id });

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        },
      });

      const paymentData = await res.json();
      console.log("💳 Dados do pagamento via IPN:", paymentData);

      if (paymentData.status === "approved") {
        console.log("✅ Pagamento confirmado para:", paymentData.payer?.email);
      } else {
        console.log("⏳ Pagamento ainda não aprovado. Status:", paymentData.status);
      }

      return NextResponse.json({ received: true });
    }

    // 🔍 Caso venha via webhook padrão (body JSON)
    const body = await req.json();
    console.log("📩 Webhook recebido:", JSON.stringify(body, null, 2));

    if (body?.type === "payment") {
      const paymentId = body.data.id;
      console.log("🔍 Verificando pagamento com ID:", paymentId);

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        },
      });

      const paymentData = await res.json();
      console.log("💳 Dados do pagamento retornados:", paymentData);

      if (paymentData.status === "approved") {
        console.log("✅ Pagamento confirmado para:", paymentData.payer?.email);
      } else {
        console.log("⏳ Pagamento ainda não aprovado. Status:", paymentData.status);
      }
    } else {
      console.log("⚠️ Webhook ignorado. Tipo:", body?.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Erro no processamento do webhook:", err);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}