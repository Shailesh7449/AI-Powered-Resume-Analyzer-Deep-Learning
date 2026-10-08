import React, { useRef, useState } from "react";
import { Upload, FileText, CheckCircle2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { SAMPLE_RESUMES, SampleResume } from "../sampleData";
import { getApiUrl } from "../api";

interface ResumeInputProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  onSampleSelect: (sample: SampleResume) => void;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  onSampleSelect,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(getApiUrl("/api/parse-resume"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to extract text from file");
      }

      const data = await response.json();
      setResumeText(data.text);
      setFileName(data.filename);
    } catch (err: any) {
      console.error("File upload error:", err);
      setUploadError(err.message || "Failed to parse document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Step 1: Candidate Resume</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload PDF/DOCX or select a realistic college project resume preset
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {SAMPLE_RESUMES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelect(sample)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/70 transition-colors"
              title={`Load ${sample.title}`}
            >
              {sample.title.split(" ")[0]} ({sample.role.split("/")[0].trim()})
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="md:col-span-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
          />

          {isUploading ? (
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:scale-105 transition-all">
              <Upload className="w-5 h-5" />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">
              {isUploading ? "Extracting Text..." : "Upload Resume"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, DOCX, TXT</p>
          </div>

          {fileName && (
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[120px]">{fileName}</span>
            </div>
          )}
        </div>

        {/* Text Area for Resume Text */}
        <div className="md:col-span-2 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Resume Text (Extracted / Editable)</span>
            <span>{wordCount} words • {resumeText.length} chars</span>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setFileName(null);
            }}
            placeholder="Paste raw resume text here, or upload your document above..."
            className="w-full h-36 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-mono text-slate-800 bg-white placeholder-slate-400 resize-none transition-all"
          />
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
