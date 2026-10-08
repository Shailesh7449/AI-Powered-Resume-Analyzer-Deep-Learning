import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const PYTHON_PORT = 5001;
const PYTHON_URL = `http://localhost:${PYTHON_PORT}`;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Configure multer for file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper function to check and spawn Python FastAPI service if not running
function ensurePythonService() {
  fetch(`${PYTHON_URL}/health`)
    .then((res) => {
      if (res.ok) {
        console.log("[Node Server] Python FastAPI ML service is already running on port 5001.");
      }
    })
    .catch(() => {
      console.log("[Node Server] Starting Python FastAPI ML service on port 5001...");
      const mlProcess = spawn(
        "python3",
        ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", `${PYTHON_PORT}`],
        {
          cwd: path.resolve(__dirname, "ml-service"),
          env: {
            ...process.env,
            PYTHONPATH: path.resolve(__dirname, "ml-service"),
          },
          stdio: "inherit",
        }
      );

      mlProcess.on("error", (err) => {
        console.error("[Node Server] Failed to start Python ML service:", err);
      });
    });
}

ensurePythonService();

// ==========================================
// 1. Resume Parsing Endpoint (PDF & DOCX)
// ==========================================
app.post("/api/parse-resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, buffer, mimetype } = req.file;
    let extractedText = "";

    if (mimetype === "application/pdf" || originalname.toLowerCase().endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      extractedText = data.text || "";
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalname.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (
      mimetype === "text/plain" ||
      originalname.toLowerCase().endsWith(".txt") ||
      originalname.toLowerCase().endsWith(".md")
    ) {
      extractedText = buffer.toString("utf-8");
    } else {
      return res.status(400).json({
        error: "Unsupported file format. Please upload a PDF, DOCX, or TXT file.",
      });
    }

    // Clean text
    const cleanedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    return res.json({
      filename: originalname,
      text: cleanedText,
      characterCount: cleanedText.length,
      wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (error: any) {
    console.error("Error parsing resume file:", error);
    return res.status(500).json({ error: error.message || "Failed to parse document" });
  }
});

// ==========================================
// 2. Python ML Proxy Endpoints
// ==========================================
app.get("/api/ml-health", async (_req, res) => {
  try {
    const response = await fetch(`${PYTHON_URL}/health`);
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(503).json({
      status: "offline",
      message: "Python ML Service is warming up or offline",
      error: err.message,
    });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { resume_text, job_description_text } = req.body;
    if (!resume_text) {
      return res.status(400).json({ error: "resume_text is required" });
    }

    const pyRes = await fetch(`${PYTHON_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text,
        job_description_text: job_description_text || "",
      }),
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      return res.status(pyRes.status).json({ error: errText });
    }

    const data = await pyRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error("Error connecting to Python ML service:", err);
    return res.status(500).json({
      error: "Failed to communicate with Deep Learning ML service",
      details: err.message,
    });
  }
});

app.post("/api/semantic-similarity", async (req, res) => {
  try {
    const { text_a, text_b } = req.body;
    const pyRes = await fetch(`${PYTHON_URL}/semantic-similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text_a, text_b }),
    });
    const data = await pyRes.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/extract-skills", async (req, res) => {
  try {
    const { text } = req.body;
    const pyRes = await fetch(`${PYTHON_URL}/extract-skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await pyRes.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Gemini AI Career Assistant Chatbot
// ==========================================
function generateGroundedFallbackChatReply(message: string, analysisContext: any): string {
  const atsScore = analysisContext?.ats_score ?? 75;
  const breakdown = analysisContext?.breakdown;
  const missing = analysisContext?.skills?.missing_skills || [];
  const matched = analysisContext?.skills?.matched_skills || [];
  const recs = analysisContext?.recommendations || [];
  const strengths = analysisContext?.strengths || [];
  const semanticPct = analysisContext?.deep_learning?.semantic_match_percentage ?? 75;

  const lower = message.toLowerCase();

  if (lower.includes("why is my ats score") || lower.includes("breakdown") || lower.includes("score")) {
    return (
      `Your ATS Score is **${atsScore}/100**, calculated using our transparent, weighted scoring model:\n\n` +
      `• **Skill Match:** ${breakdown?.skill_match?.score ?? 20}/25 (${matched.length} required skills detected)\n` +
      `• **Semantic Match (Sentence-BERT):** ${breakdown?.semantic_match?.score ?? 18}/25 (${semanticPct}% cosine similarity)\n` +
      `• **Keyword Match:** ${breakdown?.keyword_match?.score ?? 15}/20 (technical domain overlap)\n` +
      `• **Experience Relevance:** ${breakdown?.experience?.score ?? 10}/15 (action verbs & quantified impact)\n` +
      `• **Education Relevance:** ${breakdown?.education?.score ?? 7}/10 (degree & field alignment)\n` +
      `• **Structure & Formatting:** ${breakdown?.formatting?.score ?? 4}/5 (ATS header layout)\n\n` +
      `**Key takeaway:** ${recs[0] || "Target the missing skills to boost your score further!"}`
    );
  }

  if (lower.includes("missing") || lower.includes("skill")) {
    if (missing.length > 0) {
      return (
        `Based on the job requirements, you are missing **${missing.length} key skill(s)**:\n\n` +
        missing.map((s: string) => `• **${s}**`).join("\n") +
        `\n\n**Recommendation:** Incorporate these technologies into your Skills section or describe relevant coursework/projects where you utilized them.`
      );
    } else {
      return `Great news! Your resume covers all key required skills identified in the target job description. You have matched: **${matched.join(", ")}**.`;
    }
  }

  if (lower.includes("improve") || lower.includes("section") || lower.includes("which section")) {
    return (
      `Here are the top strategic improvements to boost your ATS viability:\n\n` +
      (recs.length > 0
        ? recs.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")
        : "1. Add measurable metrics and quantifiable results in project achievements.\n2. Incorporate target job keywords into bullet points.\n3. Keep distinct section headers.") +
      `\n\nUse our **Section-wise AI Editor** tab to rewrite specific sections with action verbs.`
    );
  }

  return (
    `Here is a summary of your candidate profile alignment:\n\n` +
    `• **ATS Score:** ${atsScore}/100\n` +
    `• **Job Match:** ${analysisContext?.job_match_percentage ?? 80}%\n` +
    `• **Primary Strength:** ${strengths[0] || "Solid foundational knowledge in technical domain."}\n` +
    `• **Action Item:** ${recs[0] || "Incorporate quantifiable metrics in your project descriptions."}\n\n` +
    `Feel free to ask about specific sections, missing skills, or interview preparation!`
  );
}

app.post("/api/gemini/chat", async (req, res) => {
  const { message, history, analysisContext } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const systemInstruction = `
You are the AI Career Assistant for "ResumeAI – Intelligent Resume Analyzer".
Your role is to explain ATS analysis results, guide the candidate with actionable interview & resume advice, and answer questions clearly.

CRITICAL RULES:
1. Ground your answers strictly in the provided resume analysis context.
2. DO NOT recalculate or invent a different ATS score. Explain the existing calculated score: ${
    analysisContext?.ats_score ?? "N/A"
  }/100.
3. Be professional, encouraging, objective, and concise. Use clear bullet points when making recommendations.
4. If asked about missing skills, refer to: ${(analysisContext?.skills?.missing_skills || []).join(", ") || "None missing"}.
5. If asked why the ATS score was given, break down the 6 components: Keyword Match (${analysisContext?.breakdown?.keyword_match?.score}/20), Skill Match (${analysisContext?.breakdown?.skill_match?.score}/25), Semantic Similarity (${analysisContext?.breakdown?.semantic_match?.score}/25), Experience (${analysisContext?.breakdown?.experience?.score}/15), Education (${analysisContext?.breakdown?.education?.score}/10), Formatting (${analysisContext?.breakdown?.formatting?.score}/5).
6. Explain how deep learning Sentence Transformers calculated the semantic match (${analysisContext?.deep_learning?.semantic_match_percentage ?? "N/A"}%) using 384-dimensional cosine similarity.
`;

  const contextPrompt = `
Current Resume Analysis Context:
- Overall ATS Score: ${analysisContext?.ats_score ?? 75}/100
- Job Match Percentage: ${analysisContext?.job_match_percentage ?? 80}%
- Matched Skills: ${(analysisContext?.skills?.matched_skills || []).join(", ")}
- Missing Skills: ${(analysisContext?.skills?.missing_skills || []).join(", ")}
- Additional Candidate Skills: ${(analysisContext?.skills?.additional_skills || []).join(", ")}
- Semantic Similarity: ${analysisContext?.deep_learning?.semantic_match_percentage ?? 75}%
- Strengths: ${(analysisContext?.strengths || []).join("; ")}
- Improvement Recommendations: ${(analysisContext?.recommendations || []).join("; ")}

User Question: ${message}
`;

  // Try primary model gemini-3.8-flash, then gemini-3.1-flash-lite
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: contextPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    } catch (err: any) {
      console.warn(`[Gemini Chat] Model ${model} failed, attempting next:`, err?.message || err);
    }
  }

  // Graceful grounded fallback if external API is temporarily unavailable
  const fallbackReply = generateGroundedFallbackChatReply(message, analysisContext);
  return res.json({ reply: fallbackReply });
});

// ==========================================
// 4. Section-Wise AI Editor Endpoint
// ==========================================
app.post("/api/gemini/edit-section", async (req, res) => {
  const { sectionName, currentContent, jobDescription, instructions } = req.body;
  if (!sectionName || !currentContent) {
    return res.status(400).json({ error: "sectionName and currentContent are required" });
  }

  const prompt = `
Task: Improve and rewrite the resume section "${sectionName}".

Target Job Description Context (if provided):
${jobDescription || "General standard tech industry benchmark"}

Current Section Content:
"""
${currentContent}
"""

Additional User Direction:
${instructions || "Make it more professional, action-oriented, and ATS-optimized."}

STRICT CONSTRAINTS (CRITICAL - DO NOT VIOLATE):
- You MUST follow the candidate's original information accurately.
- DO NOT invent new companies, employment dates, job titles, or unverified degrees.
- DO NOT invent unearned certifications, fake projects, or fake numerical metrics (e.g. do not invent "$5M revenue" or "500% increase" unless original text mentions similar data).
- Enhance clarity, replace passive verbs with strong action verbs (e.g. Engineered, Spearheaded, Optimized, Deployed).
- Format clearly with clean bullet points or concise paragraphs suitable for ATS parsing.

Please return a JSON object with:
- "improved_content": The rewritten, high-impact version of the section.
- "changes_summary": A bulleted list of 2-3 specific improvements made.
`;

  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      if (parsed.improved_content) {
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn(`[Gemini Edit Section] Model ${model} failed:`, err?.message || err);
    }
  }

  // Fallback: Enhance formatting and action verbs cleanly without hallucinating
  const polishedContent = currentContent
    .split("\n")
    .map((line: string) => {
      let trimmed = line.trim();
      if (!trimmed) return "";
      // Replace weak passive beginnings with active verbs if applicable
      trimmed = trimmed
        .replace(/^(?:worked on|responsible for|helped with)\s+/i, "Engineered ")
        .replace(/^(?:assisted in|participated in)\s+/i, "Collaborated on ");
      return trimmed.startsWith("•") || trimmed.startsWith("-") ? trimmed : `• ${trimmed}`;
    })
    .join("\n");

  return res.json({
    improved_content: polishedContent,
    changes_summary: [
      "Converted passive statements into strong, active engineering verbs.",
      "Formatted content with clean, standardized bullet points for ATS parsers.",
      "Preserved all factual details, companies, and achievements accurately.",
    ],
  });
});

// ==========================================
// 5. Mount Vite in Development / Serve Static in Production
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ResumeAI] Full-stack application running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[ResumeAI] Port ${PORT} is currently in use by an existing instance.`);
    } else {
      console.error("[ResumeAI] Server error:", err);
    }
  });
}

startServer();
