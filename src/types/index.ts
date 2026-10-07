export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ORG_ADMIN' 
  | 'DOCUMENT_OFFICER' 
  | 'REVIEWER_APPROVER' 
  | 'VIEWER';

export type OrganizationCode = 'DOPA' | 'RID' | 'RD' | 'CENTRAL';

export interface Organization {
  id: string;
  code: OrganizationCode;
  nameTh: string;
  nameEn: string;
  ministryTh: string;
  shortName: string;
  badgeColor: string;
  officerCount: number;
  personnelCount: number;
  isActive: boolean;
  createdAt: string;
}

export type Permission = 
  | 'ORG_MANAGE'
  | 'USER_MANAGE'
  | 'ROLE_MANAGE'
  | 'ALL_ORGS_VIEW'
  | 'PERSONNEL_VIEW'
  | 'PERSONNEL_CREATE'
  | 'PERSONNEL_EDIT'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_PREVIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VERIFY'
  | 'DOCUMENT_APPROVE'
  | 'AUDIT_LOG_VIEW'
  | 'REPORTS_VIEW'
  | 'REPORTS_EXPORT'
  | 'SYSTEM_SETTINGS_MANAGE'
  | 'SENSITIVE_DATA_VIEW';

export interface User {
  id: string;
  username: string;
  fullName: string;
  title: string;
  position: string;
  email: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  avatarUrl?: string;
  isActive: boolean;
  failedLoginAttempts: number;
  isLocked: boolean;
  lastLoginAt?: string;
  twoFactorEnabled: boolean;
}

export type PensionType = 
  | 'ORDINARY_PENSION' // บำเหน็จปกติ
  | 'SPECIAL_PENSION'   // บำเหน็จพิเศษ (กรณีได้รับอันตรายจากการปฏิบัติหน้าที่)
  | 'HEIR_PENSION'      // บำเหน็จตกทอด (กรณีถึงแก่ความตาย)
  | 'EARLY_RETIREMENT'; // บำเหน็จโครงการเกษียณอายุก่อนกำหนด

export type PersonnelStatus = 
  | 'DRAFT'             // ร่างข้อมูล
  | 'PENDING_DOCS'      // รอส่งเอกสารเพิ่มเติม
  | 'SUBMITTED'         // ส่งเรื่องแล้ว/รอตรวจสอบ
  | 'IN_VERIFICATION'   // กำลังตรวจสอบเอกสาร
  | 'VERIFIED'          // ผ่านการตรวจสอบเอกสาร
  | 'PENDING_APPROVAL'  // รออนุมัติบำเหน็จ
  | 'APPROVED'          // อนุมัติการจ่ายบำเหน็จเรียบร้อย
  | 'REJECTED';         // ไม่ผ่านการพิจารณา

export interface Personnel {
  id: string;
  personnelCode: string; // เช่น กพ-6701-089
  nationalId: string;    // เช่น 1100201234567 (13 หลัก)
  title: string;         // นาย / นาง / พ.อ. / ฯลฯ
  firstName: string;
  lastName: string;
  position: string;
  rankLevel: string;     // ระดับ ชำนาญการพิเศษ / พันเอก / ฯลฯ
  organizationId: string;
  division: string;      // กอง / สำนัก
  subDivision: string;   // ฝ่าย / กลุ่มงาน
  startDate: string;     // วันที่บรรจุรับราชการ
  endDate: string;       // วันที่พ้นจากราชการ
  totalServiceYears: number; // อายุราชการ (ปี)
  totalServiceMonths: number;// อายุราชการ (เดือน)
  pensionType: PensionType;
  pensionAmountEstimated: number; // ประมาณการยอดเงินบำเหน็จ (บาท)
  status: PersonnelStatus;
  createdAt: string;
  updatedAt: string;
  assignedOfficerId?: string;
  notesCount: number;
}

export type DocumentCategory = 
  | 'DISMISSAL_ORDER'     // คำสั่งให้ออกจากราชการ/เกษียณอายุ
  | 'SERVICE_RECORD'      // หนังสือรับรองเวลาราชการ (ก.พ. 7 หรือแฟ้มประวัติ)
  | 'SALARY_CERTIFICATE'  // หนังสือรับรองเงินเดือน/เงินประจำตำแหน่งย้อนหลัง
  | 'PENSION_APPLICATION' // แบบคำขอรับบำเหน็จ (แบบ กค. / กบข.)
  | 'CITIZEN_ID_COPY'     // สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ/ประชาชน
  | 'BANK_BOOK_COPY'      // สำเนาสมุดบัญชีเงินฝากธนาคาร
  | 'HEIR_CERTIFICATE'    // หนังสือแสดงเจตนาระบุตัวผู้รับบำเหน็จตกทอด (ถ้ามี)
  | 'OTHER_OFFICIAL_DOC'; // เอกสารราชการประกอบอื่นๆ

export type VerificationStatus = 
  | 'PENDING'             // รอตรวจสอบ
  | 'IN_PROGRESS'         // กำลังตรวจสอบ
  | 'VALID'               // เอกสารถูกต้องครบถ้วน
  | 'INVALID'             // ไม่ถูกต้อง
  | 'INCOMPLETE'          // เอกสารไม่ครบ/ไม่ชัดเจน
  | 'CORRECTION_REQUESTED'// ส่งกลับให้แก้ไข/ขอเพิ่ม
  | 'APPROVED'            // ผ่านการรับรอง
  | 'REJECTED';           // ปฏิเสธ

export interface DocumentRecord {
  id: string;
  personnelId: string;
  organizationId: string;
  category: DocumentCategory;
  categoryNameTh: string;
  title: string;
  fileName: string;
  fileSize: number;       // bytes
  mimeType: string;
  fileHashSha256: string;
  version: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedAt: string;
  verificationStatus: VerificationStatus;
  verifiedByUserId?: string;
  verifiedByUserName?: string;
  verifiedAt?: string;
  verificationRemarks?: string;
  rejectionReason?: string;
  securityClassification: 'CONFIDENTIAL' | 'SECRET' | 'NORMAL';
  mockFileUrl: string;
}

export interface VerificationHistory {
  id: string;
  documentId: string;
  personnelId: string;
  organizationId: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  action: string;
  remarks: string;
  performedByUserId: string;
  performedByUserName: string;
  performedByUserRole: UserRole;
  timestamp: string;
}

export interface PersonnelComment {
  id: string;
  personnelId: string;
  organizationId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorPosition: string;
  content: string;
  isInternalOnly: boolean;
  createdAt: string;
}

export type AuditActionType = 
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'PERSONNEL_VIEW'
  | 'PERSONNEL_CREATE'
  | 'PERSONNEL_UPDATE'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_PREVIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VERIFY_PASS'
  | 'DOCUMENT_VERIFY_FAIL'
  | 'DOCUMENT_REQUEST_CORRECTION'
  | 'WORKFLOW_STATUS_CHANGE'
  | 'SECURITY_IDOR_BLOCKED'
  | 'SECURITY_UNAUTHORIZED_ACCESS'
  | 'ADMIN_USER_UPDATE'
  | 'REPORT_EXPORT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userFullName: string;
  userRole: UserRole;
  organizationId: string;
  organizationName: string;
  action: AuditActionType;
  actionDescription: string;
  targetId: string;
  targetType: 'PERSONNEL' | 'DOCUMENT' | 'USER' | 'REPORT' | 'SYSTEM' | 'SECURITY';
  ipAddress: string;
  userAgent: string;
  isSuccess: boolean;
  securitySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ACTION_REQUIRED';
  isRead: boolean;
  createdAt: string;
  linkPersonnelId?: string;
}
