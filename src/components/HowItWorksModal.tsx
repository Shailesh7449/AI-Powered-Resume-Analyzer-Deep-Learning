import React, { useState } from "react";
import {
  BookOpen,
  X,
  Cpu,
  Layers,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Server,
  Code2,
} from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  if (!isOpen) return null;

  const vivaQuestions = [
    {
      q: "1. Why do we use deep learning in ResumeAI?",
      a: "Traditional ATS systems rely solely on exact string keyword matching. If a resume says 'Developed predictive models using Python and scikit-learn' but the job demands 'Experience in building machine learning solutions using Python', keyword matching fails. Deep learning understands that these phrases are semantically equivalent even though different words are used.",
    },
    {
      q: "2. Why do we use Pretrained Transformers (Sentence-BERT)?",
      a: "Transformers utilize self-attention mechanisms to understand the contextual meaning of words within complete sentences. Training a transformer from scratch requires millions of parameters and weeks of GPU compute. Instead, we use transfer learning with the pretrained 'sentence-transformers/all-MiniLM-L6-v2' model, which was pre-trained on over 1 billion sentence pairs.",
    },
    {
      q: "3. What are embeddings?",
      a: "An embedding is a numerical representation of text as a dense vector of real numbers (in our system, 384 dimensions). In this high-dimensional vector space, pieces of text with similar semantic meanings are placed geometrically close to each other.",
    },
    {
      q: "4. How are resume and job-description embeddings compared?",
      a: "The candidate's resume text and the job description are both preprocessed and passed through the Sentence Transformer to generate 384-dimensional dense vectors u and v. We then calculate the Cosine Similarity between the two vectors.",
    },
    {
      q: "5. What does Cosine Similarity mean and what is its formula?",
      a: "Cosine Similarity evaluates the cosine of the angle between two vectors: cos(θ) = (u · v) / (||u|| * ||v||). If the angle is 0 degrees, cos(θ) = 1.0 (identical semantic direction). It is preferred over Euclidean distance because it evaluates directional alignment without being biased by document length.",
    },
    {
      q: "6. How is the ATS score calculated?",
      a: "ATS Score = Keyword Match (20 pts) + Skill Match (25 pts) + Semantic Match (25 pts) + Experience Relevance (15 pts) + Education Relevance (10 pts) + Formatting & Structure (5 pts) = 100 points maximum.",
    },
    {
      q: "7. Why is the ATS score explainable?",
      a: "Unlike generative AI chatbots that produce a random number out of a black box, every single point in our ATS score is computed through transparent mathematical equations with dedicated weights and sub-metrics shown directly to the user.",
    },
    {
      q: "8. How does skill-gap analysis and normalization work?",
      a: "A skill taxonomy maps variations (e.g., 'ML', 'machine-learning', and 'Machine Learning' are all normalized to canonical 'Machine Learning'). The system then determines matched skills (intersection), missing skills (set difference), and related semantic cluster skills.",
    },
    {
      q: "9. Why is Gemini separate from the ML scoring system?",
      a: "Crucial engineering principle: Deterministic scoring belongs in the ML pipeline (FastAPI + PyTorch), whereas generative tasks (explaining why a score was awarded, answering questions, or rewriting sections without hallucinating) belong to Gemini. LLMs should never calculate arbitrary ATS numbers.",
    },
    {
      q: "10. How do the Frontend, Node.js backend, and Python FastAPI service communicate?",
      a: "The React client communicates with the Node.js Express server on port 3000. For deep learning vector encoding, Node.js calls the Python FastAPI service on port 5001 via HTTP REST endpoints. Node.js handles document parsing (pdf-parse/mammoth) and proxies Gemini API calls securely server-side.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                How It Works &amp; College Viva Presentation Guide
              </h2>
              <p className="text-xs text-slate-500">
                Complete walkthrough of the Deep Learning pipeline, architecture, and scoring formulas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Architecture Flowchart */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>Project Processing Pipeline:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 shadow-2xs">
              Resume
            </span>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 shadow-2xs">
              Text Extraction
            </span>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 shadow-2xs">
              NLP Analysis
            </span>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              Deep Learning (Sentence-BERT)
            </span>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 shadow-2xs">
              ATS Scoring
            </span>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 shadow-2xs">
              Skill Gap
            </span>
            <span className="text-slate-400 font-bold">&rarr;</span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs">
              Recommendations
            </span>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-1">
            System Stack: <strong>React (Vite)</strong> &rarr; <strong>Node.js Express</strong> &rarr; <strong>Python FastAPI</strong> &rarr; <strong>PyTorch Sentence-Transformers</strong> &rarr; <strong>Explainable Scoring</strong> + <strong>Gemini Career Assistant</strong>.
          </p>
        </div>

        {/* 2. College Review / Viva 10 Q&A Accordion */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>10 Key College Viva Review Questions &amp; Answers:</span>
          </div>

          <div className="space-y-2">
            {vivaQuestions.map((item, idx) => {
              const isOpen = activeAccordion === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all"
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : idx)}
                    className="w-full text-left p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Viva Guide
          </button>
        </div>
      </div>
    </div>
  );
};
