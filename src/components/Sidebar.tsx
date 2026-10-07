import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  Building2, 
  UserCog, 
  KeyRound,
  FileSearch,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTabType = 
  | 'DASHBOARD'
  | 'PERSONNEL'
  | 'DOCUMENTS'
  | 'REPORTS'
  | 'AUDIT_LOGS'
  | 'USERS'
  | 'ORGANIZATIONS'
  | 'ROLES'
  | 'SETTINGS'
  | 'SECURITY_LAB'
  | 'ARCHITECTURE_DOCS';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, currentOrg, hasPermission } = useAuth();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isOrgAdmin = currentUser?.role === 'ORG_ADMIN' || isSuperAdmin;

  const navItems = [
    {
      id: 'DASHBOARD' as ActiveTabType,
      label: 'แดชบอร์ดภาพรวม',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'PERSONNEL' as ActiveTabType,
      label: 'ทะเบียนกำลังพล',
      icon: Users,
      badge: 'งานหลัก',
    },
    {
      id: 'DOCUMENTS' as ActiveTabType,
      label: 'คลังเอกสารและผลตรวจ',
      icon: FileSearch,
      badge: undefined,
    },
    {
      id: 'REPORTS' as ActiveTabType,
      label: 'รายงานและการส่งออก',
      icon: BarChart3,
      badge: undefined,
    },
    {
      id: 'AUDIT_LOGS' as ActiveTabType,
      label: 'บันทึก Audit Trail',
      icon: ShieldCheck,
      badge: 'SOC',
    },
  ];

  const adminNavItems = [
    {
      id: 'USERS' as ActiveTabType,
      label: 'จัดการผู้ใช้งาน & เจ้าหน้าที่',
      icon: UserCog,
      show: isOrgAdmin,
    },
    {
      id: 'ORGANIZATIONS' as ActiveTabType,
      label: 'จัดการหน่วยงานภาครัฐ',
      icon: Building2,
      show: isSuperAdmin,
    },
    {
      id: 'ROLES' as ActiveTabType,
      label: 'ตารางสิทธิ์ (RBAC Matrix)',
      icon: KeyRound,
      show: isOrgAdmin,
    },
    {
      id: 'SETTINGS' as ActiveTabType,
      label: 'การตั้งค่าระบบความปลอดภัย',
      icon: Settings,
      show: isSuperAdmin,
    },
  ];

  const handleSelectTab = (tab: ActiveTabType) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Unit Identification Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          หน่วยงานผู้ใช้งาน
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-heading font-semibold text-slate-100 text-sm truncate">
            {currentOrg?.nameTh}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>รหัส: {currentOrg?.code}</span>
          <span className="text-amber-400">{currentUser?.role.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs">
        
        {/* Main Workflows */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            ระบบงานหลัก (Operations)
          </div>
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      isActive ? 'bg-amber-800/80 text-amber-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Administration Section */}
        {adminNavItems.some(item => item.show) && (
          <div>
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              การบริหารระบบ (Administration)
            </div>
            <div className="space-y-1">
              {adminNavItems.filter(item => item.show).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Security & System Docs Fast Access */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            ศูนย์ทดสอบ & สถาปัตยกรรม
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleSelectTab('SECURITY_LAB')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'SECURITY_LAB'
                  ? 'bg-rose-900 text-white shadow-sm'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ห้องทดสอบความปลอดภัย</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('ARCHITECTURE_DOCS')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${
                activeTab === 'ARCHITECTURE_DOCS'
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>พิมพ์เขียวสถาปัตยกรรม (21 หมวด)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer System Specs */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div>GP-DMS v2.6.4-SEC</div>
        <div className="text-emerald-500 font-bold">● SOC ACTIVE</div>
      </div>
    </aside>
  );
};
