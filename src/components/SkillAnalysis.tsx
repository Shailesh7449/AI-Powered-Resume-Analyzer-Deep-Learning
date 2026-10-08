import React from "react";
import { CheckCircle2, AlertTriangle, Sparkles, Layers, ArrowRight, Tag } from "lucide-react";
import { SkillData } from "../types";

interface SkillAnalysisProps {
  skills: SkillData;
  jobMatchPercentage: number;
}

export const SkillAnalysis: React.FC<SkillAnalysisProps> = ({ skills, jobMatchPercentage }) => {
  const { matched_skills, missing_skills, related_skills, additional_skills, total_found, total_missing } =
    skills;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Skill Gap & Normalization Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies canonical skills from text and normalizes variations (e.g., &quot;ML&quot; &rarr; &quot;Machine Learning&quot;, &quot;K8s&quot; &rarr; &quot;Kubernetes&quot;)
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Job Match
              </div>
              <div className="text-lg font-black text-indigo-600">
                {jobMatchPercentage}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-left text-xs text-slate-600">
              <span className="font-bold text-emerald-600">{matched_skills.length}</span> Matched •{" "}
              <span className="font-bold text-amber-600">{missing_skills.length}</span> Missing
            </div>
          </div>
        </div>

        {/* 4 Skill Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* 1. Matched Skills */}
          <div className="space-y-2.5 bg-emerald-50/30 border border-emerald-200/70 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Matched Skills ({matched_skills.length})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Present in Resume & JD
              </span>
            </div>

            {matched_skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/60 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No direct skill matches detected.</p>
            )}
          </div>

          {/* 2. Missing Skills */}
          <div className="space-y-2.5 bg-amber-50/30 border border-amber-200/70 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Missing Skills ({missing_skills.length})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                Required by Job
              </span>
            </div>

            {missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60 shadow-2xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600 mr-1" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">
                Awesome! All required skills from the job description are covered.
              </p>
            )}
          </div>

          {/* 3. Related Skills (Semantic Cousins) */}
          <div className="space-y-2.5 bg-purple-50/30 border border-purple-200/70 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-800">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Related Skills ({related_skills.length})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                Semantic Cousins
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Skills you possess that closely support the missing or required technologies:
            </p>

            {related_skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {related_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300/60 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600 mr-1" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No secondary cluster overlaps.</p>
            )}
          </div>

          {/* 4. Additional Candidate Skills */}
          <div className="space-y-2.5 bg-blue-50/30 border border-blue-200/70 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-800">
                <Tag className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Additional Skills ({additional_skills.length})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                Bonus Profile Strengths
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Technical proficiencies in your resume not explicitly requested by this job:
            </p>

            {additional_skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {additional_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300/60 shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">None</p>
            )}
          </div>
        </div>
      </div>

      {/* Explanation of Skill Matching in College Review */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center space-x-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-600" />
          <span>How Skill Extraction & Normalization Works in ResumeAI:</span>
        </div>
        <p className="leading-relaxed">
          1. <strong>Taxonomy Matching:</strong> Canonical skill definitions map technical variants (e.g. &quot;ML&quot;, &quot;machine-learning&quot;, and &quot;machine learning&quot;) to unified canonical representations.
        </p>
        <p className="leading-relaxed">
          2. <strong>Cluster Association:</strong> Detects semantic cousin clusters (e.g., if a job asks for Machine Learning, having Scikit-Learn or Pandas demonstrates foundational readiness).
        </p>
        <p className="leading-relaxed">
          3. <strong>Mathematical Match:</strong> Skill score is weighted at <strong>25 points</strong> of the total ATS score: <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700">Skill Score = (Matched Skills / Required Skills) &times; 25</code>.
        </p>
      </div>
    </div>
  );
};
