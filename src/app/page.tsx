"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

const maxFree = 3;
const USAGE_KEY = "freeUsage";

type UsageData = {
  count: number;
  firstUse: number;
};

const getFreeUsage = (): UsageData => {
  if (typeof window === "undefined") return { count: 0, firstUse: 0 };
  const raw = localStorage.getItem(USAGE_KEY);
  if (!raw) return { count: 0, firstUse: 0 };
  try {
    const data = JSON.parse(raw);
    return data;
  } catch {
    return { count: 0, firstUse: 0 };
  }
};

const setFreeUsage = (data: UsageData) => {
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
};

const incrementFreeUsage = () => {
  const usage = getFreeUsage();
  const now = Date.now();
  if (!usage.firstUse || now - usage.firstUse > 24 * 60 * 60 * 1000) {
    setFreeUsage({ count: 1, firstUse: now });
  } else {
    setFreeUsage({ ...usage, count: usage.count + 1 });
  }
};

const isPremium = () => localStorage.getItem("premium") === "true";

export default function GenerateLookPage() {
  const [prompt, setPrompt] = useState("");
  const [gender, setGender] = useState("mulher");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [freeUses, setFreeUses] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [liberando, setLiberando] = useState(false);

  useEffect(() => {
    const usage = getFreeUsage();
    const now = Date.now();
    if (usage.firstUse && now - usage.firstUse > 24 * 60 * 60 * 1000) {
      setFreeUsage({ count: 0, firstUse: 0 });
      setFreeUses(0);
    } else {
      setFreeUses(usage.count);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (freeUses >= maxFree && !isPremium()) {
      alert("Você atingiu o limite grátis de hoje. Adquira acesso ilimitado.");
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, gender }),
      });

      const data = await res.json();
      setImageUrl(data.imageUrl);
      incrementFreeUsage();
      setFreeUses(getFreeUsage().count);
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLiberarAcesso = async () => {
    if (!emailInput) return alert("Informe seu e-mail");
    setLiberando(true);
    try {
      const res = await fetch(`/api/check-premium?email=${encodeURIComponent(emailInput)}`);
      const data = await res.json();
      if (data.isPremium) {
        localStorage.setItem("premium", "true");

        // 🔥 Evento do TikTok Pixel
        if (typeof window !== "undefined" && window.ttq) {
          window.ttq.track("CompletePayment");
        }

        alert("Acesso liberado com sucesso!");
        setFreeUsage({ count: 0, firstUse: 0 });
        setFreeUses(0);
      } else {
        alert("Pagamento não encontrado. Tente novamente mais tarde.");
      }
    } catch (err) {
      console.error("Erro ao verificar premium:", err);
      alert("Erro ao verificar acesso. Tente novamente mais tarde.");
    } finally {
      setLiberando(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Gerador de Looks com IA</h1>
      <div className="flex flex-col gap-4 w-full">
        <Input
          placeholder="Digite o tipo de look (ex: look para casamento de dia)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mulher">Look feminino</SelectItem>
            <SelectItem value="homem">Look masculino</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleGenerate} disabled={loading || (freeUses >= maxFree && !isPremium())} className="w-full">
          {loading ? "Gerando..." : freeUses >= maxFree && !isPremium() ? "Limite diário atingido" : "Gerar Look"}
        </Button>

        {freeUses >= maxFree && !isPremium() && (
          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Você atingiu o limite grátis de {maxFree} usos em 24h.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Desbloquear ilimitado com PIX ou Cartão</Button>
              </DialogTrigger>
              <DialogContent className="space-y-4">
                <DialogTitle className="text-base font-medium text-center">Pagamento e Liberação de Acesso</DialogTitle>
                <p className="text-sm text-muted-foreground text-center">
                  Gere um link de pagamento abaixo usando seu e-mail e depois confirme:
                </p>

                <Input
                  type="email"
                  placeholder="Digite seu e-mail usado no pagamento"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />

                <Button
                  variant="secondary"
                  disabled={!emailInput || liberando}
                  onClick={() => {
                    if (!emailInput) return alert("Informe seu e-mail primeiro");

                    setLiberando(true);
                    const newTab = window.open("", "_blank");

                    fetch("/api/create-preference", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: emailInput }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.init_point) {
                          if (newTab) newTab.location.href = data.init_point;
                        } else {
                          alert("Erro ao gerar link. Tente novamente.");
                          if (newTab) newTab.close();
                        }
                      })
                      .catch((err) => {
                        console.error("Erro ao gerar link:", err);
                        alert("Erro ao gerar link. Tente novamente mais tarde.");
                        if (newTab) newTab.close();
                      })
                      .finally(() => {
                        setLiberando(false);
                      });
                  }}
                  className="w-full"
                >
                  Gerar link de pagamento com meu e-mail
                </Button>

                <Button onClick={handleLiberarAcesso} disabled={liberando} variant="outline" className="w-full">
                  {liberando ? "Verificando..." : "Já paguei, liberar acesso"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {imageUrl && (
        <Card className="mt-6">
          <CardContent className="p-4 flex justify-center">
            <img src={imageUrl} alt="Look gerado por IA" className="max-w-full h-auto rounded-lg" />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
