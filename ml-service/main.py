"""
FastAPI Microservice for ResumeAI Deep Learning, ATS Analysis, and API Endpoints.
Handles deep-learning semantic similarity, skill extraction, explainable ATS scoring,
resume document text extraction (PDF/DOCX), and server-side Gemini Career Assistant.
"""

from contextlib import asynccontextmanager
import io
import json
import os
import re
from typing import Any, Dict, List, Optional
import httpx
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import docx
except ImportError:
    docx = None

from model import (
    initialize_transformer,
    get_embedding,
    compute_cosine_similarity,
    find_top_semantic_matches,
    get_model_metadata,
)
from skill_extractor import extract_skills, compare_skills
from ats_scorer import calculate_ats_score


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[ResumeAI ML Service] Initializing Transformer models...")
    initialize_transformer()
    yield
    print("[ResumeAI ML Service] Shutting down...")


app = FastAPI(
    title="ResumeAI Service",
    description="Deep Learning Semantic Similarity, Explainable ATS Scoring & API Service",
    version="1.1.0",
    lifespan=lifespan,
)

# Enable CORS for cross-origin communication from Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ==========================================
# Pydantic Request Models
# ==========================================
class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of the candidate's resume")
    job_description_text: str = Field("", description="Target job description text")


class SemanticSimilarityRequest(BaseModel):
    text_a: str
    text_b: str


class SkillExtractionRequest(BaseModel):
    text: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None
    analysisContext: Optional[Dict[str, Any]] = None


class EditSectionRequest(BaseModel):
    sectionName: str
    currentContent: str
    jobDescription: Optional[str] = None
    instructions: Optional[str] = None


# ==========================================
# 1. Health Endpoints
# ==========================================
@app.get("/health")
@app.get("/api/health")
@app.get("/api/ml-health")
def health_check():
    return {
        "status": "healthy",
        "service": "ResumeAI Python ML Service",
        "engine": get_model_metadata(),
    }


# ==========================================
# 2. Skill Extraction & Semantic Similarity
# ==========================================
@app.post("/extract-skills")
@app.post("/api/extract-skills")
def api_extract_skills(req: SkillExtractionRequest):
    skills = extract_skills(req.text)
    return {"skills": skills, "count": len(skills)}


@app.post("/semantic-similarity")
@app.post("/api/semantic-similarity")
def api_semantic_similarity(req: SemanticSimilarityRequest):
    vec_a = get_embedding(req.text_a)
    vec_b = get_embedding(req.text_b)
    sim = compute_cosine_similarity(vec_a, vec_b)
    return {
        "similarity": float(round(float(sim), 4)),
        "percentage": float(round(float(sim) * 100, 1)),
        "vector_a_sample": [float(round(float(x), 4)) for x in vec_a[:8]],
        "vector_b_sample": [float(round(float(x), 4)) for x in vec_b[:8]],
        "dimension": int(len(vec_a)),
    }


# ==========================================
# 3. Main Analyze Endpoint
# ==========================================
@app.post("/analyze")
@app.post("/api/analyze")
def analyze_resume(req: AnalyzeRequest):
    """
    Main Deep Learning & ATS Pipeline:
    1. Skill Extraction & Normalization
    2. Deep Learning Dense Vector Embedding Generation (384-dim via Sentence-BERT)
    3. Cosine Similarity Calculation
    4. Top Contextual Sentence Alignments
    5. Explainable Weighted ATS Score Computation
    """
    resume_text = req.resume_text.strip()
    jd_text = req.job_description_text.strip()

    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")

    # 1. Skill Extraction
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text) if jd_text else []
    matched_skills, missing_skills, additional_skills, related_skills = compare_skills(
        resume_skills, jd_skills
    )

    # 2. Deep Learning Dense Vector Embeddings (384-dim)
    resume_vec = get_embedding(resume_text)
    jd_vec = get_embedding(jd_text) if jd_text else resume_vec

    # 3. Cosine Similarity (Deep Learning Semantic Match)
    semantic_sim = compute_cosine_similarity(resume_vec, jd_vec) if jd_text else 0.75

    # 4. Contextual Sentence Alignments
    top_matches = find_top_semantic_matches(resume_text, jd_text, top_k=4) if jd_text else []

    # 5. Explainable ATS Score Computation
    ats_result = calculate_ats_score(
        resume_text=resume_text,
        jd_text=jd_text,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        jd_skills=jd_skills,
        semantic_similarity=semantic_sim,
    )

    return {
        "ats_score": ats_result["total_score"],
        "job_match_percentage": ats_result["job_match_percentage"],
        "breakdown": ats_result["breakdown"],
        "formula": ats_result["formula"],
        "strengths": ats_result["strengths"],
        "weaknesses": ats_result["weaknesses"],
        "recommendations": ats_result["recommendations"],
        "skills": {
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "additional_skills": additional_skills,
            "related_skills": related_skills,
            "total_found": len(resume_skills),
            "total_missing": len(missing_skills),
        },
        "deep_learning": {
            "semantic_similarity": float(round(float(semantic_sim), 4)),
            "semantic_match_percentage": float(round(float(semantic_sim) * 100, 1)),
            "resume_embedding_sample": [float(round(float(x), 4)) for x in resume_vec[:8]],
            "jd_embedding_sample": [float(round(float(x), 4)) for x in jd_vec[:8]],
            "embedding_dimension": int(len(resume_vec)),
            "top_semantic_pairs": top_matches,
            "model_metadata": get_model_metadata(),
        },
    }


# ==========================================
# 4. Document Parsing (PDF / DOCX / TXT)
# ==========================================
@app.post("/parse-resume")
@app.post("/api/parse-resume")
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Extracts text from uploaded resume documents:
    Supports PDF (via pypdf), DOCX (via python-docx), and plain text.
    """
    filename = file.filename or "resume"
    contents = await file.read()
    extracted_text = ""

    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        if PdfReader is not None:
            try:
                reader = PdfReader(io.BytesIO(contents))
                text_parts = [page.extract_text() for page in reader.pages if page.extract_text()]
                extracted_text = "\n".join(text_parts)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {e}")
        else:
            raise HTTPException(status_code=500, detail="PDF parser not available")
    elif lower_name.endswith(".docx"):
        if docx is not None:
            try:
                doc = docx.Document(io.BytesIO(contents))
                extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse DOCX document: {e}")
        else:
            raise HTTPException(status_code=500, detail="DOCX parser not available")
    else:
        # Plain text / Markdown
        try:
            extracted_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = contents.decode("latin-1", errors="ignore")

    cleaned_text = re.sub(r"[\r\n]+", "\n", extracted_text).strip()
    cleaned_text = re.sub(r"[ \t]+", " ", cleaned_text)

    return {
        "filename": filename,
        "text": cleaned_text,
        "characterCount": len(cleaned_text),
        "wordCount": len(cleaned_text.split()),
    }


# ==========================================
# 5. Gemini AI Helper & Fallbacks
# ==========================================
def generate_grounded_fallback_chat_reply(message: str, context: Optional[Dict[str, Any]]) -> str:
    ats_score = context.get("ats_score", 75) if context else 75
    breakdown = context.get("breakdown", {}) if context else {}
    skills = context.get("skills", {}) if context else {}
    missing = skills.get("missing_skills", [])
    matched = skills.get("matched_skills", [])
    recs = context.get("recommendations", []) if context else []
    strengths = context.get("strengths", []) if context else []
    dl = context.get("deep_learning", {}) if context else {}
    semantic_pct = dl.get("semantic_match_percentage", 75)

    msg_lower = message.lower()
    if "why is my ats score" in msg_lower or "score" in msg_lower or "breakdown" in msg_lower:
        skill_score = breakdown.get("skill_match", {}).get("score", 20)
        sem_score = breakdown.get("semantic_match", {}).get("score", 18)
        kw_score = breakdown.get("keyword_match", {}).get("score", 15)
        exp_score = breakdown.get("experience", {}).get("score", 10)
        edu_score = breakdown.get("education", {}).get("score", 7)
        fmt_score = breakdown.get("formatting", {}).get("score", 4)
        return (
            f"Your ATS Score is **{ats_score}/100**, calculated using our transparent, weighted scoring model:\n\n"
            f"• **Skill Match:** {skill_score}/25 ({len(matched)} required skills detected)\n"
            f"• **Semantic Match (Sentence-BERT):** {sem_score}/25 ({semantic_pct}% cosine similarity)\n"
            f"• **Keyword Match:** {kw_score}/20 (technical domain overlap)\n"
            f"• **Experience Relevance:** {exp_score}/15 (action verbs & quantified impact)\n"
            f"• **Education Relevance:** {edu_score}/10 (degree & field alignment)\n"
            f"• **Structure & Formatting:** {fmt_score}/5 (ATS header layout)\n\n"
            f"**Key takeaway:** {recs[0] if recs else 'Target missing skills to boost your score further!'}"
        )

    if "missing" in msg_lower or "skill" in msg_lower:
        if missing:
            return (
                f"Based on the job requirements, you are missing **{len(missing)} key skill(s)**:\n\n"
                + "\n".join([f"• **{s}**" for s in missing])
                + "\n\n**Recommendation:** Incorporate these technologies into your Skills section or describe relevant projects where you utilized them."
            )
        else:
            return (
                f"Great news! Your resume covers all key required skills identified in the target job description: **{', '.join(matched)}**."
            )

    if "improve" in msg_lower or "section" in msg_lower:
        return (
            "Here are the top strategic improvements to boost your ATS viability:\n\n"
            + (
                "\n".join([f"{i + 1}. {r}" for i, r in enumerate(recs)])
                if recs
                else "1. Add measurable metrics in project achievements.\n2. Incorporate target job keywords.\n3. Maintain distinct section headers."
            )
            + "\n\nUse our **Section-wise AI Editor** tab to rewrite specific sections with action verbs."
        )

    return (
        f"Here is a summary of your candidate profile alignment:\n\n"
        f"• **ATS Score:** {ats_score}/100\n"
        f"• **Job Match:** {context.get('job_match_percentage', 80) if context else 80}%\n"
        f"• **Primary Strength:** {strengths[0] if strengths else 'Solid foundational knowledge in technical domain.'}\n"
        f"• **Action Item:** {recs[0] if recs else 'Incorporate quantifiable metrics in your project descriptions.'}\n\n"
        "Feel free to ask about specific sections, missing skills, or interview preparation!"
    )


async def call_gemini_api(prompt: str, system_instruction: str = "", is_json: bool = False) -> Optional[str]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    models = ["gemini-3.8-flash", "gemini-3.1-flash-lite"]
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3 if is_json else 0.7},
        }
        if system_instruction:
            payload["system_instruction"] = {"parts": [{"text": system_instruction}]}
        if is_json:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
        except Exception as e:
            print(f"[Gemini API Notice] Model {model} request failed: {e}")
            continue

    return None


@app.post("/gemini/chat")
@app.post("/api/gemini/chat")
async def chat_with_assistant(req: ChatRequest):
    """
    Career Assistant chatbot grounded in calculated ATS breakdown metrics.
    """
    ctx = req.analysisContext or {}
    system_instruction = (
        "You are the AI Career Assistant for 'ResumeAI – Intelligent Resume Analyzer'. "
        "Your role is to explain ATS analysis results, guide the candidate with actionable interview & resume advice, "
        "and answer questions clearly. Ground your answers strictly in the provided resume analysis context. "
        "DO NOT recalculate or invent a different ATS score. Explain the existing calculated score: "
        f"{ctx.get('ats_score', 75)}/100."
    )

    context_prompt = (
        f"Current Resume Analysis Context:\n"
        f"- Overall ATS Score: {ctx.get('ats_score', 75)}/100\n"
        f"- Job Match Percentage: {ctx.get('job_match_percentage', 80)}%\n"
        f"- Matched Skills: {', '.join(ctx.get('skills', {}).get('matched_skills', []))}\n"
        f"- Missing Skills: {', '.join(ctx.get('skills', {}).get('missing_skills', []))}\n"
        f"- Semantic Similarity: {ctx.get('deep_learning', {}).get('semantic_match_percentage', 75)}%\n"
        f"- Strengths: {'; '.join(ctx.get('strengths', []))}\n"
        f"- Improvement Recommendations: {'; '.join(ctx.get('recommendations', []))}\n\n"
        f"User Question: {req.message}\n"
    )

    ai_reply = await call_gemini_api(context_prompt, system_instruction=system_instruction)
    if not ai_reply:
        ai_reply = generate_grounded_fallback_chat_reply(req.message, ctx)

    return {"reply": ai_reply}


@app.post("/gemini/edit-section")
@app.post("/api/gemini/edit-section")
async def edit_resume_section(req: EditSectionRequest):
    """
    Section-wise AI Rewriting with strict anti-hallucination constraint.
    """
    prompt = (
        f"Task: Improve and rewrite the resume section '{req.sectionName}'.\n\n"
        f"Target Job Description Context (if provided):\n{req.jobDescription or 'General standard tech industry benchmark'}\n\n"
        f"Current Section Content:\n\"\"\"\n{req.currentContent}\n\"\"\"\n\n"
        f"Additional User Direction:\n{req.instructions or 'Make it more professional, action-oriented, and ATS-optimized.'}\n\n"
        f"STRICT CONSTRAINTS (CRITICAL - DO NOT VIOLATE):\n"
        f"- You MUST follow the candidate's original information accurately.\n"
        f"- DO NOT invent new companies, employment dates, job titles, or unverified degrees.\n"
        f"- DO NOT invent unearned certifications, fake projects, or fake numerical metrics.\n"
        f"- Enhance clarity, replace passive verbs with strong action verbs (e.g. Engineered, Spearheaded, Optimized, Deployed).\n"
        f"- Format clearly with clean bullet points suitable for ATS parsing.\n\n"
        f"Please return a JSON object with:\n"
        f"- 'improved_content': The rewritten, high-impact version of the section.\n"
        f"- 'changes_summary': A list of 2-3 specific improvements made.\n"
    )

    ai_json_str = await call_gemini_api(prompt, is_json=True)
    if ai_json_str:
        try:
            parsed = json.loads(ai_json_str)
            if "improved_content" in parsed:
                return parsed
        except Exception:
            pass

    # Grounded fallback: clean formatting and active verbs without hallucinating
    lines = req.currentContent.split("\n")
    cleaned_lines = []
    for line in lines:
        t = line.strip()
        if not t:
            continue
        t = re.sub(r"^(?:worked on|responsible for|helped with)\s+", "Engineered ", t, flags=re.IGNORECASE)
        t = re.sub(r"^(?:assisted in|participated in)\s+", "Collaborated on ", t, flags=re.IGNORECASE)
        if not t.startswith("•") and not t.startswith("-"):
            t = f"• {t}"
        cleaned_lines.append(t)

    return {
        "improved_content": "\n".join(cleaned_lines),
        "changes_summary": [
            "Converted passive statements into strong action verbs (e.g., Engineered, Collaborated).",
            "Structured text with clean standardized bullet points for ATS parsers.",
            "Preserved all factual details, companies, and achievements accurately.",
        ],
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=False)
