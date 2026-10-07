import React from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Check, 
  X, 
  Info,
  Lock
} from 'lucide-react';
import { Permission, UserRole } from '../types';

interface PermissionMeta {
  key: Permission;
  nameTh: string;
  category: 'ORGANIZATION' | 'PERSONNEL' | 'DOCUMENTS' | 'SECURITY' | 'REPORTS';
  description: string;
}

const PERMISSION_METAS: PermissionMeta[] = [
  { key: 'ALL_ORGS_VIEW', nameTh: 'เข้าถึงข้อมูลทุกหน่วยงาน (ข้ามสังกัด)', category: 'ORGANIZATION', description: 'ดูข้อมูลกำลังพลและเอกสารของทุกกระทรวง ทบวง กรม' },
  { key: 'ORG_MANAGE', nameTh: 'จัดการข้อมูลหน่วยงานภาครัฐ', category: 'ORGANIZATION', description: 'เพิ่ม แก้ไข หรือปิดการใช้งานหน่วยงานในระบบ' },
  { key: 'USER_MANAGE', nameTh: 'จัดการผู้ใช้งานและสิทธิ์', category: 'ORGANIZATION', description: 'สร้าง แก้ไข และปลดล็อคบัญชีเจ้าหน้าที่' },
  { key: 'PERSONNEL_VIEW', nameTh: 'ดูทะเบียนกำลังพลในสังกัด', category: 'PERSONNEL', description: 'เปิดดูรายชื่อและข้อมูลทั่วไปของกำลังพล' },
  { key: 'PERSONNEL_EDIT', nameTh: 'แก้ไขทะเบียนกำลังพล', category: 'PERSONNEL', description: 'ปรับปรุงข้อมูลเงินเดือนและอายุราชการ' },
  { key: 'SENSITIVE_DATA_VIEW', nameTh: 'เปิดดูข้อมูลระบุตัวตน (Unmask PDPA)', category: 'SECURITY', description: 'สิทธิ์ในการถอด Mask เลขบัตรประชาชน 13 หลัก' },
  { key: 'DOCUMENT_VIEW', nameTh: 'ดูรายการเอกสารในสังกัด', category: 'DOCUMENTS', description: 'ค้นหาและดูรายการ Metadata ของเอกสาร' },
  { key: 'DOCUMENT_PREVIEW', nameTh: 'เปิดดูเอกสาร (Preview พร้อมลายน้ำ)', category: 'DOCUMENTS', description: 'แสดงหน้าเอกสาร PDF/ภาพ พร้อมฝัง Dynamic Watermark' },
  { key: 'DOCUMENT_DOWNLOAD', nameTh: 'ดาวน์โหลดไฟล์เอกสาร', category: 'DOCUMENTS', description: 'สร้าง Signed Token เพื่อดาวน์โหลดไฟล์จริง (บันทึก Audit)' },
  { key: 'DOCUMENT_UPLOAD', nameTh: 'นำเข้าเอกสารประกอบ', category: 'DOCUMENTS', description: 'อัปโหลดและคำนวณ Checksum SHA-256' },
  { key: 'DOCUMENT_VERIFY', nameTh: 'ตรวจสอบและระบุผลตรวจเอกสาร', category: 'DOCUMENTS', description: 'บันทึกสถานะ ถูกต้อง/ไม่ถูกต้อง/ขอเอกสารเพิ่ม' },
  { key: 'DOCUMENT_APPROVE', nameTh: 'อนุมัติการจ่ายบำเหน็จ', category: 'DOCUMENTS', description: 'ลงนามอนุมัติสำนวนการขอรับบำเหน็จในขั้นตอนสุดท้าย' },
  { key: 'AUDIT_LOG_VIEW', nameTh: 'ตรวจสอบบันทึก Audit Trail', category: 'SECURITY', description: 'เข้าถึงบันทึกการกระทำย้อนหลังแบบแก้ไขไม่ได้' },
  { key: 'REPORTS_VIEW', nameTh: 'ดูรายงานสถิติและสรุปผล', category: 'REPORTS', description: 'ดูแดชบอร์ดสรุปยอดบำเหน็จและประสิทธิภาพ' },
  { key: 'REPORTS_EXPORT', nameTh: 'ส่งออกข้อมูล (Export CSV/Excel)', category: 'REPORTS', description: 'ดึงข้อมูลทะเบียนและรายงานออกนอกระบบ' },
  { key: 'SYSTEM_SETTINGS_MANAGE', nameTh: 'ตั้งค่านโยบายความปลอดภัยระบบ', category: 'SECURITY', description: 'กำหนด Session Timeout, Watermark และระบบเข้ารหัส' },
];

export const RolePermissionView: React.FC = () => {
  const ROLES: { key: UserRole; nameTh: string; color: string }[] = [
    { key: 'SUPER_ADMIN', nameTh: 'Super Administrator', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { key: 'ORG_ADMIN', nameTh: 'ผู้ดูแลระดับหน่วยงาน', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    { key: 'DOCUMENT_OFFICER', nameTh: 'เจ้าหน้าที่ตรวจเอกสาร', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { key: 'REVIEWER_APPROVER', nameTh: 'ผู้ตรวจ / ผู้อนุมัติ', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { key: 'VIEWER', nameTh: 'ผู้ดูข้อมูลทั่วไป (Viewer)', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  ];

  const checkHasRolePerm = (role: UserRole, perm: Permission): boolean => {
    if (role === 'SUPER_ADMIN') return true;
    
    if (role === 'ORG_ADMIN') {
      return ['USER_MANAGE', 'PERSONNEL_VIEW', 'PERSONNEL_EDIT', 'DOCUMENT_VIEW', 'DOCUMENT_PREVIEW', 'DOCUMENT_DOWNLOAD', 'DOCUMENT_UPLOAD', 'DOCUMENT_VERIFY', 'DOCUMENT_APPROVE', 'AUDIT_LOG_VIEW', 'REPORTS_VIEW', 'REPORTS_EXPORT', 'SENSITIVE_DATA_VIEW'].includes(perm);
    }

    if (role === 'DOCUMENT_OFFICER') {
      return ['PERSONNEL_VIEW', 'PERSONNEL_EDIT', 'DOCUMENT_VIEW', 'DOCUMENT_PREVIEW', 'DOCUMENT_DOWNLOAD', 'DOCUMENT_UPLOAD', 'DOCUMENT_VERIFY', 'REPORTS_VIEW'].includes(perm);
    }

    if (role === 'REVIEWER_APPROVER') {
      return ['PERSONNEL_VIEW', 'DOCUMENT_VIEW', 'DOCUMENT_PREVIEW', 'DOCUMENT_DOWNLOAD', 'DOCUMENT_VERIFY', 'DOCUMENT_APPROVE', 'REPORTS_VIEW', 'REPORTS_EXPORT'].includes(perm);
    }

    if (role === 'VIEWER') {
      return ['PERSONNEL_VIEW', 'DOCUMENT_VIEW', 'DOCUMENT_PREVIEW'].includes(perm);
    }

    return false;
  };

  return (
    <div className="space-y-5 text-slate-800 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              ตารางกำหนดสิทธิ์การใช้งาน (RBAC Permission Matrix)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
              ROLE-BASED ACCESS CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            การกำหนดสิทธิ์แบบ Least Privilege Enforced ควบคุมทั้งหน้าบ้านและหลังบ้าน (API/Controller Layer)
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          POLICY: LEAST PRIVILEGE ENFORCED
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-semibold">
                <th className="p-3.5 w-80">ฟังก์ชันและขอบเขตสิทธิ์ (Permission)</th>
                {ROLES.map((r) => (
                  <th key={r.key} className="p-3.5 text-center">
                    <div className={`px-2 py-1 rounded-md text-[11px] font-bold border ${r.color}`}>
                      {r.nameTh}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_METAS.map((pm) => (
                <tr key={pm.key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{pm.nameTh}</div>
                    <div className="text-[11px] text-slate-500">{pm.description}</div>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{pm.key}</span>
                  </td>

                  {ROLES.map((r) => {
                    const hasPerm = checkHasRolePerm(r.key, pm.key);
                    return (
                      <td key={r.key} className="p-3.5 text-center">
                        {hasPerm ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 shadow-2xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300">
                            <X className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
