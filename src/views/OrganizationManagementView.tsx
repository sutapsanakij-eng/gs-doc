import React from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Organization } from '../types';

export const OrganizationManagementView: React.FC = () => {
  const { allOrganizations, currentUser } = useAuth();

  return (
    <div className="space-y-5 text-slate-800 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              บริหารจัดการหน่วยงานภาครัฐ (Multi-Tenant Organization Management)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-100 text-purple-800 border border-purple-300 font-semibold">
              SUPER ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์กลางกำกับดูแลการแยกฐานข้อมูลและโดเมนของแต่ละส่วนราชการ (Zero Trust Tenant Boundary)
          </p>
        </div>

        <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          ขยายโครงสร้างรองรับกว่า 300 กรมทั่วประเทศ
        </div>
      </div>

      {/* Organizations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {allOrganizations.map((org) => (
          <div key={org.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  รหัสย่อ: {org.code} ({org.shortName})
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900 mt-2">
                  {org.nameTh}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{org.nameEn}</p>
                <p className="text-xs text-slate-600 mt-1 font-medium">{org.ministryTh}</p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">จนท. ในระบบ</span>
                <span className="text-base font-bold text-slate-900">{org.officerCount} นาย</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block">กำลังพลในสังกัด</span>
                <span className="text-base font-bold text-amber-700">{org.personnelCount} ราย</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> สถานะเปิดใช้งาน
              </span>
              <span className="font-mono text-[11px] text-slate-400">ISOLATION: SECURED</span>
            </div>

          </div>
        ))}
      </div>

      {/* Scalability Notice */}
      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
        <div className="font-semibold text-amber-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          ระบบพร้อมขยายสู่ระดับประเทศ (National Scale Ready):
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          สถาปัตยกรรมถูกออกแบบให้รองรับการ Onboard หน่วยงานราชการระดับกระทรวง ทบวง กรม และองค์กรปกครองส่วนท้องถิ่น (อปท.) 
          โดยข้อมูลทุกแถวในตาราง PostgreSQL ถูกจำกัดด้วย `tenant_id` และมีนโยบาย Row-Level Security (RLS) กำกับ
        </p>
      </div>

    </div>
  );
};
