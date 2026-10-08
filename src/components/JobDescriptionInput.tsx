import React from "react";
import { Briefcase, Play, Sparkles, RefreshCw } from "lucide-react";
import { SAMPLE_JOB_DESCRIPTIONS, SampleJobDescription } from "../sampleData";

interface JobDescriptionInputProps {
  jobDescriptionText: string;
  setJobDescriptionText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onSampleSelect: (sample: SampleJobDescription) => void;
  canAnalyze: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  jobDescriptionText,
  setJobDescriptionText,
  onAnalyze,
  isAnalyzing,
  onSampleSelect,
  canAnalyze,
}) => {
  const wordCount = jobDescriptionText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Step 2: Target Job Description</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter the job description to calculate semantic similarity, skill gaps, and ATS match
          </p>
        </div>

        {/* Job Presets */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {SAMPLE_JOB_DESCRIPTIONS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelect(sample)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/70 transition-colors"
              title={`Load ${sample.title} (${sample.company})`}
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Job Description Text</span>
          <span>{wordCount} words • {jobDescriptionText.length} chars</span>
        </div>
        <textarea
          value={jobDescriptionText}
          onChange={(e) => setJobDescriptionText(e.target.value)}
          placeholder="Paste job description requirements, responsibilities, and required qualifications..."
          className="w-full h-32 p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-800 bg-white placeholder-slate-400 resize-none transition-all"
        />
      </div>

      {/* Main Analyze Button */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-slate-400 hidden sm:block">
          Powered by PyTorch Sentence-Transformers (all-MiniLM-L6-v2) & Explainable Scoring
        </p>

        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className={`ml-auto flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md ${
            !canAnalyze || isAnalyzing
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01]"
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Deep Learning Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Resume & Calculate ATS Score</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
