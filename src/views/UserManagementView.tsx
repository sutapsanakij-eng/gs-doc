import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Lock, 
  Unlock, 
  Search, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  Building,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { RoleBadge } from '../components/StatusBadge';

export const UserManagementView: React.FC = () => {
  const { allUsers, currentUser, currentOrg, hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [usersList, setUsersList] = useState<User[]>(allUsers);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Org Admin only sees their own organization's users; Super Admin sees all
  const accessibleUsers = isSuperAdmin 
    ? usersList 
    : usersList.filter(u => u.organizationId === currentUser?.organizationId);

  const filteredUsers = accessibleUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleLock = (targetUser: User) => {
    const updatedLocked = !targetUser.isLocked;
    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { 
      ...u, 
      isLocked: updatedLocked,
      failedLoginAttempts: updatedLocked ? 5 : 0
    } : u));

    setActionAlert(
      updatedLocked 
        ? `ระงับการใช้งานบัญชี ${targetUser.username} เรียบร้อยแล้ว` 
        : `ปลดล็อคบัญชี ${targetUser.username} และรีเซ็ตจำนวนครั้งที่พยายามล็อกอินล้มเหลวเรียบร้อย`
    );
    setTimeout(() => setActionAlert(null), 4000);
  };

  return (
    <div className="space-y-5 text-slate-800 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              บริหารจัดการผู้ใช้งานและเจ้าหน้าที่ (User Management)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300">
              {filteredUsers.length} บัญชี
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin 
              ? 'จัดการบัญชีเจ้าหน้าที่ทุกหน่วยงานในระบบส่วนกลาง (Super Administrator Access)' 
              : `จัดการเจ้าหน้าที่เฉพาะในสังกัด ${currentOrg?.nameTh}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            นโยบาย: ปลดล็อคบัญชีโดยผู้ดูแลระบบเท่านั้น
          </div>
        </div>
      </div>

      {actionAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อเจ้าหน้าที่, Username, อีเมลราชการ หรือตำแหน่ง..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
                <th className="p-3.5">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th className="p-3.5">ชื่อผู้ใช้งาน (Username)</th>
                <th className="p-3.5">สังกัดหน่วยงาน</th>
                <th className="p-3.5">บทบาท (Role)</th>
                <th className="p-3.5 text-center">2FA Hardware/OTP</th>
                <th className="p-3.5 text-center">สถานะบัญชี</th>
                <th className="p-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">{u.position}</div>
                  </td>

                  <td className="p-3.5 font-mono text-slate-800">
                    <div>{u.username}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>

                  <td className="p-3.5 text-slate-700">
                    <div className="font-medium">
                      {u.organizationId === 'org-dopa' ? 'กรมการปกครอง' :
                       u.organizationId === 'org-rid' ? 'กรมชลประทาน' :
                       u.organizationId === 'org-rd' ? 'กรมสรรพากร' : 'ส่วนกลาง (ศสท.)'}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{u.organizationId}</span>
                  </td>

                  <td className="p-3.5">
                    <RoleBadge role={u.role} />
                  </td>

                  <td className="p-3.5 text-center">
                    {u.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> บังคับใช้
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">ปิดใช้งาน</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    {u.isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <Lock className="w-3 h-3 text-rose-600" /> ถูกระงับบัญชี
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ใช้งานปกติ
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto cursor-pointer ${
                        u.isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                      title={u.isLocked ? 'ปลดล็อคให้เข้าสู่ระบบได้' : 'ระงับการเข้าสู่ระบบชั่วคราว'}
                    >
                      {u.isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          ปลดล็อคบัญชี
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          ระงับการใช้งาน
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
