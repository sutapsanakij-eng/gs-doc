import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Download, 
  Eye, 
  ShieldCheck, 
  MessageSquare, 
  Calendar, 
  Building, 
  Coins, 
  Send, 
  CheckSquare, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { 
  Personnel, 
  DocumentRecord, 
  PersonnelStatus, 
  VerificationStatus 
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MaskedText } from '../components/MaskedText';
import { PersonnelStatusBadge, VerificationStatusBadge, PensionTypeBadge } from '../components/StatusBadge';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { DocumentVerifyModal } from '../components/DocumentVerifyModal';
import { DocumentUploadModal } from '../components/DocumentUploadModal';

interface PersonnelDetailViewProps {
  personnel: Personnel;
  onBack: () => void;
}

export const PersonnelDetailView: React.FC<PersonnelDetailViewProps> = ({
  personnel,
  onBack,
}) => {
  const { currentUser, currentOrg, hasPermission } = useAuth();
  const { 
    getDocumentsForPersonnel, 
    downloadDocument, 
    updatePersonnelStatus, 
    addComment, 
    getCommentsForPersonnel, 
    auditLogs 
  } = useData();

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'DOCUMENTS' | 'WORKFLOW' | 'AUDIT' | 'COMMENTS'>('DOCUMENTS');
  
  // Modals state
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentRecord | null>(null);
  const [selectedDocForVerify, setSelectedDocForVerify] = useState<DocumentRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [isInternalOnly, setIsInternalOnly] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const canDownload = hasPermission('DOCUMENT_DOWNLOAD');
  const canVerify = hasPermission('DOCUMENT_VERIFY');
  const canApprove = hasPermission('DOCUMENT_APPROVE');
  const canUpload = hasPermission('DOCUMENT_UPLOAD');

  const docsRes = getDocumentsForPersonnel(personnel.id);
  const documents = docsRes.success && docsRes.data ? docsRes.data : [];
  const comments = getCommentsForPersonnel(personnel.id);
  const personnelLogs = auditLogs.filter(l => l.targetId === personnel.id || documents.some(d => d.id === l.targetId));

  const handleDownloadDoc = (doc: DocumentRecord) => {
    const res = downloadDocument(doc.id);
    if (res.success) {
      setActionMessage(`อนุมัติ Token ดาวน์โหลดสำหรับ "${doc.fileName}" เรียบร้อย (บันทึก Audit Log แล้ว)`);
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setActionMessage(res.error || 'ดาวน์โหลดไม่สำเร็จ');
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleWorkflowAdvance = (newStatus: PersonnelStatus, reason: string) => {
    const res = updatePersonnelStatus(personnel.id, newStatus, reason);
    if (res.success) {
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(personnel.id, commentText, isInternalOnly);
    setCommentText('');
  };

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-150">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับสู่ทะเบียนกำลังพล
        </button>

        <div className="flex items-center gap-2">
          <PersonnelStatusBadge status={personnel.status} />
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Profile Overview Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {personnel.firstName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading text-slate-900">
                  {personnel.title}{personnel.firstName} {personnel.lastName}
                </h1>
                <PensionTypeBadge type={personnel.pensionType} />
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                <span>รหัสกำลังพล: <strong className="font-mono text-slate-900">{personnel.personnelCode}</strong></span>
                <span>•</span>
                <span>เลขประจำตัว: <MaskedText value={personnel.nationalId} /></span>
                <span>•</span>
                <span>ตำแหน่ง: <strong className="text-slate-800">{personnel.position}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">ประมาณการเงินบำเหน็จสุทธิ</span>
            <span className="text-xl font-bold font-heading text-amber-700 font-mono">
              ฿ {personnel.pensionAmountEstimated.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 5 Tab Navigation */}
        <div className="flex border-b border-slate-200 mt-4 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'DOCUMENTS'
                ? 'border-amber-600 text-amber-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>เอกสารประกอบ ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'GENERAL'
                ? 'border-amber-600 text-amber-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ข้อมูลทั่วไป</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WORKFLOW')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'WORKFLOW'
                ? 'border-amber-600 text-amber-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>สถานะการตรวจสอบและขั้นตอน</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'AUDIT'
                ? 'border-amber-600 text-amber-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ประวัติการดำเนินการ (Audit)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMMENTS')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'COMMENTS'
                ? 'border-amber-600 text-amber-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>หมายเหตุ / บันทึกเจ้าหน้าที่ ({comments.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: General Info */}
      {activeTab === 'GENERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs text-xs">
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2">
              ข้อมูลทางราชการและสังกัด
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">หน่วยงานต้นสังกัด:</span>
                <span className="font-medium text-slate-900">{currentOrg?.nameTh} ({currentOrg?.ministryTh})</span>
              </div>
              <div>
                <span className="text-slate-500 block">กอง / สำนัก:</span>
                <span className="font-medium text-slate-900">{personnel.division}</span>
              </div>
              <div>
                <span className="text-slate-500 block">กลุ่มงาน / ฝ่าย:</span>
                <span className="font-medium text-slate-900">{personnel.subDivision}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ระดับตำแหน่ง:</span>
                <span className="font-medium text-slate-900">{personnel.rankLevel}</span>
              </div>
            </div>

            <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2 pt-2">
              ประวัติเวลาการรับราชการ
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">วันเริ่มรับราชการ:</span>
                <span className="font-medium text-slate-900 font-mono">
                  {new Date(personnel.startDate).toLocaleDateString('th-TH')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">วันพ้นจากราชการ:</span>
                <span className="font-medium text-slate-900 font-mono">
                  {new Date(personnel.endDate).toLocaleDateString('th-TH')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">อายุราชการรวม:</span>
                <span className="font-bold text-amber-700">
                  {personnel.totalServiceYears} ปี {personnel.totalServiceMonths} เดือน
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">เหตุที่พ้นจากราชการ:</span>
                <span className="font-medium text-slate-900">
                  {personnel.pensionType === 'ORDINARY_PENSION' ? 'ครบเกษียณอายุราชการ' : 'ได้รับบำเหน็จพิเศษ/ลาออก'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2">
              ข้อมูลการขอรับบำเหน็จและการจ่ายเงิน
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-900 block font-semibold mb-1">สูตรคำนวณเงินบำเหน็จตามระเบียบ:</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  เงินเดือนเดือนสุดท้าย × จำนวนปีเวลาราชการ = ประมาณการยอดเงินบำเหน็จรวม
                </p>
                <div className="mt-2 text-base font-bold font-mono text-amber-800">
                  ฿ {personnel.pensionAmountEstimated.toLocaleString()} บาท
                </div>
              </div>

              <div>
                <span className="text-slate-500 block">ประเภทบำเหน็จ:</span>
                <span className="font-medium text-slate-900">
                  {personnel.pensionType === 'ORDINARY_PENSION' ? 'บำเหน็จปกติ (ข้าราชการประจำ)' :
                   personnel.pensionType === 'SPECIAL_PENSION' ? 'บำเหน็จพิเศษ (ปฏิบัติหน้าที่เสี่ยงภัย)' : 'บำเหน็จตกทอด (ทายาท)'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">เจ้าหน้าที่ผู้รับผิดชอบสำนวน:</span>
                <span className="font-medium text-slate-900">
                  {currentUser?.fullName} ({currentUser?.position})
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">วันที่นำเข้าสู่ระบบ:</span>
                <span className="font-mono text-slate-700">
                  {new Date(personnel.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Documents List & Actions */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm">
                เอกสารประกอบการขอรับบำเหน็จ ({documents.length} รายการ)
              </h3>
              <p className="text-xs text-slate-500">
                เอกสารทุกฉบับมี Checksum ตรวจสอบความถูกต้องและประทับลายน้ำเมื่อเปิดดู
              </p>
            </div>
            {canUpload && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                นำเข้าเอกสารใหม่
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="p-3.5">ประเภทเอกสาร</th>
                  <th className="p-3.5">ชื่อเรื่องเอกสาร / เลขที่หนังสือ</th>
                  <th className="p-3.5">ขนาด / Checksum SHA-256</th>
                  <th className="p-3.5">วันที่นำเข้า</th>
                  <th className="p-3.5 text-center">สถานะการตรวจ</th>
                  <th className="p-3.5 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-medium text-slate-800">
                      <div>{doc.categoryNameTh}</div>
                      <span className="text-[10px] font-mono text-slate-400">{doc.category}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{doc.fileName}</div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      <div>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs" title={doc.fileHashSha256}>
                        {doc.fileHashSha256.slice(0, 16)}...
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 font-mono">
                      {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}
                    </td>

                    <td className="p-3.5 text-center">
                      <VerificationStatusBadge status={doc.verificationStatus} size="sm" />
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview button */}
                        <button
                          type="button"
                          onClick={() => setSelectedDocForPreview(doc)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="เปิดพรีวิวเอกสารพร้อมฝังลายน้ำ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูเอกสาร
                        </button>

                        {/* Verify button */}
                        {canVerify && (
                          <button
                            type="button"
                            onClick={() => setSelectedDocForVerify(doc)}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="บันทึกผลการตรวจสอบ"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                            ตรวจ
                          </button>
                        )}

                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          disabled={!canDownload}
                          className={`p-1.5 rounded transition-colors ${
                            canDownload 
                              ? 'text-slate-600 hover:text-amber-700 hover:bg-slate-100' 
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={canDownload ? 'ดาวน์โหลดเอกสาร (สร้าง Signed Token)' : 'ไม่มีสิทธิ์ดาวน์โหลด'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Workflow Progression Timeline */}
      {activeTab === 'WORKFLOW' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2">
            ลำดับขั้นตอนการพิจารณาบำเหน็จ (Workflow Timeline)
          </h3>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            
            {/* Step 1 */}
            <div className="ml-6 relative">
              <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <h4 className="font-bold text-slate-900 text-sm">1. นำเข้าข้อมูลและจัดทำสำนวน</h4>
              <p className="text-slate-600 mt-0.5">จัดทำทะเบียนและรวบรวมเอกสารเบื้องต้นเรียบร้อย</p>
              <span className="text-[10px] text-slate-400 font-mono">เสร็จสิ้นเมื่อ: {new Date(personnel.createdAt).toLocaleDateString('th-TH')}</span>
            </div>

            {/* Step 2 */}
            <div className="ml-6 relative">
              <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                personnel.status !== 'DRAFT' && personnel.status !== 'SUBMITTED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-pulse'
              }`}>
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">2. ตรวจสอบความถูกต้องของเอกสารหลักฐาน</h4>
              <p className="text-slate-600 mt-0.5">ตรวจสอบ ก.พ. 7, คำสั่งเกษียณ, และหนังสือรับรองเงินเดือน</p>
            </div>

            {/* Step 3 */}
            <div className="ml-6 relative">
              <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                personnel.status === 'VERIFIED' || personnel.status === 'PENDING_APPROVAL' || personnel.status === 'APPROVED'
                  ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">3. สรุปความเห็นเสนอผู้บังคับบัญชา</h4>
              <p className="text-slate-600 mt-0.5">สรุปยอดเงินและเสนอหัวหน้ากลุ่มงานบำเหน็จบำนาญ</p>
            </div>

            {/* Step 4 */}
            <div className="ml-6 relative">
              <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                personnel.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm">4. อนุมัติการจ่ายเงินบำเหน็จ</h4>
              <p className="text-slate-600 mt-0.5">ผู้อำนวยการกองการเจ้าหน้าที่ลงนามอนุมัติเบิกจ่าย</p>
            </div>

          </div>

          {/* Workflow Action Buttons for Reviewer/Officer */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 pt-4">
            <span className="font-semibold text-slate-800 block text-xs">
              การสั่งการตามขั้นตอน (Workflow Actions):
            </span>
            <div className="flex flex-wrap gap-2">
              {canVerify && (
                <>
                  <button
                    type="button"
                    onClick={() => handleWorkflowAdvance('IN_VERIFICATION', 'เจ้าหน้าที่เริ่มกระบวนการตรวจสอบเอกสาร')}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-2xs"
                  >
                    ระบุ: กำลังตรวจสอบเอกสาร
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWorkflowAdvance('PENDING_DOCS', 'ส่งกลับเพื่อขอเอกสารเพิ่มเติม')}
                    className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium shadow-2xs"
                  >
                    ขอเอกสารเพิ่มเติม
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWorkflowAdvance('VERIFIED', 'เอกสารถูกต้องครบถ้วนพร้อมเสนออนุมัติ')}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-2xs"
                  >
                    ยืนยัน: เอกสารผ่านการตรวจ
                  </button>
                </>
              )}

              {canApprove && (
                <>
                  <button
                    type="button"
                    onClick={() => handleWorkflowAdvance('PENDING_APPROVAL', 'ส่งสำนวนเข้าคิวรอการลงนามอนุมัติ')}
                    className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-2xs"
                  >
                    เสนอรออนุมัติบำเหน็จ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWorkflowAdvance('APPROVED', 'อนุมัติการจ่ายเงินบำเหน็จตามระเบียบเรียบร้อย')}
                    className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-2xs"
                  >
                    ลงนามอนุมัติจ่ายบำเหน็จ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Trail specific to this personnel */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
            <span>บันทึกการดำเนินการย้อนหลัง (Audit Trail เฉพาะบุคคลนี้)</span>
            <span className="text-[11px] text-slate-500 font-mono">IMMUTABLE LOGS</span>
          </h3>

          <div className="space-y-3">
            {personnelLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{log.actionDescription}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    ผู้ดำเนินการ: {log.userFullName} ({log.userRole.replace('_', ' ')}) • IP: {log.ipAddress}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Official Comments & Remarks */}
      {activeTab === 'COMMENTS' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2">
            บันทึกหมายเหตุและข้อคิดเห็นของเจ้าหน้าที่
          </h3>

          <div className="space-y-3">
            {comments.map((cmt) => (
              <div key={cmt.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{cmt.authorName}</strong>
                    <span className="text-slate-500 text-[11px]">({cmt.authorPosition})</span>
                    {cmt.isInternalOnly && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-semibold">
                        เฉพาะภายใน
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(cmt.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed font-sans">{cmt.content}</p>
              </div>
            ))}
          </div>

          {/* Add new comment form */}
          <form onSubmit={handleAddCommentSubmit} className="space-y-3 pt-4 border-t border-slate-200">
            <label className="block font-semibold text-slate-800">
              เพิ่มข้อเสนอแนะหรือบันทึกหมายเหตุใหม่:
            </label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="บันทึกข้อคิดเห็นในการพิจารณา..."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={isInternalOnly}
                  onChange={(e) => setIsInternalOnly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>บันทึกสำหรับเจ้าหน้าที่ตรวจสอบภายในเท่านั้น</span>
              </label>

              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                บันทึกข้อคิดเห็น
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocForPreview}
        personnel={personnel}
        isOpen={!!selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
        onOpenVerifyModal={(doc) => setSelectedDocForVerify(doc)}
      />

      {/* Document Verify Modal */}
      <DocumentVerifyModal
        document={selectedDocForVerify}
        isOpen={!!selectedDocForVerify}
        onClose={() => setSelectedDocForVerify(null)}
        onSuccess={() => {
          setActionMessage('บันทึกผลการตรวจสอบเอกสารเรียบร้อย');
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        personnel={personnel}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setActionMessage('นำเข้าเอกสารใหม่เรียบร้อย');
          setTimeout(() => setActionMessage(null), 4000);
        }}
      />

    </div>
  );
};
