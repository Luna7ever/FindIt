'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { 
  Home, 
  Compass, 
  PlusCircle, 
  Package, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  ChevronDown, 
  QrCode,
  LayoutDashboard,
  Users2,
  Lock,
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import QRModal from '@/components/QRModal';
import UserAvatar from '@/components/UserAvatar';
import { env } from '@/config/env';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUserById, switchUserRole, getClaimsForMyItems } = useApp();
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const isAdminUser = canAccessAdmin(currentUser);

  const pendingClaimsCount = getClaimsForMyItems().filter(
    (c) => c.claim.status === 'pending'
  ).length;

  const isHome = pathname === '/';
  const isExplore = pathname === '/explore';
  const isReport = pathname === '/report';
  const isMyItems = pathname === '/my-items' || pathname === '/profile';
  const isMoralBank = pathname.startsWith('/moral-bank');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col md:flex-row text-[#18201D]">
      
      {/* ========================================================
          DESKTOP SIDEBAR RAIL
      ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-l border-[#E4E7E4] bg-white h-screen sticky top-0 px-4 py-6 shrink-0 z-30 select-none">
        
        {/* Brand & Main Navigation */}
        <div className="space-y-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#176B5B] flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-[#18201D] leading-none">
                  FindIt
                </span>
                {isAdminUser && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#18201D] text-white text-[9px] font-bold">
                    إدارة
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#66706B] font-medium mt-0.5 block">
                مفقودات المدرسة
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                isHome
                  ? 'bg-[#E6F1ED] text-[#176B5B]'
                  : 'text-[#66706B] hover:text-[#18201D] hover:bg-[#F1F3F0]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Link>

            <Link
              href="/explore"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                isExplore
                  ? 'bg-[#E6F1ED] text-[#176B5B]'
                  : 'text-[#66706B] hover:text-[#18201D] hover:bg-[#F1F3F0]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>استكشاف</span>
            </Link>

            <Link
              href="/report"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                isReport
                  ? 'bg-[#176B5B] text-white shadow-xs'
                  : 'text-[#66706B] hover:text-[#18201D] hover:bg-[#F1F3F0]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل بلاغ</span>
            </Link>

            <Link
              href="/my-items"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                isMyItems
                  ? 'bg-[#E6F1ED] text-[#176B5B]'
                  : 'text-[#66706B] hover:text-[#18201D] hover:bg-[#F1F3F0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>أغراضي</span>
              </div>
              {pendingClaimsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-bold">
                  {pendingClaimsCount}
                </span>
              )}
            </Link>

            {/* Admin link only for Admin user */}
            {isAdminUser && (
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isAdmin
                    ? 'bg-[#18201D] text-white font-bold shadow-xs'
                    : 'text-[#18201D] hover:bg-[#F1F3F0]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#176B5B]" />
                <span>لوحة الإشراف (Admin)</span>
              </Link>
            )}
          </nav>

        </div>

        {/* Bottom Sidebar: Account Info & Switcher */}
        <div className="space-y-3 pt-4 border-t border-[#E4E7E4]">
          
          {/* Quick QR Generator Trigger */}
          <button
            onClick={() => setShowQRModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#66706B] hover:text-[#18201D] hover:bg-[#F1F3F0] transition-colors text-right"
          >
            <QrCode className="w-4 h-4 text-[#176B5B]" />
            <span>ملصقات QR المدرسية</span>
          </button>

          {/* User Profile Card / Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
              className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-[#F1F3F0] transition-colors text-right border border-[#E4E7E4] bg-white"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar
                  size="md"
                  name={currentUser.name}
                  role={currentUser.role}
                  avatarUrl={currentUser.avatar}
                  showBadge={isAdminUser}
                />
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-xs text-[#18201D] truncate leading-tight">
                      {currentUser.name}
                    </p>
                    {isAdminUser ? (
                      <span className="px-1.5 py-0.2 rounded-sm bg-[#18201D] text-white text-[8px] font-bold">
                        إدارة
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-sm bg-[#E6F1ED] text-[#176B5B] text-[8px] font-bold">
                        طالبة
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#66706B] truncate mt-0.5">
                    {currentUser.grade}
                  </p>
                </div>
              </div>
              {env.NEXT_PUBLIC_DEMO_MODE && <ChevronDown className="w-3.5 h-3.5 text-[#66706B] shrink-0" />}
            </button>

            {/* Demo Account Switcher Popover */}
            {showDemoSwitcher && env.NEXT_PUBLIC_DEMO_MODE && (
              <div
                className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl bg-white p-2.5 shadow-xl border border-[#E4E7E4] z-50 animate-in fade-in"
                onClick={() => setShowDemoSwitcher(false)}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#E4E7E4] mb-1.5">
                  <span className="text-[10px] font-bold text-[#66706B] uppercase">
                    تبديل حساب العرض (Demo):
                  </span>
                  <Users2 className="w-3 h-3 text-[#176B5B]" />
                </div>

                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUserById(u.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-[#E6F1ED] text-[#176B5B] font-bold'
                          : 'text-[#18201D] hover:bg-[#F1F3F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          size="sm"
                          name={u.name}
                          role={u.role}
                          avatarUrl={u.avatar}
                        />
                        <div>
                          <p className="font-bold text-xs">{u.name}</p>
                          <p className="text-[9px] text-[#66706B]">{u.role === 'admin' ? 'إدارة المدرسة' : 'طالبة'}</p>
                        </div>
                      </div>
                      {currentUser.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#176B5B]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </aside>

      {/* ========================================================
          MOBILE TOP APP BAR
      ======================================================== */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E7E4] px-4 h-14 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#176B5B] flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-base tracking-tight text-[#18201D]">
              FindIt
            </span>
            {isAdminUser && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#18201D] text-white text-[8px] font-bold">
                Admin
              </span>
            )}
          </div>
        </Link>

        {/* Quick Actions & Demo Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="p-1.5 rounded-lg text-[#66706B] hover:bg-[#F1F3F0]"
            title="نقاط QR"
          >
            <QrCode className="w-4 h-4 text-[#176B5B]" />
          </button>

          {/* Account Switcher Icon */}
          <button
            onClick={() => env.NEXT_PUBLIC_DEMO_MODE && setShowDemoSwitcher(!showDemoSwitcher)}
            className="flex items-center gap-1.5 p-0.5 rounded-full bg-[#F1F3F0] ring-1 ring-[#E4E7E4]"
          >
            <UserAvatar
              size="sm"
              name={currentUser.name}
              role={currentUser.role}
              avatarUrl={currentUser.avatar}
              showBadge={isAdminUser}
            />
          </button>
        </div>

        {/* Mobile Demo Switcher Popover */}
        {showDemoSwitcher && env.NEXT_PUBLIC_DEMO_MODE && (
          <div
            className="absolute top-14 left-4 w-60 rounded-2xl bg-white p-2.5 shadow-2xl border border-[#E4E7E4] z-50 animate-in fade-in"
            onClick={() => setShowDemoSwitcher(false)}
          >
            <span className="text-[10px] font-bold text-[#66706B] px-2 py-1 block border-b border-[#E4E7E4] mb-1">
              حساب العرض النشط:
            </span>
            <div className="space-y-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUserById(u.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs ${
                    currentUser.id === u.id
                      ? 'bg-[#E6F1ED] text-[#176B5B] font-bold'
                      : 'text-[#18201D] hover:bg-[#F1F3F0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      size="sm"
                      name={u.name}
                      role={u.role}
                      avatarUrl={u.avatar}
                    />
                    <div>
                      <p className="font-bold text-xs">{u.name}</p>
                      <p className="text-[9px] text-[#66706B]">{u.role === 'admin' ? 'إدارة المدرسة' : 'طالبة'}</p>
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#176B5B]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      </header>

      {/* ========================================================
          MAIN WORKSPACE CONTENT
      ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 safe-bottom-space">
        <div className="w-full max-w-5xl mx-auto flex-1">
          {children}
        </div>
      </main>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION
      ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E4E7E4] px-4 py-2 flex items-center justify-around">
        
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition-colors ${
            isHome ? 'text-[#176B5B] font-bold' : 'text-[#66706B]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </Link>

        {/* Explore */}
        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition-colors ${
            isExplore ? 'text-[#176B5B] font-bold' : 'text-[#66706B]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">استكشاف</span>
        </Link>

        {/* Report (Elevated Button) */}
        <Link
          href="/report"
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-[#176B5B] hover:bg-[#125648] text-white flex items-center justify-center shadow-md transition-transform active:scale-95">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#176B5B] mt-0.5">إبلاغ</span>
        </Link>

        {/* My Items */}
        <Link
          href="/my-items"
          className={`relative flex flex-col items-center gap-1 min-w-[50px] py-1 transition-colors ${
            isMyItems ? 'text-[#176B5B] font-bold' : 'text-[#66706B]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">أغراضي</span>
          {pendingClaimsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#E11D48]" />
          )}
        </Link>

        {/* Admin icon only if Admin user */}
        {isAdminUser && (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition-colors ${
              isAdmin ? 'text-[#18201D] font-bold' : 'text-[#66706B]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">الإدارة</span>
          </Link>
        )}

      </nav>

      {/* QR Modal */}
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />

    </div>
  );
}
