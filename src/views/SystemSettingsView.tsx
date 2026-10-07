import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Server,
  FileCheck2,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const SystemSettingsView: React.FC = () => {
  const { logAudit } = useData();

  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(15);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState<number>(5);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(25);
  const [enforceTwoFactor, setEnforceTwoFactor] = useState<boolean>(true);
  const [auditRetentionDays, setAuditRetentionDays] = useState<number>(3650); // 10 years for government
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 4000);

    logAudit(
      'ADMIN_USER_UPDATE',
      `ปรับปรุงการตั้งค่านโยบายความมั่นคงปลอดภัยระบบ (Session Timeout: ${sessionTimeoutMinutes} นาที, Audit Retention: ${auditRetentionDays} วัน)`,
      'SYSTEM_CONFIG',
      'SYSTEM',
      true,
      'HIGH'
    );
  };

  return (
    <div className="space-y-5 text-slate-800 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              การตั้งค่าความปลอดภัยระบบ (System Security Settings)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-100 text-purple-800 border border-purple-300 font-semibold">
              CRITICAL CONFIGURATION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดค่านโยบายความปลอดภัยของระบบส่วนกลางตามข้อกำหนดมาตรฐานความมั่นคงปลอดภัยสารสนเทศภาครัฐ
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          GOV-SECURITY-LEVEL: HIGH CONFIDENTIAL
        </div>
      </div>

      {savedAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>บันทึกการตั้งค่านโยบายความมั่นคงปลอดภัยเรียบร้อยแล้ว และเผยแพร่สู่ทุกโหนดระบบ</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* Authentication & Session Policy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            นโยบายการยืนยันตัวตนและเซสชัน (Authentication & Session)
          </h3>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              เวลาหมดอายุของเซสชัน (Session Timeout - นาที):
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              ระบบจะทำการล็อคหน้าจออัตโนมัติหากไม่มีการเคลื่อนไหวเกินระยะเวลานี้
            </span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              จำนวนครั้งที่อนุญาตให้ใส่รหัสผ่านผิด (Account Lockout Threshold):
            </label>
            <input
              type="number"
              min={3}
              max={10}
              value={maxFailedAttempts}
              onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              หากใส่ผิดครบ {maxFailedAttempts} ครั้ง บัญชีจะถูกระงับเพื่อป้องกันการโจมตีแบบ Brute-force
            </span>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={enforceTwoFactor}
                onChange={(e) => setEnforceTwoFactor(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>บังคับใช้การยืนยันตัวตนสองชั้น (2FA / Digital ID / OTP) สำหรับระดับ Admin และ Approver</span>
            </label>
          </div>
        </div>

        {/* Dynamic Watermark & File Security */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-heading font-semibold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            นโยบายลายน้ำดิจิทัลและการเก็บรักษา (Watermark & Retention)
          </h3>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ความโปร่งใสของลายน้ำดิจิทัล (Watermark Opacity: {watermarkOpacity}%):
            </label>
            <input
              type="range"
              min={10}
              max={60}
              value={watermarkOpacity}
              onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              ลายน้ำจะประทับ ชื่อเจ้าหน้าที่, สังกัด, วันเวลา และ IP Address อัตโนมัติในทุกหน้าพรีวิว
            </span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ระยะเวลาจัดเก็บบันทึก Audit Trail (วัน):
            </label>
            <input
              type="number"
              value={auditRetentionDays}
              onChange={(e) => setAuditRetentionDays(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              มาตรฐานราชการกำหนดให้จัดเก็บไม่น้อยกว่า 10 ปี (3,650 วัน) สำหรับการตรวจสอบของ สตง.
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
            <div className="text-slate-700 font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              STATUS: MASTER KMS ENCRYPTION ACTIVE
            </div>
            <div className="text-slate-500">Algorithm: AES-256-GCM Hardware-backed HSM</div>
            <div className="text-emerald-700 font-semibold">✓ Storage at Rest & In Transit (TLS 1.3)</div>
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            บันทึกการเปลี่ยนแปลงนโยบาย
          </button>
        </div>

      </form>

    </div>
  );
};
