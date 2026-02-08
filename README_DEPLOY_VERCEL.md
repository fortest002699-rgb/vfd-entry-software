Deployment to Vercel (step-by-step)

1) Install and login to Vercel CLI

```bash
npm install -g vercel
vercel login
```

2) From your project root (where `package.json` sits):

```bash
cd C:\Users\DAS\dts-frontend
# First interactive deploy (preview)
vercel
# When prompted: choose your account scope, accept defaults, root='.'

# To deploy production
vercel --prod
```

3) Add the Google service account JSON as an environment variable

- In the Vercel Dashboard → Projects → select your project → Settings → Environment Variables
- Create a variable:
  - Name: `SERVICE_ACCOUNT_JSON`
  - Value: (paste entire JSON from `backend/service-account.json`)
  - Environment: `Production` (and `Preview` if you want)

Or via CLI:

```bash
# interactive: it will ask for environment (production/preview)
vercel env add SERVICE_ACCOUNT_JSON production
# paste JSON when prompted
```

4) Redeploy production so the env var is available to functions

```bash
vercel --prod
```

5) Make site public (remove password if present)

- Dashboard → Project → Settings → Security/Protection → disable Password Protection
- Domains tab → ensure domain has no protection

6) Verify API endpoint (example):

```bash
curl -X POST https://<your-app>.vercel.app/api/sync-sheets \
  -H "Content-Type: application/json" \
  -d "{\"jobs\":[], \"sheetId\":\"13gxrOZycnC_WjHxJGSBqEu9p2Niry8PQuR7G9UITx60\"}"
```

7) Share your Google Sheet with the service account email (value of `client_email` in `backend/service-account.json`). Give Editor permission.

Notes
- The `api/` folder contains `sync-sheets.js` which will be deployed as a Vercel Serverless Function.
- I converted the function to CommonJS (`module.exports`) for compatibility.
- No code was deleted.
