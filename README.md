# School Stories — website + contact form (Vercel)

A static marketing site plus one serverless function that emails each booking
enquiry to **engage@schoolstories.com.au** using Resend.

The Resend API key lives **only** in Vercel's encrypted Environment Variables.
It is never committed to this repo and never sent to the browser.

```
.
├── index.html          ← the website (served at /)
├── logo-bubble.png     ← logo
├── image-slot.js       ← drag-to-fill photo helper
├── api/
│   └── contact.js      ← POST /api/contact → Resend (reads RESEND_API_KEY)
├── package.json
├── .env.example        ← shows the env-var NAME only
└── .gitignore
```

## Deploy in 5 steps

1. **Push to GitHub**
   ```bash
   cd vercel-deploy
   git init
   git add .
   git commit -m "School Stories site + contact form"
   git branch -M main
   git remote add origin https://github.com/<you>/school-stories.git
   git push -u origin main
   ```

2. **Import to Vercel** — at [vercel.com/new](https://vercel.com/new), pick the
   repo. No framework, no build command needed — Vercel serves `index.html`
   statically and `api/contact.js` as a function automatically.

3. **Add the secret** — in Vercel → Project → **Settings → Environment
   Variables**, add:
   - **Name:** `RESEND_API_KEY`
   - **Value:** your Resend key
   - Apply to Production (and Preview/Development if you want).

4. **Verify your sender domain in Resend** — in the Resend dashboard, add and
   verify **schoolstories.com.au** so mail can be sent from
   `engage@schoolstories.com.au`. For a quick test before DNS is set, change
   `FROM_ADDRESS` in `api/contact.js` to `onboarding@resend.dev`.

5. **Deploy.** Submitting the form now posts to `/api/contact`, which sends the
   email. The form shows a graceful error (with the direct email address) if
   anything fails.

## Routing & redirects (`vercel.json`)

Two redirects are configured:

- **`/contact-us`** → jumps straight to the contact form at the bottom of the
  page (redirects to `/#book`). Share `schoolstories.com.au/contact-us` and it
  lands the visitor right on the booking form.
- **`www` → apex** — `www.schoolstories.com.au/*` permanently redirects to
  `https://schoolstories.com.au/*` so there's one canonical domain.

For the www redirect to fire, add **both** domains to the project in Vercel →
Settings → Domains: add `schoolstories.com.au` (set as primary) and
`www.schoolstories.com.au`. Vercel + the `vercel.json` rule then send all `www`
traffic to the apex.

## Local testing (optional)

```bash
npm i -g vercel
vercel dev            # runs the site + function locally
# add RESEND_API_KEY to a local .env (gitignored) when prompted
```

## Security note

The key shared earlier in chat (`re_b8W2…`) is now exposed. **Rotate it** in the
Resend dashboard and use the new key as the Vercel environment variable above.
Never paste a real key into any file in this repo.
