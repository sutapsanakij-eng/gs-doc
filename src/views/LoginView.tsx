import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound,
  Building2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USERS } from '../data/mockData';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState<string>('officer.dopa');
  const [password, setPassword] = useState<string>('password123');
  const [captchaInput, setCaptchaInput] = useState<string>('7842');
  const [captchaCode, setCaptchaCode] = useState<string>('7842');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setErrorMessage('รหัสยืนยันความปลอดภัย (CAPTCHA) ไม่ถูกต้อง');
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
        generateCaptcha();
      }
    }, 400);
  };

  const handleFillDemo = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword('password123');
    setCaptchaInput(captchaCode);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Banner Header */}
      <div className="relative z-10 w-full bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold font-heading text-white">
              ระบบตรวจสอบและบริหารเอกสารข้าราชการผู้ได้รับบำเหน็จ
            </div>
            <div className="text-[11px] text-slate-400">
              Government Pension & Gratuity Personnel Document Management System (GP-DMS)
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>SECURITY GATEWAY ACTIVE (TLS 1.3)</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-heading text-white tracking-wide">
              เข้าสู่ระบบสารบรรณและบำเหน็จ
            </h2>
            <p className="text-xs text-slate-400">
              กรุณาระบุบัญชีผู้ใช้ราชการเพื่อเข้าถึงเอกสารตามสังกัดหน่วยงาน
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                ชื่อผู้ใช้งานราชการ (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น officer.dopa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 pl-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 pl-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Captcha Section */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                รหัสยืนยันความปลอดภัย (Bot Protection CAPTCHA)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  maxLength={4}
                  placeholder="กรอกเลข 4 หลัก"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 font-mono font-bold text-amber-400 text-base tracking-widest select-none">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="สุ่มรหัส CAPTCHA ใหม่"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>จดจำข้อมูลสำหรับเครื่องราชการ</span>
              </label>
              <button
                type="button"
                onClick={() => setErrorMessage('กรุณาติดต่อผู้ดูแลระบบสารสนเทศ (ศูนย์เทคโนโลยีสารสนเทศส่วนกลาง) เพื่อรีเซ็ตรหัสผ่าน')}
                className="text-amber-400 hover:underline"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold font-heading text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  กำลังตรวจสอบสิทธิ์...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  เข้าสู่ระบบ (Secure Sign In)
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel (For fast role testing) */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              เลือกบัญชีทดสอบระบบตามบทบาทและหน่วยงาน:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleFillDemo('officer.dopa')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-200 transition-colors"
              >
                <div className="font-semibold text-emerald-400">1. จนท. กรมการปกครอง</div>
                <div className="text-[10px] text-slate-400 font-mono">officer.dopa (DOPA)</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('reviewer.dopa')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-200 transition-colors"
              >
                <div className="font-semibold text-blue-400">2. ผู้ตรวจ กรมการปกครอง</div>
                <div className="text-[10px] text-slate-400 font-mono">reviewer.dopa (DOPA)</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('officer.rid')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-200 transition-colors"
              >
                <div className="font-semibold text-cyan-400">3. จนท. กรมชลประทาน</div>
                <div className="text-[10px] text-slate-400 font-mono">officer.rid (RID)</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('admin.central')}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-200 transition-colors"
              >
                <div className="font-semibold text-purple-400">4. Super Admin ส่วนกลาง</div>
                <div className="text-[10px] text-slate-400 font-mono">admin.central (ศสท.)</div>
              </button>
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-2 font-mono">
              รหัสผ่านเริ่มต้นสำหรับทุกบัญชี: password123
            </div>
          </div>

        </div>
      </div>

      {/* Official Government Warning Notice (Section 14 Security) */}
      <div className="relative z-10 w-full bg-slate-950/90 border-t border-slate-800 py-3 px-6 text-center text-[11px] text-slate-500">
        <p>
          คำเตือน: ระบบนี้เป็นระบบสารสนเทศของทางราชการ การเข้าถึงโดยไม่ได้รับอนุญาตหรือพยายามเข้าถึงข้อมูลต่างหน่วยงาน
          มีโทษตามพระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ และพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
        </p>
      </div>

    </div>
  );
};
