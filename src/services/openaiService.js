/**
 * OpenAI API Integration Service for SnapFit AI.
 *
 * This demo reads the key from Vite env because the existing app is fully
 * client-side. For production, proxy these calls through your server.
 */

export const getOpenAIKey = () => {
  return import.meta.env.VITE_OPENAI_API_KEY || "";
};

export const getOpenAIVisionModel = () => {
  return import.meta.env.VITE_OPENAI_VISION_MODEL || "gpt-5.5";
};

export const getOpenAIImageModel = () => {
  return import.meta.env.VITE_OPENAI_IMAGE_MODEL || "gpt-image-1";
};

export const hasOpenAIKey = () => {
  const apiKey = getOpenAIKey();
  return apiKey && apiKey.startsWith("sk-");
};

export function extractResponseText(data) {
  if (typeof data?.output_text === "string") return data.output_text;

  const content = data?.output
    ?.flatMap((item) => item.content || [])
    ?.find((part) => part.type === "output_text" || part.type === "text");

  return content?.text || "";
}

export function parseJsonFromText(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}

export async function createVisionJson({ imageUrl, prompt, schema, model = getOpenAIVisionModel() }) {
  const apiKey = getOpenAIKey();
  if (!apiKey || !apiKey.startsWith("sk-")) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageUrl },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "outfit_product_match",
          strict: true,
          schema,
        },
      },
      max_output_tokens: 900,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `OpenAI vision request failed (${response.status})`);
  }

  const data = await response.json();
  return parseJsonFromText(extractResponseText(data));
}

export async function editImageWithOpenAI({ imageUrl, prompt, model = getOpenAIImageModel() }) {
  const apiKey = getOpenAIKey();
  if (!apiKey || !apiKey.startsWith("sk-")) return null;

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      images: [{ image_url: imageUrl }],
      prompt,
      n: 1,
      size: "1024x1024",
      output_format: "png",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `OpenAI image edit failed (${response.status})`);
  }

  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;
  return b64 ? `data:image/png;base64,${b64}` : url || null;
}

/**
 * Perform AI-powered outfit analysis using GPT 5.6 SOL Vision Engine
 */
export async function analyzeOutfitWithOpenAI(imageBase64, visionPrompt) {
  const apiKey = getOpenAIKey();

  if (!apiKey || !apiKey.startsWith("sk-")) {
    return null; // Caller handles fallback
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: getOpenAIVisionModel(),
        messages: [
          { role: "system", content: "You are SnapFit AI Vision. Respond ONLY with valid JSON." },
          { role: "user", content: visionPrompt }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (err) {
    console.error("GPT 5.6 SOL API error:", err);
    return null;
  }
}
