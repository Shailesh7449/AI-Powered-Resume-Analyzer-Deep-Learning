"""
Skill extraction and normalization module for ResumeAI.
Designed to be lightweight, deterministic, and easily explainable for college reviews.
"""

import re
from typing import Dict, List, Set, Tuple

# Comprehensive taxonomy mapping skill variations to normalized canonical names
SKILL_TAXONOMY: Dict[str, List[str]] = {
    # AI / ML / Data
    "Machine Learning": ["machine learning", "machine-learning", "ml"],
    "Deep Learning": ["deep learning", "deep-learning", "dl"],
    "Natural Language Processing": ["natural language processing", "nlp"],
    "Computer Vision": ["computer vision", "cv", "object detection"],
    "PyTorch": ["pytorch", "torch"],
    "TensorFlow": ["tensorflow", "tf"],
    "Scikit-Learn": ["scikit-learn", "scikit learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Data Analysis": ["data analysis", "data analytics", "exploratory data analysis", "eda"],
    "Generative AI": ["generative ai", "genai", "llm", "large language models"],
    "Transformers": ["transformers", "hugging face", "huggingface", "bert"],

    # Programming Languages
    "Python": ["python", "python3"],
    "Java": ["java"],
    "C++": ["c++", "cpp"],
    "C": ["\\bc\\b"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "SQL": ["sql", "postgresql", "postgres", "mysql", "sqlite", "relational database"],
    "R": ["\\br\\b"],
    "Go": ["golang", "\\bgo\\b"],

    # Web & Backend
    "React": ["react", "react.js", "reactjs"],
    "Node.js": ["node.js", "nodejs", "\\bnode\\b"],
    "FastAPI": ["fastapi", "fast-api"],
    "Flask": ["flask"],
    "Django": ["django"],
    "Express.js": ["express", "express.js", "expressjs"],
    "Next.js": ["next.js", "nextjs"],
    "HTML/CSS": ["html", "css", "html5", "css3", "tailwind", "tailwind css"],
    "REST APIs": ["rest api", "rest apis", "restful api", "restful apis", "rest"],
    "GraphQL": ["graphql"],

    # Cloud & DevOps
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "Google Cloud": ["google cloud", "gcp", "google cloud platform"],
    "Azure": ["azure", "microsoft azure"],
    "Docker": ["docker", "containerization", "containers"],
    "Kubernetes": ["kubernetes", "k8s"],
    "CI/CD": ["ci/cd", "cicd", "continuous integration", "github actions", "jenkins"],
    "Git": ["git", "github", "gitlab"],
    "Linux": ["linux", "bash", "shell scripting", "ubuntu"],

    # Databases
    "MongoDB": ["mongodb", "mongo", "nosql"],
    "Redis": ["redis"],
    "PostgreSQL": ["postgresql", "postgres"],

    # Soft Skills & Engineering Practices
    "Agile / Scrum": ["agile", "scrum", "sprint"],
    "System Design": ["system design", "distributed systems", "microservices"],
    "Problem Solving": ["problem solving", "algorithmic problem solving", "dsa", "data structures and algorithms"],
}

# Semantic clusters for identifying related skills
SKILL_CLUSTERS: Dict[str, Set[str]] = {
    "Machine Learning": {"Scikit-Learn", "Pandas", "NumPy", "Deep Learning", "PyTorch", "TensorFlow", "Data Analysis", "Python"},
    "Deep Learning": {"PyTorch", "TensorFlow", "Computer Vision", "Natural Language Processing", "Transformers", "Generative AI"},
    "Data Analysis": {"Pandas", "NumPy", "SQL", "Python", "Data Visualization", "Machine Learning"},
    "Frontend": {"React", "Next.js", "JavaScript", "TypeScript", "HTML/CSS"},
    "Backend": {"Node.js", "Express.js", "FastAPI", "Flask", "Django", "REST APIs", "SQL", "MongoDB"},
    "Cloud & DevOps": {"Docker", "Kubernetes", "AWS", "Google Cloud", "CI/CD", "Linux"},
}


def extract_skills(text: str) -> List[str]:
    """
    Extracts all canonical skills found within the given text.
    Handles boundaries and case-insensitivity cleanly.
    """
    if not text:
        return []

    lower_text = " " + text.lower() + " "
    found_skills = set()

    for canonical_name, variations in SKILL_TAXONOMY.items():
        for pattern in variations:
            if pattern.startswith("\\b") or pattern.endswith("\\b"):
                # Regex boundary pattern
                if re.search(pattern, lower_text, re.IGNORECASE):
                    found_skills.add(canonical_name)
                    break
            else:
                # Word boundary match with escape
                escaped = re.escape(pattern)
                regex = rf"(?:^|[\s,.;:()/\-\[\]])({escaped})(?:[\s,.;:()/\-\[\]]|$)"
                if re.search(regex, lower_text, re.IGNORECASE):
                    found_skills.add(canonical_name)
                    break

    return sorted(list(found_skills))


def compare_skills(resume_skills: List[str], jd_skills: List[str]) -> Tuple[List[str], List[str], List[str], List[str]]:
    """
    Compares resume skills against job description skills.
    Returns: (matched, missing, additional, related)
    """
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)

    matched = sorted(list(resume_set.intersection(jd_set)))
    missing = sorted(list(jd_set - resume_set))
    additional = sorted(list(resume_set - jd_set))

    # Identify related skills that the candidate has which belong to missing skills' clusters
    related = set()
    for miss in missing:
        for cluster_name, skills_in_cluster in SKILL_CLUSTERS.items():
            if miss in skills_in_cluster:
                # Candidate has skills in this cluster
                cluster_matches = resume_set.intersection(skills_in_cluster)
                for rel in cluster_matches:
                    if rel not in matched:
                        related.add(rel)

    return matched, missing, additional, sorted(list(related))
