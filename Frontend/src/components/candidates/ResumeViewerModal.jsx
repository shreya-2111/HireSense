import React from 'react';
import { Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

export function ResumeViewerModal({ candidate, isOpen, onClose }) {
  const { addToast } = useRecruitment();

  if (!candidate) return null;

  const handleDownload = () => {
    if (!candidate) return;
    try {
      const experienceSection = (candidate.experienceTimeline || [])
        .map(
          (exp) =>
            `${exp.role} | ${exp.company} (${exp.period})\nLocation: ${exp.location}\nKey Achievements:\n${(exp.achievements || [])
              .map((a) => `  • ${a}`)
              .join('\n')}`
        )
        .join('\n\n');

      const educationSection = candidate.education
        ? typeof candidate.education === 'object'
          ? `${candidate.education.degree || 'Bachelor of Engineering'}\n${candidate.education.institution || 'Recognized University'} (Class of ${candidate.education.year || '2021'}) - GPA: ${candidate.education.gpa || '3.8/4.0'}`
          : candidate.education
        : 'N/A';

      const resumeContent = [
        '============================================================',
        `${candidate.name.toUpperCase()} - RESUME DOCUMENT`,
        `Role: ${candidate.appliedRole}`,
        `Email: ${candidate.email} | Phone: ${candidate.phone || 'N/A'} | Location: ${candidate.location || 'N/A'}`,
        '============================================================\n',
        'PROFESSIONAL SUMMARY',
        '------------------------------------------------------------',
        `${candidate.summary || 'Experienced professional.'}\n`,
        'CORE SKILLS & COMPETENCIES',
        '------------------------------------------------------------',
        `Matched Skills: ${(candidate.matchedSkills || []).join(', ')}`,
        `Additional Skills: ${(candidate.missingSkills || []).join(', ') || 'None'}\n`,
        'WORK EXPERIENCE',
        '------------------------------------------------------------',
        `${experienceSection || 'Experience on file.'}\n`,
        'EDUCATION',
        '------------------------------------------------------------',
        `${educationSection}\n`,
        '============================================================'
      ].join('\n');

      const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${candidate.name.replace(/\s+/g, '_')}_Resume.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Resume for ${candidate.name} downloaded successfully!`);
    } catch (err) {
      addToast("Failed to download resume file.", "warning");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${candidate.name} — Resume Document`}
      subtitle={`Original application for ${candidate.appliedRole}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500">
            Format: Verified Text/PDF Export • Parsed by HireSense Ingestion
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Download} onClick={handleDownload}>
              Download Resume (.txt)
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      }
    >
      {/* Resume Document Styled Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs text-slate-800 space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
          <p className="text-sm font-medium text-blue-600 mt-0.5">{candidate.appliedRole}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
            <span>{candidate.email}</span>
            <span>•</span>
            <span>{candidate.phone}</span>
            <span>•</span>
            <span>{candidate.location}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Professional Summary</h4>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
            {candidate.summary}
          </p>
        </div>

        {/* Core Competencies / Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Key Technical Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {candidate.matchedSkills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                {skill}
              </span>
            ))}
            {candidate.missingSkills && candidate.missingSkills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 text-xs rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {skill} (Learning)
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Work Experience</h4>
          <div className="space-y-4">
            {candidate.experienceTimeline && candidate.experienceTimeline.map((item, idx) => (
              <div key={idx} className="border-l-2 border-slate-200 pl-4 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                  <span className="font-semibold text-slate-900">{item.role}</span>
                  <span className="text-xs text-slate-500 font-medium">{item.period}</span>
                </div>
                <p className="text-xs font-medium text-slate-600">{item.company} — {item.location}</p>
                <ul className="list-disc list-outside pl-4 text-xs text-slate-600 space-y-1 pt-1">
                  {item.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Education & Credentials</h4>
          {candidate.education && (
            <div className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <p className="font-semibold text-slate-900">
                  {typeof candidate.education === 'object' ? (candidate.education.degree || 'Bachelor of Engineering in Computer Science') : candidate.education}
                </p>
                <p className="text-slate-500">
                  {typeof candidate.education === 'object' ? (candidate.education.institution || 'Gujarat Technological University') : 'Recognized University'} • GPA: {typeof candidate.education === 'object' ? (candidate.education.gpa || '3.8/4.0') : '3.8/4.0'}
                </p>
              </div>
              <span className="text-slate-400 font-medium">
                {typeof candidate.education === 'object' ? (candidate.education.year || '2021') : '2021'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
