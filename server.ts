import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom user agent telemetry
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  ai = new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will fallback to local simulated replies.");
}

// REST API Proxy Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", keyConfigured: !!API_KEY });
});

// 1. AI SQL Query Tutor & Explanations Route
app.post("/api/query-explain", async (req, res) => {
  const { query, datasetName, tableSchemas } = req.body;

  if (!query) {
    return res.status(400).json({ error: "No custom SQL query provided." });
  }

  const prompt = `As an elite SQL Performance Coach and Senior Data Analyst, inspect this SQL Query:
\`\`\`sql
${query}
\`\`\`
Target Dataset Namespace: ${datasetName || "General Analytical Storage"}
Associated Table Schemas context:
${JSON.stringify(tableSchemas || {}, null, 2)}

Provide a beautiful, educational, and highly scannable Markdown summary explaining:
1. **Mechanical Execution flow**: Detail exactly which clause executes first, second, etc. (e.g. FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY). Explain in context of this exact query!
2. **Analysis Breakdown**: Explain what this query answers in natural corporate business terms.
3. **Tips & Potential Syntax Risks**: Point out if they are using INNER vs LEFT JOIN properly, checking null cases, or if aggregations match their GROUP BY dimensions perfectly.
4. **Optimization Note**: How they could index keys or write it more efficiently on huge millions-of-rows tables.

Keep your response highly educational, clean, concise, and structured. Do not use flowery marketing jargon.`;

  try {
    if (!ai) {
      throw new Error("Gemini API Client is not initialized. Please verify your GEMINI_API_KEY in secrets configuration.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("AI Explanation failure:", error);
    // Provide an elegant fallback explanation so the user has an operational experience even if key is absent
    const fallbackExplanation = `### 💡 Database Tutor (Simulated Guidance - Offline Mode)
Your SQL Query:
\`\`\`sql
${query}
\`\`\`

Here is a high-level review of your query:
1. **Execution Sequence**:
   - The database starts at **FROM**, locating the source tables.
   - Any **JOIN** statements compile paired row buckets based on your shared keys.
   - It filters rows with **WHERE**, groups aggregates using **GROUP BY**, filters groups via **HAVING**, projects columns from **SELECT**, and finally sorts with **ORDER BY**.
2. **Business Application**:
   - This query scans your datasets to partition, organize, and filter items.
3. **Analyst Best Practice**:
   - Always verify that all selected columns not inside an aggregate function are explicitly declared in the \`GROUP BY\` statement to avoid parsing errors in standard RDBMS engines.

*Note: Configure your GEMINI_API_KEY in the Secrets panel to activate full tailored AI explanations!*`;
    res.json({ explanation: fallbackExplanation, isOfflineFallback: true });
  }
});

// 2. AI Analyst Mock Interview Chat Routing
app.post("/api/mock-interview-chat", async (req, res) => {
  const { messages, persona, level } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  // Align instructions according to the selected persona
  let personaPrompt = `You are a Senior Analytics Lead interviewing a junior candidate for an elite Data Analyst role. Your tone is supportive, smart, but rigorous. You ask SQL syntax questions, query execution logic, index optimization, and analytical case study logic. Wait for the candidate to answer before testing/guiding them on the next scenario.`;
  if (persona === "faang-manager") {
    personaPrompt = `You are a tough, FAANG-level Director of Business Intelligence. You test the candidate on scale, complex window operations, indexing, explain paths, query bottlenecks, and advanced business cohort modeling. Be professional, direct, and detailed.`;
  } else if (persona === "startup-cto") {
    personaPrompt = `You are a quick-moving, agile Startup CTO. You want to see if the candidate has practical business sense, moves fast with SQL aggregations, writes raw rapid dashboard queries, and can translate technical database outcomes directly to CEO growth strategies. Ask practical product-led SQL scenarios.`;
  }

  const systemInstruction = `${personaPrompt}
Currently interviewing a candidate aiming for: ${level || "Job-Ready Data Analyst"}.
Guidelines:
1. Conduct a realistic tech screening. Be responsive to what the candidate shares.
2. If they paste a query, evaluate its layout, correctness, performance efficiency, and explain any bugs.
3. Keep each response concise (1-2 scannable paragraphs), professional, educational, and end your response with exactly ONE engaging SQL query challenge or behavioral analyst conceptual question.
4. Always outputs in highly structured scannable Markdown formats.`;

  try {
    if (!ai) {
      throw new Error("Gemini API Client is not initialized.");
    }

    // Adapt messages list for SDK format { role: 'user'|'model', parts: [{ text: '...' }] }
    const formattedContents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // If last message doesn't exist, seed initial greeting
    if (formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: "Hello, I am ready to start my mock Data Analyst SQL interview." }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents as any,
      config: {
        systemInstruction: systemInstruction
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Mock Interview failure:", error);
    // Offline simulated support
    const fallbackReplies = [
      "Welcome to your Data Analyst Technical Screening! I am your Technical Interviewer today. Let's start with a practical challenge. Suppose you have a table `sales` with columns `sale_id`, `customer_id`, `sale_date`, and `amount`. How would you write a query to find the top 3 spending customers with their total purchase amounts?",
      "Excellent. That is correct! Now, let's look at performance optimization. If that `sales` table had 50 million rows and queries on `sale_date` took several seconds, what relational indexes would you propose to create, and how would you verify if the database is actually using them?",
      "Great insights on database execution indexes! Let's talk business cases: Can you explain the practical business difference between a LEFT JOIN and an INNER JOIN with concrete retail examples? When would a LEFT JOIN be absolutely essential for measuring service performance indicators?",
      "Fantastic response. Let's try deep window operators. If you wanted to compute a 7-day trailing average of transactions, what SQL syntax configuration would you write?"
    ];
    // Pick based on message history length
    const step = Math.min(Math.floor((messages.length || 0) / 2), fallbackReplies.length - 1);
    res.json({ reply: fallbackReplies[step], isOfflineFallback: true });
  }
});

// Configure Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SQL Analytics Board Server] Booted on port ${PORT}`);
  });
}

startServer();
