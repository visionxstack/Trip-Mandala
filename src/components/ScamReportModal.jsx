/**
 * ScamReportModal — Tourist scam/fraud report submission modal
 */
import { useState } from "react";
import { AlertTriangle, X, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trustService } from "../services/trustService";
import ImageUploader from "./ImageUploader";

const REPORT_TYPES = [
  { value: "overcharging",    label: "Overcharging / Price Fraud" },
  { value: "fake_guide",      label: "Fake or Unqualified Guide" },
  { value: "fake_listing",    label: "Fake or Misleading Listing" },
  { value: "misleading_info", label: "Misleading Information" },
  { value: "unsafe_behavior", label: "Unsafe Behavior" },
  { value: "other",           label: "Other" },
];

export default function ScamReportModal({ targetId, targetType, targetName, onClose }) {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [evidenceImages, setEvidenceImages] = useState([]);

  const handleSubmit = async () => {
    if (!reportType || description.length < 20) {
      setError("Please select a report type and provide a description (min 20 characters).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // TODO (Supabase Storage): 
      // 1. Loop through evidenceImages (File objects).
      // 2. Upload them to a secure Supabase Storage bucket (e.g. 'evidence_bucket').
      // 3. Get the public URLs and pass them to evidence_urls below.
      const evidenceUrls = evidenceImages.length > 0
        ? evidenceImages.map(f => URL.createObjectURL(f)) // Temporary placeholder
        : [];

      await trustService.submitReport({
        target_id: targetId,
        target_type: targetType,
        report_type: reportType,
        description,
        evidence_urls: evidenceUrls,
      });
      setSubmitted(true);
    } catch (e) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[#2A2A2A] text-base">Report a Problem</h2>
              {targetName && <p className="text-xs text-neutral-500">{targetName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1 bg-transparent border-0 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-green-800 text-base">Report Submitted</h3>
            <p className="text-sm text-neutral-500 text-center">
              Our admin team will review your report within 48 hours. Trust scores are updated accordingly.
            </p>
            <Button onClick={onClose} className="mt-2 bg-[#B5532A] hover:bg-[#a0441f] text-white text-sm px-6 h-9 rounded-lg">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {/* Report Type */}
              <div>
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-2">
                  Report Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      onClick={() => setReportType(rt.value)}
                      className={`text-left text-xs px-3 py-2 rounded-lg border cursor-pointer transition-colors font-medium ${
                        reportType === rt.value
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-2">
                  Describe What Happened *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about what happened..."
                  rows={4}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#B5532A] resize-none text-neutral-800"
                />
                <p className="text-[10px] text-neutral-400 mt-1">{description.length}/500 characters (min 20)</p>
              </div>

              {/* Evidence Upload */}
              <div>
                <ImageUploader 
                  maxImages={3}
                  onImagesChange={(files) => setEvidenceImages(files)}
                  initialPreviews={[]}
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg h-10 border-0 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#B5532A] hover:bg-[#a0441f] text-white text-sm h-10 rounded-lg gap-2"
              >
                <Send size={13} />
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
