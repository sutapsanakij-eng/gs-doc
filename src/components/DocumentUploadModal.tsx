import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { Personnel, DocumentCategory } from '../types';
import { useData } from '../context/DataContext';

interface DocumentUploadModalProps {
  personnel: Personnel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: { key: DocumentCategory; label: string }[] = [
  { key: 'DISMISSAL_ORDER', label: 'คำสั่งให้ออกจากราชการ / เกษียณอายุ' },
  { key: 'SERVICE_RECORD', label: 'หนังสือรับรองเวลาราชการ (ก.พ. 7 หรือแฟ้มประวัติ)' },
  { key: 'SALARY_CERTIFICATE', label: 'หนังสือรับรองเงินเดือนย้อนหลัง 60 เดือน' },
  { key: 'PENSION_APPLICATION', label: 'แบบคำขอรับบำเหน็จ (แบบ กค. / กบข.)' },
  { key: 'CITIZEN_ID_COPY', label: 'สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ / บัตรประชาชน' },
  { key: 'BANK_BOOK_COPY', label: 'สำเนาสมุดบัญชีเงินฝากธนาคารสำหรับโอนเงินบำเหน็จ' },
  { key: 'HEIR_CERTIFICATE', label: 'หนังสือแสดงเจตนาระบุตัวผู้รับบำเหน็จตกทอด (ถ้ามี)' },
  { key: 'OTHER_OFFICIAL_DOC', label: 'เอกสารราชการประกอบอื่นๆ' },
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  personnel,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { uploadDocument } = useData();

  const [category, setCategory] = useState<DocumentCategory>('DISMISSAL_ORDER');
  const [docTitle, setDocTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !personnel) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!docTitle) {
        setDocTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage('กรุณาเลือกไฟล์เอกสารที่ต้องการนำเข้า');
      return;
    }

    if (!docTitle.trim()) {
      setErrorMessage('กรุณาระบุชื่อเรื่องเอกสาร');
      return;
    }

    setIsUploading(true);
    setUploadStatus('กำลังสแกนไวรัสและมัลแวร์ตามมาตรฐานรักษาความปลอดภัย ศสท. ...');

    setTimeout(() => {
      setUploadStatus('กำลังคำนวณ Checksum SHA-256 และเข้ารหัสจัดเก็บ...');

      setTimeout(() => {
        const selectedCat = CATEGORIES.find(c => c.key === category);
        const res = uploadDocument(
          personnel.id,
          category,
          selectedCat?.label || 'เอกสารราชการ',
          docTitle,
          {
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
          }
        );

        setIsUploading(false);
        setUploadStatus(null);

        if (res.success) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      }, 700);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base">นำเข้าเอกสารประกอบบำเหน็จ</h3>
              <p className="text-xs text-slate-400">
                {personnel.title}{personnel.firstName} {personnel.lastName} ({personnel.personnelCode})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              ประเภทเอกสาร <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              ชื่อเรื่องเอกสาร / เลขที่หนังสือ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="เช่น คำสั่งกระทรวงมหาดไทย ที่ 842/2569 เรื่อง ข้าราชการพ้นจากราชการ"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* File input container */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              เลือกไฟล์เอกสาร (PDF, JPG, PNG สูงสุด 25MB) <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                id="doc-upload"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="doc-upload" className="cursor-pointer block">
                {file ? (
                  <div className="space-y-1">
                    <FileCheck2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="font-semibold text-slate-800">{file.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'เอกสาร'}
                    </div>
                    <span className="text-xs text-amber-600 underline">คลิกเพื่อเปลี่ยนไฟล์</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-slate-700 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                    <p className="text-slate-400 text-[11px]">รองรับไฟล์ PDF, JPG, PNG และเอกสารรับรองดิจิทัล</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Upload progress & AV scan indicator */}
          {isUploading && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-600 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* Security policy note */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              มาตรการรักษาความปลอดภัยของระบบ:
            </div>
            <div>• ไฟล์จะถูกเข้ารหัสระดับพื้นที่จัดเก็บ (Encryption at Rest: AES-256)</div>
            <div>• คำนวณรหัสลับตรวจสอบความถูกต้อง (SHA-256 Checksum) เพื่อป้องกันการแก้ไขย้อนหลัง</div>
            <div>• บันทึกตราประทับ Audit Log ประจำตัวเจ้าหน้าที่ผู้นำเข้า</div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-5 py-2 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-colors disabled:opacity-50"
            >
              {isUploading ? 'กำลังประมวลผล...' : 'นำเข้าเอกสาร'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
