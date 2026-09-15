import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRecruitment } from '../../context/RecruitmentContext';

export function JobDeleteConfirmModal({ job, isOpen, onClose, onDeleted }) {
  const { deleteJob } = useRecruitment();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await deleteJob(job.id);
      if (onDeleted) onDeleted(job.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete job opening.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Job Opening"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            {isDeleting ? 'Deleting...' : 'Delete Job'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-slate-800">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Permanent Action Warning</p>
            <p className="mt-0.5 text-red-700 leading-relaxed">
              Are you sure you want to delete <strong className="font-bold text-slate-900">"{job.title}"</strong> ({job.department})?
              All associated applicant rankings and interview links will also be removed.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-100 text-red-800 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
