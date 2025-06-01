import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email não informado" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`, // use variável de ambiente
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    const hasPaid = data.results?.some(
      (p: any) => p.status === "approved" && p.external_reference?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ isPremium: hasPaid || false });
  } catch (err) {
    console.error("Erro ao verificar pagamento:", err);
    return NextResponse.json({ error: "Erro ao consultar Mercado Pago" }, { status: 500 });
  }
}