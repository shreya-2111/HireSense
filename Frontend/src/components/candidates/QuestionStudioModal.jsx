import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Edit2,
  Trash2,
  Plus,
  Download,
  SlidersHorizontal
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useRecruitment } from '../../context/RecruitmentContext';
import { candidateService } from '../../services/candidateService';

export function QuestionStudioModal({ candidate, job, isOpen, onClose }) {
  const { addToast } = useRecruitment();

  const [questionType, setQuestionType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (candidate?.interviewQuestions?.length > 0) {
      setQuestions(
        candidate.interviewQuestions.map((q, idx) => ({
          id: q.id || `q-${idx}`,
          question: q.question,
          rationale: q.rationale || 'Targeted interview probe',
          type: q.type || 'Technical',
          isEditing: false,
        }))
      );
    } else if (candidate) {
      const fallbackSkill = candidate?.matchedSkills?.[0] || 'Modern Web Architecture';
      setQuestions([
        {
          id: `q-${candidate.id}-1`,
          question: `How have you utilized ${fallbackSkill} in large-scale applications to optimize rendering and state management?`,
          rationale: `Probes practical hands-on proficiency with ${fallbackSkill}.`,
          type: 'Technical',
          isEditing: false
        },
        {
          id: `q-${candidate.id}-2`,
          question: `Explain your approach to designing resilient APIs and handling asynchronous data streams under high load.`,
          rationale: `Evaluates architecture and production reliability skills.`,
          type: 'Technical',
          isEditing: false
        },
        {
          id: `q-${candidate.id}-3`,
          question: `Describe a scenario where you resolved complex performance bottlenecks in a production deployment.`,
          rationale: `Assesses troubleshooting maturity and root-cause analysis.`,
          type: 'Experience',
          isEditing: false
        }
      ]);
    }
  }, [candidate, isOpen]);

  const [copiedId, setCopiedId] = useState(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newGenerated = await candidateService.generateQuestions({
      candidate,
      job,
      type: questionType,
      difficulty,
      count: parseInt(questionCount, 10)
    });
    setQuestions(newGenerated.map(q => ({ ...q, isEditing: false })));
    setIsGenerating(false);
    addToast(`Generated ${newGenerated.length} ${difficulty.toLowerCase()} ${questionType.toLowerCase()} interview questions!`);
  };

  const handleCopySingle = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("Question copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const formatted = questions
      .map((q, idx) => `${idx + 1}. [${q.type || 'General'}] ${q.question}\n   Note: ${q.rationale}`)
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    addToast("All interview questions formatted and copied to clipboard!");
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    addToast("Question removed.");
  };

  const handleToggleEdit = (id) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, isEditing: !q.isEditing } : q));
  };

  const handleSaveEdit = (id, newText) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question: newText, isEditing: false } : q));
    addToast("Question updated.");
  };

  const handleAddCustomQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: `custom-${Date.now()}`,
      question: newQuestionText.trim(),
      rationale: 'Custom interviewer question',
      type: questionType,
      isEditing: false
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText('');
    setIsAddingCustom(false);
    addToast("Custom question added to list.");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interview Questions Preparation"
      subtitle={`Prepare relevant questions for ${candidate?.name || 'Candidate'} (${candidate?.appliedRole || job?.title || 'Position'})`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportAll}
          >
            Export / Copy All ({questions.length})
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done & Save
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-slate-800">
        {/* Candidate Context Pill Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Candidate</span>
            <span className="font-semibold text-slate-900">{candidate?.name || 'Aarav Shah'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Position</span>
            <span className="font-semibold text-slate-900">{candidate?.appliedRole || job?.title || 'Frontend Developer'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Match Score</span>
            <span className="font-semibold text-emerald-700">{candidate?.matchScore || 92}% Match</span>
          </div>
        </div>

        {/* Generator Controls Toolbar */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Configure Interview Question Parameters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Question Focus / Type"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
            >
              <option value="Technical">Technical & Architecture</option>
              <option value="Behavioral">Behavioral & Culture</option>
              <option value="Experience">Past Experience Deep-Dive</option>
              <option value="Situational">Situational & Problem Solving</option>
            </Select>

            <Select
              label="Difficulty Level"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy / Foundational</option>
              <option value="Medium">Medium / Standard</option>
              <option value="Hard">Hard / Advanced Staff Level</option>
            </Select>

            <Select
              label="Number of Questions"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
            </Select>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="sm"
              loading={isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? "Synthesizing Questions..." : "Generate Questions"}
            </Button>
          </div>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Generated Questions ({questions.length})
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Question
            </button>
          </div>

          {/* Add custom question input */}
          {isAddingCustom && (
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-blue-900">
                Write Custom Interview Question:
              </label>
              <textarea
                rows={2}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Type your question..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsAddingCustom(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleAddCustomQuestion}>
                  Save Question
                </Button>
              </div>
            </div>
          )}

          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-blue-200 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    {q.isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={q.question}
                          id={`edit-input-${q.id}`}
                          rows={2}
                          className="w-full text-xs sm:text-sm p-2 border border-blue-400 rounded-lg focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              const val = document.getElementById(`edit-input-${q.id}`)?.value;
                              handleSaveEdit(q.id, val || q.question);
                            }}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleToggleEdit(q.id)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                          {q.question}
                        </p>
                        {q.rationale && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            <span className="font-semibold text-slate-600">Rationale:</span> {q.rationale}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopySingle(q.question, q.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Copy Question"
                  >
                    {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEdit(q.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
