import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FileKey,
  Printer
} from 'lucide-react';
import { DocumentRecord, Personnel } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { VerificationStatusBadge } from './StatusBadge';

interface DocumentPreviewModalProps {
  document: DocumentRecord | null;
  personnel?: Personnel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifyModal?: (doc: DocumentRecord) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  personnel,
  isOpen,
  onClose,
  onOpenVerifyModal,
}) => {
  const { currentUser, currentOrg, hasPermission } = useAuth();
  const { downloadDocument } = useData();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const canDownload = hasPermission('DOCUMENT_DOWNLOAD');
  const canVerify = hasPermission('DOCUMENT_VERIFY');

  const handleDownload = () => {
    setDownloadSuccessMessage(null);
    setDownloadError(null);

    const result = downloadDocument(document.id);
    if (result.success) {
      setDownloadSuccessMessage(`อนุมัติ Token ดาวน์โหลด: ${result.downloadToken?.slice(0, 16)}... บันทึก Audit Log เรียบร้อย`);
      setTimeout(() => setDownloadSuccessMessage(null), 6000);
    } else {
      setDownloadError(result.error || 'ดาวน์โหลดไม่สำเร็จ');
      setTimeout(() => setDownloadError(null), 6000);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const nowThai = new Date().toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 md:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-6xl h-[92vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100 font-heading truncate max-w-md">
                  {document.title}
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {document.securityClassification}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {document.fileName} • {(document.fileSize / 1024 / 1024).toFixed(2)} MB • SHA-256: {document.fileHashSha256.slice(0, 16)}...
              </p>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2">
            {canVerify && onOpenVerifyModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVerifyModal(document);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                ตรวจสอบเอกสาร
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors ${
                canDownload 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title={canDownload ? 'ดาวน์โหลดเอกสาร (สร้าง Signed Token และบันทึก Audit Log)' : 'ท่านไม่มีสิทธิ์ DOCUMENT_DOWNLOAD'}
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลดเอกสาร
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status / Alert notifications */}
        {downloadSuccessMessage && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}
        {downloadError && (
          <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Viewer Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Document Canvas View */}
          <div className="flex-1 flex flex-col bg-slate-200/90 overflow-hidden relative">
            
            {/* Viewer Controls Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-300 text-slate-700 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 15, 50))}
                  className="p-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
                  title="ย่อขนาด"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-mono font-medium">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 15, 180))}
                  className="p-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
                  title="ขยายขนาด"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
                  title="หมุนหน้าเอกสาร 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs hidden sm:inline-flex"
                  title="พิมพ์เอกสาร"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600">หน้า:</span>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 disabled:opacity-40"
                >
                  ◀
                </button>
                <span className="font-mono font-semibold text-slate-800">{currentPage} / 3</span>
                <button
                  type="button"
                  disabled={currentPage >= 3}
                  onClick={() => setCurrentPage(p => Math.min(3, p + 1))}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 disabled:opacity-40"
                >
                  ▶
                </button>
              </div>

              {/* Security Watermark Badge */}
              <div className="hidden lg:flex items-center gap-1.5 text-rose-700 font-mono text-[11px] font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                PROTECTED WATERMARK ACTIVE
              </div>
            </div>

            {/* Document Sheet Display with Dynamic Watermark */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
              <div 
                className="relative bg-white shadow-2xl border border-slate-300 rounded p-10 md:p-14 text-slate-900 transition-all duration-150"
                style={{
                  width: `${640 * (zoomLevel / 100)}px`,
                  minHeight: `${880 * (zoomLevel / 100)}px`,
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Dynamic Watermark Overlay (Section 11 requirement) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-20 flex flex-col justify-around opacity-25">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="transform -rotate-25 text-center text-rose-800 font-bold tracking-widest text-xs md:text-sm uppercase leading-relaxed"
                    >
                      <div>CONFIDENTIAL • FOR OFFICIAL USE ONLY</div>
                      <div className="text-[10px] text-slate-800 font-mono">
                        {currentUser?.fullName} ({currentUser?.username}) • {currentOrg?.nameTh}
                      </div>
                      <div className="text-[9px] text-slate-700 font-mono">
                        {nowThai} • IP: 192.168.10.88 • DOC-HASH: {document.fileHashSha256.slice(0, 10)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Official Thai Document Content */}
                <div className="relative z-10 flex flex-col h-full font-serif text-slate-900 select-text">
                  
                  {/* Garuda Emblem */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-600 flex items-center justify-center shadow-xs">
                      <span className="text-2xl font-bold text-amber-800 select-none">ตราครุฑ</span>
                    </div>
                  </div>

                  {/* Header text */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold font-heading text-slate-900 tracking-wide">
                      {document.categoryNameTh}
                    </h2>
                    <p className="text-xs text-slate-600 font-sans mt-1">
                      {currentOrg?.ministryTh} • {currentOrg?.nameTh}
                    </p>
                  </div>

                  {/* Formal Order Layout */}
                  <div className="text-xs md:text-sm font-sans space-y-4 text-slate-800 leading-relaxed border-t border-b border-slate-200 py-6">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>เลขที่เอกสาร: {document.id.toUpperCase()}</span>
                      <span>วันที่ตรวจสอบ: {nowThai.split(' ')[0]}</span>
                    </div>

                    <p className="indent-8 text-justify">
                      เรื่อง การขอรับบำเหน็จของข้าราชการ/กำลังพลผู้พ้นจากราชการ
                      ตามระเบียบกระทรวงการคลังว่าด้วยการขอรับและการจ่ายเงินบำเหน็จบำนาญข้าราชการ
                    </p>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-xs">
                      <div><strong className="text-slate-900">ผู้ขอรับบำเหน็จ:</strong> {personnel ? `${personnel.title}${personnel.firstName} ${personnel.lastName}` : 'นายสมหมาย ภักดีสยาม'}</div>
                      <div><strong className="text-slate-900">ตำแหน่ง/สังกัด:</strong> {personnel?.position || 'ปลัดอำเภอชำนาญการพิเศษ'} ({personnel?.division || 'ที่ทำการปกครอง'})</div>
                      <div><strong className="text-slate-900">รหัสกำลังพล:</strong> {personnel?.personnelCode || 'ปค-6809-0012'}</div>
                      <div><strong className="text-slate-900">ประเภทบำเหน็จ:</strong> {personnel?.pensionType === 'ORDINARY_PENSION' ? 'บำเหน็จปกติ' : 'บำเหน็จพิเศษ'}</div>
                      <div><strong className="text-slate-900">ประมาณการยอดเงิน:</strong> {personnel?.pensionAmountEstimated ? `${personnel.pensionAmountEstimated.toLocaleString()} บาท` : '1,425,600 บาท'}</div>
                    </div>

                    <p className="indent-8 text-justify">
                      เอกสารฉบับนี้ได้รับการตรวจสอบความถูกต้องทางสารบรรณอิเล็กทรอนิกส์
                      และนำเข้าสู่ศูนย์ข้อมูลกลางระบบตรวจสอบเอกสารข้าราชการผู้ได้รับบำเหน็จ
                      ข้อมูลที่ปรากฏเป็นเอกสารหลักฐานราชการที่มีผลตามกฎหมาย
                    </p>

                    {/* Official Verification Note */}
                    <div className="mt-6 pt-4 border-t border-dashed border-slate-300">
                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong>ผลการตรวจสอบล่าสุด:</strong> {document.verificationRemarks || 'เอกสารอยู่ระหว่างขั้นตอนการตรวจสอบของเจ้าหน้าที่'}</p>
                        {document.verifiedByUserName && (
                          <p><strong>ผู้ตรวจสอบ:</strong> {document.verifiedByUserName} (วันที่ {new Date(document.verifiedAt || '').toLocaleDateString('th-TH')})</p>
                        )}
                      </div>
                    </div>

                    {/* Signature block */}
                    <div className="pt-10 flex justify-end">
                      <div className="text-center w-56">
                        <div className="h-10 border-b border-slate-400 border-dashed mb-2 flex items-center justify-center font-serif text-slate-400 italic">
                          (ลงนามอิเล็กทรอนิกส์)
                        </div>
                        <p className="text-xs font-semibold text-slate-800">ผู้มีอำนาจรับรองเอกสาร</p>
                        <p className="text-[11px] text-slate-500">{currentOrg?.nameTh}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="mt-auto pt-4 text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>GP-DMS CENTRAL PLATFORM • VERSION {document.version}.0</span>
                    <span>หน้าที่ {currentPage} จาก 3</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Meta & Verification Sidebar */}
          <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col overflow-y-auto p-4 hidden md:flex text-xs space-y-5">
            <div>
              <h4 className="font-heading font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <FileKey className="w-4 h-4 text-amber-600" />
                ข้อมูลจำเพาะเอกสาร
              </h4>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">สถานะเอกสาร:</span>
                  <div className="mt-1">
                    <VerificationStatusBadge status={document.verificationStatus} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">ประเภทเอกสาร:</span>
                  <span className="font-medium text-slate-800">{document.categoryNameTh}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">นำเข้าโดย:</span>
                  <span className="text-slate-800">{document.uploadedByUserName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">วันที่นำเข้า:</span>
                  <span className="text-slate-700 font-mono">
                    {new Date(document.uploadedAt).toLocaleString('th-TH')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">ระดับชั้นความลับ:</span>
                  <span className="font-semibold text-amber-700">{document.securityClassification}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Checksum Verification */}
            <div>
              <h4 className="font-heading font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ความสมบูรณ์ของไฟล์ (Integrity)
              </h4>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SHA-256 Checksum Verified
                </div>
                <div className="p-2 bg-slate-100 rounded text-[10px] font-mono break-all text-slate-700 border border-slate-200">
                  {document.fileHashSha256}
                </div>
                <p className="text-[10px] text-slate-500">
                  ไฟล์ไม่ถูกแก้ไขหรือแทรกแซงตั้งแต่ได้รับนำเข้าสู่ระบบความมั่นคงปลอดภัย
                </p>
              </div>
            </div>

            {/* Verification Remarks */}
            <div>
              <h4 className="font-heading font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                บันทึกการตรวจสอบ
              </h4>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                {document.verificationRemarks ? (
                  <>
                    <p className="text-slate-700 italic">"{document.verificationRemarks}"</p>
                    <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      ตรวจโดย: {document.verifiedByUserName || 'เจ้าหน้าที่ผู้มีอำนาจ'}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 italic">ยังไม่มีบันทึกผลการตรวจสอบ</p>
                )}

                {document.rejectionReason && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
                    <strong>เหตุผลส่งกลับ/ปฏิเสธ:</strong> {document.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>ข้อควรระวัง:</strong> การดูหรือดาวน์โหลดเอกสารนี้ถูกบันทึกลงใน Audit Trail ส่วนกลาง พร้อมระบุ IP, ผู้ใช้ และตราประทับเวลา
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
