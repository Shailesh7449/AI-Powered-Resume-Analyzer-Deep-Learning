import React from "react";
import { Sparkles, Cpu, BookOpen, MessageSquareText, FileText, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  activeTab: "overview" | "skills" | "deep-learning" | "editor";
  setActiveTab: (tab: "overview" | "skills" | "deep-learning" | "editor") => void;
  onOpenVivaGuide: () => void;
  onToggleChatbot: () => void;
  hasAnalysis: boolean;
  mlStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenVivaGuide,
  onToggleChatbot,
  hasAnalysis,
  mlStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Resume<span className="text-indigo-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  College Project Review
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Intelligent Resume Analyzer & Career Assistant • Deep Learning & Explainable ATS
              </p>
            </div>
          </div>

          {/* Navigation Tabs (visible when analysis exists) */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>ATS & Analysis</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "skills"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Skill Gap & Match
            </button>
            <button
              onClick={() => setActiveTab("deep-learning")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "deep-learning"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deep Learning Pipeline</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Section-wise AI Editor
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-[11px]">PyTorch ML Ready</span>
            </div>

            {/* Viva & Project Guide Modal Trigger */}
            <button
              onClick={onOpenVivaGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
              title="How It Works & College Viva Presentation Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>How It Works & Viva Guide</span>
            </button>

            {/* Career Assistant Chatbot Button */}
            <button
              onClick={onToggleChatbot}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs shadow-indigo-200"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Ask AI Chatbot</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
