import React from "react";
import {
  Cpu,
  Binary,
  Layers,
  ArrowRight,
  Sparkles,
  GitCompare,
  CheckCircle2,
  HelpCircle,
  Code2,
} from "lucide-react";
import { DeepLearningData } from "../types";

interface DeepLearningViewProps {
  deepLearning: DeepLearningData;
}

export const DeepLearningView: React.FC<DeepLearningViewProps> = ({ deepLearning }) => {
  const {
    semantic_similarity,
    semantic_match_percentage,
    resume_embedding_sample,
    jd_embedding_sample,
    embedding_dimension,
    top_semantic_pairs,
    model_metadata,
  } = deepLearning;

  return (
    <div className="space-y-6">
      {/* Hero Pipeline Card */}
      <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PyTorch &amp; Hugging Face Transformers
              </span>
              <span className="text-xs text-slate-400">Transfer Learning Architecture</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              Deep Learning Semantic Match Pipeline
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Pretrained Sentence-BERT transforms resume and job text into 384-dimensional dense semantic vectors, capturing conceptual meaning beyond exact keyword matching.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
              Cosine Similarity Score
            </div>
            <div className="text-3xl font-black text-indigo-300">
              {semantic_match_percentage}%
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              cos(&#119906;, &#119907;) = {semantic_similarity}
            </span>
          </div>
        </div>

        {/* Visual Pipeline Flowchart */}
        <div className="pt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-3">
            End-to-End Neural Architecture Flow:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex flex-col justify-center">
              <span className="font-semibold text-white">1. Resume Text</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Raw Candidate Data</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex flex-col justify-center">
              <span className="font-semibold text-white">2. Preprocessing</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Normalization &amp; Cleaning</span>
            </div>
            <div className="bg-indigo-600/40 p-2.5 rounded-xl border border-indigo-400/40 flex flex-col justify-center">
              <span className="font-semibold text-indigo-200">3. Sentence-BERT</span>
              <span className="text-[10px] text-indigo-300 mt-0.5">MiniLM-L6-v2 Transformer</span>
            </div>
            <div className="bg-indigo-600/40 p-2.5 rounded-xl border border-indigo-400/40 flex flex-col justify-center">
              <span className="font-semibold text-indigo-200">4. Dense Vector</span>
              <span className="text-[10px] text-indigo-300 mt-0.5">384-Dim Embedding</span>
            </div>
            <div className="bg-indigo-600/40 p-2.5 rounded-xl border border-indigo-400/40 flex flex-col justify-center">
              <span className="font-semibold text-indigo-200">5. JD Embedding</span>
              <span className="text-[10px] text-indigo-300 mt-0.5">384-Dim Target Vector</span>
            </div>
            <div className="bg-emerald-600/30 p-2.5 rounded-xl border border-emerald-400/30 flex flex-col justify-center">
              <span className="font-semibold text-emerald-200">6. Cosine Sim</span>
              <span className="text-[10px] text-emerald-300 mt-0.5">Vector Angle Metric</span>
            </div>
            <div className="bg-emerald-600/40 p-2.5 rounded-xl border border-emerald-400/40 flex flex-col justify-center col-span-2 sm:col-span-1">
              <span className="font-semibold text-white">7. ATS Weight</span>
              <span className="text-[10px] text-emerald-300 mt-0.5">25 Points Allocation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedding Inspector & Cosine Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vector Slice Visualizer */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Binary className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Vector Embedding Sample (First 8 of {embedding_dimension} Dimensions)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">float32 dense</span>
          </div>

          <div className="space-y-3">
            {/* Resume Vector */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>Resume Embedding Vector &#119906;</span>
                <span className="text-[11px] font-mono text-indigo-600">dim: {embedding_dimension}</span>
              </div>
              <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2.5 rounded-xl overflow-x-auto flex items-center space-x-2">
                <span className="text-slate-500">[</span>
                {resume_embedding_sample.map((val, idx) => (
                  <span key={idx} className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">
                    {val > 0 ? `+${val}` : val}
                  </span>
                ))}
                <span className="text-slate-500">... ]</span>
              </div>
            </div>

            {/* Job Description Vector */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>Job Description Embedding Vector &#119907;</span>
                <span className="text-[11px] font-mono text-blue-600">dim: {embedding_dimension}</span>
              </div>
              <div className="bg-slate-900 text-blue-400 font-mono text-[11px] p-2.5 rounded-xl overflow-x-auto flex items-center space-x-2">
                <span className="text-slate-500">[</span>
                {jd_embedding_sample.map((val, idx) => (
                  <span key={idx} className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">
                    {val > 0 ? `+${val}` : val}
                  </span>
                ))}
                <span className="text-slate-500">... ]</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <strong>What are embeddings?</strong> Dense mathematical vectors where words and sentences with similar contextual meanings reside close to each other in geometric vector space.
          </div>
        </div>

        {/* Cosine Similarity Math */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <GitCompare className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Mathematical Similarity Metric
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Cosine Metric
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-center space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cosine Similarity Formula
            </div>
            <div className="text-lg font-serif font-bold text-slate-800 bg-white py-2 px-4 rounded-lg inline-block border border-slate-200 shadow-2xs">
              cos(&#952;) = (&#119906; &middot; &#119907;) / (||&#119906;|| &times; ||&#119907;||)
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Measures the cosine of the angle between two multi-dimensional vectors regardless of their length. A value of 1.0 indicates identical directional meaning.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold uppercase text-indigo-700 block">
                Model Name
              </span>
              <span className="font-semibold text-slate-800">
                {model_metadata?.pretrained_model || "all-MiniLM-L6-v2"}
              </span>
            </div>
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold uppercase text-indigo-700 block">
                Pooling Strategy
              </span>
              <span className="font-semibold text-slate-800">
                Mean Pooling (Token Embeddings)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Semantic Alignment Demonstrations (For College Viva Review) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Deep Learning Semantic Alignments (Viva Demonstration)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrates how the Transformer detects semantic similarity even when exact wording differs:
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            {top_semantic_pairs.length} Top Contextual Pairs
          </span>
        </div>

        {top_semantic_pairs.length > 0 ? (
          <div className="space-y-3">
            {top_semantic_pairs.map((pair, index) => (
              <div
                key={index}
                className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Alignment Example #{index + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Similarity: {pair.percentage}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-indigo-600 block text-[10px] uppercase mb-1">
                      Candidate Resume:
                    </span>
                    <p className="text-slate-800 font-medium italic">&quot;{pair.resume_sentence}&quot;</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-blue-600 block text-[10px] uppercase mb-1">
                      Job Description:
                    </span>
                    <p className="text-slate-800 font-medium italic">&quot;{pair.jd_sentence}&quot;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            Analyze a resume and job description to see live sentence embeddings and cosine alignment.
          </div>
        )}
      </div>

      {/* College Project Viva Defense Reference Card */}
      <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-amber-900">
          <Code2 className="w-4 h-4 text-amber-700" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            College Viva Defense: Why Pretrained Transformers &amp; Separate Gemini Assistant?
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 leading-relaxed">
          <div className="bg-white p-3 rounded-xl border border-amber-200/60">
            <strong>1. Transfer Learning with Sentence-BERT:</strong> Rather than training an impractical multi-gigabyte model from scratch, we leverage transfer learning with <code className="bg-slate-100 px-1 py-0.5 rounded">all-MiniLM-L6-v2</code>. It was pre-trained on 1B+ sentence pairs to capture semantic relationships.
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200/60">
            <strong>2. Explainability vs. Black-Box LLMs:</strong> An ATS score generated arbitrarily by a chatbot is non-deterministic and unscientific. In ResumeAI, the score is mathematically computed via explicit weighted formulas, using PyTorch embeddings strictly for the 25-point semantic similarity component.
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200/60">
            <strong>3. Separation of Concerns Architecture:</strong> The React frontend communicates with the Node.js Express backend, which delegates heavy tensor computations to the FastAPI Python service running PyTorch, reserving Gemini strictly for conversational explanations.
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200/60">
            <strong>4. Cosine Similarity vs. Euclidean Distance:</strong> Cosine similarity evaluates directional vector alignment rather than magnitude, ensuring longer text passages are not penalized simply due to higher word counts.
          </div>
        </div>
      </div>
    </div>
  );
};
