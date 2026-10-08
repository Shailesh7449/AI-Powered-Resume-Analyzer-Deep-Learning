import React from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Calculator,
  HelpCircle,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { AnalysisResult, ScoreComponent } from "../types";

interface ScoreBreakdownProps {
  analysis: AnalysisResult;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ analysis }) => {
  const { ats_score, breakdown, formula, strengths, weaknesses, recommendations, deep_learning } =
    analysis;

  const components: { key: keyof typeof breakdown; icon: React.ReactNode; color: string }[] = [
    {
      key: "skill_match",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      color: "from-emerald-500 to-teal-600",
    },
    {
      key: "semantic_match",
      icon: <Cpu className="w-4 h-4 text-indigo-600" />,
      color: "from-indigo-500 to-blue-600",
    },
    {
      key: "keyword_match",
      icon: <FileCheck className="w-4 h-4 text-blue-600" />,
      color: "from-blue-500 to-cyan-600",
    },
    {
      key: "experience",
      icon: <TrendingUp className="w-4 h-4 text-violet-600" />,
      color: "from-violet-500 to-purple-600",
    },
    {
      key: "education",
      icon: <Award className="w-4 h-4 text-amber-600" />,
      color: "from-amber-500 to-yellow-600",
    },
    {
      key: "formatting",
      icon: <HelpCircle className="w-4 h-4 text-slate-600" />,
      color: "from-slate-500 to-gray-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Explainable Formula Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider">
                Explainable ATS Formula
              </span>
              <span className="text-xs text-slate-400">Zero Black-Box Mystery</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Transparent Weighted Scoring Model
            </h3>
            <p className="text-xs text-slate-300 font-mono pt-1">
              {formula}
            </p>
          </div>

          {/* Big Score Block */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 text-center self-start md:self-auto shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
              Total Score
            </div>
            <div className="text-3xl font-black text-white">
              {ats_score}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-300 font-medium">
              Sum of 6 Components
            </span>
          </div>
        </div>
      </div>

      {/* 6 Component Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map(({ key, icon }) => {
          const item: ScoreComponent = breakdown[key];
          const percentage = Math.round((item.score / item.max) * 100);

          return (
            <div
              key={key}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      {icon}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {item.score}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      /{item.max}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 my-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full bg-linear-to-r from-indigo-500 to-blue-600 transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  {item.explanation}
                </p>
              </div>

              {key === "semantic_match" && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-indigo-600 font-semibold">
                    Sentence-BERT 384D Cosine
                  </span>
                  <span className="font-mono text-slate-600">
                    sim = {deep_learning.semantic_similarity}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strengths & Recommendations Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Identified Strengths ({strengths.length})
            </h4>
          </div>

          <ul className="space-y-2">
            {strengths.map((str, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-700 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Recommendations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-amber-800 pb-2 border-b border-slate-100">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              ATS Improvement Recommendations ({recommendations.length})
            </h4>
          </div>

          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-700 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
