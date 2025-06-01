import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, gender } = await req.json();

    const res = await fetch("https://lanca-ai-n8n.boapz7.easypanel.host/webhook/91671854-bb13-481c-b8cb-66da3470516d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ look: prompt, gender }),
    });

    const text = await res.text();
    console.log("🔎 Resposta bruta do n8n:", text);

    if (!res.ok) {
      return NextResponse.json({ error: "Erro no webhook", detail: text }, { status: 500 });
    }

    let imageBase64: string;

    try {
      const parsed = JSON.parse(text);
      imageBase64 = parsed.data;
    } catch (err) {
      console.error("❌ Erro ao parsear JSON:", err);
      return NextResponse.json({ error: "Resposta inválida do n8n" }, { status: 500 });
    }

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "Imagem não encontrada na resposta" }, { status: 500 });
    }

    const imageUrl = imageBase64.startsWith("data:image")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("❌ Erro geral:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}