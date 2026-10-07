import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  FileText, 
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { DocumentRecord, VerificationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface DocumentVerifyModalProps {
  document: DocumentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DocumentVerifyModal: React.FC<DocumentVerifyModalProps> = ({
  document,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, currentOrg } = useAuth();
  const { verifyDocument } = useData();

  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>('VALID');
  const [remarks, setRemarks] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [checklist, setChecklist] = useState({
    identityMatch: true,
    officialStampValid: true,
    signatureValid: true,
    clarityCheck: true,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const handleChecklistToggle = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if ((selectedStatus === 'INVALID' || selectedStatus === 'REJECTED' || selectedStatus === 'CORRECTION_REQUESTED') && !remarks.trim() && !rejectionReason.trim()) {
      setErrorMessage('กรุณาระบุเหตุผลหรือข้อเสนอแนะในการแก้ไข');
      return;
    }

    const res = verifyDocument(
      document.id,
      selectedStatus,
      remarks,
      rejectionReason
    );

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base">บันทึกผลการตรวจสอบเอกสาร</h3>
              <p className="text-xs text-slate-400 font-mono">
                {document.fileName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Doc Summary Box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              {document.title}
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>ประเภท: {document.categoryNameTh}</span>
              <span>สังกัด: {currentOrg?.nameTh}</span>
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              รายการตรวจสอบความถูกต้อง (Verification Checklist)
            </label>
            <div className="space-y-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={checklist.identityMatch}
                  onChange={() => handleChecklistToggle('identityMatch')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>1. ข้อมูลชื่อ-นามสกุล และเลขประจำตัวประชาชนตรงกับทะเบียนประวัติ</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={checklist.officialStampValid}
                  onChange={() => handleChecklistToggle('officialStampValid')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>2. มีตราประทับทางราชการ/ตราครุฑ ชัดเจน ไม่เลือนราง</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={checklist.signatureValid}
                  onChange={() => handleChecklistToggle('signatureValid')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>3. มีลายมือชื่อผู้มีอำนาจลงนามและตำแหน่งระบุชัดเจน</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={checklist.clarityCheck}
                  onChange={() => handleChecklistToggle('clarityCheck')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>4. ภาพเอกสารชัดเจน ครบถ้วนทุกหน้า ไม่มีรอยขูดลบแก้ไขผิดระเบียบ</span>
              </label>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              ผลการตรวจสอบ (Verification Status) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              <button
                type="button"
                onClick={() => setSelectedStatus('VALID')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  selectedStatus === 'VALID'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-medium">ถูกต้องสมบูรณ์</div>
                  <div className="text-[10px] text-slate-500">เอกสารถูกต้องตามระเบียบ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('APPROVED')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  selectedStatus === 'APPROVED'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-medium">ผ่านการรับรอง</div>
                  <div className="text-[10px] text-slate-500">รับรองผลพร้อมเสนออนุมัติ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('CORRECTION_REQUESTED')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  selectedStatus === 'CORRECTION_REQUESTED'
                    ? 'border-orange-600 bg-orange-50 text-orange-900 font-semibold ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-orange-600 shrink-0" />
                <div>
                  <div className="font-medium">ขอเอกสารเพิ่มเติม</div>
                  <div className="text-[10px] text-slate-500">ส่งกลับให้แนบหลักฐานเพิ่ม</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('INVALID')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  selectedStatus === 'INVALID'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div className="font-medium">ไม่ถูกต้อง / ปฏิเสธ</div>
                  <div className="text-[10px] text-slate-500">เอกสารผิดพลาดไม่ตรงระเบียบ</div>
                </div>
              </button>

            </div>
          </div>

          {/* Remarks Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              หมายเหตุ / ข้อเสนอแนะการตรวจสอบ
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="ระบุข้อคิดเห็นในการตรวจสอบ เช่น ตรวจสอบเทียบกับฉบับจริงแล้ว..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Rejection reason (if invalid or correction requested) */}
          {(selectedStatus === 'INVALID' || selectedStatus === 'CORRECTION_REQUESTED' || selectedStatus === 'REJECTED') && (
            <div>
              <label className="block text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
                เหตุผลการส่งกลับหรือปฏิเสธ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="เช่น ขาดใบรับรองแพทย์จากโรงพยาบาลทหาร หรือสำเนาไม่ชัดเจน"
                className="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          )}

          {/* Officer footer info */}
          <div className="p-2.5 bg-slate-100 rounded text-[11px] text-slate-600 flex justify-between items-center">
            <span>ผู้ตรวจสอบ: <strong>{currentUser?.fullName}</strong> ({currentUser?.position})</span>
            <span className="font-mono text-slate-500">บันทึกลง Audit Log อัตโนมัติ</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
            >
              บันทึกผลการตรวจสอบ
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
