import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

app.post("/sort-ticket", async (req, res) => {
  try {
    const { ticket_id, channel, locale, message } = req.body;

    if (!ticket_id || !message) {
      return res
        .status(400)
        .json({ error: "ticket_id and message are required fields." });
    }

    const ticketSchema = {
      type: Type.OBJECT,
      properties: {
        case_type: {
          type: Type.STRING,
          enum: [
            "wrong_transfer",
            "payment_failed",
            "refund_request",
            "phishing_or_social_engineering",
            "other",
          ],
          description: "Classify the issue based on customer message.",
        },
        severity: {
          type: Type.STRING,
          enum: ["low", "medium", "high", "critical"],
          description: "Severity level of the issue.",
        },
        department: {
          type: Type.STRING,
          enum: [
            "customer_support",
            "dispute_resolution",
            "payments_ops",
            "fraud_risk",
          ],
          description: "The department that should handle this.",
        },
        agent_summary: {
          type: Type.STRING,
          description:
            "One or two neutral sentences summarizing the ticket. NEVER ask for PIN, OTP, password, or card numbers.",
        },
        confidence: {
          type: Type.NUMBER,
          description: "Float between 0 and 1 representing model confidence.",
        },
      },
      required: [
        "case_type",
        "severity",
        "department",
        "agent_summary",
        "confidence",
      ],
    };

    const systemInstruction = `
        You are an AI assistant for a financial service ticket classification system.
        Analyze the customer message and classify it according to the rules:
        
        - case_type rules: 
          * 'wrong_transfer': Money sent to wrong recipient. 
          * 'payment_failed': Transaction failed but balance deducted. 
          * 'refund_request': Customer asking for a refund. 
          * 'phishing_or_social_engineering': Suspicious calls, asking for PIN, OTP, password. 
          * 'other': Anything else. 
          
        - department mapping: 
          * wrong_transfer -> dispute_resolution 
          * payment_failed -> payments_ops 
          * phishing_or_social_engineering -> fraud_risk 
          * refund_request (low severity) -> customer_support, (contested) -> dispute_resolution 
          * other -> customer_support 

        - CRITICAL SAFETY RULE: The agent_summary MUST NEVER ask the customer to share PIN, OTP, password, or card numbers. Keep it neutral. [cite: 22, 23]
        `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Classify this ticket message: "${message}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ticketSchema,
        temperature: 0.1,
      },
    });

    const aiResult = JSON.parse(response.text);

    const human_review_required =
      aiResult.severity === "critical" ||
      aiResult.case_type === "phishing_or_social_engineering";

    const finalResponse = {
      ticket_id: ticket_id,
      case_type: aiResult.case_type,
      severity: aiResult.severity,
      department: aiResult.department,
      agent_summary: aiResult.agent_summary,
      human_review_required: human_review_required,
      confidence: aiResult.confidence,
    };

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error processing ticket:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
