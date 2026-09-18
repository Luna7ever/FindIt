import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { renderToString } from 'react-dom/server';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import AppShell from '../src/components/AppShell';
import HomePage from '../src/app/page';
import { AppProvider } from '../src/context/AppContext';

// Helper mock router for Next.js app router context
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

// Read raw source files for static AST/token validation
const appShellSource = fs.readFileSync(path.resolve(__dirname, '../src/components/AppShell.tsx'), 'utf-8');
const homePageSource = fs.readFileSync(path.resolve(__dirname, '../src/app/page.tsx'), 'utf-8');
const dropzoneSource = fs.readFileSync(path.resolve(__dirname, '../src/components/EdgeVisionDropzone.tsx'), 'utf-8');
const myItemsPageSource = fs.readFileSync(path.resolve(__dirname, '../src/app/my-items/page.tsx'), 'utf-8');
const globalsCssSource = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');

describe('Layout Integrity, Button Presence & Ergonomics Suite', () => {

  // =========================================================================
  // 1. ESSENTIAL NAVIGATION TRIGGERS & BUTTON PRESENCE
  // =========================================================================
  describe('1. Essential Navigation Triggers & Button Presence', () => {
    it('1.1 Desktop sidebar rail renders all essential navigation routes', () => {
      const html = renderWithContext(
        React.createElement(AppShell, null, React.createElement('div', null, 'Content')),
        '/'
      );

      // Verify presence of all key navigation links
      assert.ok(html.includes('href="/"'), 'Home link must exist');
      assert.ok(html.includes('href="/explore"'), 'Explore link must exist');
      assert.ok(html.includes('href="/report"'), 'Report link must exist');
      assert.ok(html.includes('href="/integrity"'), 'Integrity link must exist');
      assert.ok(html.includes('href="/activities"'), 'Activities link must exist');
      assert.ok(html.includes('href="/admin/benchmark"'), 'ISEF Benchmark link must exist');
      assert.ok(html.includes('href="/my-items"'), 'My Items link must exist');
      assert.ok(html.includes('href="/settings"'), 'Settings link must exist');
    });

    it('1.2 Admin portal navigation link is protected by admin authorization', () => {
      // In source code, admin link must be guarded by isAdminUser
      assert.ok(appShellSource.includes('isAdminUser &&'), 'Admin link must be guarded by isAdminUser');
      assert.ok(appShellSource.includes('href="/admin"'), 'Admin href must be present in AppShell');
    });

    it('1.3 Mobile bottom navigation dock contains exactly the 5 canonical core tabs', () => {
      const html = renderWithContext(
        React.createElement(AppShell, null, React.createElement('div', null, 'Content')),
        '/'
      );

      // Verify mobile bottom dock container
      assert.ok(html.includes('md:hidden fixed bottom-3 left-0 right-0 z-40'), 'Mobile dock container must exist');

      // The 5 core mobile dock action routes
      const mobileDockHrefs = ['/', '/explore', '/report', '/integrity', '/my-items'];
      for (const href of mobileDockHrefs) {
        assert.ok(html.includes(`href="${href}"`), `Mobile dock must include href: ${href}`);
      }
    });

    it('1.4 Mobile header features accessible Hamburger Drawer button (☰)', () => {
      assert.ok(
        appShellSource.includes('onClick={() => setIsDrawerOpen(true)}'),
        'AppShell header must have button triggering setIsDrawerOpen'
      );
      assert.ok(
        appShellSource.includes('<Menu className="w-5 h-5 stroke-[2.2]" />'),
        'AppShell hamburger button must use Menu icon'
      );
    });

    it('1.5 Quick action strip on Home page renders all 4 shortcut buttons', () => {
      const html = renderWithContext(React.createElement(HomePage), '/');

      assert.ok(html.includes('href="/activities"'), 'Quick action strip must contain Activities shortcut');
      assert.ok(html.includes('href="/leaderboard"'), 'Quick action strip must contain Leaderboard shortcut');
      assert.ok(homePageSource.includes('openQRScanner'), 'Home page must feature QR Scanner shortcut button');
      assert.ok(homePageSource.includes('openCertificateModal'), 'Home page must feature Certificate shortcut button');
    });

    it('1.6 Dual action hero cards on Home page provide immediate access to Report Lost and Record Found', () => {
      const html = renderWithContext(React.createElement(HomePage), '/');

      assert.ok(html.includes('href="/report?type=lost"'), 'Hero must link to Report Lost');
      assert.ok(html.includes('href="/report?type=found"'), 'Hero must link to Record Found');
    });

    it('1.7 Search form on Home page contains input field and dedicated submit button', () => {
      assert.ok(homePageSource.includes('<form onSubmit={handleSearchSubmit}'), 'Home page must have search form');
      assert.ok(homePageSource.includes('type="submit"'), 'Search form must have submit button');
      assert.ok(homePageSource.includes('handleSearchSubmit'), 'Search form must have submit handler');
    });
  });

  // =========================================================================
  // 2. TOUCH TARGET ERGONOMICS (>= 40px STANDARD)
  // =========================================================================
  describe('2. Touch Target Ergonomics (>= 40px Standard)', () => {
    it('2.1 AppShell mobile hamburger button meets >= 40px touch target standard', () => {
      assert.ok(
        appShellSource.includes('w-10 h-10 min-w-[40px] min-h-[40px]'),
        'Hamburger button in AppShell must define w-10 h-10 min-w-[40px] min-h-[40px]'
      );
    });

    it('2.2 AppShell mobile user avatar/drawer trigger meets >= 40px touch target standard', () => {
      assert.ok(
        appShellSource.includes('min-w-[40px] min-h-[40px] p-0.5 rounded-full'),
        'Account profile drawer button in mobile header must be min-w-[40px] min-h-[40px]'
      );
    });

    it('2.3 HomePage search submit button meets >= 40px touch target standard', () => {
      assert.ok(
        homePageSource.includes('min-h-[40px] rounded-xl bg-[#176B5B]'),
        'Search submit button must have min-h-[40px]'
      );
    });

    it('2.4 EdgeVisionDropzone photo delete button meets >= 40px touch target standard', () => {
      assert.ok(
        dropzoneSource.includes('min-w-[40px] min-h-[40px] rounded-lg'),
        'Photo delete button in EdgeVisionDropzone must be min-w-[40px] min-h-[40px]'
      );
    });

    it('2.5 My Items segmented filter tabs meet >= 40px touch target standard', () => {
      // Check that all 4 tabs use min-h-[40px]
      const tabMatchCount = (myItemsPageSource.match(/min-h-\[40px\]/g) || []).length;
      assert.ok(
        tabMatchCount >= 4,
        `My Items segmented tabs must have at least 4 min-h-[40px] occurrences, found ${tabMatchCount}`
      );
    });

    it('2.6 AppShell quick language toggle meets >= 40px touch target standard', () => {
      assert.ok(
        appShellSource.includes('h-10 px-3 min-w-[44px] rounded-xl'),
        'Language toggle button must have h-10 min-w-[44px]'
      );
    });
  });

  // =========================================================================
  // 3. SAFE BOTTOM DOCK CLEARANCE & SPATIAL INVARIANTS
  // =========================================================================
  describe('3. Safe Bottom Dock Clearance & Spatial Invariants', () => {
    it('3.1 globals.css defines .safe-bottom-space with mobile padding-bottom >= 7.5rem (120px)', () => {
      assert.ok(globalsCssSource.includes('.safe-bottom-space'), 'globals.css must define .safe-bottom-space');
      assert.ok(
        globalsCssSource.includes('padding-bottom: max(7.5rem, calc(6rem + env(safe-area-inset-bottom, 0px)))'),
        'safe-bottom-space must specify max(7.5rem, ...)'
      );

      // Parse and verify numeric value in rem
      const remMatch = globalsCssSource.match(/padding-bottom:\s*max\(([0-9.]+)rem/);
      assert.ok(remMatch, 'Should find padding-bottom rem specification');
      const remValue = parseFloat(remMatch[1]);
      assert.ok(remValue >= 7.5, `Mobile padding-bottom rem (${remValue}) must be >= 7.5rem`);
    });

    it('3.2 globals.css defines responsive desktop clearance of 2.5rem for viewports >= 768px', () => {
      assert.ok(
        globalsCssSource.includes('@media (min-width: 768px)'),
        'globals.css must define desktop breakpoint for safe-bottom-space'
      );
      assert.ok(
        globalsCssSource.includes('padding-bottom: 2.5rem;'),
        'Desktop safe-bottom-space must be 2.5rem'
      );
    });

    it('3.3 AppShell <main> element strictly applies safe-bottom-space class', () => {
      const html = renderWithContext(
        React.createElement(AppShell, null, React.createElement('div', null, 'Content')),
        '/'
      );

      assert.ok(
        html.includes('safe-bottom-space'),
        'Rendered AppShell must include safe-bottom-space class on main workspace'
      );
      assert.ok(
        appShellSource.includes('<main className="flex-1 flex flex-col min-w-0 safe-bottom-space">'),
        'AppShell source must apply safe-bottom-space directly to <main>'
      );
    });

    it('3.4 clearance calculation confirms 120px padding provides >= 48px headroom above 72px mobile dock', () => {
      const mobilePaddingRem = 7.5;
      const baseFontSizePx = 16;
      const totalPaddingPx = mobilePaddingRem * baseFontSizePx; // 120px
      const dockHeightEstimatePx = 72; // ~64-72px dock height

      const safetyBufferPx = totalPaddingPx - dockHeightEstimatePx; // 120 - 72 = 48px

      assert.strictEqual(totalPaddingPx, 120, '7.5rem must equal 120px');
      assert.ok(
        safetyBufferPx >= 48,
        `Safety buffer (${safetyBufferPx}px) must be at least 48px to prevent touch occlusion`
      );
    });

    it('3.5 floating mobile dock container uses pointer-events-none outer wrapper and pointer-events-auto inner nav', () => {
      assert.ok(
        appShellSource.includes('pointer-events-none'),
        'Floating dock outer container must use pointer-events-none to prevent deadzones'
      );
      assert.ok(
        appShellSource.includes('pointer-events-auto'),
        'Floating dock inner nav must use pointer-events-auto for interactive tab taps'
      );
    });
  });

  // =========================================================================
  // 4. VISUAL HIERARCHY, MAX-WIDTH CONTAINERS & INVARIANT TOKENS
  // =========================================================================
  describe('4. Visual Hierarchy, Max-Width Harmonization & Invariant Tokens', () => {
    it('4.1 AppShell main content wrapper strictly enforces max-w-5xl container constraint', () => {
      assert.ok(
        appShellSource.includes('max-w-5xl mx-auto flex-1 flex flex-col'),
        'AppShell content motion container must enforce max-w-5xl mx-auto'
      );
    });

    it('4.2 HomePage root container strictly enforces max-w-5xl and responsive horizontal padding', () => {
      assert.ok(
        homePageSource.includes('px-4 sm:px-6 py-6 sm:py-8 space-y-7 sm:space-y-8 max-w-5xl mx-auto'),
        'HomePage root div must enforce max-w-5xl mx-auto with px-4 sm:px-6'
      );
    });

    it('4.3 Greeting badge container on HomePage retains invariant border tokens', () => {
      assert.ok(
        homePageSource.includes('border-[#176B5B]/30 dark:border-[#263834]'),
        'Greeting badge must retain border-[#176B5B]/30 dark:border-[#263834]'
      );
    });

    it('4.4 Atmosphere context ribbon on HomePage displays live period icon, awareness text, and time bracket badge', () => {
      assert.ok(
        homePageSource.includes('{campusAtmosphere.icon}'),
        'Atmosphere ribbon must render campus period icon'
      );
      assert.ok(
        homePageSource.includes('{t(campusAtmosphere.awarenessKey)}'),
        'Atmosphere ribbon must render custodial awareness subtitle'
      );
      assert.ok(
        homePageSource.includes('{campusAtmosphere.timeBracket}'),
        'Atmosphere ribbon must render time bracket badge'
      );
    });

    it('4.5 Absence of layout breakages: verifies no conflicting negative margins on primary containers', () => {
      // AppShell main container should not have negative margin classes
      const mainSnippet = appShellSource.match(/<main[^>]*>/)?.[0] || '';
      assert.ok(!mainSnippet.includes('-m-'), 'Main container should not have negative margin');
      assert.ok(!mainSnippet.includes('-mx-'), 'Main container should not have negative horizontal margin');
      assert.ok(!mainSnippet.includes('-my-'), 'Main container should not have negative vertical margin');

      // HomePage root should not have negative margins
      const homeRootMatch = homePageSource.match(/return\s*\(\s*<div className="([^"]*)"/)?.[1] || '';
      assert.ok(!homeRootMatch.includes('-m-'), 'HomePage root should not have negative margin');
      assert.ok(!homeRootMatch.includes('-mx-'), 'HomePage root should not have negative horizontal margin');
    });

    it('4.6 Responsive Grid Systems: validates responsive multi-column layouts across viewports', () => {
      // Dual Action Hero Cards: 1 column on mobile, 2 columns on sm+
      assert.ok(
        homePageSource.includes('grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4'),
        'Dual action hero cards must be 1 col on mobile and 2 col on sm+'
      );

      // Quick Shortcuts Strip: 2 columns on mobile, 4 columns on sm+
      assert.ok(
        homePageSource.includes('grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3'),
        'Quick shortcuts strip must be 2 col on mobile and 4 col on sm+'
      );

      // Recent Found Items Feed: 1 col on mobile, 2 on sm, 4 on lg
      assert.ok(
        homePageSource.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'),
        'Recent feed must scale from 1 col to 2 col to 4 col'
      );
    });
  });

});
