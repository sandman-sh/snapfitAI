/**
 * OpenAI API Integration Service for SnapFit AI.
 * Uses gpt-5.6-sol for vision and gpt-image-1 for image edits.
 */

export const getOpenAIKey = () => {
  return import.meta.env.VITE_OPENAI_API_KEY || "";
};

export const hasOpenAIKey = () => {
  const apiKey = getOpenAIKey();
  return apiKey && apiKey.startsWith("sk-");
};

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

/**
 * Vision API — v1/chat/completions with gpt-5.6-sol
 */
export async function createVisionJson({ imageUrl, prompt }) {
  const apiKey = getOpenAIKey();
  if (!apiKey || !apiKey.startsWith("sk-")) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.6-sol",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `${prompt}\nRespond strictly with valid JSON.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("gpt-5.6-sol vision error:", response.status, err);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return parseJsonFromText(content);
  } catch (err) {
    console.warn("gpt-5.6-sol vision exception:", err.message);
    return null;
  }
}

/**
 * Image Edit via gpt-image-1 — /v1/images/edits (multipart/form-data)
 * Edits the ACTUAL uploaded photo. Never generates from scratch.
 */
export async function editImageWithOpenAI({ imageUrl, prompt }) {
  const apiKey = getOpenAIKey();
  if (!apiKey || !apiKey.startsWith("sk-")) return null;

  try {
    const blob = await imageToPngBlob(imageUrl);

    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("image", blob, "outfit.png");
    formData.append("prompt", prompt);
    formData.append("n", "1");
    formData.append("size", "1024x1024");

    const editRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}` },
      body: formData,
    });

    if (editRes.ok) {
      const data = await editRes.json();
      const b64 = data.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
      const url = data.data?.[0]?.url;
      if (url) return url;
    } else {
      const err = await editRes.json().catch(() => ({}));
      console.warn("gpt-image-1 edits error:", editRes.status, err);
    }
  } catch (err) {
    console.warn("gpt-image-1 edit exception:", err.message);
  }

  return null;
}

/**
 * Convert any image to a PNG Blob for multipart upload
 */
function imageToPngBlob(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      c.toBlob(
        b => b ? resolve(b) : reject(new Error("toBlob failed")),
        "image/png"
      );
    };
    img.onerror = () => reject(new Error("Image load error"));
    img.src = imageUrl;
  });
}
