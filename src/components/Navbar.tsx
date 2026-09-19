'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Compass, 
  Search, 
  PlusCircle, 
  QrCode, 
  User, 
  ShieldCheck, 
  LayoutDashboard,
  CheckCircle2, 
  ChevronDown,
  Trophy,
  Camera,
  Sparkles,
  Award
} from 'lucide-react';
import QRModal from '@/components/QRModal';
import CameraQRScannerModal from '@/components/CameraQRScannerModal';
import IntegrityCertificateModal from '@/components/IntegrityCertificateModal';
import NotificationCenter from '@/components/NotificationCenter';
import ToastNotification from '@/components/ToastNotification';
import UserAvatar from '@/components/UserAvatar';

export default function Navbar() {
  const pathname = usePathname();
  const { 
    currentUser, 
    users, 
    setCurrentUserById, 
    getClaimsForMyItems,
    isQRScannerOpen,
    openQRScanner,
    closeQRScanner,
    isCertificateModalOpen,
    certificateUser,
    closeCertificateModal
  } = useApp();
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pendingClaimsCount = getClaimsForMyItems().filter(
    (c) => c.claim.status === 'pending'
  ).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full findit-header">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shadow-sm group-hover:bg-emerald-800 transition-colors">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col text-start">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  ETHOS
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  النزاهة والمشاركة المدرسية
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                الرئيسية
              </Link>
              <Link
                href="/explore"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/explore'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                استكشاف
              </Link>
              <Link
                href="/report?type=found"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/report'
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>تسجيل بلاغ</span>
              </Link>
              <Link
                href="/integrity"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/integrity'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>سفير النزاهة</span>
              </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/leaderboard'
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>لوحة الشرف</span>
              </Link>
              {currentUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    pathname === '/admin'
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  <span>لوحة المشرف</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Quick Actions & User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Camera QR Scanner Trigger */}
            <button
              onClick={openQRScanner}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all shadow-xs"
              title="مسح باركود المرفق بالكاميرا"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">مسح بالكاميرا</span>
            </button>

            {/* School Printable QR Trigger */}
            <button
              onClick={() => setShowQRModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="ملصقات QR لمرافق المدرسة"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>ملصقات QR</span>
            </button>

            {/* Real-time Notification Center */}
            <NotificationCenter />

            {/* Profile & Claims Link */}
            <Link
              href="/my-items"
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              title="أغراضي وطلبات الاسترداد"
            >
              <User className="w-4 h-4" />
              {pendingClaimsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* Active User Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-xs text-right"
              >
                <UserAvatar size="xs" name={currentUser.name} role={currentUser.role} />
                <span className="hidden sm:inline font-semibold text-slate-800 text-xs max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                {currentUser.isTrusted && (
                  <span title="طالب موثوق" className="flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute left-0 mt-2 w-60 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      تبديل الحساب التجريبي:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {currentUser.goodwillPoints || 0} نقطة
                    </span>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setCurrentUserById(u.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-emerald-50 text-emerald-950 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar size="xs" name={u.name} role={u.role} />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{u.grade}</p>
                          </div>
                        </div>
                        {currentUser.id === u.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-slate-200 bg-white/95 px-3 py-1.5 justify-around text-xs">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">الرئيسية</span>
          </Link>
          <Link
            href="/explore"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/explore' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="text-[10px]">استكشاف</span>
          </Link>
          <Link
            href="/report?type=found"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/report' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-[10px]">إبلاغ</span>
          </Link>
          <Link
            href="/leaderboard"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/leaderboard' ? 'text-amber-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[10px]">الشرف</span>
          </Link>
          <Link
            href="/integrity"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/integrity' ? 'text-teal-700 font-bold' : 'text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px]">النزاهة</span>
          </Link>
        </div>
      </header>

      {/* Global Modals & Toasts */}
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      <CameraQRScannerModal isOpen={isQRScannerOpen} onClose={closeQRScanner} />
      <IntegrityCertificateModal 
        isOpen={isCertificateModalOpen} 
        onClose={closeCertificateModal} 
        user={certificateUser} 
      />
      <ToastNotification />
    </>
  );
}
