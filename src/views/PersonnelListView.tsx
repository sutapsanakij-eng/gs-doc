import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  FileText, 
  ChevronRight, 
  ArrowUpDown, 
  Building, 
  Calendar,
  Coins,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Personnel, PersonnelStatus, PensionType } from '../types';
import { MaskedText } from '../components/MaskedText';
import { PersonnelStatusBadge, PensionTypeBadge } from '../components/StatusBadge';

interface PersonnelListViewProps {
  onSelectPersonnel: (personnel: Personnel) => void;
  onOpenUploadModal?: () => void;
}

export const PersonnelListView: React.FC<PersonnelListViewProps> = ({
  onSelectPersonnel,
}) => {
  const { currentOrg, hasPermission } = useAuth();
  const { getAccessiblePersonnel, logAudit } = useData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPensionType, setSelectedPensionType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'personnelCode' | 'name' | 'startDate' | 'pensionAmount'>('personnelCode');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const canExport = hasPermission('REPORTS_EXPORT');

  const rawPersonnel = getAccessiblePersonnel();

  // Filter & Search
  const filteredPersonnel = rawPersonnel.filter(person => {
    const matchesSearch = 
      person.personnelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${person.title}${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.nationalId.includes(searchTerm) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.division.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || person.status === selectedStatus;
    const matchesPensionType = selectedPensionType === 'ALL' || person.pensionType === selectedPensionType;

    return matchesSearch && matchesStatus && matchesPensionType;
  });

  // Sort
  const sortedPersonnel = [...filteredPersonnel].sort((a, b) => {
    let comp = 0;
    if (sortField === 'personnelCode') comp = a.personnelCode.localeCompare(b.personnelCode);
    else if (sortField === 'name') comp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    else if (sortField === 'startDate') comp = a.startDate.localeCompare(b.startDate);
    else if (sortField === 'pensionAmount') comp = a.pensionAmountEstimated - b.pensionAmountEstimated;
    return sortAsc ? comp : -comp;
  });

  const handleExport = () => {
    if (!canExport) return;
    
    // Create CSV content
    const headers = ['รหัสกำลังพล,เลขประจำตัวประชาชน(Masked),ชื่อ-นามสกุล,ตำแหน่ง,สังกัด,ประเภทบำเหน็จ,ประมาณการเงินบำเหน็จ(บาท),สถานะ\n'];
    const rows = sortedPersonnel.map(p => 
      `"${p.personnelCode}","${p.nationalId.slice(0, 1)}-${p.nationalId.slice(1, 5)}-XXXXX-${p.nationalId.slice(10, 12)}-${p.nationalId.slice(12)}","${p.title}${p.firstName} ${p.lastName}","${p.position}","${p.division}","${p.pensionType}","${p.pensionAmountEstimated}","${p.status}"`
    );
    const blob = new Blob(['\uFEFF' + headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personnel_pension_registry_${currentOrg?.code}_${Date.now()}.csv`;
    link.click();

    logAudit(
      'REPORT_EXPORT',
      `ส่งออกข้อมูลทะเบียนกำลังพล (${sortedPersonnel.length} รายการ) เป็นไฟล์ CSV สังกัด ${currentOrg?.nameTh}`,
      currentOrg?.id || 'ORG',
      'REPORT',
      true,
      'MEDIUM'
    );
  };

  return (
    <div className="space-y-5 text-slate-800 animate-in fade-in duration-150">
      
      {/* Title & Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              ทะเบียนกำลังพลผู้ขอรับบำเหน็จ (Personnel Registry)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300">
              {filteredPersonnel.length} รายการ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ข้อมูลกำลังพลในความรับผิดชอบของ <strong>{currentOrg?.nameTh}</strong> (Data Isolation Active)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canExport && (
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ส่งออกรายการเป็นไฟล์ CSV สำหรับงานราชการ"
            >
              <Download className="w-4 h-4" />
              ส่งออก CSV
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วย รหัสกำลังพล, ชื่อ-นามสกุล, เลขประจำตัว, หรือตำแหน่ง..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="SUBMITTED">ส่งเรื่องแล้ว / รอตรวจสอบ</option>
              <option value="IN_VERIFICATION">กำลังตรวจสอบเอกสาร</option>
              <option value="PENDING_DOCS">รอส่งเอกสารเพิ่มเติม</option>
              <option value="VERIFIED">เอกสารผ่านการตรวจสอบ</option>
              <option value="PENDING_APPROVAL">รออนุมัติบำเหน็จ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="REJECTED">ไม่ผ่านการพิจารณา</option>
            </select>
          </div>

          {/* Pension Type Filter */}
          <div>
            <select
              value={selectedPensionType}
              onChange={(e) => setSelectedPensionType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="ALL">ประเภทบำเหน็จทั้งหมด</option>
              <option value="ORDINARY_PENSION">บำเหน็จปกติ</option>
              <option value="SPECIAL_PENSION">บำเหน็จพิเศษ</option>
              <option value="HEIR_PENSION">บำเหน็จตกทอด</option>
              <option value="EARLY_RETIREMENT">เกษียณก่อนกำหนด</option>
            </select>
          </div>

        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
                <th 
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => { setSortField('personnelCode'); setSortAsc(!sortAsc); }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>รหัสกำลังพล</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">เลขประจำตัวประชาชน (PDPA)</th>
                <th 
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>ชื่อ - สกุล</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">ตำแหน่ง / สังกัด</th>
                <th className="p-3.5">ประเภทบำเหน็จ</th>
                <th 
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition-colors text-right"
                  onClick={() => { setSortField('pensionAmount'); setSortAsc(!sortAsc); }}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>ประมาณการเงินบำเหน็จ</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 text-center">สถานะ</th>
                <th className="p-3.5 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    ไม่พบข้อมูลกำลังพลที่ตรงตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                sortedPersonnel.map((person) => (
                  <tr
                    key={person.id}
                    onClick={() => onSelectPersonnel(person)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-mono font-semibold text-slate-900">
                      {person.personnelCode}
                    </td>

                    <td className="p-3.5">
                      <MaskedText value={person.nationalId} type="CITIZEN_ID" />
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">
                        {person.title}{person.firstName} {person.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        อายุราชการ {person.totalServiceYears} ปี {person.totalServiceMonths} เดือน
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-800">{person.position}</div>
                      <div className="text-[11px] text-slate-500">{person.division}</div>
                    </td>

                    <td className="p-3.5">
                      <PensionTypeBadge type={person.pensionType} />
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold text-slate-900">
                      ฿ {person.pensionAmountEstimated.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-center">
                      <PersonnelStatusBadge status={person.status} size="sm" />
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPersonnel(person);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-2xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        เปิดแฟ้ม
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            แสดง {sortedPersonnel.length} จากทั้งหมด {rawPersonnel.length} รายการในสังกัด {currentOrg?.nameTh}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            ระบบป้องกันการสืบค้นข้ามหน่วยงาน (Row-Level Multi-Tenant Policy Active)
          </div>
        </div>

      </div>

    </div>
  );
};
