import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, Organization } from '../types';
import { INITIAL_USERS, INITIAL_ORGANIZATIONS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentOrg: Organization | null;
  allOrganizations: Organization[];
  allUsers: User[];
  login: (username: string, password: string,captchaToken?: string) => { success: boolean; message: string };
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  hasPermission: (permission: Permission) => boolean;
  canAccessOrg: (targetOrgId: string) => boolean;
  canAccessPersonnelOrg: (targetOrgId: string) => boolean;
  canAccessDocumentOrg: (targetOrgId: string) => boolean;
  toggleMasking: () => void;
  showSensitiveData: boolean;
  sessionTimeRemaining: number;
  resetSessionTimer: () => void;
  lockSession: () => void;
  unlockSession: (password: string) => boolean;
  isSessionLocked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Document Officer DOPA for intuitive primary testing, but user can easily switch!
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[2]); // officer.dopa
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [showSensitiveData, setShowSensitiveData] = useState<boolean>(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(900); // 15 minutes (900s)
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);

  const currentOrg = currentUser 
    ? INITIAL_ORGANIZATIONS.find(o => o.id === currentUser.organizationId) || {
        id: 'org-central',
        code: 'CENTRAL',
        nameTh: 'ศูนย์เทคโนโลยีสารสนเทศส่วนกลาง (ศสท.)',
        nameEn: 'Central IT Center',
        ministryTh: 'สำนักนายกรัฐมนตรี / ส่วนกลาง',
        shortName: 'ส่วนกลาง',
        badgeColor: 'bg-purple-900 text-white',
        officerCount: 15,
        personnelCount: 362,
        isActive: true,
        createdAt: '2025-01-01T08:00:00Z',
      }
    : null;

  // Session timer ticker
  useEffect(() => {
    if (!currentUser || isSessionLocked) return;
    const interval = setInterval(() => {
      setSessionTimeRemaining(prev => {
        if (prev <= 1) {
          setIsSessionLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUser, isSessionLocked]);

  const resetSessionTimer = () => {
    setSessionTimeRemaining(900);
  };

  const lockSession = () => {
    setIsSessionLocked(true);
  };

  const unlockSession = (password: string): boolean => {
    // Demo unlock password
    if (password === 'password123' || password === 'admin123' || password === '123456') {
      setIsSessionLocked(false);
      resetSessionTimer();
      return true;
    }
    return false;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return currentUser.permissions.includes(permission);
  };

  // Organization-level access control (Zero Trust Data Isolation)
  const canAccessOrg = (targetOrgId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return currentUser.organizationId === targetOrgId;
  };

  const canAccessPersonnelOrg = (targetOrgId: string): boolean => {
    return canAccessOrg(targetOrgId);
  };

  const canAccessDocumentOrg = (targetOrgId: string): boolean => {
    return canAccessOrg(targetOrgId);
  };

  const login = (username: string, password: string, _captchaToken?: string) => {
    const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    
    if (!user) {
      return { success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (User not found)' };
    }

    if (user.isLocked) {
      return { 
        success: false, 
        message: 'บัญชีนี้ถูกระงับการใช้งานเนื่องจากพยายามเข้าสู่ระบบผิดพลาดเกินกำหนด กรุณาติดต่อผู้ดูแลระบบ' 
      };
    }

    // Default demo passwords for all: password123 or admin123
    const isValid = (password === 'password123' || password === 'admin123' || password === '123456');

    if (!isValid) {
      const updatedAttempts = user.failedLoginAttempts + 1;
      const isNowLocked = updatedAttempts >= 5;
      
      setAllUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        failedLoginAttempts: updatedAttempts,
        isLocked: isNowLocked,
      } : u));

      if (isNowLocked) {
        return { 
          success: false, 
          message: 'พยายามเข้าสู่ระบบผิดเกิน 5 ครั้ง บัญชีถูกระงับชั่วคราวเพื่อความปลอดภัยตามนโยบายราชการ' 
        };
      }
      return { 
        success: false, 
        message: `รหัสผ่านไม่ถูกต้อง (พยายามผิด ${updatedAttempts}/5 ครั้ง)` 
      };
    }

    // Login success
    setAllUsers(prev => prev.map(u => u.id === user.id ? {
      ...u,
      failedLoginAttempts: 0,
      lastLoginAt: new Date().toISOString(),
    } : u));

    setCurrentUser({
      ...user,
      failedLoginAttempts: 0,
      lastLoginAt: new Date().toISOString(),
    });
    setIsSessionLocked(false);
    resetSessionTimer();

    return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsSessionLocked(false);
  };

  const switchDemoUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsSessionLocked(false);
      resetSessionTimer();
    }
  };

  const toggleMasking = () => {
    if (hasPermission('SENSITIVE_DATA_VIEW')) {
      setShowSensitiveData(prev => !prev);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOrg,
        allOrganizations: INITIAL_ORGANIZATIONS,
        allUsers,
        login,
        logout,
        switchDemoUser,
        hasPermission,
        canAccessOrg,
        canAccessPersonnelOrg,
        canAccessDocumentOrg,
        toggleMasking,
        showSensitiveData,
        sessionTimeRemaining,
        resetSessionTimer,
        lockSession,
        unlockSession,
        isSessionLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
