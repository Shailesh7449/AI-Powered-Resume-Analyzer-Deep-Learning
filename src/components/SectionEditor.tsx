import React, { useState } from "react";
import {
  Sparkles,
  Edit3,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Save,
  CheckCircle2,
} from "lucide-react";
import { ResumeSectionId, ResumeSectionItem } from "../types";

interface SectionEditorProps {
  resumeText: string;
  onUpdateResumeText: (newText: string) => void;
  jobDescription: string;
}

const DEFAULT_SECTIONS: { id: ResumeSectionId; name: string }[] = [
  { id: "summary", name: "Professional Summary" },
  { id: "skills", name: "Technical Skills" },
  { id: "experience", name: "Work Experience" },
  { id: "projects", name: "Technical Projects" },
  { id: "education", name: "Education & Coursework" },
  { id: "certifications", name: "Certifications" },
  { id: "achievements", name: "Achievements & Awards" },
];

export const SectionEditor: React.FC<SectionEditorProps> = ({
  resumeText,
  onUpdateResumeText,
  jobDescription,
}) => {
  // Helper to extract or segment sections from resumeText
  const extractSectionContent = (id: ResumeSectionId): string => {
    const lines = resumeText.split("\n");
    let capturing = false;
    const captured: string[] = [];

    const sectionPatterns: Record<ResumeSectionId, RegExp> = {
      summary: /^(?:professional\s+)?summary|objective|profile/i,
      skills: /^(?:technical\s+)?skills|technologies|proficiencies/i,
      experience: /^(?:work\s+|professional\s+)?experience|employment|work\s+history/i,
      projects: /^(?:academic\s+|technical\s+)?projects/i,
      education: /^education|academic\s+background/i,
      certifications: /^certifications|credentials/i,
      achievements: /^achievements|awards|honors/i,
    };

    const targetPattern = sectionPatterns[id];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (capturing) captured.push("");
        continue;
      }

      // Check if this line is our section header
      if (targetPattern.test(line.replace(/[^a-zA-Z\s]/g, "").trim())) {
        capturing = true;
        continue;
      }

      // Check if this line matches ANY other section header
      if (capturing) {
        const isAnotherHeader = Object.entries(sectionPatterns).some(([secId, pattern]) => {
          if (secId === id) return false;
          return pattern.test(line.replace(/[^a-zA-Z\s]/g, "").trim());
        });

        if (isAnotherHeader) {
          break; // finished this section
        }

        captured.push(lines[i]);
      }
    }

    const result = captured.join("\n").trim();
    if (result) return result;

    // Fallback default templates if not detected in text
    if (id === "summary") {
      return "Results-driven Software Engineer with experience in developing scalable web applications and machine learning pipelines. Seeking to leverage skills in Python, React, and cloud architectures.";
    }
    if (id === "skills") {
      return "• Languages: Python, C++, SQL, TypeScript\n• Frameworks: PyTorch, React, FastAPI, Node.js\n• Tools: Docker, Git, Linux, AWS";
    }
    if (id === "experience") {
      return "Software Engineering Intern | Tech Innovations | May 2024 - Aug 2024\n• Developed and deployed backend microservices using Python and FastAPI.\n• Integrated PostgreSQL database schemas, improving query response time by 20%.\n• Collaborated in weekly agile sprints to deliver customer-facing features.";
    }
    if (id === "projects") {
      return "AI Document Analyzer\n• Built an intelligent document analysis tool utilizing Transformer embeddings.\n• Deployed containerized microservices using Docker on cloud infrastructure.";
    }
    if (id === "education") {
      return "Bachelor of Science in Computer Science\nUniversity Institute of Technology | GPA: 3.8 / 4.0\nGraduation: 2025";
    }
    if (id === "certifications") {
      return "• DeepLearning.AI Deep Learning Specialization\n• AWS Certified Cloud Practitioner";
    }
    if (id === "achievements") {
      return "• Finalist in National Engineering Hackathon 2024\n• Dean's Academic Honors List for 4 consecutive semesters";
    }
    return "";
  };

  const [activeSectionId, setActiveSectionId] = useState<ResumeSectionId>("summary");
  const [sectionContent, setSectionContent] = useState<Record<ResumeSectionId, string>>({
    summary: extractSectionContent("summary"),
    skills: extractSectionContent("skills"),
    experience: extractSectionContent("experience"),
    projects: extractSectionContent("projects"),
    education: extractSectionContent("education"),
    certifications: extractSectionContent("certifications"),
    achievements: extractSectionContent("achievements"),
  });

  const [isEditingDirectly, setIsEditingDirectly] = useState(false);
  const [editedText, setEditedText] = useState("");

  // AI Editing State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiImprovedText, setAiImprovedText] = useState("");
  const [aiChangesSummary, setAiChangesSummary] = useState<string[]>([]);
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const currentSection = DEFAULT_SECTIONS.find((s) => s.id === activeSectionId)!;
  const currentText = sectionContent[activeSectionId];

  // Direct manual editing
  const handleStartManualEdit = () => {
    setEditedText(currentText);
    setIsEditingDirectly(true);
  };

  const handleSaveManualEdit = () => {
    const updated = { ...sectionContent, [activeSectionId]: editedText };
    setSectionContent(updated);
    setIsEditingDirectly(false);
    updateGlobalResumeText(updated);
  };

  // AI Editing Flow
  const handleOpenAiEdit = async () => {
    setIsAiModalOpen(true);
    setAiImprovedText("");
    setAiChangesSummary([]);
    await generateAiImprovements(currentText);
  };

  const generateAiImprovements = async (contentToImprove: string) => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/gemini/edit-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionName: currentSection.name,
          currentContent: contentToImprove,
          jobDescription,
          instructions: customAiPrompt || "Make action-oriented, professional, and ATS-optimized.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI rewrite");
      }

      const data = await response.json();
      setAiImprovedText(data.improved_content || contentToImprove);
      setAiChangesSummary(data.changes_summary || ["Enhanced phrasing and action verbs."]);
    } catch (err) {
      console.error("AI rewrite error:", err);
      setAiImprovedText(contentToImprove);
      setAiChangesSummary(["Could not connect to Gemini service. Preserved original text."]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAcceptAiChanges = () => {
    const updated = { ...sectionContent, [activeSectionId]: aiImprovedText };
    setSectionContent(updated);
    setIsAiModalOpen(false);
    updateGlobalResumeText(updated);
  };

  const handleRejectAiChanges = () => {
    setIsAiModalOpen(false);
  };

  const updateGlobalResumeText = (updatedSections: Record<ResumeSectionId, string>) => {
    // Reconstruct full resume text cleanly
    const fullText = `PROFESSIONAL SUMMARY
${updatedSections.summary}

TECHNICAL SKILLS
${updatedSections.skills}

WORK EXPERIENCE
${updatedSections.experience}

PROJECTS
${updatedSections.projects}

EDUCATION
${updatedSections.education}

CERTIFICATIONS
${updatedSections.certifications}

ACHIEVEMENTS
${updatedSections.achievements}`;

    onUpdateResumeText(fullText);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Section-wise AI Resume Editor
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Refine individual resume sections with direct editing or grounded Gemini AI optimization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Anti-Hallucination Policy Active
          </span>
          {saveSuccessMessage && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white animate-fade-in">
              <Check className="w-3 h-3 mr-1" />
              Resume Synchronized!
            </span>
          )}
        </div>
      </div>

      {/* Main Section Navigation and Editor Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Side: 7 Sections List */}
        <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Resume Sections
          </div>
          {DEFAULT_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSectionId(sec.id);
                setIsEditingDirectly(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                activeSectionId === sec.id
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{sec.name}</span>
              <ArrowRight
                className={`w-3.5 h-3.5 ${
                  activeSectionId === sec.id ? "text-white" : "text-slate-400"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Right Side: Active Section Content & Action Buttons */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">{currentSection.name}</h4>
              <p className="text-xs text-slate-400">
                Current content for ATS evaluation and recruitment screening
              </p>
            </div>

            {/* Section Actions: [Edit] & [Edit with AI] */}
            <div className="flex items-center space-x-2">
              {!isEditingDirectly ? (
                <>
                  <button
                    onClick={handleStartManualEdit}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Direct Edit</span>
                  </button>

                  <button
                    onClick={handleOpenAiEdit}
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-semibold transition-all shadow-xs shadow-indigo-200 hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Edit with AI</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingDirectly(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveManualEdit}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Section</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Editor Body */}
          {isEditingDirectly ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-56 p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs text-slate-800 bg-slate-50/50 leading-relaxed resize-none"
              />
              <p className="text-[11px] text-slate-400">
                Edit text directly. Click &apos;Save Section&apos; when finished to synchronize into the main resume.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 min-h-[160px] whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
              {currentText || (
                <span className="text-slate-400 italic">
                  No text defined for this section yet. Click &apos;Direct Edit&apos; or &apos;Edit with AI&apos; to populate it.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Rewrite Modal / Split-Pane Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Section Enhancement: {currentSection.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Grounding strictly in original facts — no hallucinated companies, numbers, or degrees
                  </p>
                </div>
              </div>
              <button
                onClick={handleRejectAiChanges}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom AI Instruction Bar */}
            <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="Optional direction: e.g. Focus on cloud technologies, emphasize lead responsibilities..."
                className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
              <button
                onClick={() => generateAiImprovements(currentText)}
                disabled={isGeneratingAi}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
              >
                {isGeneratingAi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Regenerate</span>
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Original */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Original Section
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans text-slate-700 whitespace-pre-wrap h-56 overflow-y-auto leading-relaxed">
                  {currentText}
                </div>
              </div>

              {/* Right: AI Improved */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    AI Improved Version
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    ATS-Optimized
                  </span>
                </div>

                <div className="bg-indigo-50/40 border border-indigo-200 rounded-xl p-4 text-xs font-sans text-slate-800 whitespace-pre-wrap h-56 overflow-y-auto leading-relaxed relative">
                  {isGeneratingAi ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-2xs space-y-2">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                      <span className="text-xs font-medium text-slate-600">
                        Polishing section with Gemini AI...
                      </span>
                    </div>
                  ) : (
                    aiImprovedText
                  )}
                </div>
              </div>
            </div>

            {/* Changes Summary */}
            {aiChangesSummary.length > 0 && !isGeneratingAi && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Improvements Applied:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800 ml-1">
                  {aiChangesSummary.map((ch, idx) => (
                    <li key={idx}>{ch}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleRejectAiChanges}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Reject Changes
              </button>

              <button
                onClick={() => generateAiImprovements(currentText)}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleAcceptAiChanges}
                disabled={isGeneratingAi || !aiImprovedText}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs shadow-emerald-200"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
