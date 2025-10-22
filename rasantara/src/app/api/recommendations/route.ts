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

    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      console.error("Gemini API error", resp.status, t);
      return Response.json({ error: "Model API error" }, { status: 502 });
    }

    const j = await resp.json().catch(() => null);

    let text: string | undefined;
    if (j) {
      text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? undefined;
    }

    if (!text) {
      console.warn("No textual output from Gemini response", j);
      return Response.json({ error: "Model returned no text" }, { status: 502 });
    }

    let recommendations: unknown = null;
    const tryParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    };

    recommendations = tryParse(text);

    if (!recommendations) {
      const m = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (m) {
        recommendations = tryParse(m[0]);
      }
    }

    if (!recommendations) {
      console.warn("Could not parse JSON from model output; returning raw text", text.slice(0, 200));
      return Response.json({ error: "Model did not return JSON", raw: text }, { status: 502 });
    }

    return Response.json({ recommendations });
  } catch (err) {
    console.error("Recommendation error", err);
    return Response.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
