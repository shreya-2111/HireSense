import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export function ResumeUploader({ selectedFile, onSelectFile }) {
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
      onSelectFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSelectFile(file);
    }
  };

  const fileName = selectedFile instanceof File ? selectedFile.name : selectedFile?.name;
  const fileSize = selectedFile instanceof File
    ? `${Math.round(selectedFile.size / 1024)} KB`
    : selectedFile?.size || 'Ready for analysis';

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
              <p className="text-sm font-semibold text-slate-900">{fileName}</p>
              <p className="text-xs text-slate-500">{fileSize} • Ready for analysis</p>
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
    </div>
  );
}
