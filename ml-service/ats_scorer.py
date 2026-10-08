"""
Explainable ATS Scoring Engine for ResumeAI.
Computes a fully transparent, weighted ATS score with no black-box mystery numbers.
"""

import re
from typing import Dict, List, Any


def calculate_ats_score(
    resume_text: str,
    jd_text: str,
    matched_skills: List[str],
    missing_skills: List[str],
    jd_skills: List[str],
    semantic_similarity: float
) -> Dict[str, Any]:
    """
    Transparent Weighted ATS Score Calculation:
    1. Keyword Match:       20 points max
    2. Skill Match:         25 points max
    3. Semantic Match:      25 points max (from Transformer Cosine Similarity)
    4. Experience:          15 points max
    5. Education:           10 points max
    6. Formatting:           5 points max
    --------------------------------------
    Total:                 100 points max
    """
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    # 1. Skill Match (Max 25)
    total_required = len(jd_skills)
    matched_count = len(matched_skills)
    if total_required > 0:
        skill_ratio = min(1.0, float(matched_count) / float(total_required))
    else:
        # If no JD skills provided, gauge from candidate's skills
        skill_ratio = min(1.0, float(len(matched_skills)) / 8.0) if matched_skills else 0.5
    skill_score = round(float(skill_ratio * 25), 1)

    # 2. Semantic Match (Max 25)
    # Directly driven by Transformer / Sentence Embedding Cosine Similarity
    semantic_score = round(float(min(1.0, max(0.0, float(semantic_similarity))) * 25), 1)

    # 3. Keyword Match (Max 20)
    # Significant technical & action words in JD
    jd_words = set(re.findall(r'\b[a-z]{3,}\b', jd_lower))
    # Filter common stop words
    stopwords = {"and", "the", "for", "with", "that", "this", "from", "have", "will", "our", "are", "you", "your", "must", "they", "been", "role", "team", "work", "join", "help"}
    jd_keywords = jd_words - stopwords
    matched_keywords = [w for w in jd_keywords if re.search(rf'\b{re.escape(w)}\b', resume_lower)]
    keyword_ratio = float(len(matched_keywords)) / float(max(1, len(jd_keywords))) if jd_keywords else 0.7
    # Bound gracefully
    keyword_score = round(float(min(1.0, keyword_ratio * 1.3) * 20), 1)

    # 4. Experience Relevance (Max 15)
    action_verbs = ["developed", "engineered", "built", "implemented", "designed", "created", "led", "managed", "deployed", "optimized", "collaborated", "researched", "architected"]
    action_hits = sum(1 for verb in action_verbs if verb in resume_lower)
    has_metrics = bool(re.search(r'\b\d+%\b|\$\d+|\b\d+\s*(?:users|clients|latency|reduction|increase|scale|downloads)\b', resume_lower))
    has_years = bool(re.search(r'\b\d+\+?\s*(?:years?|yrs?|months?)\b', resume_lower))

    exp_points = 0.0
    if action_hits >= 5:
        exp_points += 7.0
    elif action_hits >= 2:
        exp_points += 4.5
    else:
        exp_points += 2.0

    if has_metrics:
        exp_points += 4.5
    else:
        exp_points += 2.0

    if has_years or "experience" in resume_lower or "intern" in resume_lower:
        exp_points += 3.5
    else:
        exp_points += 1.5

    experience_score = round(float(min(15.0, exp_points)), 1)

    # 5. Education Relevance (Max 10)
    edu_keywords = ["bachelor", "master", "b.tech", "b.e", "b.s", "m.s", "degree", "university", "institute", "college", "gpa", "cgpa", "computer science", "engineering"]
    edu_hits = sum(1 for ek in edu_keywords if ek in resume_lower)
    if edu_hits >= 3:
        education_score = 10.0
    elif edu_hits >= 1:
        education_score = 7.5
    else:
        education_score = 4.0

    # 6. Formatting & Structure (Max 5)
    standard_sections = ["summary", "education", "experience", "projects", "skills"]
    found_sections = sum(1 for sec in standard_sections if sec in resume_lower)
    formatting_score = round(float(min(5.0, max(2.5, (float(found_sections) / float(len(standard_sections))) * 5.0))), 1)

    # Total Score
    total_score = int(round(skill_score + semantic_score + keyword_score + experience_score + education_score + formatting_score))
    total_score = max(0, min(100, total_score))

    # Overall Job Match percentage
    job_match_pct = int(round((skill_score / 25.0 * 0.45 + semantic_score / 25.0 * 0.35 + keyword_score / 20.0 * 0.20) * 100))
    job_match_pct = max(0, min(100, job_match_pct))

    # Strengths and Weaknesses
    strengths = []
    weaknesses = []
    recommendations = []

    if skill_score >= 18:
        strengths.append(f"Strong technical skill alignment ({len(matched_skills)} key skills matched).")
    else:
        weaknesses.append(f"Missing {len(missing_skills)} critical skill(s) demanded in the job description.")
        recommendations.append(f"Incorporate missing core skills: {', '.join(missing_skills[:3])} in your Skills or Experience section.")

    if semantic_score >= 18:
        strengths.append("High semantic alignment: resume content closely mirrors industry phrasing.")
    else:
        weaknesses.append("Semantic similarity is moderate; phrasing differs from modern industry job descriptions.")
        recommendations.append("Align project descriptions with industry terminology used in the job description.")

    if has_metrics:
        strengths.append("Contains measurable outcomes and quantifiable impacts (percentages, scale).")
    else:
        weaknesses.append("Lacks quantifiable metrics and quantifiable results in project/experience descriptions.")
        recommendations.append("Add quantifiable impact (e.g., 'improved performance by 25%', 'served 100+ users').")

    if found_sections >= 4:
        strengths.append("Clear structural section layout conforming to ATS parsing standards.")
    else:
        recommendations.append("Ensure distinct section headings: Summary, Education, Skills, Projects, and Experience.")

    if not strengths:
        strengths.append("Good baseline foundation in relevant educational domain.")

    return {
        "total_score": int(total_score),
        "job_match_percentage": int(job_match_pct),
        "breakdown": {
            "keyword_match": {
                "score": float(keyword_score),
                "max": 20,
                "label": "Keyword Match",
                "explanation": f"Matched {len(matched_keywords)} relevant domain keywords from the job description.",
            },
            "skill_match": {
                "score": float(skill_score),
                "max": 25,
                "label": "Skill Match",
                "explanation": f"Found {matched_count} of {max(1, total_required)} required hard and soft technical skills.",
            },
            "semantic_match": {
                "score": float(semantic_score),
                "max": 25,
                "label": "Semantic Match",
                "explanation": f"Deep learning Sentence Transformer cosine similarity: {round(float(semantic_similarity) * 100, 1)}%.",
            },
            "experience": {
                "score": float(experience_score),
                "max": 15,
                "label": "Experience Relevance",
                "explanation": f"Evaluates active engineering verbs ({action_hits} found) and metric indicators.",
            },
            "education": {
                "score": float(education_score),
                "max": 10,
                "label": "Education Relevance",
                "explanation": f"Degree level, field of study, and accredited university alignment.",
            },
            "formatting": {
                "score": float(formatting_score),
                "max": 5,
                "label": "Structure & Formatting",
                "explanation": f"Detected {found_sections}/5 standard resume sections for optimal ATS parser parsing.",
            },
        },
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "formula": "ATS Score = Keyword Match (20) + Skill Match (25) + Semantic Match (25) + Experience (15) + Education (10) + Formatting (5)",
    }
