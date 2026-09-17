'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  Sparkles, 
  Search, 
  KeyRound, 
  CheckCheck,
  Award
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NotificationItem, NotificationType } from '@/types';
import { getLocalizedNotification } from '@/lib/i18n/seedDataTranslations';

export default function NotificationCenter() {
  const router = useRouter();
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    language,
    dir
  } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    setIsOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'claim':
        return <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'points':
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'integrity':
        return <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const isRtl = dir === 'rtl';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2724] transition-colors focus:outline-none cursor-pointer"
        title={language === 'en' ? 'School Notifications' : 'التنبيهات المدرسية'}
        aria-label={language === 'en' ? 'Notifications' : 'التنبيهات'}
      >
        <Bell className="w-4 h-4" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#141C1A] animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white dark:bg-[#15201D] shadow-2xl border border-slate-200 dark:border-[#263834] z-50 overflow-hidden animate-in fade-in zoom-in-95 text-[#18201D] dark:text-[#F1F5F3]`}
          dir={dir}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#263834] bg-slate-50 dark:bg-[#182220] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#18201D] dark:text-white">
                {language === 'en' ? 'Notifications' : 'مركز التنبيهات'}
              </h3>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                  {unreadNotificationsCount} {language === 'en' ? 'new' : 'جديد'}
                </span>
              )}
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-[#176B5B] dark:text-[#2DD4BF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Mark all as read' : 'تحديد الكل كمقروء'}</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-[#263834] bg-white dark:bg-[#15201D] overflow-x-auto text-[11px] font-medium scrollbar-none">
            {[
              { id: 'all', label: language === 'en' ? 'All' : 'الكل' },
              { id: 'match', label: language === 'en' ? 'Matches' : 'مطابقات' },
              { id: 'claim', label: language === 'en' ? 'Claims' : 'تسليم' },
              { id: 'points', label: language === 'en' ? 'Points' : 'نقاط' },
              { id: 'integrity', label: language === 'en' ? 'Integrity' : 'نزاهة' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === f.id
                    ? 'bg-[#E6F1ED] dark:bg-[#122B25] text-[#176B5B] dark:text-[#2DD4BF] font-black border border-emerald-300 dark:border-[#2DD4BF]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2B27]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#23332F]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'en' ? 'No notifications right now' : 'لا توجد تنبيهات في هذا القسم حالياً'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((rawN) => {
                const n = getLocalizedNotification(rawN, language);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-start ${
                      !n.isRead
                        ? 'bg-emerald-50/40 dark:bg-[#122823]/50 hover:bg-emerald-50 dark:hover:bg-[#122823]/80'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1C2B27]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1C2B27] shrink-0 mt-0.5">
                      {getIconForType(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs truncate ${!n.isRead ? 'font-black text-[#18201D] dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
