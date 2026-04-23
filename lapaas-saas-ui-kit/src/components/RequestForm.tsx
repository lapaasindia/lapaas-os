import React, { useState } from 'react';
import { Send, Upload, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { RequestCategory, RequestUrgency, CATEGORY_CONFIG, URGENCY_CONFIG, SLA_CONFIG } from '../types/requests';
import { requestService } from '../services/requestService';

interface RequestFormProps {
  userId: string;
  orgId: string;
  onSubmit?: (requestId: string) => void;
  onClose?: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({
  userId,
  orgId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'support' as RequestCategory,
    urgency: 'P2' as RequestUrgency,
    description: '',
    whatTried: '',
    impact: '',
    deadline: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setError('Description is required');
        setLoading(false);
        return;
      }

      // Create request
      const request = await requestService.createRequest(userId, orgId, {
        title: formData.title,
        category: formData.category,
        urgency: formData.urgency,
        description: formData.description,
        whatTried: formData.whatTried,
        impact: formData.impact,
        deadline: formData.deadline || undefined,
        status: 'new'
      });

      if (!request) {
        setError('Failed to create request');
        setLoading(false);
        return;
      }

      // Upload attachments if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          await requestService.uploadAttachment(request.id, file);
        }
      }

      setSubmitted(true);
      onSubmit?.(request.id);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          title: '',
          category: 'support',
          urgency: 'P2',
          description: '',
          whatTried: '',
          impact: '',
          deadline: ''
        });
        setAttachments([]);
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      setError('An error occurred while submitting the request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const slaDueMinutes = SLA_CONFIG[formData.urgency];
  const slaDueHours = Math.round(slaDueMinutes / 60);

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-8 border border-slate-700 text-center">
        <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
        <p className="text-gray-400 mb-4">Your request has been created and assigned an SLA.</p>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-8 border border-slate-700">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Submit a Request</h1>
        <p className="text-gray-400">Provide details about your request. All fields marked with * are required.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-1" size={20} />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief title of your request"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Category & Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Urgency *
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {key} - {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SLA Information */}
        <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-200">
            <span className="font-semibold">SLA:</span> {slaDueHours} hour{slaDueHours !== 1 ? 's' : ''} ({slaDueMinutes} minutes)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description of your request"
            rows={5}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition resize-none"
            required
          />
        </div>

        {/* What Tried */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            What have you already tried?
          </label>
          <textarea
            name="whatTried"
            value={formData.whatTried}
            onChange={handleInputChange}
            placeholder="Describe any troubleshooting steps you've already taken"
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {/* Impact */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Impact
          </label>
          <textarea
            name="impact"
            value={formData.impact}
            onChange={handleInputChange}
            placeholder="How does this issue impact your work?"
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Deadline (Optional)
          </label>
          <div className="relative">
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                  return; // Don't allow past dates
                }
                handleInputChange(e);
              }}
              className="w-full px-4 py-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Select a future date</p>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Attachments (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Upload size={20} />
                <span>Click to upload files</span>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="p-2 bg-slate-700 rounded-lg text-sm text-gray-300">
                  📎 {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Summary */}
        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
          <p className="text-sm text-gray-300 mb-3">
            <span className="font-semibold">Request Summary:</span>
          </p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <span className="font-semibold">Category:</span> {CATEGORY_CONFIG[formData.category].label}</li>
            <li>• <span className="font-semibold">Urgency:</span> {formData.urgency} - {URGENCY_CONFIG[formData.urgency].label}</li>
            <li>• <span className="font-semibold">SLA:</span> {slaDueHours} hours</li>
            {attachments.length > 0 && <li>• <span className="font-semibold">Attachments:</span> {attachments.length} file(s)</li>}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              loading
                ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Send size={20} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
