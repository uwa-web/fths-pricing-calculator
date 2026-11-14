# FTHS Upwork Pricing Calculator

A free, client-side Upwork pricing calculator by First Tech Hub Solutions.

## Features
- Contract fee breakdown: service fee, Nigeria VAT on the service fee, withdrawal fee and estimated net payout.
- Reverse pricing: calculate a quote from a desired take-home amount.
- Hourly rate calculator based on monthly income goals and billable capacity.
- Fixed-price project estimate with a configurable buffer.
- Editable fee assumptions.
- Copyable calculation summaries.
- Responsive layout; no account, database or API required.

## Run locally
Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to GitHub and Vercel
1. Create a new GitHub repository, for example `fths-upwork-pricing-calculator`.
2. Extract this project and upload/commit all files to the repository root.
3. In Vercel, select **Add New → Project** and import the GitHub repository.
4. Keep the detected framework as Next.js. No environment variables are required.
5. Deploy.

Every push to the connected production branch will trigger a new Vercel deployment.

## Fee calculation assumptions
- Service fee: 15% default, editable.
- Nigeria VAT on service fee: 7.5% default, editable. VAT is calculated on the service fee, not on the full contract value.
- Withdrawal fee: $2.99 default, editable.
- Each deduction is rounded to two decimal places before the net payout is calculated.

These are configurable assumptions, not a guarantee of the fees charged on every Upwork contract or withdrawal. Users should verify their actual contract and withdrawal statements.

## Before public launch
- Confirm the fee assumptions and wording against current Upwork account statements and official documentation.
- Add the final FTHS logo and approved brand assets.
- Test the calculator with representative contract values, including small contracts and zero/negative edge cases.
- Add a custom domain in Vercel if desired.


## Brand assets
The header uses `public/fths-logo.png`, cropped from the supplied website screenshot. The theme colours are sampled from the supplied FTHS homepage screenshot: warm cream, deep brown and golden yellow. The exact website font family has not yet been confirmed; the current build uses an Inter/system sans-serif stack pending the official font name or font files.


## FTHS brand assets
Brand assets are kept in dedicated folders under `public/`:
- `public/logo/fths-logo.png`
- `public/fonts/bricolage-grotesque.woff`
- `public/fonts/instrument-sans.woff`
- `public/fonts/instrument-sans-italic.woff`

Fonts are self-hosted by the application. No Google Fonts request is needed.
