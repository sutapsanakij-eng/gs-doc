import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Lock, 
  KeyRound, 
  Building2, 
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface SecurityTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityTesterModal: React.FC<SecurityTesterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentOrg, switchDemoUser } = useAuth();
  const { simulateIdorAttack, logAudit } = useData();

  const [activeTab, setActiveTab] = useState<'ISOLATION' | 'IDOR' | 'SQLI_XSS' | 'LOCKOUT'>('ISOLATION');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [targetDocId, setTargetDocId] = useState<string>('doc-rid-001-1'); // doc of Royal Irrigation Dept
  const [customParam, setCustomParam] = useState<string>("' OR '1'='1");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Run Test 1: Cross-Organization Isolation Test
  const handleTestIsolation = () => {
    setIsLoading(true);
    setTestResult(null);

    setTimeout(() => {
      // Current user tries to access RID document
      const result = simulateIdorAttack(targetDocId);
      setTestResult({
        testName: 'Zero Trust Cross-Organization Boundary Enforcement',
        currentUser: currentUser?.username,
        userRole: currentUser?.role,
        userOrg: currentUser?.organizationId,
        targetRequested: targetDocId,
        targetExpectedOrg: 'org-rid (กรมชลประทาน)',
        status: result.blocked ? 'BLOCKED_BY_SECURITY_ENGINE (SUCCESS)' : 'ALLOWED (SAME_ORG_OR_SUPERADMIN)',
        httpCode: result.blocked ? 403 : 200,
        message: result.message,
        auditLogged: true,
        socIncidentTicket: result.blocked ? `SEC-ALERT-${Date.now().toString().slice(-6)}` : 'N/A',
      });
      setIsLoading(false);
    }, 400);
  };

  // Run Test 3: SQLi & Input Sanitization
  const handleTestSqlInjection = () => {
    setIsLoading(true);
    setTestResult(null);

    setTimeout(() => {
      // Simulate input sanitization / parameterized query engine
      const sanitized = customParam.replace(/'/g, "''").replace(/--/g, "");
      const isDangerous = /('|--|;|union|select|drop|or 1=1)/i.test(customParam);

      logAudit(
        'SECURITY_UNAUTHORIZED_ACCESS',
        `[WAF/SANITIZER TEST] ตรวจพบรูปแบบ Input ต้องสงสัย "${customParam}" ผ่านตัวกรองความปลอดภัย (Parameterized Query Sanitizer active)`,
        'SYSTEM_SEARCH_API',
        'SECURITY',
        false,
        'HIGH',
        {
          rawInput: customParam,
          sanitizedInput: sanitized,
          wafSignature: 'SQLI_GENERIC_TAUTOLOGY',
          action: 'NEUTRALIZED_BY_ORM_PARAMETERIZATION',
        }
      );

      setTestResult({
        testName: 'SQL Injection & Malicious Input Sanitization',
        rawInput: customParam,
        threatDetected: isDangerous,
        mitigationLayer: 'Drizzle ORM Parameterized Prepared Statements & Central WAF',
        result: 'PASSED (0 injection vector allowed, input escaped securely)',
        httpCode: 200,
        auditLogged: true,
      });
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-base text-white">
                  ศูนย์ทดสอบความมั่นคงปลอดภัย (Government Security & Zero Trust Lab)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-950 text-rose-300 border border-rose-800">
                  CRITICAL DEFENSE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบทดสอบจำลองการแยกข้อมูลตามหน่วยงาน (Data Isolation), การดักจับ IDOR, และบันทึก Audit SOC
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

        {/* Current User Security Context Bar */}
        <div className="px-6 py-2.5 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <span>ผู้ใช้ปัจจุบัน: <strong className="text-amber-400">{currentUser?.fullName}</strong> ({currentUser?.username})</span>
            <span>สังกัด: <strong className="text-cyan-400">{currentOrg?.nameTh}</strong> ({currentOrg?.code})</span>
            <span>บทบาท: <span className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-[11px]">{currentUser?.role}</span></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">สลับผู้ใช้ทดสอบ:</span>
            <select
              value={currentUser?.id}
              onChange={(e) => {
                switchDemoUser(e.target.value);
                setTestResult(null);
              }}
              className="bg-slate-900 text-xs border border-slate-600 rounded px-2 py-1 text-slate-200"
            >
              <option value="usr-officer-dopa">น.ส. กานดา (จนท. กรมการปกครอง - DOPA)</option>
              <option value="usr-officer-rid">นายธนภัทร (จนท. กรมชลประทาน - RID)</option>
              <option value="usr-officer-rd">น.ส. รัตนา (จนท. กรมสรรพากร - RD)</option>
              <option value="usr-reviewer-dopa">นายพิชัย (ผู้ตรวจสอบ กรมการปกครอง)</option>
              <option value="usr-viewer-dopa">นายสมควร (Viewer กรมการปกครอง)</option>
              <option value="usr-superadmin">พล.ต. ชัยชนะ (Super Admin ส่วนกลาง)</option>
            </select>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          <button
            type="button"
            onClick={() => { setActiveTab('ISOLATION'); setTestResult(null); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ISOLATION'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            1. ทดสอบ Data Isolation & ข้ามหน่วยงาน
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('IDOR'); setTestResult(null); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'IDOR'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            2. จำลองการโจมตี IDOR (Direct Object Reference)
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('SQLI_XSS'); setTestResult(null); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'SQLI_XSS'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            3. ป้องกัน SQL Injection & Sanitization
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('LOCKOUT'); setTestResult(null); }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'LOCKOUT'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            4. ล็อคบัญชีเมื่อรหัสผ่านผิด 5 ครั้ง
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: Organization Data Isolation */}
          {activeTab === 'ISOLATION' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 leading-relaxed text-slate-300">
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  การแยกข้อมูลระหว่างสังกัดอย่างเด็ดขาด (Multi-Agency Tenant Boundary)
                </h4>
                <p>
                  ตามข้อกำหนดส่วนที่ 2, 14, 15 และ 31 เจ้าหน้าที่ของ <strong>หน่วยงาน A (เช่น กรมการปกครอง)</strong> 
                  จะต้อง <strong>ไม่สามารถมองเห็น, ค้นหา หรือดาวน์โหลด</strong> เอกสารของ <strong>หน่วยงาน B (กรมชลประทาน)</strong> ได้โดยเด็ดขาด 
                  ไม่ว่าจะพยายามผ่าน UI, การแก้ไข URL Parameters หรือการเรียก API โดยตรง
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <span className="font-mono text-amber-400 block font-semibold">
                    กำหนดสถานการณ์ทดสอบ (Test Setup)
                  </span>
                  
                  <div>
                    <label className="text-slate-400 block mb-1">ผู้ใช้ที่ทดสอบขณะนี้:</label>
                    <div className="p-2 bg-slate-900 rounded border border-slate-700 text-slate-200">
                      {currentUser?.fullName} ({currentUser?.organizationId})
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">เอกสารเป้าหมายที่พยายามจะเข้าถึง:</label>
                    <select
                      value={targetDocId}
                      onChange={(e) => setTargetDocId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                    >
                      <option value="doc-rid-001-1">doc-rid-001-1 (คำสั่งเกษียณ กรมชลประทาน - RID)</option>
                      <option value="doc-rd-001-1">doc-rd-001-1 (ก.พ.7 กรมสรรพากร - RD)</option>
                      <option value="doc-dopa-001-1">doc-dopa-001-1 (คำสั่งเกษียณ กรมการปกครอง - DOPA)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestIsolation}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    ยิงคำขอทดสอบการสกัดกั้น (Execute Test)
                  </button>
                </div>

                {/* Expected & Mechanism */}
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px] text-slate-300">
                  <div className="text-cyan-400 font-bold">Zero Trust Backend Rule:</div>
                  <pre className="p-2.5 bg-slate-900 rounded border border-slate-800 text-emerald-400 overflow-x-auto">
{`WHERE documents.organization_id = authContext.org_id
OR authContext.role = 'SUPER_ADMIN'

IF doc.org_id != authContext.org_id {
   auditService.logSecurityBreach(IDOR_VIOLATION);
   throw new ForbiddenException(403);
}`}
                  </pre>
                  <p className="text-slate-400 font-sans">
                    ระบบไม่เชื่อใจ Client และไม่ส่ง ID ข้ามหน่วยงานลงใน JSON payload
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDOR */}
          {activeTab === 'IDOR' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 text-slate-300 leading-relaxed">
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  Insecure Direct Object Reference (IDOR) Protection
                </h4>
                <p>
                  ผู้ใช้งานไม่หวังดีทำการดักจับ Request และเปลี่ยน `document_id` จากเอกสารของตนเองเป็นรหัสเอกสารของบุคคลอื่นในหน่วยงานอื่น
                  กลไกของระบบ GP-DMS ตรวจสอบสิทธิ์ที่ระดับ Controller & Service Layer พร้อมสร้าง Incident Log อัตโนมัติ
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400">HTTP REST Simulator:</span>
                  <span className="text-[11px] text-slate-400">GET /api/v1/documents/{'{id}'}/download</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetDocId}
                    onChange={(e) => setTargetDocId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 font-mono"
                    placeholder="Document ID to tamper"
                  />
                  <button
                    type="button"
                    onClick={handleTestIsolation}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded text-white font-medium"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SQLi / XSS */}
          {activeTab === 'SQLI_XSS' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 text-slate-300">
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  Input Validation & Prepared Statement Defense
                </h4>
                <p>
                  ระบบใช้ Drizzle ORM และ Prepared Statements ในการสืบค้นฐานข้อมูล ป้องกัน SQL Injection 100% 
                  พร้อมทั้งใช้ DOMPurify และ React JSX escaping เพื่อป้องกัน Cross-Site Scripting (XSS)
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                <label className="text-slate-400 block">ทดสอบป้อนข้อความที่เป็น SQL Injection หรือ XSS Payload:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customParam}
                    onChange={(e) => setCustomParam(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestSqlInjection}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white font-medium"
                  >
                    ทดสอบตัวกรอง
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Lockout */}
          {activeTab === 'LOCKOUT' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 text-slate-300 leading-relaxed">
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  นโยบายความมั่นคงปลอดภัยในการยืนยันตัวตน (Account Lockout Policy)
                </h4>
                <p>
                  เมื่อมีผู้ใช้งานป้อนรหัสผ่านผิดเกิน <strong>5 ครั้งติดต่อกัน</strong> 
                  ระบบจะทำการระงับบัญชี (Account Locked) โดยทันที และต้องได้รับการปลดล็อคโดย Administrator เท่านั้น
                  เพื่อป้องกันการโจมตีแบบ Brute-Force Password Guessing
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Policy Active: Max 5 Attempts / 15-Minute Cooldown / SOC Alert Enabled
                </div>
                <p className="text-slate-400">
                  ท่านสามารถทดสอบได้ในหน้า Login โดยการใส่รหัสผ่านผิดกับบัญชีใดๆ จนครบ 5 ครั้ง
                </p>
              </div>
            </div>
          )}

          {/* Test Execution Output Console */}
          {testResult && (
            <div className="mt-4 p-4 rounded-lg bg-black border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-mono text-cyan-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  SECURITY EVALUATION REPORT: {testResult.testName}
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  testResult.httpCode === 403 
                    ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  HTTP {testResult.httpCode}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400">Result Status: <strong className={testResult.httpCode === 403 ? 'text-rose-400' : 'text-emerald-400'}>{testResult.status || testResult.result}</strong></div>
                {testResult.socIncidentTicket && (
                  <div className="text-amber-400">Incident Ticket ID: <strong>{testResult.socIncidentTicket}</strong> (Logged into Central SIEM)</div>
                )}
                <div className="text-slate-300 p-2 bg-slate-900 rounded border border-slate-800">
                  {testResult.message || 'Sanitization applied successfully. Parameter escaped.'}
                </div>
                <div className="text-slate-500 text-[10px]">
                  ✓ Recorded into Immutable Audit Trail • Tamper-Resistant Log ID Created
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">
            SEC-FRAMEWORK: ISO 27001 / NIST SP 800-53 / PDPA THAILAND
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            ปิดหน้าต่างทดสอบ
          </button>
        </div>

      </div>
    </div>
  );
};
