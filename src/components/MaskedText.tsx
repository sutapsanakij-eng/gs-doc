import React from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MaskedTextProps {
  value: string;
  type?: 'CITIZEN_ID' | 'BANK_ACCOUNT';
  className?: string;
}

export const MaskedText: React.FC<MaskedTextProps> = ({ value, type = 'CITIZEN_ID', className = '' }) => {
  const { showSensitiveData, toggleMasking, hasPermission } = useAuth();
  const canViewSensitive = hasPermission('SENSITIVE_DATA_VIEW');

  // Format and mask citizen ID: 1-1002-XXXXX-45-8
  const formatCitizenId = (id: string, masked: boolean) => {
    const clean = id.replace(/\D/g, '');
    if (clean.length !== 13) return id;
    
    if (masked) {
      return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-XXXXX-${clean.slice(10, 12)}-${clean.slice(12)}`;
    }
    return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
  };

  const isMasked = !showSensitiveData || !canViewSensitive;
  const displayValue = type === 'CITIZEN_ID' ? formatCitizenId(value, isMasked) : value;

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-sm ${className}`}>
      <span className={isMasked ? 'tracking-wider text-slate-700 font-medium' : 'tracking-normal text-slate-900 font-semibold'}>
        {displayValue}
      </span>
      {canViewSensitive ? (
        <button
          type="button"
          onClick={toggleMasking}
          title={isMasked ? 'แสดงข้อมูลเต็ม (สิทธิ์ SENSITIVE_DATA_VIEW)' : 'ซ่อนข้อมูลส่วนบุคคล (Mask)'}
          className="text-slate-400 hover:text-amber-700 p-0.5 rounded transition-colors focus:outline-none"
        >
          {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
        </button>
      ) : (
        <span title="ข้อมูลส่วนบุคคลถูกปกปิดตามระเบียบ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)" className="text-slate-300">
          <ShieldAlert className="w-3 h-3 text-slate-400" />
        </span>
      )}
    </span>
  );
};
