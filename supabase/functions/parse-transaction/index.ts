import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Mensagem inválida. Máximo 500 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `Você é um assistente financeiro que interpreta descrições de transações em linguagem natural em português brasileiro.

Extraia as seguintes informações e retorne APENAS um JSON válido (sem markdown, sem código):
{
  "type": "income" ou "expense",
  "amount": número positivo,
  "description": "descrição curta e clara",
  "category": "categoria mais adequada entre: Salário, Freelance, Investimentos, Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Contas, Outros",
  "date": "YYYY-MM-DD"
}

Regras:
- Se não mencionar data, use hoje: ${today}
- "ontem" = dia anterior a hoje
- Palavras como "gastei", "paguei", "comprei" indicam "expense"
- Palavras como "recebi", "ganhei", "entrou" indicam "income"
- Sempre retorne um valor numérico positivo para amount
- Não inclua texto extra, apenas o JSON`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao processar com IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse the JSON from the AI response
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const transaction = JSON.parse(cleanContent);

    // Validate required fields
    if (!transaction.type || !transaction.amount || !transaction.description) {
      throw new Error("Dados incompletos na resposta da IA");
    }

    return new Response(
      JSON.stringify({ transaction }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-transaction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
