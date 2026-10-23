'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { SCHOOL_LOCATIONS, CATEGORIES, SCHOOL_ACTIVITIES } from '@/lib/constants';
import { getLocalizedItem, getLocalizedLocation, getLocalizedActivity } from '@/lib/i18n/seedDataTranslations';
import { formatAppDate } from '@/lib/utils';
import { formatArabicDate } from '@/lib/utils';
import ItemVisual from '@/components/ItemVisual';
import BehavioralImpactTab from '@/components/BehavioralImpactTab';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Building2, 
  Trash2, 
  Printer, 
  QrCode, 
  MapPin, 
  Check, 
  Eye, 
  Inbox, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Users2, 
  AlertTriangle, 
  FileCheck,
  Award,
  Sparkles,
  XCircle,
  Clock,
  Cpu,
  HeartHandshake,
  FileSpreadsheet,
  Cloud,
  RefreshCw,
  Volume2
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { 
    currentUser, 
    switchUserRole,
    items, 
    claims,
    approveClaim,
    rejectClaim,
    updateItemStatus, 
    updateItemCustody, 
    deleteItem, 
    adminDirectReunite,
    activitySubmissions,
    approveSchoolActivity,
    rejectSchoolActivity,
    addToast,
    syncStatus,
    triggerCloudSync,
    dir,
    isRtl,
    language,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'inventory' | 'activities' | 'behavioral'>('overview');
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lost' | 'found' | 'at_office' | 'reunited'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filtered Inventory List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'lost' && (item.type !== 'lost' || item.status === 'reunited')) return false;
      if (statusFilter === 'found' && (item.type !== 'found' || item.status === 'reunited')) return false;
      if (statusFilter === 'at_office' && (item.custody !== 'at_office' || item.status === 'reunited')) return false;
      if (statusFilter === 'reunited' && item.status !== 'reunited') return false;

      if (locationFilter !== 'all' && item.locationId !== locationFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesReporter = item.reportedBy?.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesColor = item.color?.toLowerCase().includes(q);
        const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
        const matchesLoc = loc?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesReporter && !matchesDesc && !matchesColor && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [items, statusFilter, locationFilter, searchQuery]);

  // Filtered Activities List
  const filteredActivities = useMemo(() => {
    return (activitySubmissions || []).filter((sub) => {
      if (activityStatusFilter !== 'all' && sub.status !== activityStatusFilter) {
        return false;
      }
      return true;
    });
  }, [activitySubmissions, activityStatusFilter]);

  // ========================================================
  // 🛡️ ROLE-BASED ACCESS CONTROL (RBAC) GUARD
  // ========================================================
  const isAuthorized = canAccessAdmin(currentUser);

  if (!isAuthorized) {
    return (
      <div className="px-3 sm:px-4 py-8 sm:py-16 text-center max-w-md mx-auto space-y-5 animate-in fade-in" dir={dir}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#FEF2F2] dark:bg-rose-950/40 border border-[#FEE2E2] dark:border-rose-900/60 text-[#E11D48] dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('admin.guardTitle')}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#18201D] dark:text-white">
            {t('admin.guardHeading')}
          </h1>
          <p className="text-xs text-[#66706B] dark:text-[#94A39D] leading-relaxed">
            {language === 'en' ? (
              <>You are currently logged in as student <strong>«{currentUser.name}»</strong>. The administration portal is strictly restricted to verified school supervisors.</>
            ) : (
              <>أنت مسجل حالياً بحساب الطالبة <strong>«{currentUser.name}»</strong>. لوحة الإشراف مخصصة حصرياً لإدارة المدرسة المعتمدة.</>
            )}
          </p>
        </div>

        {/* Action to switch to Moshira or return Home */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] space-y-3 text-start shadow-xs">
          <span className="text-[11px] font-bold text-[#66706B] dark:text-[#94A39D] block">
            {language === 'en' ? 'For demonstration purposes (Demo):' : 'لأغراض العرض التقديمي (Demo):'}
          </span>
          <button
            onClick={() => switchUserRole('admin')}
            className="w-full py-2.5 px-4 min-h-[40px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-[#18201D] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('admin.switchBtn')}</span>
          </button>
          
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold transition-colors block text-center"
          >
            {t('app.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  // ========================================================
  // AUTHORIZED ADMIN VIEW (م. مشيرة)
  // ========================================================
  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // KPIs
  const totalItems = items.length;
  const lostCount = items.filter((i) => i.type === 'lost' && i.status !== 'reunited').length;
  const foundCount = items.filter((i) => i.type === 'found' && i.status !== 'reunited').length;
  const atOfficeCount = items.filter((i) => i.custody === 'at_office' && i.status !== 'reunited').length;
  const reunitedCount = items.filter((i) => i.status === 'reunited').length;
  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const pendingActivities = (activitySubmissions || []).filter((a) => a.status === 'pending');

  // Dynamic CSV/Excel Export Handler
  const handleExportCSV = () => {
    try {
      // Simplified headers as selected
      const headers = language === 'en'
        ? ['#', 'Item Title', 'Location', 'Date', 'Type', 'Status & Custody', 'Reporter']
        : ['م', 'اسم الغرض / الأمانة', 'المكان', 'التاريخ', 'نوع البلاغ', 'حالة الأمانة والتسليم', 'المبلّغ'];

      const rows = filteredItems.map((item, idx) => {
        const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
        const locName = loc ? getLocalizedLocation(loc, language).name : (item.locationId || '-');
        const formattedDate = formatAppDate(item.createdAt, language);
        
        const typeStr = item.type === 'found' 
          ? (language === 'en' ? 'Found Item' : 'أمانة معثور عليها')
          : (language === 'en' ? 'Lost Item' : 'غرض مفقود');

        let statusStr = '';
        if (item.status === 'reunited') {
          statusStr = language === 'en' ? 'Reunited with Owner' : 'تم التسليم للمالك';
        } else if (item.custody === 'at_office') {
          statusStr = language === 'en' ? 'At Lost & Found Office' : 'في مكتب الأمانات المدرسية';
        } else {
          statusStr = language === 'en' ? 'Pending Handover' : 'قيد المتابعة / مع الطالب';
        }

        const reporterName = item.reportedBy?.name || (language === 'en' ? 'Anonymous' : 'مجهول');

        return [
          idx + 1,
          `"${(item.title || '').replace(/"/g, '""')}"`,
          `"${locName.replace(/"/g, '""')}"`,
          `"${formattedDate.replace(/"/g, '""')}"`,
          `"${typeStr.replace(/"/g, '""')}"`,
          `"${statusStr.replace(/"/g, '""')}"`,
          `"${reporterName.replace(/"/g, '""')}"`
        ];
      });

      // UTF-8 BOM (\uFEFF) ensures Arabic renders accurately without mojibake in Microsoft Excel
      const csvContent = '\uFEFF' + [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateSlug = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `ETHOS_School_Ledger_${dateSlug}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(
        language === 'en' ? 'Export Successful' : 'تم التصدير بنجاح',
        language === 'en' 
          ? `Exported ${filteredItems.length} records to Excel/CSV` 
          : `تم تحميل كشف رسمي يضم (${filteredItems.length}) سجلاً بصيغة Excel/CSV`,
        'success'
      );
    } catch (err) {
      console.error('Failed to export CSV', err);
      addToast(
        language === 'en' ? 'Export Failed' : 'فشل التصدير',
        language === 'en' ? 'An error occurred while generating CSV' : 'حدث خطأ أثناء إنشاء ملف الإكسيل',
        'error'
      );
    }
  };

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 w-full text-start font-sans" dir={dir}>
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-start transition-colors duration-300">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18201D] dark:bg-[#1C2B27] border border-transparent dark:border-[#2D3E3A] text-white text-[10px] sm:text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>{t('admin.badge')}</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-[#18201D] dark:text-white">
            {t('admin.greeting')}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D]">
            {t('admin.headerSubtitle')}
          </p>
        </div>

        {/* Top Control Buttons (Cloudflare Sync + Export Excel + Print) */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <button
            onClick={triggerCloudSync}
            disabled={syncStatus.state === 'syncing'}
            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-sky-200 dark:border-sky-800 shadow-2xs"
            title={language === 'en' ? 'Sync data with Cloudflare D1 Edge Database' : 'مزامنة البيانات فورياً مع قاعدة بيانات Cloudflare D1 السحابية'}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>
              {syncStatus.state === 'syncing' 
                ? (language === 'en' ? 'Syncing...' : 'جارِ المزامنة...')
                : syncStatus.state === 'offline'
                ? (language === 'en' ? 'Offline (Local-First)' : 'محلي (أوفلاين)')
                : (language === 'en' ? 'Cloudflare D1' : 'سحابة D1')}
            </span>
            <RefreshCw className={`w-3 h-3 text-sky-500 ${syncStatus.state === 'syncing' ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
            title={language === 'en' ? 'Export filtered items to Excel/CSV' : 'تصدير الكشف المعروض إلى ملف إكسيل معتمد'}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'en' ? 'Export to Excel' : 'تصدير كشف (Excel)'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-transparent dark:border-[#2D3E3A]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('admin.printReport')}</span>
          </button>
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionSuccessMessage && (
        <div className="p-3 rounded-2xl bg-[#D1FAE5] dark:bg-emerald-950/80 border border-[#A7F3D0] dark:border-emerald-800 text-[#065F46] dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Operations Quick KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => setActiveTab('claims')}
          className="p-3 sm:p-4 text-start space-y-1 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs hover:border-[#CBD3CE] dark:hover:border-[#344C46] transition-all cursor-pointer"
        >
          <span className="text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D] block font-bold">{t('admin.kpiPending')}</span>
          <div className="text-xl sm:text-2xl font-black text-[#E11D48] dark:text-rose-400">{pendingClaims.length}</div>
          <span className="text-[9px] sm:text-[10px] text-[#E11D48] dark:text-rose-400 font-bold">{t('admin.kpiPendingSub')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setStatusFilter('lost'); }}
          className="p-3 sm:p-4 text-start space-y-1 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs hover:border-[#CBD3CE] dark:hover:border-[#344C46] transition-all cursor-pointer"
        >
          <span className="text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D] block font-bold">{t('admin.kpiLost')}</span>
          <div className="text-xl sm:text-2xl font-black text-[#D97706] dark:text-amber-400">{lostCount}</div>
          <span className="text-[9px] sm:text-[10px] text-[#66706B] dark:text-[#94A39D]">{t('admin.kpiLostSub')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setStatusFilter('at_office'); }}
          className="p-3 sm:p-4 text-start space-y-1 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs hover:border-[#CBD3CE] dark:hover:border-[#344C46] transition-all cursor-pointer"
        >
          <span className="text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D] block font-bold">{t('admin.kpiOffice')}</span>
          <div className="text-xl sm:text-2xl font-black text-[#176B5B] dark:text-emerald-400">{atOfficeCount}</div>
          <span className="text-[9px] sm:text-[10px] text-[#176B5B] dark:text-emerald-400 font-bold">{t('admin.kpiOfficeSub')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setStatusFilter('reunited'); }}
          className="p-3 sm:p-4 text-start space-y-1 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs hover:border-[#CBD3CE] dark:hover:border-[#344C46] transition-all cursor-pointer"
        >
          <span className="text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D] block font-bold">{t('admin.kpiReunited')}</span>
          <div className="text-xl sm:text-2xl font-black text-[#059669] dark:text-emerald-400">{reunitedCount}</div>
          <span className="text-[9px] sm:text-[10px] text-[#059669] dark:text-emerald-400 font-bold">{t('admin.kpiReunitedSub')}</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center p-1 bg-[#F1F3F0] dark:bg-[#141C1A] rounded-2xl overflow-x-auto gap-1 scrollbar-none border border-transparent dark:border-[#23332F]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-3 min-h-[42px] sm:min-h-[44px] rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('admin.tabOverview')}</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2.5 px-3 min-h-[42px] sm:min-h-[44px] rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>{t('admin.tabClaims')} ({pendingClaims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2.5 px-3 min-h-[42px] sm:min-h-[44px] rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>{t('admin.tabInventory')} ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2.5 px-3 min-h-[42px] sm:min-h-[44px] rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('admin.tabActivities')} ({pendingActivities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('behavioral')}
          className={`flex-1 py-2.5 px-3 min-h-[42px] sm:min-h-[44px] rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
            activeTab === 'behavioral'
              ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
              : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF]" />
          <span>{t('admin.tabBehavioral')}</span>
        </button>


      </div>

      {/* ========================================================
          TAB 1: Overview & Pending Claims Queue
      ======================================================== */}
      {/* ========================================================
          TAB 1: Overview & School Operations
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in">

          {/* Office Custody Cabinet (Physical items in administration custody) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] shadow-xs space-y-3.5 text-start">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-[#18201D] dark:text-white">
                    {language === 'en' ? 'School Office Custody Cabinet' : 'غرفة العهدة والأمانات بمكتب الإدارة'}
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D]">
                    {language === 'en'
                      ? 'Items physically handed over to the school supervisor desk awaiting verified owners.'
                      : 'أمانات سلمها الطلاب لإشراف المدرسة ومحفوظة حالياً في دولاب مكتب الأمانات.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setActiveTab('inventory'); setStatusFilter('at_office'); }}
                className="text-[11px] text-[#176B5B] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {language === 'en' ? 'View Cabinet' : 'سجل العهدة ←'}
              </button>
            </div>

            {items.filter((i) => i.custody === 'at_office' && i.status !== 'reunited').length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.filter((i) => i.custody === 'at_office' && i.status !== 'reunited').slice(0, 4).map((item) => {
                  const loc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#192421] border border-[#E4E7E4] dark:border-[#2D3E3A] flex items-center justify-between gap-2.5 text-start"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E6F1ED] dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-emerald-300">
                            {language === 'en' ? '🏛️ In Custody' : '🏛️ في العهدة'}
                          </span>
                          <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">{loc?.name || item.locationId}</span>
                        </div>
                        <h4 className="font-bold text-xs text-[#18201D] dark:text-white truncate mt-0.5">{item.title}</h4>
                        <p className="text-[10px] text-[#66706B] dark:text-[#94A39D] truncate">
                          المسلم: {item.reportedBy?.name || 'مجهول'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          adminDirectReunite(item.id);
                          showFeedback('تم توثيق تسليم العهدة رسمياً لصاحبها بالسجل الإداري 🎉');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                        title={language === 'en' ? 'Document physical return to owner in office ledger' : 'توثيق تسليم العهدة حضورياً للمالك في مكتب الإشراف'}
                      >
                        {language === 'en' ? 'Log Return' : 'تسليم للمالك'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-[#F8FAF9] dark:bg-[#182220] border border-[#E4E7E4] dark:border-[#263834] text-xs text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' ? 'No items currently in office custody.' : 'لا توجد أمانات محتجزة في عهدة المكتب حالياً (العهد مستقرة).'}
              </div>
            )}
          </div>

          {/* Supervisory Claims Monitor (Strictly oversight - finder evaluates) */}
          <div className="p-4 sm:p-6 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-3.5 text-start">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white">
                  {t('admin.pendingClaimsTitle')}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D]">
                  {language === 'en'
                    ? 'Supervisory tracking of peer-to-peer verification between finders and claimants.'
                    : 'متابعة إشرافية فقط: التحقق من إجابة السؤال السري يتم بواسطة الطالب العاثر أولاً لترسيخ الأمانة.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('claims')}
                className="text-xs text-[#176B5B] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {t('admin.viewAllClaims')}
              </button>
            </div>

            {pendingClaims.length > 0 ? (
              <div className="space-y-2.5">
                {pendingClaims.slice(0, 3).map((claim) => {
                  const item = items.find((i) => i.id === claim.itemId);
                  const isItemAtOffice = item?.custody === 'at_office';
                  return (
                    <div
                      key={claim.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#F1F3F0] dark:bg-[#1C2B27] border border-transparent dark:border-[#2D3E3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-start"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            {isItemAtOffice ? 'أمانة بمكتب الإدارة 🏛️' : 'قيد مراجعة العاثر ⏳'}
                          </span>
                          <span className="text-[10px] text-[#66706B] dark:text-[#94A39D]">{formatAppDate(claim.createdAt)}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white">{item?.title}</h4>
                        <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                          العاثر: <strong className="text-[#18201D] dark:text-white">{item?.reportedBy?.name || 'طالب مجهول'}</strong>
                          <span className="mx-1.5">•</span>
                          مقدم الطلب: <strong className="text-[#18201D] dark:text-white">{claim.claimant.name}</strong> ({claim.claimant.grade})
                        </p>
                        <p className="text-[11px] text-[#176B5B] dark:text-emerald-400 font-medium">
                          الإجابة المسجلة: «{claim.answerText}»
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4E7E4] dark:border-[#23332F]">
                        {isItemAtOffice ? (
                          <button
                            onClick={() => {
                              adminDirectReunite(claim.itemId);
                              showFeedback('تم توثيق تسليم العهدة رسمياً للطالب وإغلاق البلاغ بالسجل الإداري 🎉');
                            }}
                            className="py-2 px-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            {language === 'en' ? 'Document Office Handover' : 'توثيق تسليم العهدة'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] font-medium bg-white dark:bg-[#182220] py-1.5 px-2.5 rounded-xl border border-[#E4E7E4] dark:border-[#2D3E3A]">
                            {language === 'en' ? 'Supervisory Oversight Active' : 'إشراف إداري (التحقق مع العاثر)'}
                          </span>
                        )}
                        <Link
                          href={`/items/${claim.itemId}`}
                          className="py-2 px-3 rounded-xl bg-white dark:bg-[#15201D] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold border border-[#E4E7E4] dark:border-[#2D3E3A] cursor-pointer"
                        >
                          {t('admin.preview')}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F1F3F0] dark:bg-[#1C2B27] rounded-2xl space-y-1 border border-transparent dark:border-[#2D3E3A]">
                <CheckCircle2 className="w-7 h-7 text-[#059669] dark:text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-[#18201D] dark:text-white">{t('admin.allUpdated')}</h4>
                <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">{t('admin.noPendingClaims')}</p>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-start">
            <div
              onClick={() => setActiveTab('inventory')}
              className="p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1.5 cursor-pointer hover:border-[#176B5B] dark:hover:border-emerald-500 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-emerald-400 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white">{t('admin.inventoryShortcut')}</h3>
              <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                {t('admin.inventoryShortcutDesc')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('activities')}
              className="p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-1.5 cursor-pointer hover:border-[#176B5B] dark:hover:border-emerald-500 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white">
                {language === 'en' ? 'Student Field Activities' : 'اعتماد المبادرات الميدانية'}
              </h3>
              <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                {language === 'en'
                  ? 'Review and officially certify student volunteering and integrity initiatives.'
                  : 'مراجعة واعتماد مبادرات الطلاب الميدانية وتوثيق نقاط النزاهة.'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: All Claims Management
      ======================================================== */}
      {activeTab === 'claims' && (
        <div className="space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between text-start px-1">
            <h2 className="text-xs sm:text-sm font-black text-[#18201D] dark:text-white">
              {t('admin.claimsHeading')}
            </h2>
            <span className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
              {t('admin.totalClaimsLabel')} {claims.length}
            </span>
          </div>

          {claims.length > 0 ? (
            <div className="space-y-3">
              {claims.map((claim) => {
                const item = items.find((i) => i.id === claim.itemId);
                const isPending = claim.status === 'pending';
                const isApproved = claim.status === 'approved';
                const isCompleted = claim.status === 'completed';

                return (
                  <div
                    key={claim.id}
                    className="p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-3 text-start"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-[#E4E7E4] dark:border-[#23332F] pb-2.5">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white">{item?.title}</h4>
                        <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                          الطالب: <strong className="text-[#18201D] dark:text-white">{claim.claimant.name}</strong> ({claim.claimant.grade})
                        </p>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            تم التسليم بنجاح
                          </span>
                        ) : isApproved ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F1ED] dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-emerald-300 border border-[#176B5B]/40">
                            اعتمدها العاثر · رمز PIN: {claim.handoverPin}
                          </span>
                        ) : item?.custody === 'at_office' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F1ED] dark:bg-[#176B5B]/30 text-[#176B5B] dark:text-emerald-300 border border-[#176B5B]/40">
                            أمانة بمكتب الإدارة 🏛️
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            قيد مراجعة العاثر ⏳
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] text-xs space-y-1 border border-transparent dark:border-[#2D3E3A]">
                      <div className="flex items-center justify-between text-[10px] text-[#66706B] dark:text-[#94A39D]">
                        <span>السؤال السري: «{item?.secretQuestion || 'العلامة المميزة'}»</span>
                        <span>
                          مكان الحيازة:{' '}
                          <strong className={item?.custody === 'at_office' ? 'text-[#176B5B] dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                            {item?.custody === 'at_office' ? 'مكتب الإدارة (غرفة العهدة)' : `مع العاثر (${item?.reportedBy?.name || 'طالب'})`}
                          </strong>
                        </span>
                      </div>
                      <p className="font-bold text-[#18201D] dark:text-white text-xs">إجابة الطالب: «{claim.answerText}»</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 w-full sm:w-auto justify-end">
                      {/* Supervisory Notice / Action */}
                      {item?.custody === 'at_office' && !isCompleted ? (
                        <button
                          onClick={() => {
                            adminDirectReunite(claim.itemId);
                            showFeedback('تم توثيق تسليم العهدة رسمياً للمالك وإغلاق البلاغ بالسجل الإداري 🎉');
                          }}
                          className="py-2 px-3.5 min-h-[40px] rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 text-center flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('admin.directReuniteBtn')}</span>
                        </button>
                      ) : !isCompleted && item?.custody !== 'at_office' ? (
                        <button
                          onClick={() => {
                            updateItemCustody(claim.itemId, 'at_office');
                            showFeedback('تم استلام الأمانة لعهدة مكتب الإدارة رسمياً 🏛️');
                          }}
                          className="py-2 px-3 min-h-[40px] rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#176B5B] dark:text-emerald-400 text-xs font-bold border border-transparent dark:border-[#2D3E3A] cursor-pointer flex items-center gap-1.5 transition-colors"
                          title="نقل الأمانة لعهدة مكتب الإدارة في حال حدوث خلاف بين الطلاب أو تعذر التواصل الميداني"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>استلام لغرفة العهدة بالمكتب</span>
                        </button>
                      ) : null}

                      <Link
                        href={`/items/${claim.itemId}`}
                        className="py-2 px-3 min-h-[40px] rounded-xl bg-white dark:bg-[#15201D] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-bold border border-[#E4E7E4] dark:border-[#2D3E3A] cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('admin.preview')}</span>
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-10 text-center space-y-2 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl">
              <FileCheck className="w-8 h-8 text-[#66706B] dark:text-[#94A39D] mx-auto" />
              <h3 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white">{t('admin.noClaimsFound')}</h3>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: Inventory Management
      ======================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-3.5 animate-in fade-in">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-[#66706B] dark:text-[#94A39D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.searchPlaceholder')}
                className="w-full py-2 pr-9 pl-4 rounded-xl bg-white dark:bg-[#182220] border border-[#E4E7E4] dark:border-[#2D3E3A] text-xs text-[#18201D] dark:text-white focus:outline-none focus:border-[#176B5B] shadow-2xs"
              />
            </div>

            <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-1 p-1 bg-[#F1F3F0] dark:bg-[#141C1A] rounded-xl w-full sm:w-auto text-center border border-transparent dark:border-[#23332F]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all' ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs' : 'text-[#66706B] dark:text-[#94A39D]'
                }`}
              >
                {language === 'en' ? 'All' : 'الكل'}
              </button>
              <button
                onClick={() => setStatusFilter('lost')}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'lost' ? 'bg-white dark:bg-[#1C2B27] text-[#D97706] dark:text-amber-400 shadow-2xs' : 'text-[#66706B] dark:text-[#94A39D]'
                }`}
              >
                {language === 'en' ? 'Lost' : 'مفقودات'}
              </button>
              <button
                onClick={() => setStatusFilter('at_office')}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'at_office' ? 'bg-white dark:bg-[#1C2B27] text-[#176B5B] dark:text-emerald-400 shadow-2xs' : 'text-[#66706B] dark:text-[#94A39D]'
                }`}
              >
                {language === 'en' ? 'In Custody' : 'بالأمانات'}
              </button>
              <button
                onClick={() => setStatusFilter('reunited')}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'reunited' ? 'bg-white dark:bg-[#1C2B27] text-[#059669] dark:text-emerald-400 shadow-2xs' : 'text-[#66706B] dark:text-[#94A39D]'
                }`}
              >
                {language === 'en' ? 'Reunited' : 'مستردة'}
              </button>
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white dark:bg-[#182220] border border-[#E4E7E4] dark:border-[#2D3E3A] text-xs font-semibold text-[#18201D] dark:text-white focus:outline-none focus:border-[#176B5B] w-full sm:w-auto shadow-2xs cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#182220] text-[#18201D] dark:text-white">{t('app.allLocations')}</option>
              {SCHOOL_LOCATIONS.map((rawLoc) => {
                const loc = getLocalizedLocation(rawLoc, language);
                return (
                  <option key={loc.id} value={loc.id} className="bg-white dark:bg-[#182220] text-[#18201D] dark:text-white">
                    {loc.name}
                  </option>
                );
              })}
            </select>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((rawItem) => {
                const item = getLocalizedItem(rawItem, language);
                const rawLoc = SCHOOL_LOCATIONS.find((l) => l.id === item.locationId);
                const loc = rawLoc ? getLocalizedLocation(rawLoc, language) : undefined;
                const isReunited = item.status === 'reunited';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-start"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-[#2D3E3A]">
                        <ItemVisual
                          category={item.category}
                          title={item.title}
                          imageUrl={item.imageUrl}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isReunited
                              ? 'bg-[#E0E7FF] dark:bg-indigo-950/80 text-[#3730A3] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : item.type === 'lost'
                              ? 'bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                              : 'bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}>
                            {isReunited ? t('status.reunited') : item.type === 'lost' ? t('status.lost') : t('status.found')}
                          </span>

                          {!isReunited && item.custody === 'at_office' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#18201D] dark:bg-[#1C2B27] text-white border border-transparent dark:border-[#2D3E3A]">
                              {language === 'en' ? '🏛️ At Admin Office' : '🏛️ في مكتب الإدارة'}
                            </span>
                          )}

                          <span className="text-[10px] text-[#66706B] dark:text-[#94A39D]">
                            {formatAppDate(item.date || item.createdAt)}
                          </span>
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white truncate">{item.title}</h3>
                        
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-[#66706B] dark:text-[#94A39D]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#176B5B] dark:text-emerald-400" />
                            {loc?.name}
                          </span>
                          <span>•</span>
                          <span>اللون: {item.color}</span>
                          <span>•</span>
                          <span>الطالب: <strong className="text-[#18201D] dark:text-white">{item.reportedBy?.name}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4E7E4] dark:border-[#23332F]">
                      {!isReunited && (
                        <button
                          onClick={() => {
                            adminDirectReunite(item.id);
                            showFeedback('تم توثيق تسليم (' + item.title + ') لصاحبه بنجاح 🎉');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('admin.handoverToOwner')}</span>
                        </button>
                      )}

                      {!isReunited && item.custody !== 'at_office' && item.type === 'found' && (
                        <button
                          onClick={() => {
                            updateItemCustody(item.id, 'at_office');
                            showFeedback('تم نقل الغرض إلى حيازة مكتب الأمانات 🏛️');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#176B5B] dark:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors border border-transparent dark:border-[#2D3E3A] cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{t('admin.takeToOffice')}</span>
                        </button>
                      )}

                      <Link
                        href={`/items/${item.id}`}
                        className="py-1.5 px-3 rounded-xl bg-[#F1F3F0] dark:bg-[#1C2B27] hover:bg-[#E4E7E4] dark:hover:bg-[#23332F] text-[#18201D] dark:text-white text-xs font-semibold flex items-center gap-1 border border-transparent dark:border-[#2D3E3A]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('admin.preview')}</span>
                      </Link>

                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف بلاغ (' + item.title + ')؟')) {
                            deleteItem(item.id);
                            showFeedback('تم حذف البلاغ بنجاح');
                          }
                        }}
                        className="p-2 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 text-[#E11D48] dark:text-rose-400 cursor-pointer"
                        title="حذف البلاغ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-10 text-center space-y-2 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl">
              <Inbox className="w-8 h-8 text-[#66706B] dark:text-[#94A39D] mx-auto" />
              <h3 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white">{t('admin.noMatchingItems')}</h3>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          TAB 4: Student Activities Review & Approval
      ======================================================== */}
      {activeTab === 'activities' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E7E4] dark:border-[#23332F] pb-3 text-start">
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#18201D] dark:text-white">
                {t('admin.pendingActivitiesTitle')}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#66706B] dark:text-[#94A39D]">
                {language === 'en' 
                  ? 'Official administrative oversight and certification of student field engagement and honesty initiatives.' 
                  : 'الإشراف والمراجعة والاعتماد الإداري الرسمي لمبادرات ومشاركات الطلاب التطوعية والميدانية.'}
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-[#F1F3F0] dark:bg-[#141C1A] p-1 rounded-xl overflow-x-auto scrollbar-none border border-transparent dark:border-[#23332F] shrink-0">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActivityStatusFilter(st)}
                  className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer min-h-[38px] flex items-center justify-center ${
                    activityStatusFilter === st
                      ? 'bg-white dark:bg-[#1C2B27] text-[#18201D] dark:text-white shadow-2xs font-black'
                      : 'text-[#66706B] dark:text-[#94A39D] hover:text-[#18201D] dark:hover:text-white'
                  }`}
                >
                  {st === 'all' && (language === 'en' ? `All (${activitySubmissions.length})` : `الكل (${activitySubmissions.length})`)}
                  {st === 'pending' && (language === 'en' ? `Pending (${pendingActivities.length})` : `بانتظار الاعتماد (${pendingActivities.length})`)}
                  {st === 'approved' && (language === 'en' ? 'Approved' : 'معتمد')}
                  {st === 'rejected' && (language === 'en' ? 'Rejected' : 'مرفوض')}
                </button>
              ))}
            </div>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="space-y-3.5">
              {filteredActivities.map((sub) => {
                const act = SCHOOL_ACTIVITIES.find((a) => a.id === sub.activityId);
                const localizedAct = act ? getLocalizedActivity(act, language) : null;
                const loc = sub.locationId ? SCHOOL_LOCATIONS.find((l) => l.id === sub.locationId) : null;
                const localizedLoc = loc ? getLocalizedLocation(loc, language) : null;

                const categoryLabels: Record<string, { ar: string; en: string; color: string }> = {
                  volunteer: { 
                    ar: 'تطوع مدرسي', 
                    en: 'Volunteering', 
                    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  },
                  integrity: { 
                    ar: 'نزاهة وأمانة', 
                    en: 'Integrity', 
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
                  },
                  environment: { 
                    ar: 'بيئة واستدامة', 
                    en: 'Environment', 
                    color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800' 
                  },
                  academic_support: { 
                    ar: 'دعم تعليمي', 
                    en: 'Academic Support', 
                    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
                  },
                };
                const catMeta = act?.category ? categoryLabels[act.category] : null;

                return (
                  <div
                    key={sub.id}
                    className="p-4 sm:p-5 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl shadow-xs space-y-3.5 text-start transition-all hover:border-[#CBD3CE] dark:hover:border-[#344C46]"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-[#E4E7E4] dark:border-[#23332F] pb-2.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {catMeta && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.color}`}>
                              {language === 'en' ? catMeta.en : catMeta.ar}
                            </span>
                          )}
                          <span className="text-[10px] text-[#66706B] dark:text-[#94A39D] flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {formatAppDate(sub.submittedAt)}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#18201D] dark:text-white">
                          {localizedAct?.title || sub.activityId}
                        </h4>
                        <p className="text-[11px] text-[#66706B] dark:text-[#94A39D]">
                          {language === 'en' ? 'Student:' : 'الطالب:'}{' '}
                          <strong className="text-[#18201D] dark:text-white">{sub.userName}</strong>
                          {sub.userGrade && <span className="ms-1">({sub.userGrade})</span>}
                          {localizedLoc && (
                            <span className="ms-2 inline-flex items-center gap-1 text-[10px] text-[#176B5B] dark:text-emerald-400 font-bold">
                              <MapPin className="w-3 h-3" />
                              {localizedLoc.name}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E6F1ED] dark:bg-[#176B5B]/20 text-[#176B5B] dark:text-emerald-400 border border-[#176B5B]/20 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#176B5B] dark:text-emerald-400" />
                          <span>{language === 'en' ? 'Field Initiative' : 'مبادرة ميدانية موثقة'}</span>
                        </span>
                        {sub.status === 'approved' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === 'en' ? 'Approved' : 'معتمد'}
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] dark:bg-rose-950/80 text-[#991B1B] dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {language === 'en' ? 'Rejected' : 'مرفوض'}
                          </span>
                        )}
                        {sub.status === 'pending' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/80 text-[#92400E] dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {language === 'en' ? 'Pending Review' : 'قيد المراجعة'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description / Notes Proof */}
                    {sub.notes && (
                      <div className="p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#182220] border border-[#E4E7E4] dark:border-[#263834] text-xs">
                        <span className="text-[10px] font-bold text-[#66706B] dark:text-[#94A39D] block mb-0.5">
                          {language === 'en' ? 'Student Report / Proof:' : 'تقرير وإثبات الطالب:'}
                        </span>
                        <p className="text-[#18201D] dark:text-white leading-relaxed font-medium">
                          {sub.notes}
                        </p>
                      </div>
                    )}

                    {/* Voice Recording Proof */}
                    {sub.audioBase64 && (
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-start">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{language === 'en' ? 'Student Voice Evidence 🎙️:' : 'التسجيل الصوتي لإثبات إنجاز الطالب 🎙️:'}</span>
                          </span>
                          {sub.audioDuration && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              {sub.audioDuration} {language === 'en' ? 'sec' : 'ثانية'}
                            </span>
                          )}
                        </div>
                        <audio controls src={sub.audioBase64} className="w-full h-9 rounded-xl outline-none" />
                      </div>
                    )}

                    {/* Action buttons if pending */}
                    {sub.status === 'pending' && (
                      <div className="flex items-center gap-2.5 pt-1 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            approveSchoolActivity(sub.id);
                            showFeedback(
                              language === 'en'
                                ? `Endorsed and certified initiative for student ${sub.userName} successfully`
                                : `تم الاعتماد والتوثيق الإداري لمبادرة الطالب (${sub.userName}) بنجاح`
                            );
                          }}
                          className="flex-1 sm:flex-initial py-2.5 px-4 min-h-[42px] rounded-xl bg-[#176B5B] dark:bg-[#2DD4BF] hover:bg-[#125648] dark:hover:bg-[#14B8A6] text-white dark:text-[#18201D] text-xs font-bold shadow-xs cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t('admin.approveActivityBtn')}</span>
                        </button>
                        <button
                          onClick={() => {
                            rejectSchoolActivity(sub.id);
                            showFeedback(
                              language === 'en'
                                ? `Rejected activity submission for ${sub.userName}`
                                : `تم رفض توثيق النشاط للطالب (${sub.userName})`
                            );
                          }}
                          className="py-2.5 px-4 min-h-[42px] rounded-xl bg-white dark:bg-[#15201D] hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 text-[#E11D48] dark:text-rose-400 text-xs font-bold border border-[#E4E7E4] dark:border-[#2D3E3A] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{t('admin.rejectBtn')}</span>
                        </button>
                      </div>
                    )}

                    {sub.status !== 'pending' && sub.reviewedBy && (
                      <div className="text-[10px] text-[#66706B] dark:text-[#94A39D] flex items-center gap-1 pt-0.5">
                        <span>{language === 'en' ? 'Reviewed by:' : 'تمت المراجعة بواسطة:'}</span>
                        <strong className="text-[#18201D] dark:text-white">{sub.reviewedBy}</strong>
                        {sub.reviewedAt && <span>• {formatAppDate(sub.reviewedAt)}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-10 text-center space-y-2 bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] rounded-2xl">
              <Award className="w-8 h-8 text-[#66706B] dark:text-[#94A39D] mx-auto" />
              <h3 className="text-xs sm:text-sm font-bold text-[#18201D] dark:text-white">
                {t('admin.noPendingActivities')}
              </h3>
            </div>
          )}

        </div>
      )}



      {/* ========================================================
          TAB 7: School Behavioral Impact (ISEF BEHA)
      ======================================================== */}
      {activeTab === 'behavioral' && (
        <BehavioralImpactTab />
      )}

    </div>
  );
}
