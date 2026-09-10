import React, { useState } from 'react';
import {
  User,
  Bell,
  SlidersHorizontal,
  Check,
  Building,
  Mail,
  Shield,
  Save,
  RotateCcw
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useRecruitment } from '../context/RecruitmentContext';

export function SettingsPage() {
  const { settings, updateSettings, addToast } = useRecruitment();

  const [activeTab, setActiveTab] = useState('profile');

  // Form state
  const [formData, setFormData] = useState({
    recruiterName: settings.recruiterName || 'Sarah Lin',
    recruiterTitle: settings.recruiterTitle || 'Senior Technical Recruiter',
    recruiterEmail: settings.recruiterEmail || 'sarah.lin@hiresense.internal',
    companyName: settings.companyName || 'Acme Cloud Technologies',
    department: settings.department || 'Talent Acquisition',
    timezone: settings.timezone || 'America/New_York (EST)',
    emailNewApplicants: settings.emailNewApplicants ?? true,
    highMatchThreshold: settings.highMatchThreshold || 85,
    dailyInterviewDigest: settings.dailyInterviewDigest ?? true,
    skillMatchingSensitivity: settings.skillMatchingSensitivity || 'Balanced (Recommended)',
    exportFormat: settings.exportFormat || 'PDF',
  });

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Application Preferences' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <PageContainer
      title="Settings"
      subtitle="Manage your recruiter profile, automated notifications, and AI screening preferences."
    >
      <div className="max-w-4xl space-y-6">
        {/* Settings Navigation Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recruiter Profile</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Your personal recruiter details and organizational affiliation</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    required
                  />
                  <Input
                    label="Job Title"
                    value={formData.recruiterTitle}
                    onChange={(e) => setFormData({ ...formData, recruiterTitle: e.target.value })}
                    required
                  />
                  <Input
                    label="Work Email Address"
                    type="email"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    required
                  />
                  <Input
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                  <Select
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Engineering Management">Engineering Management</option>
                    <option value="Executive Search">Executive Search</option>
                  </Select>
                  <Select
                    label="Primary Timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    <option value="America/New_York (EST)">Eastern Time (US & Canada)</option>
                    <option value="America/Chicago (CST)">Central Time (US & Canada)</option>
                    <option value="America/Denver (MST)">Mountain Time (US & Canada)</option>
                    <option value="America/Los_Angeles (PST)">Pacific Time (US & Canada)</option>
                    <option value="Europe/London (GMT)">London (GMT)</option>
                    <option value="Asia/Kolkata (IST)">India Standard Time (IST)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Control when HireSense sends you email alerts and task digests</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.emailNewApplicants}
                      onChange={(e) => setFormData({ ...formData, emailNewApplicants: e.target.checked })}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                        Email alerts for high-fit candidate matches
                      </span>
                      <span className="text-xs text-slate-500">
                        Receive immediate notifications when an applicant scores above the high match threshold ({formData.highMatchThreshold}%+).
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.dailyInterviewDigest}
                      onChange={(e) => setFormData({ ...formData, dailyInterviewDigest: e.target.checked })}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                        Daily interview digest and prep reminders
                      </span>
                      <span className="text-xs text-slate-500">
                        Get a summary every morning at 8:00 AM with scheduled interviews and candidate dossiers.
                      </span>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Application Preferences */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Application & Screening Preferences</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Configure scoring thresholds, matching sensitivity, and report defaults</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* High Match Score Threshold Slider */}
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800">
                      Strong Match Flagging Threshold
                    </label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {formData.highMatchThreshold}% Match
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="1"
                    value={formData.highMatchThreshold}
                    onChange={(e) => setFormData({ ...formData, highMatchThreshold: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Candidates scoring at or above this value are automatically badged as "Strong Match" and prioritized in the dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Skill Matching Sensitivity"
                    value={formData.skillMatchingSensitivity}
                    onChange={(e) => setFormData({ ...formData, skillMatchingSensitivity: e.target.value })}
                  >
                    <option value="Strict (Exact Keyword Matches Only)">Strict (Exact Keyword Matches Only)</option>
                    <option value="Balanced (Recommended)">Balanced (Semantic & Related Technologies)</option>
                    <option value="Flexible (Broad Equivalencies)">Flexible (Broad Equivalencies)</option>
                  </Select>

                  <Select
                    label="Default Export Format"
                    value={formData.exportFormat}
                    onChange={(e) => setFormData({ ...formData, exportFormat: e.target.value })}
                  >
                    <option value="PDF">PDF Summary Dossier</option>
                    <option value="CSV">CSV Spreadsheet Table</option>
                    <option value="JSON">JSON Data Export</option>
                  </Select>
                </div>

                {/* Algorithmic Disclosure Note */}
                <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-lg text-xs text-blue-900 leading-relaxed">
                  <p>
                    <strong>Transparency & Compliance:</strong> All scoring weights apply equally to all candidate profiles without demographic adjustments. Audit logs are preserved for all shortlist and rejection decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData({
                  recruiterName: settings.recruiterName,
                  recruiterTitle: settings.recruiterTitle,
                  recruiterEmail: settings.recruiterEmail,
                  companyName: settings.companyName,
                  department: settings.department,
                  timezone: settings.timezone,
                  emailNewApplicants: settings.emailNewApplicants,
                  highMatchThreshold: settings.highMatchThreshold,
                  dailyInterviewDigest: settings.dailyInterviewDigest,
                  skillMatchingSensitivity: settings.skillMatchingSensitivity,
                  exportFormat: settings.exportFormat,
                });
                addToast("Settings reset to current values.");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
