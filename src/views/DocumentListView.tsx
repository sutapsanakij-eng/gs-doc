import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  CheckSquare, 
  ShieldCheck, 
  FileKey,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DocumentRecord, VerificationStatus, DocumentCategory } from '../types';
import { VerificationStatusBadge } from '../components/StatusBadge';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { DocumentVerifyModal } from '../components/DocumentVerifyModal';

export const DocumentListView: React.FC = () => {
  const { currentOrg, hasPermission } = useAuth();
  const { downloadDocument, getAccessiblePersonnel, getDocumentsForPersonnel } = useData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentRecord | null>(null);
  const [selectedDocForVerify, setSelectedDocForVerify] = useState<DocumentRecord | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const canDownload = hasPermission('DOCUMENT_DOWNLOAD');
  const canVerify = hasPermission('DOCUMENT_VERIFY');

  // Collect accessible documents
  const accessiblePersonnel = getAccessiblePersonnel();
  const allAccessibleDocs: DocumentRecord[] = [];
  accessiblePersonnel.forEach(p => {
    const res = getDocumentsForPersonnel(p.id);
    if (res.success && res.data) {
      allAccessibleDocs.push(...res.data);
    }
  });

  const filteredDocs = allAccessibleDocs.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileHashSha256.includes(searchTerm) ||
      doc.uploadedByUserName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || doc.verificationStatus === selectedStatus;
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleDownload = (doc: DocumentRecord) => {
    const res = downloadDocument(doc.id);
    if (res.success) {
      setActionMessage(`สร้าง Token ดาวน์โหลดสำเร็จ (${doc.fileName}) บันทึก Audit Log แล้ว`);
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setActionMessage(res.error || 'ดาวน์โหลดไม่สำเร็จ');
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-5 text-slate-800 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              คลังเอกสารและผลการตรวจสอบ (Document Management)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300">
              {filteredDocs.length} ไฟล์
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์กลางจัดเก็บและตรวจสอบเอกสารในสังกัด <strong>{currentOrg?.nameTh}</strong> พร้อมระบบเข้ารหัสและลายน้ำ
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          ENCRYPTED OBJECT STORAGE (AES-256)
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อเอกสาร, ชื่อไฟล์, รหัส Hash, หรือผู้นำเข้า..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="ALL">สถานะการตรวจทั้งหมด</option>
            <option value="PENDING">รอตรวจสอบ</option>
            <option value="IN_PROGRESS">กำลังตรวจสอบ</option>
            <option value="VALID">ถูกต้องสมบูรณ์</option>
            <option value="APPROVED">ผ่านการรับรอง</option>
            <option value="CORRECTION_REQUESTED">ขอเอกสารเพิ่มเติม</option>
            <option value="INVALID">ไม่ถูกต้อง</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="ALL">ประเภทเอกสารทั้งหมด</option>
            <option value="DISMISSAL_ORDER">คำสั่งให้ออกจากราชการ/เกษียณ</option>
            <option value="SERVICE_RECORD">หนังสือรับรองเวลาราชการ (ก.พ. 7)</option>
            <option value="SALARY_CERTIFICATE">หนังสือรับรองเงินเดือน 60 เดือน</option>
            <option value="PENSION_APPLICATION">แบบคำขอรับบำเหน็จ</option>
            <option value="BANK_BOOK_COPY">สำเนาสมุดบัญชีเงินฝาก</option>
          </select>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="p-3.5">ชื่อเอกสาร / รายละเอียด</th>
                <th className="p-3.5">หมวดหมู่</th>
                <th className="p-3.5">ขนาดไฟล์ / ความปลอดภัย</th>
                <th className="p-3.5">ผู้นำเข้า / วันที่</th>
                <th className="p-3.5 text-center">สถานะ</th>
                <th className="p-3.5 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    ไม่พบเอกสารที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.fileName}</div>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <div>{doc.categoryNameTh}</div>
                      <span className="text-[10px] font-mono text-slate-400">{doc.category}</span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      <div>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={doc.fileHashSha256}>
                        SHA-256: {doc.fileHashSha256.slice(0, 12)}...
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <div>{doc.uploadedByUserName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <VerificationStatusBadge status={doc.verificationStatus} size="sm" />
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocForPreview(doc)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          พรีวิว
                        </button>

                        {canVerify && (
                          <button
                            type="button"
                            onClick={() => setSelectedDocForVerify(doc)}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                            ตรวจ
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          disabled={!canDownload}
                          className={`p-1.5 rounded transition-colors ${
                            canDownload 
                              ? 'text-slate-600 hover:text-amber-700 hover:bg-slate-100' 
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title="ดาวน์โหลด"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <DocumentPreviewModal
        document={selectedDocForPreview}
        isOpen={!!selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
        onOpenVerifyModal={(doc) => setSelectedDocForVerify(doc)}
      />

      <DocumentVerifyModal
        document={selectedDocForVerify}
        isOpen={!!selectedDocForVerify}
        onClose={() => setSelectedDocForVerify(null)}
        onSuccess={() => {
          setActionMessage('บันทึกผลการตรวจสอบเรียบร้อย');
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

    </div>
  );
};
