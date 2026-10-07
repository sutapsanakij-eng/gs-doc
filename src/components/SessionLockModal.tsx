import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SessionLockModal: React.FC = () => {
  const { isSessionLocked, unlockSession, currentUser, logout } = useAuth();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isSessionLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = unlockSession(password);
    if (!success) {
      setError('รหัสผ่านไม่ถูกต้อง (ลองใส่ password123)');
    } else {
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 text-center text-slate-100">
        
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-heading text-white">
            หน้าจอถูกล็อคชั่วคราว (Session Locked)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            เพื่อความปลอดภัยของข้อมูลราชการ กรุณากรอกรหัสผ่านเพื่อดำเนินการต่อ
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white shrink-0">
            {currentUser?.fullName.charAt(0)}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{currentUser?.fullName}</div>
            <div className="text-[11px] text-slate-400 truncate">{currentUser?.position}</div>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่านเพื่อปลดล็อค (password123)"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>ปลดล็อคเซสชัน</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากระบบและเข้าใช้งานใหม่
          </button>
        </div>

      </div>
    </div>
  );
};
