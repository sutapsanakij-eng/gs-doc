import React, { createContext, useContext, useState } from 'react';
import { 
  Personnel, 
  DocumentRecord, 
  AuditLogEntry, 
  PersonnelComment, 
  NotificationItem, 
  VerificationStatus,
  PersonnelStatus,
  AuditActionType,
  DocumentCategory
} from '../types';
import { 
  INITIAL_PERSONNEL, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_COMMENTS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface DataContextType {
  personnelList: Personnel[];
  getAccessiblePersonnel: () => Personnel[];
  getPersonnelById: (id: string) => { success: boolean; data?: Personnel; error?: string };
  getDocumentsForPersonnel: (personnelId: string) => { success: boolean; data?: DocumentRecord[]; error?: string };
  getDocumentById: (docId: string) => { success: boolean; data?: DocumentRecord; error?: string };
  verifyDocument: (
    documentId: string, 
    status: VerificationStatus, 
    remarks: string, 
    rejectionReason?: string
  ) => { success: boolean; message: string };
  updatePersonnelStatus: (personnelId: string, newStatus: PersonnelStatus, reason?: string) => { success: boolean; message: string };
  downloadDocument: (documentId: string) => { 
    success: boolean; 
    downloadToken?: string; 
    fileName?: string; 
    error?: string;
  };
  uploadDocument: (
    personnelId: string, 
    category: DocumentCategory, 
    categoryNameTh: string,
    title: string, 
    file: { name: string; size: number; type: string }
  ) => { success: boolean; message: string; docId?: string };
  addComment: (personnelId: string, content: string, isInternalOnly: boolean) => void;
  getCommentsForPersonnel: (personnelId: string) => PersonnelComment[];
  auditLogs: AuditLogEntry[];
  logAudit: (
    action: AuditActionType, 
    actionDescription: string, 
    targetId: string, 
    targetType: 'PERSONNEL' | 'DOCUMENT' | 'USER' | 'REPORT' | 'SYSTEM' | 'SECURITY',
    isSuccess: boolean,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata?: Record<string, any>
  ) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  simulateIdorAttack: (targetDocId: string) => { blocked: boolean; message: string };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, canAccessOrg, hasPermission } = useAuth();

  const [personnelList, setPersonnelList] = useState<Personnel[]>(INITIAL_PERSONNEL);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [comments, setComments] = useState<PersonnelComment[]>(INITIAL_COMMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Append immutable audit log
  const logAudit = (
    action: AuditActionType,
    actionDescription: string,
    targetId: string,
    targetType: 'PERSONNEL' | 'DOCUMENT' | 'USER' | 'REPORT' | 'SYSTEM' | 'SECURITY',
    isSuccess: boolean,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata?: Record<string, any>
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'ANONYMOUS',
      username: currentUser?.username || 'anonymous',
      userFullName: currentUser?.fullName || 'ผู้ใช้งานไม่ระบุตัวตน',
      userRole: currentUser?.role || 'VIEWER',
      organizationId: currentUser?.organizationId || 'NONE',
      organizationName: currentUser?.organizationId === 'org-dopa' ? 'กรมการปกครอง' : 
                        currentUser?.organizationId === 'org-rid' ? 'กรมชลประทาน' :
                        currentUser?.organizationId === 'org-rd' ? 'กรมสรรพากร' : 'ส่วนกลาง',
      action,
      actionDescription,
      targetId,
      targetType,
      ipAddress: '192.168.10.88 (Proxy: 10.0.1.5)',
      userAgent: navigator.userAgent || 'GovClient-Secured-Browser/2.4',
      isSuccess,
      securitySeverity: severity,
      metadata,
    };

    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Filter personnel strictly by current user's organization!
  const getAccessiblePersonnel = (): Personnel[] => {
    if (!currentUser) return [];
    if (currentUser.role === 'SUPER_ADMIN') {
      return personnelList;
    }
    // Strict Organization Isolation
    return personnelList.filter(p => p.organizationId === currentUser.organizationId);
  };

  // Safe fetch single personnel with Organization Isolation enforcement
  const getPersonnelById = (id: string): { success: boolean; data?: Personnel; error?: string } => {
    const found = personnelList.find(p => p.id === id);
    if (!found) {
      return { success: false, error: 'ไม่พบข้อมูลกำลังพลในระบบ (Personnel Not Found)' };
    }

    if (!canAccessOrg(found.organizationId)) {
      // Security violation! Attempted to access another organization's personnel!
      logAudit(
        'SECURITY_IDOR_BLOCKED',
        `ตรวจพบการพยายามเข้าถึงข้อมูลกำลังพลต่างหน่วยงาน (IDOR Attempt: target personnel ${found.personnelCode} ของหน่วย ${found.organizationId})`,
        found.id,
        'SECURITY',
        false,
        'CRITICAL',
        {
          attemptedByUserId: currentUser?.id,
          userOrg: currentUser?.organizationId,
          targetOrg: found.organizationId,
          personnelCode: found.personnelCode,
        }
      );
      return { 
        success: false, 
        error: `[403 FORBIDDEN - ACCESS DENIED] ท่านไม่มีสิทธิ์เข้าถึงข้อมูลของสังกัดนี้ ข้อมูลถูกแยกตามหน่วยงาน (Data Isolation Enforcement)` 
      };
    }

    // Access granted - log view event
    logAudit(
      'PERSONNEL_VIEW',
      `เปิดดูข้อมูลทะเบียนกำลังพล: ${found.title}${found.firstName} ${found.lastName} (${found.personnelCode})`,
      found.id,
      'PERSONNEL',
      true,
      'LOW'
    );

    return { success: true, data: found };
  };

  const getDocumentsForPersonnel = (personnelId: string): { success: boolean; data?: DocumentRecord[]; error?: string } => {
    const personnelRes = getPersonnelById(personnelId);
    if (!personnelRes.success || !personnelRes.data) {
      return { success: false, error: personnelRes.error };
    }

    const docs = documents.filter(d => d.personnelId === personnelId);
    return { success: true, data: docs };
  };

  const getDocumentById = (docId: string): { success: boolean; data?: DocumentRecord; error?: string } => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) {
      return { success: false, error: 'ไม่พบเอกสารในระบบ' };
    }

    if (!canAccessOrg(doc.organizationId)) {
      logAudit(
        'SECURITY_IDOR_BLOCKED',
        `ตรวจพบการพยายามเข้าถึงเอกสารต่างหน่วยงานโดยไม่ได้รับอนุญาต (IDOR Attempt: doc ${doc.fileName} ของหน่วย ${doc.organizationId})`,
        doc.id,
        'SECURITY',
        false,
        'CRITICAL',
        {
          attemptedByUserId: currentUser?.id,
          userOrg: currentUser?.organizationId,
          targetOrg: doc.organizationId,
        }
      );
      return { 
        success: false, 
        error: '[403 FORBIDDEN] ท่านไม่มีสิทธิ์เข้าถึงหรือเปิดดูเอกสารของหน่วยงานอื่น' 
      };
    }

    return { success: true, data: doc };
  };

  const verifyDocument = (
    documentId: string, 
    status: VerificationStatus, 
    remarks: string, 
    rejectionReason?: string
  ): { success: boolean; message: string } => {
    if (!hasPermission('DOCUMENT_VERIFY')) {
      return { success: false, message: 'ท่านไม่มีสิทธิ์ในการตรวจสอบหรืออนุมัติเอกสาร (Requires DOCUMENT_VERIFY permission)' };
    }

    const doc = documents.find(d => d.id === documentId);
    if (!doc) return { success: false, message: 'ไม่พบเอกสาร' };

    if (!canAccessOrg(doc.organizationId)) {
      return { success: false, message: 'ไม่อนุญาตให้แก้ไขสถานะเอกสารต่างสังกัด' };
    }

    setDocuments(prev => prev.map(d => {
      if (d.id === documentId) {
        return {
          ...d,
          verificationStatus: status,
          verifiedByUserId: currentUser?.id,
          verifiedByUserName: currentUser?.fullName,
          verifiedAt: new Date().toISOString(),
          verificationRemarks: remarks,
          rejectionReason: rejectionReason,
        };
      }
      return d;
    }));

    const actionType: AuditActionType = status === 'VALID' || status === 'APPROVED' 
      ? 'DOCUMENT_VERIFY_PASS' 
      : status === 'CORRECTION_REQUESTED' 
      ? 'DOCUMENT_REQUEST_CORRECTION' 
      : 'DOCUMENT_VERIFY_FAIL';

    const statusLabel = 
      status === 'VALID' ? 'เอกสารถูกต้องสมบูรณ์' :
      status === 'APPROVED' ? 'อนุมัติเอกสารผ่าน' :
      status === 'CORRECTION_REQUESTED' ? 'ส่งกลับให้แก้ไข/ขอเอกสารเพิ่ม' :
      status === 'INVALID' ? 'เอกสารไม่ถูกต้อง' : 'ปรับปรุงสถานะ';

    logAudit(
      actionType,
      `บันทึกผลการตรวจสอบเอกสาร "${doc.title}" เป็น "${statusLabel}": ${remarks || rejectionReason || 'ไม่มีหมายเหตุเพิ่มเติม'}`,
      doc.id,
      'DOCUMENT',
      true,
      'MEDIUM',
      {
        oldStatus: doc.verificationStatus,
        newStatus: status,
        remarks,
        rejectionReason,
      }
    );

    return { success: true, message: `บันทึกผลการตรวจสอบเอกสารเรียบร้อย (${statusLabel})` };
  };

  const updatePersonnelStatus = (personnelId: string, newStatus: PersonnelStatus, reason?: string): { success: boolean; message: string } => {
    if (!hasPermission('DOCUMENT_APPROVE') && !hasPermission('DOCUMENT_VERIFY')) {
      return { success: false, message: 'ท่านไม่มีสิทธิ์ในการเปลี่ยนสถานะการพิจารณาบำเหน็จ' };
    }

    const target = personnelList.find(p => p.id === personnelId);
    if (!target) return { success: false, message: 'ไม่พบกำลังพล' };

    if (!canAccessOrg(target.organizationId)) {
      return { success: false, message: 'ไม่อนุญาตให้ดำเนินการข้ามหน่วยงาน' };
    }

    setPersonnelList(prev => prev.map(p => {
      if (p.id === personnelId) {
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    }));

    logAudit(
      'WORKFLOW_STATUS_CHANGE',
      `เปลี่ยนขั้นตอนกระบวนการบำเหน็จของ ${target.personnelCode} (${target.title}${target.firstName} ${target.lastName}) เป็น "${newStatus}" โดยมีเหตุผล: ${reason || 'ตามลำดับขั้นตอนระเบียบราชการ'}`,
      target.id,
      'PERSONNEL',
      true,
      'HIGH',
      {
        previousStatus: target.status,
        newStatus,
        reason,
      }
    );

    return { success: true, message: `อัปเดตสถานะกระบวนการเรียบร้อย (${newStatus})` };
  };

  const downloadDocument = (documentId: string): { 
    success: boolean; 
    downloadToken?: string; 
    fileName?: string; 
    error?: string;
  } => {
    if (!hasPermission('DOCUMENT_DOWNLOAD')) {
      logAudit(
        'SECURITY_UNAUTHORIZED_ACCESS',
        `พยายามดาวน์โหลดเอกสารโดยไม่มีสิทธิ์ DOCUMENT_DOWNLOAD (doc: ${documentId})`,
        documentId,
        'SECURITY',
        false,
        'HIGH'
      );
      return { success: false, error: 'ท่านไม่มีสิทธิ์ในการดาวน์โหลดเอกสาร (Document Download Permission Denied)' };
    }

    const doc = documents.find(d => d.id === documentId);
    if (!doc) {
      return { success: false, error: 'ไม่พบเอกสาร' };
    }

    if (!canAccessOrg(doc.organizationId)) {
      logAudit(
        'SECURITY_IDOR_BLOCKED',
        `พยายามดาวน์โหลดเอกสารต่างหน่วยงาน ${doc.organizationId} (IDOR Blocked)`,
        doc.id,
        'SECURITY',
        false,
        'CRITICAL'
      );
      return { success: false, error: '[403 FORBIDDEN] ไม่อนุญาตให้ดาวน์โหลดเอกสารของหน่วยงานอื่น' };
    }

    // Generate simulated cryptographic signed token valid for 60 seconds
    const signedToken = `gov-dms-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    logAudit(
      'DOCUMENT_DOWNLOAD',
      `ดาวน์โหลดเอกสาร "${doc.fileName}" (${(doc.fileSize / 1024 / 1024).toFixed(2)} MB) ผ่านระบบ Secure Token สำเร็จ`,
      doc.id,
      'DOCUMENT',
      true,
      'MEDIUM',
      {
        fileHash: doc.fileHashSha256,
        signedToken,
        fileSize: doc.fileSize,
      }
    );

    return { 
      success: true, 
      downloadToken: signedToken, 
      fileName: doc.fileName 
    };
  };

  const uploadDocument = (
    personnelId: string, 
    category: DocumentCategory, 
    categoryNameTh: string,
    title: string, 
    file: { name: string; size: number; type: string }
  ): { success: boolean; message: string; docId?: string } => {
    if (!hasPermission('DOCUMENT_UPLOAD')) {
      return { success: false, message: 'ท่านไม่มีสิทธิ์ในการนำเข้าหรืออัปโหลดเอกสาร (DOCUMENT_UPLOAD required)' };
    }

    const personnel = personnelList.find(p => p.id === personnelId);
    if (!personnel) return { success: false, message: 'ไม่พบกำลังพลเป้าหมาย' };

    if (!canAccessOrg(personnel.organizationId)) {
      return { success: false, message: 'ไม่อนุญาตให้อัปโหลดเอกสารข้ามหน่วยงาน' };
    }

    // Size check (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return { success: false, message: 'ขนาดไฟล์เกินกำหนดสูงสุด (ไม่เกิน 25MB ตามมาตรฐาน ศสท.)' };
    }

    // Generate simulated SHA-256 hash
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newDocId = `doc-${personnel.organizationId.replace('org-', '')}-${Date.now().toString().slice(-4)}`;

    const newDoc: DocumentRecord = {
      id: newDocId,
      personnelId,
      organizationId: personnel.organizationId,
      category,
      categoryNameTh,
      title,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
      fileHashSha256: fakeHash,
      version: 1,
      uploadedByUserId: currentUser?.id || 'sys',
      uploadedByUserName: currentUser?.fullName || 'เจ้าหน้าที่',
      uploadedAt: new Date().toISOString(),
      verificationStatus: 'PENDING',
      securityClassification: 'CONFIDENTIAL',
      mockFileUrl: '/mock/docs/sample_official.pdf',
    };

    setDocuments(prev => [newDoc, ...prev]);

    logAudit(
      'DOCUMENT_UPLOAD',
      `นำเข้าเอกสารใหม่ "${title}" (${file.name}) สำหรับกำลังพล ${personnel.personnelCode} ผ่านการสแกนความปลอดภัยและคำนวณ Checksum SHA-256 แล้ว`,
      newDoc.id,
      'DOCUMENT',
      true,
      'MEDIUM',
      {
        fileName: file.name,
        sha256: fakeHash,
        fileSize: file.size,
        avScanResult: 'CLEAN - NO MALWARE DETECTED',
      }
    );

    return { success: true, message: 'นำเข้าเอกสารและบันทึก Hash ลงระบบความปลอดภัยสำเร็จ', docId: newDocId };
  };

  const addComment = (personnelId: string, content: string, isInternalOnly: boolean) => {
    const personnel = personnelList.find(p => p.id === personnelId);
    if (!personnel || !canAccessOrg(personnel.organizationId) || !currentUser) return;

    const newComment: PersonnelComment = {
      id: `cmt-${Date.now()}`,
      personnelId,
      organizationId: personnel.organizationId,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      authorPosition: currentUser.position,
      content,
      isInternalOnly,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [newComment, ...prev]);
    setPersonnelList(prev => prev.map(p => p.id === personnelId ? { ...p, notesCount: p.notesCount + 1 } : p));
  };

  const getCommentsForPersonnel = (personnelId: string): PersonnelComment[] => {
    return comments.filter(c => c.personnelId === personnelId);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Interactive IDOR Demonstration method
  const simulateIdorAttack = (targetDocId: string): { blocked: boolean; message: string } => {
    const doc = documents.find(d => d.id === targetDocId);
    if (!doc) return { blocked: true, message: 'ไม่พบรหัสเอกสารเป้าหมาย' };

    const isDifferentOrg = currentUser?.role !== 'SUPER_ADMIN' && currentUser?.organizationId !== doc.organizationId;

    if (isDifferentOrg) {
      logAudit(
        'SECURITY_IDOR_BLOCKED',
        `[IDOR SECURITY TEST] ผู้ใช้ ${currentUser?.username} (${currentUser?.organizationId}) พยายามใช้ Request ปลอมแปลง ID เพื่อเข้าถึงเอกสาร ${doc.fileName} ของ ${doc.organizationId}`,
        doc.id,
        'SECURITY',
        false,
        'CRITICAL',
        {
          attackType: 'Insecure Direct Object Reference (IDOR)',
          simulated: true,
          requestedDocId: doc.id,
          targetOrg: doc.organizationId,
          currentUserOrg: currentUser?.organizationId,
          actionTaken: 'HTTP 403 Forbidden Returned & Event Sent to Central SOC',
        }
      );
      return {
        blocked: true,
        message: `[IDOR BLOCKED] ระบบตรวจสอบพบว่าผู้ใช้สังกัด "${currentUser?.organizationId}" พยายามเข้าถึงเอกสาร "${doc.fileName}" ซึ่งเป็นของสังกัด "${doc.organizationId}". คำขอถูกปฏิเสธทันที และบันทึก Audit Trail ระดับ CRITICAL`,
      };
    } else {
      return {
        blocked: false,
        message: `[AUTHORIZED] เอกสารนี้อยู่ในสังกัดที่ท่านมีสิทธิ์ถูกต้อง (${doc.organizationId})`,
      };
    }
  };

  return (
    <DataContext.Provider
      value={{
        personnelList,
        getAccessiblePersonnel,
        getPersonnelById,
        getDocumentsForPersonnel,
        getDocumentById,
        verifyDocument,
        updatePersonnelStatus,
        downloadDocument,
        uploadDocument,
        addComment,
        getCommentsForPersonnel,
        auditLogs,
        logAudit,
        notifications,
        markNotificationAsRead,
        simulateIdorAttack,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
