import React from 'react';
import { 
  PersonnelStatus, 
  VerificationStatus, 
  PensionType,
  UserRole 
} from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileCheck2, 
  RotateCcw,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const PersonnelStatusBadge: React.FC<{ status: PersonnelStatus; size?: 'sm' | 'md' }> = ({ 
  status, 
  size = 'md' 
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          อนุมัติแล้ว
        </span>
      );
    case 'PENDING_APPROVAL':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-300 ${sizeClasses}`}>
          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
          รออนุมัติบำเหน็จ
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-300 ${sizeClasses}`}>
          <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
          เอกสารผ่านการตรวจสอบ
        </span>
      );
    case 'IN_VERIFICATION':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse-slow" />
          กำลังตรวจสอบเอกสาร
        </span>
      );
    case 'PENDING_DOCS':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-300 ${sizeClasses}`}>
          <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
          รอส่งเอกสารเพิ่มเติม
        </span>
      );
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          ส่งเรื่องแล้ว / รอคิวตรวจ
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-100 text-rose-800 border border-rose-300 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          ไม่ผ่านการพิจารณา
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          ร่างข้อมูล
        </span>
      );
  }
};

export const VerificationStatusBadge: React.FC<{ status: VerificationStatus; size?: 'sm' | 'md' }> = ({ 
  status, 
  size = 'md' 
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'VALID':
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {status === 'APPROVED' ? 'ผ่านการรับรอง' : 'ถูกต้องสมบูรณ์'}
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          กำลังตรวจสอบ
        </span>
      );
    case 'CORRECTION_REQUESTED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}>
          <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
          ขอเอกสารเพิ่มเติม
        </span>
      );
    case 'INVALID':
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          {status === 'REJECTED' ? 'ปฏิเสธเอกสาร' : 'ไม่ถูกต้อง'}
        </span>
      );
    case 'INCOMPLETE':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
          เอกสารไม่ครบ
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          รอตรวจสอบ
        </span>
      );
  }
};

export const PensionTypeBadge: React.FC<{ type: PensionType }> = ({ type }) => {
  switch (type) {
    case 'ORDINARY_PENSION':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          บำเหน็จปกติ
        </span>
      );
    case 'SPECIAL_PENSION':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          บำเหน็จพิเศษ
        </span>
      );
    case 'HEIR_PENSION':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          บำเหน็จตกทอด
        </span>
      );
    case 'EARLY_RETIREMENT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
          เกษียณก่อนกำหนด
        </span>
      );
    default:
      return <span className="text-xs text-slate-500">{type}</span>;
  }
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          Super Admin
        </span>
      );
    case 'ORG_ADMIN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-300">
          ผู้ดูแลระดับหน่วยงาน
        </span>
      );
    case 'DOCUMENT_OFFICER':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
          เจ้าหน้าที่ตรวจเอกสาร
        </span>
      );
    case 'REVIEWER_APPROVER':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
          ผู้ตรวจสอบ / อนุมัติ
        </span>
      );
    case 'VIEWER':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          ผู้ดูข้อมูลทั่วไป (Viewer)
        </span>
      );
  }
};
