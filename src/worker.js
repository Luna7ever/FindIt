import rscHandler from 'virtual:vinext-rsc-entry';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Forward env variables and D1 binding to global scope and process.env
    if (env) {
      globalThis.env = env;
      if (typeof process !== 'undefined' && process.env) {
        Object.assign(process.env, env);
      }
    }

    // 1. Try static assets for known static asset paths or file extensions
    if (env?.ASSETS && (url.pathname.startsWith('/_next/') || (url.pathname.includes('.') && !url.pathname.endsWith('.rsc')))) {
      try {
        const assetRes = await env.ASSETS.fetch(request.clone());
        if (assetRes && assetRes.status < 400) {
          return assetRes;
        }
      } catch (e) {
        console.warn('Asset fetch warning:', e);
      }
    }

    // 2. Dispatch to Next.js App Router SSR Pipeline
    try {
      const response = await rscHandler(request, ctx || {});
      if (response instanceof Response) {
        if (response.headers.has('x-vinext-static-file') && env?.ASSETS) {
          const filePath = decodeURIComponent(response.headers.get('x-vinext-static-file') || url.pathname);
          const assetReq = new Request(new URL(filePath, request.url), request);
          const assetRes = await env.ASSETS.fetch(assetReq);
          if (assetRes && assetRes.status < 400) {
            return assetRes;
          }
        }
        return response;
      }
    } catch (err) {
      console.error('FindIt SSR Worker Error:', err);
      return new Response(`FindIt Server Error: ${err instanceof Error ? err.stack || err.message : String(err)}`, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    // 3. Fallback to ASSETS
    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
