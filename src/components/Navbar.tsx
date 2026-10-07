import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Lock, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Building,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { RoleBadge } from './StatusBadge';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenSecurityModal: () => void;
  onOpenArchDocsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenSecurityModal,
  onOpenArchDocsModal,
}) => {
  const { 
    currentUser, 
    currentOrg, 
    allUsers, 
    switchDemoUser, 
    logout, 
    lockSession, 
    sessionTimeRemaining 
  } = useAuth();
  
  const { notifications, markNotificationAsRead } = useData();

  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Organization */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            {/* Government Crest Motif */}
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md border border-amber-400/40 shrink-0">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm tracking-wide text-white">
                  ระบบตรวจสอบและบริหารเอกสารข้าราชการผู้ได้รับบำเหน็จ
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  GP-DMS
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>ระบบศูนย์กลางมาตรฐานความมั่นคงปลอดภัยภาครัฐ</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-medium">สังกัด: {currentOrg?.nameTh || 'ส่วนกลาง'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Demo Switcher (Crucial for testing Org isolation & RBAC!) */}
          <div className="hidden md:flex items-center bg-slate-800/90 rounded-lg border border-slate-700 p-1">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              สลับผู้ใช้ทดสอบ:
            </span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchDemoUser(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.role === 'SUPER_ADMIN' ? '👑 ' : ''}
                  {u.fullName.split(' ')[0]} {u.fullName.split(' ')[1]} ({u.role.replace('_', ' ')} - {u.organizationId.replace('org-', '').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Security Lab Button */}
          <button
            type="button"
            onClick={onOpenSecurityModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold shadow-xs transition-colors"
            title="เปิดศูนย์ทดสอบการสกัดกั้น IDOR & ข้ามหน่วยงาน"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">ทดสอบ Security & IDOR</span>
          </button>

          {/* Architecture Docs Button */}
          <button
            type="button"
            onClick={onOpenArchDocsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs font-semibold shadow-xs transition-colors"
            title="ดูพิมพ์เขียวสถาปัตยกรรม 21 หมวด"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">พิมพ์เขียว 21 หมวด</span>
          </button>

          {/* Session Timer & Lock Button */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTimer(sessionTimeRemaining)}</span>
            <button
              type="button"
              onClick={lockSession}
              className="text-slate-400 hover:text-amber-400 ml-1 p-0.5 rounded transition-colors"
              title="ล็อคหน้าจอเซสชันทันที"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifMenu(prev => !prev);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <span className="font-heading font-semibold text-xs text-slate-800">
                    การแจ้งเตือนของหน่วยงาน ({notifications.length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ศูนย์แจ้งเตือน</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.isRead ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <strong className="text-slate-800 text-[11px]">{n.title}</strong>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                        {new Date(n.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(prev => !prev);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-xs">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-36">
                  {currentUser?.fullName}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-36">
                  {currentUser?.position}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-lg mb-1">
                  <div className="font-semibold text-slate-800">{currentUser?.fullName}</div>
                  <div className="text-slate-500 text-[11px]">{currentUser?.email}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <RoleBadge role={currentUser?.role || 'VIEWER'} />
                  </div>
                </div>

                <div className="p-2 space-y-1 text-slate-600">
                  <div className="flex justify-between py-1">
                    <span>หน่วยงาน:</span>
                    <strong className="text-slate-800">{currentOrg?.nameTh}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>กระทรวง:</span>
                    <span className="text-slate-700">{currentOrg?.ministryTh}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>รหัสหน่วย:</span>
                    <span className="font-mono font-semibold text-amber-700">{currentOrg?.code}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>2FA Status:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> เปิดใช้งานแล้ว
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-1">
                  <button
                    type="button"
                    onClick={lockSession}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    ล็อคหน้าจอ
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
