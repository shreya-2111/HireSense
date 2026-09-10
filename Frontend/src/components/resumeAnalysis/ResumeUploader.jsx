import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { MOCK_RESUME_SAMPLES } from '../../data/mockResumeSamples';

export function ResumeUploader({ selectedFile, onSelectFile, onSelectSample }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onSelectFile({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        rawText: "Uploaded file content parsed via client mock engine.",
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSelectFile({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        rawText: "Uploaded file content parsed via client mock engine.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : selectedFile
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 text-emerald-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{selectedFile.size} • Ready for analysis</p>
            </div>
            <span className="text-xs text-blue-600 font-medium underline mt-1">
              Click to replace file
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports PDF, DOCX, or plain TXT (Max: 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recruiter 1-Click Demo Helper */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">
            Quick Test: Select a Sample Candidate Resume
          </span>
          <span className="text-[10px] text-slate-400">Pre-formatted profiles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MOCK_RESUME_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600">
                  {sample.title.split('—')[0]}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                {sample.title.split('—')[1] || 'Specialist'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
