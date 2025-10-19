type HistoryItem = { name?: string };

type ReqBody = {
  foodName: string;
  userHistory?: HistoryItem[];
  userWishlist?: HistoryItem[];
};

export async function POST(request: Request) {
  try {
    const { foodName, userHistory = [], userWishlist = [] } = (await request.json()) as ReqBody;

    const historyText = userHistory.map((h) => h.name ?? "").filter(Boolean).join(", ");
    const wishlistText = userWishlist.map((w) => w.name ?? "").filter(Boolean).join(", ");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

    const prompt = `You are an Indonesian food expert. Based on viewing history (${historyText}) and wishlist (${wishlistText}), recommend 2-3 Indonesian foods similar to ${foodName}. Return a JSON array of objects {name, reason}.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });

    const body = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";

    return Response.json({ recommendations: JSON.parse(text) });
  } catch (err) {
    console.error("Recommendation error", err);
    return Response.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
