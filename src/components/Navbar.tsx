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
  ChevronDown
} from 'lucide-react';
import QRModal from '@/components/QRModal';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUserById, getClaimsForMyItems } = useApp();
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
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col text-right">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  FindIt
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  أمانات المدرسة
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                الرئيسية
              </Link>
              <Link
                href="/report?type=lost"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/report'
                    ? 'bg-amber-50 text-amber-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                أضعت شيئاً
              </Link>
              <Link
                href="/report?type=found"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/report'
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                عثرت على شيء
              </Link>
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/admin'
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                لوحة المشرف
              </Link>
            </nav>
          </div>

          {/* Quick Actions & User Switcher */}
          <div className="flex items-center gap-3">
            {/* School QR Points Trigger */}
            <button
              onClick={() => setShowQRModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="ملصقات QR في مرافق المدرسة"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>نقاط QR المدرسية</span>
            </button>

            {/* Profile & Claims Link */}
            <Link
              href="/profile"
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              title="حسابي وبلاغاتي"
            >
              <User className="w-4 h-4" />
              {pendingClaimsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </Link>

            {/* Active User Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-xs text-right"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="hidden sm:inline font-semibold text-slate-800 text-xs">
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
                  className="absolute left-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      الحساب الحالي:
                    </span>
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setCurrentUserById(u.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-blue-50 text-blue-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.grade}</p>
                          </div>
                        </div>
                        {currentUser.id === u.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
              pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">الرئيسية</span>
          </Link>
          <Link
            href="/report?type=lost"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/report' ? 'text-amber-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="text-[10px]">أضعت</span>
          </Link>
          <Link
            href="/report?type=found"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/report' ? 'text-emerald-600 font-bold' : 'text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-[10px]">عثرت</span>
          </Link>
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
              pathname === '/admin' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">المشرف</span>
          </Link>
        </div>
      </header>

      {/* QR Modal */}
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}
