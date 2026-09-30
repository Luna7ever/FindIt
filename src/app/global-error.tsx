'use client';

import React from 'react';

/**
 * Root Global Error Boundary
 * Replaces the generic Next.js / Vinext unhandled crash screen with a
 * polished, localized, branded recovery experience that gracefully self-heals.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <html lang="ar" dir="rtl" translate="no" className="notranslate">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google" content="notranslate" />
        <title>ETHOS | منظومة النزاهة والمشاركة المدرسية</title>
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #F7F7F4;
            color: #18201D;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1rem;
            box-sizing: border-box;
          }
          .card {
            background: #ffffff;
            border-radius: 1.5rem;
            padding: 2rem 1.5rem;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
            border: 1px solid #E2E8F0;
          }
          .icon-box {
            width: 3.5rem;
            height: 3.5rem;
            margin: 0 auto 1.25rem;
            background: #FEF3C7;
            color: #D97706;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
          }
          h1 {
            font-size: 1.125rem;
            font-weight: 800;
            margin: 0 0 0.5rem;
            color: #1E293B;
          }
          p {
            font-size: 0.8125rem;
            color: #64748B;
            line-height: 1.5;
            margin: 0 0 1.5rem;
          }
          .btn-group {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
          }
          button {
            border: none;
            padding: 0.65rem 1.25rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn-primary {
            background-color: #176B5B;
            color: #ffffff;
          }
          .btn-primary:hover {
            background-color: #125648;
          }
          .btn-secondary {
            background-color: #F1F5F9;
            color: #475569;
          }
          .btn-secondary:hover {
            background-color: #E2E8F0;
          }
        ` }} />
      </head>
      <body>
        <div className="card">
          <div className="icon-box">🛡️</div>
          <h1>استعادة جلسة منظومة ETHOS</h1>
          <p>
            حدث تعارض مؤقت أثناء مزامنة واجهة المتصفح. انقر على الزر أدناه لتحديث الجلسة واستئناف العمل بشكل طبيعي.
          </p>
          <div className="btn-group">
            <button type="button" className="btn-primary" onClick={handleReload}>
              إعادة تحميل المنظومة ↻
            </button>
            <button type="button" className="btn-secondary" onClick={handleGoHome}>
              الرئيسية
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
