import React from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  ArrowUpRight, 
  ShieldCheck, 
  FileCheck2, 
  ChevronRight,
  TrendingUp,
  Building,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PersonnelStatusBadge, VerificationStatusBadge } from '../components/StatusBadge';
import { Personnel } from '../types';

interface DashboardViewProps {
  onSelectPersonnel: (personnel: Personnel) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectPersonnel,
  onNavigateTab,
}) => {
  const { currentUser, currentOrg } = useAuth();
  const { getAccessiblePersonnel, auditLogs } = useData();

  const accessiblePersonnel = getAccessiblePersonnel();

  // Compute metrics for current organization
  const totalPersonnel = accessiblePersonnel.length;
  const inVerificationCount = accessiblePersonnel.filter(p => p.status === 'IN_VERIFICATION').length;
  const pendingDocsCount = accessiblePersonnel.filter(p => p.status === 'PENDING_DOCS').length;
  const pendingApprovalCount = accessiblePersonnel.filter(p => p.status === 'PENDING_APPROVAL').length;
  const verifiedCount = accessiblePersonnel.filter(p => p.status === 'VERIFIED' || p.status === 'APPROVED').length;
  const totalEstimatedPension = accessiblePersonnel.reduce((acc, p) => acc + p.pensionAmountEstimated, 0);

  // Items needing immediate attention
  const urgentTasks = accessiblePersonnel.filter(
    p => p.status === 'IN_VERIFICATION' || p.status === 'PENDING_DOCS' || p.status === 'PENDING_APPROVAL'
  ).slice(0, 5);

  // Recent logs
  const recentLogs = auditLogs.slice(0, 6);

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-150">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-md border border-slate-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-semibold">
              {currentOrg?.code} • {currentOrg?.nameTh}
            </span>
            <span className="text-xs text-slate-400">ระบบตรวจสอบเอกสารราชการ</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-white">
            ยินดีต้อนรับ, {currentUser?.title}{currentUser?.fullName}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {currentUser?.position} • บทบาทในระบบ: <strong className="text-amber-400">{currentUser?.role.replace('_', ' ')}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigateTab('PERSONNEL')}
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            เปิดทะเบียนกำลังพล
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('DOCUMENTS')}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            คลังเอกสาร
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        
        {/* Total Personnel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>กำลังพลในสังกัด</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">{totalPersonnel}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" />
            {currentOrg?.shortName || 'สังกัด'}
          </div>
        </div>

        {/* In Verification */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>กำลังตรวจสอบ</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-amber-600">{inVerificationCount}</div>
          <div className="text-[11px] text-amber-700">อยู่ระหว่างตรวจเอกสาร</div>
        </div>

        {/* Pending Docs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>ขอเอกสารเพิ่ม</span>
            <RotateCcw className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-orange-600">{pendingDocsCount}</div>
          <div className="text-[11px] text-orange-700">ส่งกลับแก้ไข/รอเอกสาร</div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>รออนุมัติ</span>
            <FileCheck2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-purple-600">{pendingApprovalCount}</div>
          <div className="text-[11px] text-purple-700">รอเสนอผู้บังคับบัญชา</div>
        </div>

        {/* Verified & Approved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>เสร็จสิ้น / อนุมัติ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-600">{verifiedCount}</div>
          <div className="text-[11px] text-emerald-700">ผ่านการอนุมัติแล้ว</div>
        </div>

        {/* Estimated Pension Budget */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>ยอดประมาณการรวม</span>
            <Coins className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-lg font-bold font-heading text-teal-700 truncate">
            {(totalEstimatedPension / 1000000).toFixed(2)} ล้าน
          </div>
          <div className="text-[10px] text-slate-500 font-mono">฿ {totalEstimatedPension.toLocaleString()}</div>
        </div>

      </div>

      {/* Main Grid: Urgent Workflows & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Action Queue Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                รายการกำลังพลที่อยู่ระหว่างการดำเนินการ (Active Workflow Queue)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กำลังพลที่มีเอกสารรอการตรวจหรือรอส่งกลับตามขั้นตอน
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('PERSONNEL')}
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด ({accessiblePersonnel.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">รหัสกำลังพล</th>
                  <th className="p-3">ชื่อ - นามสกุล</th>
                  <th className="p-3">ตำแหน่ง / หน่วยงาน</th>
                  <th className="p-3">ประเภทบำเหน็จ</th>
                  <th className="p-3">สถานะขั้นตอน</th>
                  <th className="p-3 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentTasks.map(person => (
                  <tr 
                    key={person.id}
                    onClick={() => onSelectPersonnel(person)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono font-semibold text-slate-800">
                      {person.personnelCode}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {person.title}{person.firstName} {person.lastName}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{person.position}</div>
                      <div className="text-[11px] text-slate-400">{person.division}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-700">
                        {person.pensionType === 'ORDINARY_PENSION' ? 'บำเหน็จปกติ' :
                         person.pensionType === 'SPECIAL_PENSION' ? 'บำเหน็จพิเศษ' : 'บำเหน็จตกทอด'}
                      </span>
                    </td>
                    <td className="p-3">
                      <PersonnelStatusBadge status={person.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPersonnel(person);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        เปิดแฟ้ม
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Trail & Security Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                บันทึกการกระทำล่าสุด (Audit Trail)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">บันทึกเหตุการณ์ที่ไม่สามารถแก้ไขย้อนหลังได้</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('AUDIT_LOGS')}
              className="text-xs text-amber-700 font-semibold hover:underline"
            >
              ดูบันทึกทั้งหมด
            </button>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {recentLogs.map(log => (
              <div 
                key={log.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px] truncate max-w-48">
                    {log.actionDescription}
                  </span>
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    log.securitySeverity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 font-bold' :
                    log.securitySeverity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {log.securitySeverity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>โดย: {log.userFullName.split(' ')[0]} ({log.userRole.replace('_', ' ')})</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString('th-TH')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between font-mono">
            <span>ISO 27001 AUDIT COMPLIANT</span>
            <span className="text-emerald-700 font-bold">100% INTEGRITY CHECK</span>
          </div>
        </div>

      </div>

    </div>
  );
};
