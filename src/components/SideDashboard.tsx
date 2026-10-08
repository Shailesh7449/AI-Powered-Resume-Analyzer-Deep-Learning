import React from "react";
import {
  Award,
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  MessageSquareText,
  TrendingUp,
  Cpu,
  BarChart3,
} from "lucide-react";
import { AnalysisResult } from "../types";

interface SideDashboardProps {
  analysis: AnalysisResult | null;
  onOpenChatWithPrompt: (prompt: string) => void;
  onNavigateToTab: (tab: "overview" | "skills" | "deep-learning" | "editor") => void;
}

export const SideDashboard: React.FC<SideDashboardProps> = ({
  analysis,
  onOpenChatWithPrompt,
  onNavigateToTab,
}) => {
  if (!analysis) {
    return (
      <aside className="w-full lg:w-80 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs sticky top-20 self-start">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
              Resume Analysis
            </h3>
            <p className="text-xs text-slate-400">Waiting for analysis</p>
          </div>
        </div>

        <div className="py-8 text-center text-slate-400">
          <Target className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
          <p className="text-xs font-medium text-slate-600">No Resume Analyzed Yet</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Upload or paste your resume and target job description to compute the explainable ATS score.
          </p>
        </div>
      </aside>
    );
  }

  const { ats_score, job_match_percentage, skills, breakdown, strengths, recommendations, deep_learning } =
    analysis;

  // Determine ATS score color scheme
  const getScoreColor = (score: number) => {
    if (score >= 75) return { stroke: "stroke-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 60) return { stroke: "stroke-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { stroke: "stroke-rose-500", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const scoreTheme = getScoreColor(ats_score);

  // SVG Circular progress radius
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ats_score / 100) * circumference;

  return (
    <aside className="w-full lg:w-80 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs sticky top-20 self-start space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Resume Analysis
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
          Live Results
        </span>
      </div>

      {/* Main Circular ATS Score Card */}
      <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          ATS Score
        </div>

        <div className="relative inline-flex items-center justify-center my-1">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-slate-200"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`${scoreTheme.stroke} transition-all duration-1000 ease-out`}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-2xl font-black tracking-tight ${scoreTheme.text}`}>
              {ats_score}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-2 font-medium">
          {ats_score >= 75
            ? "High Interview Probability"
            : ats_score >= 60
            ? "Moderate ATS Viability"
            : "Needs Optimization"}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Job Match */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Job Match</span>
            <Target className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{job_match_percentage}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${job_match_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Semantic Similarity */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Deep Learning</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {deep_learning.semantic_match_percentage}%
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Sentence-BERT</span>
        </div>

        {/* Skills Found */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Skills</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {skills.total_found}
            <span className="text-xs font-normal text-slate-500 ml-1">Found</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {skills.matched_skills.length} matched JD
          </span>
        </div>

        {/* Missing Skills */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Missing</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700">
            {skills.total_missing}
            <span className="text-xs font-normal text-slate-500 ml-1">Skills</span>
          </div>
          <span className="text-[10px] text-slate-400">Skill gaps detected</span>
        </div>
      </div>

      {/* Top Strength Summary */}
      <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 space-y-1">
        <div className="flex items-center space-x-1.5 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Primary Strength</span>
        </div>
        <p className="text-xs text-emerald-900 font-medium leading-relaxed">
          {strengths[0] || "Strong foundational qualifications in technical domain."}
        </p>
      </div>

      {/* Top Improvement Suggestion */}
      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 space-y-1">
        <div className="flex items-center space-x-1.5 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>Priority Improvement</span>
        </div>
        <p className="text-xs text-amber-900 font-medium leading-relaxed">
          {recommendations[0] || "Add measurable metrics and quantifiable results in project achievements."}
        </p>
      </div>

      {/* Quick AI Chat Action Buttons */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <button
          onClick={() => onOpenChatWithPrompt(`Why is my ATS score ${ats_score}? Can you explain the score breakdown?`)}
          className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-700 transition-colors flex items-center justify-between group"
        >
          <span className="truncate">Why is my ATS score {ats_score}?</span>
          <MessageSquareText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
        </button>

        <button
          onClick={() => onOpenChatWithPrompt(`What skills am I missing and how can I incorporate them?`)}
          className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-700 transition-colors flex items-center justify-between group"
        >
          <span className="truncate">What skills am I missing?</span>
          <MessageSquareText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
        </button>

        <button
          onClick={() => onNavigateToTab("editor")}
          className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimize Sections with AI</span>
        </button>
      </div>
    </aside>
  );
};
