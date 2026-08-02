import { getOpenAIKey } from "./openaiService";

/**
 * KIRO AI Service — SnapFit Full Control Agentic Engine
 * Powered strictly by OpenAI API (GPT 5.6 SOL Vision & Reasoner)
 *
 * KIRO is an autonomous shopping agent that can both answer questions AND
 * trigger real UI actions on behalf of the user (Try-On, Checkout, Filters, Mandates).
 */

const KIRO_SYSTEM_PROMPT = `You are KIRO, the intelligent autonomous AI shopping assistant & copilot for SnapFit AI & Prava Payments.
You have FULL CONTROL over the e-commerce application. You can assist users AND execute UI actions for them!

Available Products in Store:
- prod_floral_dress_01: Floral Silk Wrap Midi Dress (₹14,999, Women)
- prod_leather_jacket_03: Vintage Biker Leather Jacket (₹35,999, Women)
- prod_women_trench_09: Beige Double-Breasted Trench Coat (₹28,999, Women)
- prod_sneakers_05: Platform White Leather Sneakers (₹12,999, Women)
- prod_men_suit_10: Italian Wool Charcoal Suit Blazer (₹44,999, Men)
- prod_men_denim_12: Trucker Vintage Denim Jacket (₹8,999, Men)
- prod_men_oxford_14: Egyptian Cotton Oxford Shirt (₹6,999, Men)
- prod_men_boots_13: Heritage Leather Chelsea Boots (₹21,999, Men)
- prod_kids_jacket_15: Kids Mini Denim Jacket (₹3,499, Kids)
- prod_kids_dress_17: Floral Tulle Party Dress (₹5,999, Kids)
- prod_kids_sneakers_18: Youth Retro Runner Sneakers (₹4,999, Kids)

Available Action Commands:
If the user requests an action (e.g. "try on the leather jacket", "open checkout", "show men's shoes", "switch to man model", "buy floral dress"), append an ACTION JSON block at the VERY END of your response on a new line using this exact format:

[ACTION:{"type":"OPEN_TRY_ON","garmentId":"prod_leather_jacket_03","modelId":"woman_1"}]
[ACTION:{"type":"OPEN_CHECKOUT","garmentId":"prod_floral_dress_01"}]
[ACTION:{"type":"FILTER_CATEGORY","category":"Women"}]
[ACTION:{"type":"OPEN_MANDATES"}]
[ACTION:{"type":"OPEN_TRANSACTIONS"}]

Tone & Style:
- Professional, enthusiastic, helpful, and concise.
- ALWAYS use clean markdown (**bold**, *lists*).
- Confirm actions to the user in a friendly voice (e.g., "I've opened the Virtual Try-On for the Vintage Biker Leather Jacket for you! ✨").`;

export async function askKiroAI(messages) {
  const apiKey = getOpenAIKey();

  if (!apiKey || !apiKey.startsWith("sk-")) {
    return generateFallbackKiroResponse(messages);
  }

  try {
    const formattedMessages = [
      { role: "system", content: KIRO_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.6-sol",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      return generateFallbackKiroResponse(messages);
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "";

    if (rawReply) {
      // Extract ACTION block if present
      let text = rawReply;
      let action = null;

      const actionMatch = rawReply.match(/\[ACTION:(.*?)\]/s);
      if (actionMatch) {
        try {
          action = JSON.parse(actionMatch[1]);
          text = rawReply.replace(/\[ACTION:(.*?)\]/s, "").trim();
        } catch (e) {
          console.warn("Failed to parse KIRO action JSON:", e);
        }
      }

      return { success: true, text, action };
    }

    return generateFallbackKiroResponse(messages);
  } catch (err) {
    console.error("KIRO OpenAI API error:", err);
    return generateFallbackKiroResponse(messages);
  }
}

function generateFallbackKiroResponse(messages) {
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
  let reply = "";
  let action = null;

  if (lastUserMsg.includes("try on") || lastUserMsg.includes("tryon") || lastUserMsg.includes("jacket") || lastUserMsg.includes("dress")) {
    let garmentId = "prod_leather_jacket_03";
    if (lastUserMsg.includes("dress")) garmentId = "prod_floral_dress_01";
    if (lastUserMsg.includes("trench")) garmentId = "prod_women_trench_09";
    if (lastUserMsg.includes("suit")) garmentId = "prod_men_suit_10";

    reply = "I've launched the **AI Virtual Try-On Studio** and loaded the item for you! ✨\n\n* **Model Fit:** Full-body model composited in real time\n* **Engine:** GPT 5.6 SOL Vision AR";
    action = { type: "OPEN_TRY_ON", garmentId, modelId: "woman_1" };

  } else if (lastUserMsg.includes("order") || lastUserMsg.includes("buy") || lastUserMsg.includes("checkout")) {
    reply = "Here is your 1-click **Prava Passkey Checkout**:\n\n" +
      "* **Step 1:** Prava automatically generates an encrypted single-use virtual card.\n" +
      "* **Step 2:** Approving with Passkey completes the purchase instantly without sharing card details!";
    action = { type: "OPEN_CHECKOUT", garmentId: "prod_floral_dress_01" };

  } else if (lastUserMsg.includes("mandate") || lastUserMsg.includes("subscription")) {
    reply = "Opening your **Prava Autonomous Mandates Manager**! Here you can set budget limits, recurring rules, and auto-purchase authorizations.";
    action = { type: "OPEN_MANDATES" };

  } else if (lastUserMsg.includes("transaction") || lastUserMsg.includes("ledger") || lastUserMsg.includes("history")) {
    reply = "Opening your **Prava Transaction Ledger**! All single-use virtual card spending is logged transparently.";
    action = { type: "OPEN_TRANSACTIONS" };

  } else {
    reply = "Hello! I am **KIRO**, your **SnapFit AI** full-control shopping assistant! ✨\n\n" +
      "You can ask me to:\n" +
      "* **\"Try on the leather jacket on the model\"**\n" +
      "* **\"Buy the floral wrap dress\"**\n" +
      "* **\"Open my Prava Mandates Manager\"**\n" +
      "* **\"Show transaction ledger\"**\n\n" +
      "What would you like me to do for you today?";
  }

  return { success: true, text: reply, action };
}
