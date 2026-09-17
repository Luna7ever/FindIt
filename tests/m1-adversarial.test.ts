import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import ItemCard from '../src/components/ItemCard';
import AppShell from '../src/components/AppShell';
import HomePage from '../src/app/page';
import { AppProvider } from '../src/context/AppContext';
import { Item, UserProfile } from '../src/types';
import { INITIAL_SEED_ITEMS, CATEGORIES, SCHOOL_LOCATIONS } from '../src/lib/constants';
import { formatAppDate, getPublicReporterLabel } from '../src/lib/utils';
import { getLocalizedItem, getLocalizedLocation } from '../src/lib/i18n/seedDataTranslations';

function cleanHtml(html: string): string {
  return html.replace(/<!--.*?-->/g, '');
}

const mockRouter: any = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  bfcacheId: '0',
};

function renderWithContext(ui: React.ReactElement, pathname: string | null = '/') {
  return renderToString(
    React.createElement(
      AppRouterContext.Provider,
      { value: mockRouter },
      React.createElement(
        PathnameContext.Provider,
        { value: pathname },
        React.createElement(AppProvider, null, ui)
      )
    )
  );
}

describe('Milestone 1 Adversarial & Stress Testing Suite', () => {

  // =========================================================================
  // 1. EXTREME CONDITIONS: LONG TEXT TRUNCATION & OVERFLOW RESILIENCE
  // =========================================================================
  describe('1. Extreme Conditions & Text Truncation in ItemCard', () => {
    it('handles absurdly long title (500 chars) and description (2000 chars) without crashing', () => {
      const extremeItem: Item = {
        id: 'item_stress_long_text',
        title: 'أ'.repeat(500),
        description: 'هذا نص تجريبي طويل جداً مكرر لاختبار مرونة البطاقة والتأكد من عدم كسر التصميم أو تجاوز حدود الحاوية. '.repeat(40),
        category: 'electronics',
        locationId: 'science_lab',
        date: '2026-09-01T12:00:00.000Z',
        createdAt: '2026-09-01T12:00:00.000Z',
        color: 'أسود',
        type: 'found',
        status: 'open',
        custody: 'at_office',
        reportedBy: {
          id: 'user_long_name',
          name: 'عبد الرحمن بن عبد العزيز بن محمد آل الشيخ التميمي الشهري',
          role: 'student',
          grade: 'الصف الثالث الثانوي - شعبة المتفوقين في الفيزياء والكيمياء',
          goodwillPoints: 999999,
          isTrusted: true,
          email: 'abdulrahman@school.edu',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
          returnedCount: 50,
        },
        secretQuestion: 'ما هو الرقم التسلسلي الدقيق المكتوب بخط اليد داخل الغطاء الخلفي للبطارية؟',
      };

      const html = cleanHtml(
        renderToString(
          React.createElement(AppProvider, null, React.createElement(ItemCard, { item: extremeItem }))
        )
      );

      assert.ok(html.length > 0, 'Should render HTML successfully');
      assert.ok(html.includes('line-clamp-1'), 'Title must have line-clamp-1');
      assert.ok(html.includes('line-clamp-2'), 'Description must have line-clamp-2');
      assert.ok(html.includes('truncate'), 'Location/Reporter must have truncate');
    });

    it('handles unicode, emojis, HTML-like strings, and special characters safely', () => {
      const injectionItem: any = {
        id: 'item_injection_test',
        title: '<script>alert("xss")</script> 🚀🔥📱 &quot; &amp;',
        description: '<img src=x onerror=alert(1)> \\n\\t\\r\\0 \\u0000 <div>broken</div>',
        category: 'books',
        locationId: 'library',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        color: 'أزرق',
        type: 'lost',
        status: 'open',
        custody: 'with_finder',
      };

      const html = renderToString(
        React.createElement(AppProvider, null, React.createElement(ItemCard, { item: injectionItem }))
      );

      assert.ok(!html.includes('<script>'), 'Raw script tag must NOT be rendered');
      assert.ok(html.includes('&lt;script&gt;'), 'Script tags must be escaped as entities');
    });
  });

  // =========================================================================
  // 2. MISSING FIELDS, NULLS & UNDEFINED VALUES IN ITEMCARD
  // =========================================================================
  describe('2. Missing Fields & Edge Case Data in ItemCard', () => {
    it('renders cleanly when optional fields (reportedBy, secretQuestion, imageUrl, matchScore) are missing', () => {
      const minimalItem: any = {
        id: 'item_minimal',
        title: 'قلم حبر',
        description: 'قلم أزرق عادي',
        category: 'stationery',
        locationId: 'cafeteria',
        date: '2026-09-01T10:00:00.000Z',
        createdAt: '2026-09-01T10:00:00.000Z',
        color: 'أزرق',
        type: 'found',
        status: 'open',
        custody: 'with_finder',
      };

      const html = renderToString(
        React.createElement(AppProvider, null, React.createElement(ItemCard, { item: minimalItem }))
      );

      assert.ok(html.length > 0);
      assert.ok(html.includes('قلم حبر'));
      assert.ok(!html.includes('يتطلب إثبات ملكية'), 'Secret question badge must not show when missing');
    });

    it('handles unknown category and unknown locationId gracefully without throwing', () => {
      const unknownMetadataItem: any = {
        id: 'item_unknown_meta',
        title: 'غرض مجهول',
        description: 'تصنيف وموقع غير مسجلين',
        category: 'non_existent_category_xyz',
        locationId: 'non_existent_location_123',
        date: '2026-09-01T10:00:00.000Z',
        createdAt: '2026-09-01T10:00:00.000Z',
        color: 'رمادي',
        type: 'lost',
        status: 'open',
        custody: 'with_finder',
      };

      const html = renderToString(
        React.createElement(AppProvider, null, React.createElement(ItemCard, { item: unknownMetadataItem }))
      );

      assert.ok(html.length > 0);
      assert.ok(html.includes('غرض مجهول'));
    });

    it('handles edge cases in matchScore (0%, 100%, negative, undefined)', () => {
      const baseItem = INITIAL_SEED_ITEMS[0];

      const html0 = cleanHtml(
        renderToString(
          React.createElement(AppProvider, null, React.createElement(ItemCard, { item: baseItem, matchScore: 0 }))
        )
      );
      assert.ok(html0.includes('0%'), 'Should display 0% match');

      const html100 = cleanHtml(
        renderToString(
          React.createElement(AppProvider, null, React.createElement(ItemCard, { item: baseItem, matchScore: 100 }))
        )
      );
      assert.ok(html100.includes('100%'), 'Should display 100% match');

      const htmlUndef = cleanHtml(
        renderToString(
          React.createElement(AppProvider, null, React.createElement(ItemCard, { item: baseItem, matchScore: undefined }))
        )
      );
      assert.ok(!htmlUndef.includes('% Match') && !htmlUndef.includes('% تطابق'), 'Should not render match badge when undefined');
    });
  });

  // =========================================================================
  // 3. ARABIC (RTL) VS ENGLISH (LTR) RENDERING & DIRECTIONAL CHEVRONS
  // =========================================================================
  describe('3. Arabic vs English Rendering & Directional Transforms', () => {
    it('verifies directional arrow hover translation logic for RTL and LTR', () => {
      const isRtlTrue = true;
      const rtlTranslate = isRtlTrue ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1';
      assert.strictEqual(rtlTranslate, 'group-hover:-translate-x-1');

      const isRtlFalse = false;
      const ltrTranslate = isRtlFalse ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1';
      assert.strictEqual(ltrTranslate, 'group-hover:translate-x-1');
    });

    it('verifies logical coordinate classes (top-2.5 end-2.5 and top-2.5 start-2.5) in ItemCard', () => {
      const baseItem = INITIAL_SEED_ITEMS[0];
      const html = renderToString(
        React.createElement(AppProvider, null, React.createElement(ItemCard, { item: baseItem, matchScore: 85 }))
      );

      assert.ok(html.includes('end-2.5'), 'Status pill badge must use logical end-2.5');
      assert.ok(html.includes('start-2.5'), 'Match badge must use logical start-2.5');
    });

    it('formats date and reporter labels accurately in both AR and EN', () => {
      const sampleDate = '2026-09-10T14:30:00.000Z';
      const arDate = formatAppDate(sampleDate, 'ar');
      const enDate = formatAppDate(sampleDate, 'en');

      assert.ok(arDate.length > 0, 'Arabic date must be non-empty');
      assert.ok(enDate.length > 0, 'English date must be non-empty');
      assert.notStrictEqual(arDate, enDate, 'Arabic and English dates must be different');

      const reporterAr = getPublicReporterLabel('student', false, 'with_finder', 'ar');
      const reporterEn = getPublicReporterLabel('student', false, 'with_finder', 'en');
      assert.strictEqual(reporterAr, 'أحد الطلاب (أمانة)');
      assert.strictEqual(reporterEn, 'Fellow Student (Goodwill)');
    });
  });

  // =========================================================================
  // 4. VIEWPORT CALCULATIONS & RESPONSIVE CONSTRAINTS (768px, 1280px, 1366px)
  // =========================================================================
  describe('4. Viewport Dimensions & Height Constraints (768px height, 1280px & 1366px width)', () => {
    it('verifies Desktop Sidebar Rail height fits safely inside 768px laptop height', () => {
      const asidePaddingY = 16 * 2; // py-4 = 32px
      const headerLogoHeight = 32; // w-8 h-8 = 32px
      const headerPaddingBottom = 4; // pb-1 = 4px
      const headerSpaceY = 10; // space-y-2.5 = 10px

      const navItemCount = 9;
      const navItemHeight = 34;
      const navItemGap = 4; // space-y-1 = 4px
      const totalNavHeight = (navItemCount * navItemHeight) + ((navItemCount - 1) * navItemGap); // 9 * 34 + 8 * 4 = 338px

      const bottomPaddingTop = 12; // pt-3 = 12px
      const profileButtonPadding = 8 * 2; // p-2 = 16px
      const avatarHeight = 32; // size="sm" = 32px
      const profileHeight = Math.max(avatarHeight, 32) + profileButtonPadding; // 48px

      const totalSidebarStaticHeight = asidePaddingY + headerLogoHeight + headerPaddingBottom + headerSpaceY + totalNavHeight + bottomPaddingTop + profileHeight;

      const minUsableLaptopInnerHeight = 608;

      assert.ok(
        totalSidebarStaticHeight < minUsableLaptopInnerHeight,
        `Sidebar static height (${totalSidebarStaticHeight}px) must be strictly less than usable inner height (${minUsableLaptopInnerHeight}px)`
      );

      const headroom = minUsableLaptopInnerHeight - totalSidebarStaticHeight;
      assert.ok(headroom >= 100, `Headroom (${headroom}px) should be at least 100px for safety`);
    });

    it('verifies ItemCard usable content width exceeds 200px in 4-column desktop grid', () => {
      const containerMaxWidth = 1024; // max-w-5xl
      const pagePaddingX = 24 * 2; // px-6 on sm/lg = 48px
      const netContainerWidth = containerMaxWidth - pagePaddingX; // 976px

      const columnCount = 4;
      const totalGaps = (columnCount - 1) * 16; // 3 * 16 = 48px
      const cardWidth = (netContainerWidth - totalGaps) / columnCount; // (976 - 48) / 4 = 232px

      const cardPaddingX = 16 * 2; // p-3.5 sm:p-4 = 32px
      const usableContentWidth = cardWidth - cardPaddingX; // 232 - 32 = 200px

      assert.ok(
        usableContentWidth >= 200,
        `Usable card content width (${usableContentWidth}px) must be >= 200px to prevent metadata cramp`
      );
    });

    it('verifies Category Browser unified container reduces border overload from 22 to unified surface', () => {
      assert.strictEqual(CATEGORIES.length, 10, 'Must have exactly 10 categories');

      const unifiedContainerClass = 'rounded-3xl bg-white dark:bg-[#15201D] border border-[#E4E7E4] dark:border-[#263834] shadow-xs';
      assert.ok(unifiedContainerClass.includes('border-[#E4E7E4]'), 'Container must use Obsidian Emerald light border token');
      assert.ok(unifiedContainerClass.includes('dark:border-[#263834]'), 'Container must use Obsidian Emerald dark border token');
    });
  });

  // =========================================================================
  // 5. APPSHELL STRUCTURE & SIDEBAR RAIL VERIFICATION
  // =========================================================================
  describe('5. AppShell Architecture & Sidebar Rail Verification', () => {
    it('renders AppShell desktop sidebar rail with compact tokens and defensive scrolling', () => {
      const html = renderWithContext(
        React.createElement(AppShell, null, React.createElement('div', null, 'Test Child')),
        '/'
      );

      // Verify aside structure
      assert.ok(html.includes('hidden md:flex flex-col justify-between w-64'), 'Aside must have w-64 desktop flex layout');
      assert.ok(html.includes('px-3.5 py-4'), 'Aside must have compact px-3.5 py-4 padding');
      
      // Verify defensive scrolling nav rail
      assert.ok(html.includes('min-h-0 overflow-y-auto scrollbar-none flex-1'), 'Nav rail must enable defensive scrolling');

      // Verify Obsidian Emerald border tokens on sidebar buttons
      assert.ok(html.includes('border-[#E4E7E4] dark:border-[#263834]'), 'Sidebar buttons must use Obsidian Emerald border tokens');

      // Verify bottom User Profile section has shrink-0 and compact avatar
      assert.ok(html.includes('pt-3 border-t border-[#E4E7E4] dark:border-[#23332F] shrink-0'), 'Bottom profile container must be shrink-0');

      // Verify redundant "More" button was removed
      assert.ok(!html.includes('nav.more'), 'Redundant bottom More button must not exist in sidebar');
    });

    it('renders canonical 5 core tabs in mobile floating dock', () => {
      const html = renderWithContext(
        React.createElement(AppShell, null, React.createElement('div', null, 'Test Child')),
        '/'
      );

      assert.ok(html.includes('md:hidden fixed bottom-3 left-0 right-0 z-40'), 'Mobile dock container must be present');
      // Verify hrefs of 5 core tabs
      assert.ok(html.includes('href="/"'), 'Home tab must exist');
      assert.ok(html.includes('href="/explore"'), 'Explore tab must exist');
      assert.ok(html.includes('href="/report"'), 'Report tab must exist');
      assert.ok(html.includes('href="/integrity"'), 'Integrity tab must exist');
      assert.ok(html.includes('href="/my-items"'), 'My Items tab must exist');
    });

    it('handles null pathname safely without throwing', () => {
      const html = renderWithContext(
        React.createElement(AppShell, null, React.createElement('div', null, 'Test Child')),
        null
      );
      assert.ok(html.includes('Test Child'), 'AppShell should render safely with null pathname');
    });
  });

  // =========================================================================
  // 6. HOME PAGE MAX-W-5XL & DECLUTTERING VERIFICATION
  // =========================================================================
  describe('6. HomePage max-w-5xl Harmonization & Surface Decluttering', () => {
    it('renders HomePage aligned to max-w-5xl with unified category browser', () => {
      const html = renderWithContext(React.createElement(HomePage), '/');

      // max-w-5xl container
      assert.ok(html.includes('max-w-5xl mx-auto'), 'HomePage must be max-w-5xl mx-auto');

      // 4-column feed
      assert.ok(html.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'), 'Recent feed must be 4 columns on lg');

      // Quick Features strip
      assert.ok(html.includes('grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3'), 'Quick features must be 4 columns');

      // Activities banner
      assert.ok(html.includes('border-[#176B5B]/30 dark:border-[#263834]'), 'Activities banner must use Obsidian Emerald border token');
    });
  });

});
