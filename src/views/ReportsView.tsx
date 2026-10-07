import React from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  Users, 
  Coins,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const ReportsView: React.FC = () => {
  const { currentOrg, currentUser, hasPermission } = useAuth();
  const { getAccessiblePersonnel, auditLogs, logAudit } = useData();

  const canExport = hasPermission('REPORTS_EXPORT');
  const personnel = getAccessiblePersonnel();

  const total = personnel.length;
  const verified = personnel.filter(p => p.status === 'VERIFIED' || p.status === 'APPROVED').length;
  const inProgress = personnel.filter(p => p.status === 'IN_VERIFICATION').length;
  const pendingDocs = personnel.filter(p => p.status === 'PENDING_DOCS').length;
  const pendingApproval = personnel.filter(p => p.status === 'PENDING_APPROVAL').length;
  const totalAmount = personnel.reduce((acc, p) => acc + p.pensionAmountEstimated, 0);

  const handlePrint = () => {
    window.print();
    logAudit(
      'REPORT_EXPORT',
      `สั่งพิมพ์รายงานสถิติการตรวจสอบบำเหน็จ สังกัด ${currentOrg?.nameTh}`,
      currentOrg?.id || 'ORG',
      'REPORT',
      true,
      'LOW'
    );
  };

  const handleExportSummaryCsv = () => {
    if (!canExport) return;
    const content = [
      'หัวข้อ,จำนวน/มูลค่า,หน่วย',
      `จำนวนกำลังพลทั้งหมด,${total},ราย`,
      `เอกสารผ่านการตรวจสอบแล้ว,${verified},ราย`,
      `อยู่ระหว่างการตรวจสอบ,${inProgress},ราย`,
      `รอส่งเอกสารเพิ่มเติม,${pendingDocs},ราย`,
      `รอการอนุมัติบำเหน็จ,${pendingApproval},ราย`,
      `ประมาณการงบประมาณบำเหน็จรวม,${totalAmount},บาท`,
      `อัตราความสำเร็จ,${total > 0 ? ((verified / total) * 100).toFixed(1) : 0},%`
    ].join('\n');

    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pension_summary_report_${currentOrg?.code}_${Date.now()}.csv`;
    link.click();

    logAudit(
      'REPORT_EXPORT',
      `ส่งออกรายงานสรุปภาพรวมบำเหน็จ สังกัด ${currentOrg?.nameTh}`,
      currentOrg?.id || 'ORG',
      'REPORT',
      true,
      'MEDIUM'
    );
  };

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              รายงานสถิติและผลการดำเนินงาน (Executive Reports & Analytics)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
              OFFICIAL REPORT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สรุปข้อมูลกำลังพล สถานะการตรวจสอบเอกสาร และประมาณการงบประมาณ สังกัด <strong>{currentOrg?.nameTh}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            พิมพ์รายงาน
          </button>

          {canExport && (
            <button
              type="button"
              onClick={handleExportSummaryCsv}
              className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              ส่งออก CSV สรุปผล
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>กำลังพลที่ยื่นเรื่องทั้งหมด</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-500">สังกัด {currentOrg?.nameTh}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>อัตราความสำเร็จของเอกสาร</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-heading text-emerald-600">
            {total > 0 ? ((verified / total) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">{verified} จาก {total} รายการผ่านตรวจ</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>รายการค้างดำเนินการ</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold font-heading text-amber-600">
            {inProgress + pendingDocs + pendingApproval}
          </div>
          <div className="text-[11px] text-amber-700">อยู่ระหว่างตรวจสอบหรือขอเอกสารเพิ่ม</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>ยอดประมาณการงบประมาณรวม</span>
            <Coins className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-teal-700">
            ฿ {(totalAmount / 1000000).toFixed(2)} ล้าน
          </div>
          <div className="text-[10px] text-slate-500 font-mono">สุทธิ: ฿ {totalAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2">
          ตารางแจกแจงสถานะเอกสารตามกระบวนการทำงาน
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b">
                <th className="p-3">ขั้นตอน / สถานะ</th>
                <th className="p-3 text-center">จำนวน (ราย)</th>
                <th className="p-3 text-center">สัดส่วน (%)</th>
                <th className="p-3 text-right">ยอดประมาณการเงิน (บาท)</th>
                <th className="p-3">เกณฑ์ระยะเวลา (SLA มาตรฐาน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium text-slate-900">1. ผ่านการอนุมัติเรียบร้อย (APPROVED)</td>
                <td className="p-3 text-center font-bold text-emerald-700">
                  {personnel.filter(p => p.status === 'APPROVED').length}
                </td>
                <td className="p-3 text-center text-slate-600">
                  {total > 0 ? ((personnel.filter(p => p.status === 'APPROVED').length / total) * 100).toFixed(1) : 0}%
                </td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">
                  ฿ {personnel.filter(p => p.status === 'APPROVED').reduce((a, b) => a + b.pensionAmountEstimated, 0).toLocaleString()}
                </td>
                <td className="p-3 text-emerald-700 font-medium">✓ เสร็จสมบูรณ์</td>
              </tr>

              <tr>
                <td className="p-3 font-medium text-slate-900">2. เอกสารผ่านการตรวจ / รออนุมัติ (VERIFIED / PENDING_APPROVAL)</td>
                <td className="p-3 text-center font-bold text-blue-700">
                  {personnel.filter(p => p.status === 'VERIFIED' || p.status === 'PENDING_APPROVAL').length}
                </td>
                <td className="p-3 text-center text-slate-600">
                  {total > 0 ? (((personnel.filter(p => p.status === 'VERIFIED' || p.status === 'PENDING_APPROVAL').length) / total) * 100).toFixed(1) : 0}%
                </td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">
                  ฿ {personnel.filter(p => p.status === 'VERIFIED' || p.status === 'PENDING_APPROVAL').reduce((a, b) => a + b.pensionAmountEstimated, 0).toLocaleString()}
                </td>
                <td className="p-3 text-blue-700">ไม่เกิน 3 วันทำการ</td>
              </tr>

              <tr>
                <td className="p-3 font-medium text-slate-900">3. กำลังดำเนินการตรวจสอบ (IN_VERIFICATION)</td>
                <td className="p-3 text-center font-bold text-amber-700">{inProgress}</td>
                <td className="p-3 text-center text-slate-600">
                  {total > 0 ? ((inProgress / total) * 100).toFixed(1) : 0}%
                </td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">
                  ฿ {personnel.filter(p => p.status === 'IN_VERIFICATION').reduce((a, b) => a + b.pensionAmountEstimated, 0).toLocaleString()}
                </td>
                <td className="p-3 text-amber-700">ไม่เกิน 5 วันทำการ</td>
              </tr>

              <tr>
                <td className="p-3 font-medium text-slate-900">4. รอส่งเอกสารเพิ่มเติม (PENDING_DOCS)</td>
                <td className="p-3 text-center font-bold text-orange-700">{pendingDocs}</td>
                <td className="p-3 text-center text-slate-600">
                  {total > 0 ? ((pendingDocs / total) * 100).toFixed(1) : 0}%
                </td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">
                  ฿ {personnel.filter(p => p.status === 'PENDING_DOCS').reduce((a, b) => a + b.pensionAmountEstimated, 0).toLocaleString()}
                </td>
                <td className="p-3 text-orange-700">รอผู้ขอรับบำเหน็จแนบเอกสาร (15 วัน)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
