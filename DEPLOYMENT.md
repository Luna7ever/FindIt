# FindIt — Deployment & Release Guide

## 1. Live Production Deployment

- **Cloudflare Worker:** `findit`
- **Live URL:** [https://findit.findit-us.workers.dev](https://findit.findit-us.workers.dev)
- **Deployment Platform:** Cloudflare Workers (SSR + Static Edge Assets)
- **Runtime:** `nodejs_compat`

---

## 2. Local Commands

### Standard Next.js Development
```bash
npm run dev
```

### Production Test Suite
```bash
npm test
```

### Standard Next.js Production Build
```bash
npm run build
```

### Cloudflare vinext Development
```bash
npm run dev:vinext
```

### Cloudflare vinext Build
```bash
npm run build:vinext
```

### Cloudflare Workers Deployment
```bash
npx wrangler deploy
```

---

## 3. Firebase Deployment

To deploy security rules and compound indexes to Firebase:
```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

---

## 4. Environment Variables

Configure these variables in your deployment environment (e.g. Cloudflare Worker Variables / GitHub Actions / Vercel):

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Production application base URL | `https://findit.findit-us.workers.dev` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` enables presentation demo identities (Malak & Moshira); `false` enforces Firebase Auth | `true` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | (Optional in demo mode) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | (Optional in demo mode) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | (Optional in demo mode) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket | (Optional in demo mode) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | (Optional in demo mode) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | (Optional in demo mode) |

---

## 5. Security & RBAC Isolation

- **Student Identity:** ملك محمد فروق (`role: student`)
  - Can search, browse, submit lost/found reports, and claim matched items.
  - Blocked from `/admin` and cannot execute moderation actions.
- **Admin Identity:** م. مشيرة (`role: admin`)
  - Can access `/admin`, approve/reject claims, verify PIN handovers, and manage school custody.
- **Data Privacy:** Verification answers (`secretAnswer`) are automatically sanitized and stripped from public views via `sanitizeItemForViewer`.
- **PIN Rate Limiting:** Maximum 5 failed attempts per claim to protect against brute-force verification.
