# FTHS Upwork Pricing Calculator

A free public calculator by First Tech Hub Solutions, built with Next.js, TypeScript and locally hosted brand assets.

## Features
- Upwork contract fee breakdown.
- Editable freelancer service fee (15% default; Upwork says rates can range from 0% to 15% depending on contract).
- Editable Nigeria VAT on service fee (7.5% default).
- Editable withdrawal fee ($2.99 USD default based on the supplied transaction screenshot).
- Reverse pricing from desired take-home amount.
- Hourly rate and fixed-price project calculators.
- Currency selection: USD, GBP, EUR, CAD, AUD and NGN.
- PDF export and copyable calculation summary.
- Educational explanations linked to official Upwork Help articles.
- Responsive FTHS-inspired design.
- No account, database or server-side storage required.

## Important currency behaviour
The currency selector changes the currency denomination and formatting of all entered values and results. It does **not** fetch live foreign-exchange rates or convert amounts between currencies. All input amounts, including the withdrawal fee, must be entered in the selected currency. The USD $2.99 default is only prefilled for USD; switching to another currency resets the withdrawal fee to zero so a USD amount is never silently treated as GBP, EUR, CAD, AUD or NGN.

## Fee assumptions
- Freelancer service fee: 15% default, editable. Upwork currently describes a 0%–15% per-contract range.
- Nigeria VAT: 7.5% default, calculated on the service fee. Change it to match the user's tax residence and actual transaction.
- Withdrawal fee: $2.99 default based on the supplied Upwork transaction screenshot. It is not universal and varies by withdrawal method. Users must check their own Upwork withdrawal settings and transaction statement.

## Official references
- Freelancer Service Fee: https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee
- Nigeria VAT for freelancers: https://support.upwork.com/hc/en-us/articles/15156139408147-How-VAT-works-for-freelancers-in-Nigeria
- Getting paid and withdrawal methods: https://support.upwork.com/hc/en-us/articles/211060918-How-to-get-paid-on-Upwork

## Run locally
Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy
Push the repository to GitHub and import it into Vercel as a Next.js project. No environment variables are required.

## Brand assets
- `public/logo/fths-mark.png`
- `public/fonts/bricolage-grotesque.woff`
- `public/fonts/instrument-sans.woff`
- `public/fonts/instrument-sans-italic.woff`
- Font licence files are included in `public/fonts/`.
