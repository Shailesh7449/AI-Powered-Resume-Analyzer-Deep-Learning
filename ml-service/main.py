"""
FastAPI Microservice for ResumeAI Deep Learning & ATS Analysis.
Serves deep-learning semantic matching, skill extraction, and explainable ATS scoring.
Runs on port 8000.
"""

from contextlib import asynccontextmanager
from typing import List, Optional
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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
    # Initialize transformer weights during startup
    print("[ResumeAI ML Service] Starting up and initializing models...")
    initialize_transformer()
    yield
    print("[ResumeAI ML Service] Shutting down...")


app = FastAPI(
    title="ResumeAI ML Service",
    description="Deep Learning Semantic Similarity and Explainable ATS Scoring Service",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local and proxy communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of the candidate's resume")
    job_description_text: str = Field(..., description="Target job description text")


class SemanticSimilarityRequest(BaseModel):
    text_a: str
    text_b: str


class SkillExtractionRequest(BaseModel):
    text: str


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ResumeAI Python ML Service",
        "engine": get_model_metadata(),
    }


@app.post("/extract-skills")
def api_extract_skills(req: SkillExtractionRequest):
    skills = extract_skills(req.text)
    return {"skills": skills, "count": len(skills)}


@app.post("/semantic-similarity")
def api_semantic_similarity(req: SemanticSimilarityRequest):
    vec_a = get_embedding(req.text_a)
    vec_b = get_embedding(req.text_b)
    sim = compute_cosine_similarity(vec_a, vec_b)
    return {
        "similarity": round(float(sim), 4),
        "percentage": round(float(sim) * 100, 1),
        "vector_a_sample": [round(float(x), 4) for x in vec_a[:8]],
        "vector_b_sample": [round(float(x), 4) for x in vec_b[:8]],
        "dimension": len(vec_a),
    }


@app.post("/analyze")
def analyze_resume(req: AnalyzeRequest):
    """
    Main Deep Learning & ATS Pipeline:
    1. Skill Extraction & Normalization
    2. Deep Learning Dense Vector Embedding Generation (384-dim)
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

    # 2. Deep Learning Dense Vector Embeddings
    resume_vec = get_embedding(resume_text)
    jd_vec = get_embedding(jd_text) if jd_text else resume_vec

    # 3. Cosine Similarity (Deep Learning Semantic Match)
    semantic_sim = compute_cosine_similarity(resume_vec, jd_vec) if jd_text else 0.75

    # 4. Deep Learning Semantic Sentence Alignment (Viva Demonstration)
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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=False)
