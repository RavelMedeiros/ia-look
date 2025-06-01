// src/app/api/create-preference/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: "Acesso Premium - Look IA",
            quantity: 1,
            unit_price: 5.0,
          },
        ],
        payer: {
          email,
        },
        external_reference: email,
        back_urls: {
          success: "https://seudominio.com/sucesso",
          failure: "https://seudominio.com/erro",
          pending: "https://seudominio.com/pendente",
        },
        auto_return: "approved",
      }),
    });

    const data = await response.json();
    return NextResponse.json({ init_point: data.init_point });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return NextResponse.json({ error: "Erro ao criar preferência" }, { status: 500 });
  }
}