export interface ScoreComponent {
  score: number;
  max: number;
  label: string;
  explanation: string;
}

export interface ScoreBreakdown {
  keyword_match: ScoreComponent;
  skill_match: ScoreComponent;
  semantic_match: ScoreComponent;
  experience: ScoreComponent;
  education: ScoreComponent;
  formatting: ScoreComponent;
}

export interface SemanticSentencePair {
  resume_sentence: string;
  jd_sentence: string;
  semantic_similarity: number;
  percentage: number;
}

export interface ModelMetadata {
  architecture: string;
  pretrained_model: string;
  embedding_dimensions: number;
  pooling_strategy: string;
  similarity_metric: string;
  status: string;
  transfer_learning: boolean;
}

export interface DeepLearningData {
  semantic_similarity: number;
  semantic_match_percentage: number;
  resume_embedding_sample: number[];
  jd_embedding_sample: number[];
  embedding_dimension: number;
  top_semantic_pairs: SemanticSentencePair[];
  model_metadata: ModelMetadata;
}

export interface SkillData {
  resume_skills: string[];
  jd_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  related_skills: string[];
  total_found: number;
  total_missing: number;
}

export interface AnalysisResult {
  ats_score: number;
  job_match_percentage: number;
  breakdown: ScoreBreakdown;
  formula: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skills: SkillData;
  deep_learning: DeepLearningData;
}

export type ResumeSectionId =
  | "summary"
  | "education"
  | "skills"
  | "experience"
  | "projects"
  | "certifications"
  | "achievements";

export interface ResumeSectionItem {
  id: ResumeSectionId;
  name: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
