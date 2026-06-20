import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely (with lazy instantiation or optional flag check)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI client:", e);
      }
    }
  }
  return aiClient;
}

// Robust helper to perform Gemini generation with retries and multiple model fallbacks on transient server errors (e.g. 503 Spikes or 429 Rate Limits)
async function generateContentWithRetry(ai: any, params: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-pro-preview"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000; // 1s base backoff

    while (attempts < maxAttempts) {
      try {
        console.log(`[AI Saathi] Attempting generation with model: "${model}" (attempt ${attempts + 1}/${maxAttempts})`);
        const response = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: params.config
        });
        if (response && response.text) {
          return { response, model };
        }
        throw new Error("Empty text in Gemini response");
      } catch (err: any) {
        attempts++;
        lastError = err;
        const errMsg = err.message || JSON.stringify(err);
        console.warn(`[AI Saathi] Attempt with model "${model}" failed on attempt ${attempts}:`, errMsg);

        // If it is a hard quota limit / budget exhausted error, retry is useless. Break immediately to try the next fallback model.
        const isQuotaLimit = errMsg.includes("Quota exceeded") || 
                             errMsg.includes("RESOURCE_EXHAUSTED") || 
                             errMsg.includes("quota") ||
                             errMsg.includes("limit") ||
                             errMsg.includes("exhausted");

        if (isQuotaLimit) {
          console.log(`[AI Saathi] Hard quota / rate limit detected for model "${model}". Skipping further retries and selecting next fallback model.`);
          break; // Break the attempts loop, skip immediately to next model in master loop
        }

        const isTransient = errMsg.includes("503") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("429") || 
                            errMsg.includes("busy") || 
                            errMsg.includes("demand") ||
                            errMsg.includes("overloaded");

        if (isTransient && attempts < maxAttempts) {
          console.log(`[AI Saathi] Transient error on model "${model}". Backing off for ${delay}ms before retrying...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        } else {
          break; // Exit inner try-attempts loop to try the next fallback model directly
        }
      }
    }
  }

  throw lastError || new Error("All fallback models and retry attempts were exhausted");
}

// API endpoint to generate high-fidelity AI tips using @google/genai SDK
app.post("/api/tips", async (req, res) => {
  const { language, products, totalSales, netProfit, totalUdhaar, activeShopName } = req.body;
  const ai = getGeminiClient();

  // Baseline rule-based fallback tips tuned to language
  const localFallbacks: Record<string, { text: string; type: string }[]> = {
    en: [
      { text: "Maggi has low profit margin (3.1%). Consider soft rising the selling price from ₹95 to ₹98 to save profits.", type: "margin" },
      { text: "Friday is your historically highest sales day for Amul Butter. Stock 20% extra to satisfy demand.", type: "info" },
      { text: "Udhaar balance is exceeding ₹8,000 threshold! Tap 'Send WhatsApp Reminder' next to top accounts.", type: "alert" }
    ],
    hi: [
      { text: "मैगी पर लाभ मार्जिन बहुत कम (3.1%) है। मुनाफा बढ़ाने के लिए दाम को ₹95 से बढ़ाकर ₹98 करने पर विचार करें।", type: "margin" },
      { text: "शुक्रवार को अमूल बटर की बिक्री सबसे अधिक होती है। ग्राहकों की मांग पूरी करने के लिए 20% अतिरिक्त स्टॉक रखें।", type: "info" },
      { text: "कुल उधार ₹8,000 से ऊपर हो गया है! बड़े खातों के आगे 'व्हाट्सएप रिमांडर' दबाकर भुगतान मांगें।", type: "alert" }
    ],
    mr: [
      { text: "मॅगीवर नफा मार्जिन खूप कमी (3.1%) आहे. नफा वाढवण्यासाठी विक्री किंमत ₹95 वरून ₹98 करण्याचा विचार करा.", type: "margin" },
      { text: "शुक्रवारी अमूल बटरला सर्वात जास्त मागणी असते. ग्राहकांची निराशा टाळण्यासाठी आधीच 20% अतिरिक्त स्टॉक ठेवा.", type: "info" },
      { text: "एकूण उधारी ₹8,000 पेक्षा जास्त झाली आहे! मुख्य खात्यांच्या समोर 'व्हाट्सएप रिमांडर' बटण दाबून उधारी वसूल करा.", type: "alert" }
    ],
    ta: [
      { text: "மேகியின் லாப வரம்பு மிகக் குறைவாக (3.1%) உள்ளது. லாபத்தைக் காக்க விற்பனை விலையை ₹95 இல் இருந்து ₹98 ஆக உயர்த்தவும்.", type: "margin" },
      { text: "வெள்ளிக்கிழமை உங்கள் சிறந்த விற்பனை நாளாகும். அமூல் பட்டர் கூடுதலாக 20% இருப்பு வைக்கவும்.", type: "info" },
      { text: "கடன் நிலுவை ₹8,000ஐத் தாண்டியுள்ளது! வாடிக்கையாளர்களுக்கு வாட்ஸ்அப் நினைவூட்டலை அனுப்ப ஊக்குவிக்கவும்.", type: "alert" }
    ],
    te: [
      { text: "మ్యాగీపై లాభ మార్జిన్ చాలా తక్కువగా (3.1%) ఉంది. లాభాలు పెంచుకోవడానికి అమ్మకపు ధరను ₹95 నుండి ₹98 కి పెంచండి.", type: "margin" },
      { text: "శుక్రవారం నాడు అమూల్ బటర్ అమ్మకాలు అత్యధికంగా ఉన్నాయి. ముందుగానే 20% అదనంగా స్టాక్ చేసుకోండి.", type: "info" },
      { text: "మొత్తం అప్పు బకాయి ₹8,000 దాటింది! వాట్సాప్ రిమైండర్ల సదుపాయం ఉపయోగించి అప్పు వసూలు చేయండి.", type: "alert" }
    ]
  };

  const currentLanguage = language || 'en';
  const fallbackList = localFallbacks[currentLanguage] || localFallbacks['en'];

  if (!ai) {
    // Return high-quality localized rules if Gemini client is offline or missing API Key
    return res.json({
      success: true,
      provider: "rule-engine",
      tips: fallbackList
    });
  }

  try {
    const productsSummary = (products || [])
      .slice(0, 8)
      .map((p: any) => `${p.name} (Buy: ₹${p.buyPrice}, Sell: ₹${p.sellPrice}, Sold: ${p.soldQuantity})`)
      .join(", ");

    const systemInstruction = `You are "AI Saathi", a friendly, highly intelligent local Indian business advisor for micro-retailers (grocery shops, stationery, kirana stores). 
Your task is to analyze the user's products and shop stats and output EXACTLY 3 helpful, highly specific, practical business optimization tips in the requested language (${language}).

RULES:
1. Speak directly, warmly, and clearly to a small shopkeeper, using practical contexts. Use local terms if appropriate (e.g., Maggi, Kirana, Udhaar).
2. Ground your tips in the provided shop data.
   - Look for products with low profit margin (sellPrice - buyPrice is small) and tell them to increase the price.
   - Look for products selling very well, advise storing more.
   - Discuss Udhaar collection if udhaar is high.
3. Write completely in the target language (e.g. if language is "hi", write in Hindi script; if "mr", in Marathi script; if "en", in English).
4. MUST return a JSON array conforming exactly to the responseSchema description. No other words should prefix or suffix the JSON output.`;

    const prompt = `Shop Name: "${activeShopName || 'My Shop'}"
Financial Snapshot:
- Today's Sales: ₹${totalSales}
- Today's Net Profit: ₹${netProfit}
- Out-standing Udhaar: ₹${totalUdhaar}
Products in Inventory: ${productsSummary || 'No products added yet.'}

Provide 3 business tips in ${language}.`;

    const { response, model } = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of exactly 3 highly customized business advisor tips",
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "Conversational, highly actionable advice phrase in the chosen language. (E.g. Hindi script if language is hi)."
              },
              type: {
                type: Type.STRING,
                description: "Category index representing tip nature: 'margin' (for pricing/underpricing warning), 'alert' (for high udhaar or low cash warnings), 'success' (positive milestone achieved), or 'info' (general intelligence or stocking recommendations)."
              }
            },
            required: ["text", "type"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (textOutput) {
      const cleaned = textOutput.trim();
      const parsedTips = JSON.parse(cleaned);
      return res.json({
        success: true,
        provider: model,
        tips: parsedTips
      });
    } else {
      throw new Error("Empty text output from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error, falling back to local intelligence:", error);
    return res.json({
      success: true,
      provider: "rule-engine-fallback",
      tips: fallbackList
    });
  }
});

// Dynamic UI Translation Endpoint using Gemini
app.post("/api/translate-ui", async (req, res) => {
  const { targetLanguage, englishProfile } = req.body;
  const ai = getGeminiClient();

  if (!targetLanguage || !englishProfile) {
    return res.status(400).json({ status: "error", error: "Missing targetLanguage or englishProfile" });
  }

  if (!ai) {
    return res.status(503).json({ 
      status: "error", 
      error: "Gemini AI client is not configured. Please supply a valid GEMINI_API_KEY." 
    });
  }

  try {
    const systemInstruction = `You are a professional retail localization and software translation assistant.
Translate the following English localization JSON structure into the target language: "${targetLanguage}".

CRITICAL INSTRUCTIONS:
1. Keep the JSON keys EXACTLY identical. Never change or translate any JSON keys.
2. Only translate the values (the strings).
3. Do NOT translate or modify placeholder patterns like {shopName}, {amount}, or {phone}. Keep them exactly as they are (including curly braces).
4. Do not wrap code in any markdown backticks. Return the JSON directly.
5. Translate to conversational, warm, and natural phrasing suitable for an Indian microscopic shop owner / kirana store owner. Save profits, warn about credit or overdue balances elegantly, etc.`;

    const prompt = `Target Language requested: ${targetLanguage}
UI Labels to translate:
${JSON.stringify(englishProfile)}`;

    const { response, model } = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    let output = response.text || "";
    if (output) {
      // Clean up markdown code block syntax if generated by model
      output = output.trim();
      if (output.startsWith("```")) {
        output = output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      const parsedMap = JSON.parse(output);
      return res.json({
        success: true,
        translated: parsedMap
      });
    } else {
      throw new Error("No output from model");
    }
  } catch (err: any) {
    console.error("AI translation error occurred:", err);
    return res.status(500).json({
      status: "error",
      error: err.message || "Failed to translate UI dynamically"
    });
  }
});

// Serve health report
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date() });
});

// Vite middleware development setup
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dukaan Saathi Server] Booted successfully and running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
