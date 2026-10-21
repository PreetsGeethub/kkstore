export type AIProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
};

export type AIChatResponse = {
  conversation_id: string;
  message: string;
  products: AIProduct[];
};

const AI_URL = process.env.NEXT_PUBLIC_AI_URL;

if (!AI_URL) {
  throw new Error("NEXT_PUBLIC_AI_URL is not configured.");
}

export async function sendAIMessage(
  message: string,
  conversationId?: string
): Promise<AIChatResponse> {
  const response = await fetch(`${AI_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const data: AIChatResponse = await response.json();

  return data;
}