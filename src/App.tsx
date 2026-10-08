import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SideDashboard } from "./components/SideDashboard";
import { ResumeInput } from "./components/ResumeInput";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { ScoreBreakdown } from "./components/ScoreBreakdown";
import { SkillAnalysis } from "./components/SkillAnalysis";
import { DeepLearningView } from "./components/DeepLearningView";
import { SectionEditor } from "./components/SectionEditor";
import { ChatbotDrawer } from "./components/ChatbotDrawer";
import { HowItWorksModal } from "./components/HowItWorksModal";
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS, SampleResume, SampleJobDescription } from "./sampleData";
import { AnalysisResult } from "./types";
import { Sparkles, AlertCircle, FileText, Cpu, Layers, Edit3, WifiOff } from "lucide-react";
import { getApiUrl, getApiBaseUrl } from "./api";

export default function App() {
  // Preset defaults (Alexander Chen + ML Engineer Job)
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].text);
  const [jobDescriptionText, setJobDescriptionText] = useState(SAMPLE_JOB_DESCRIPTIONS[0].text);
  const [fileName, setFileName] = useState<string | null>("alex_chen_resume.pdf");

  // Analysis state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Tab & Modal Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "deep-learning" | "editor">("overview");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>("");
  const [isVivaGuideOpen, setIsVivaGuideOpen] = useState(false);
  const [mlServiceStatus, setMlServiceStatus] = useState("checking");

  // Check ML service health on startup
  useEffect(() => {
    fetch(getApiUrl("/api/ml-health"))
      .then((res) => {
        if (!res.ok) throw new Error("Health check returned non-200");
        return res.json();
      })
      .then((data) => {
        setMlServiceStatus(data.status || "healthy");
      })
      .catch(() => {
        setMlServiceStatus("offline");
      });
  }, []);

  // Run initial analysis automatically on mount for immediate presentation
  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch(getApiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description_text: jobDescriptionText,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Analysis request failed with status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
      setMlServiceStatus("healthy");
    } catch (err: any) {
      console.error("Analysis error:", err);
      const targetUrl = getApiBaseUrl() || "http://localhost:5001";
      setAnalysisError(
        `Unable to reach Python ML Service at ${targetUrl}. ` +
        `Please ensure the FastAPI backend is running and CORS is enabled. (${err.message})`
      );
      setMlServiceStatus("offline");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleResumeSelect = (sample: SampleResume) => {
    setResumeText(sample.text);
    setFileName(`${sample.id}.pdf`);
  };

  const handleSampleJobSelect = (sample: SampleJobDescription) => {
    setJobDescriptionText(sample.text);
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatbotOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVivaGuide={() => setIsVivaGuideOpen(true)}
        onToggleChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
        hasAnalysis={!!analysis}
        mlStatus={mlServiceStatus}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Left/Center Column */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Step 1 & 2: Resume Input & Job Description Input */}
            <div className="space-y-4">
              <ResumeInput
                resumeText={resumeText}
                setResumeText={setResumeText}
                fileName={fileName}
                setFileName={setFileName}
                onSampleSelect={handleSampleResumeSelect}
              />

              <JobDescriptionInput
                jobDescriptionText={jobDescriptionText}
                setJobDescriptionText={setJobDescriptionText}
                onAnalyze={runAnalysis}
                isAnalyzing={isAnalyzing}
                onSampleSelect={handleSampleJobSelect}
                canAnalyze={resumeText.trim().length > 20}
              />
            </div>

            {/* Error & Offline Notification */}
            {analysisError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {!analysisError && mlServiceStatus === "offline" && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>ML Service Offline:</strong> Cannot reach the FastAPI backend at{" "}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">
                      {getApiBaseUrl() || "http://localhost:5001"}
                    </code>
                    . Configure <code>VITE_ML_API_URL</code> for production deployment.
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Tabs (Mobile & Tablet) */}
            {analysis && (
              <div className="lg:hidden flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === "overview" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  ATS Breakdown
                </button>
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === "skills" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Skills
                </button>
                <button
                  onClick={() => setActiveTab("deep-learning")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === "deep-learning" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Deep Learning
                </button>
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === "editor" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  AI Editor
                </button>
              </div>
            )}

            {/* Analysis Views */}
            {analysis && (
              <div>
                {activeTab === "overview" && <ScoreBreakdown analysis={analysis} />}
                {activeTab === "skills" && (
                  <SkillAnalysis
                    skills={analysis.skills}
                    jobMatchPercentage={analysis.job_match_percentage}
                  />
                )}
                {activeTab === "deep-learning" && (
                  <DeepLearningView deepLearning={analysis.deep_learning} />
                )}
                {activeTab === "editor" && (
                  <SectionEditor
                    resumeText={resumeText}
                    onUpdateResumeText={(newText) => {
                      setResumeText(newText);
                      // Re-run analysis with updated text
                      setTimeout(() => runAnalysis(), 200);
                    }}
                    jobDescription={jobDescriptionText}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sticky Side Dashboard */}
          <SideDashboard
            analysis={analysis}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        </div>
      </main>

      {/* AI Career Assistant Chatbot Drawer */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        analysis={analysis}
        initialPrompt={chatInitialPrompt}
      />

      {/* College Viva & Presentation Modal */}
      <HowItWorksModal
        isOpen={isVivaGuideOpen}
        onClose={() => setIsVivaGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <strong>ResumeAI</strong> • Intelligent Resume Analyzer &amp; Career Assistant
          </div>
          <div className="flex items-center space-x-3">
            <span>PyTorch Sentence-BERT (384-dim)</span>
            <span>•</span>
            <span>FastAPI Microservice</span>
            <span>•</span>
            <span>Gemini AI Assistant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
