# Weigh-Tech Food Prospect Hub (Next.js)

A Next.js App Router dashboard for Weigh-Tech Solutions' 450 Ontario food-industry prospects. It replaces the earlier plain-HTML/Node preview with a maintainable React application.

## Features

- Search by company, city, operation, contact role, email, or scale opportunity.
- Filter by city, prospect tier, usable email, confidence, and custom-outreach readiness.
- Open a full prospect record with contact routes, custom email, call opener, recommended first ask, and source links.
- Copy sales outreach and export the currently filtered list to CSV.
- Static `/api/prospects` endpoint backed by the normalized prospect dataset.
- WTS logo displayed from `/public/wts-logo.png` exactly as supplied.

## Run locally

Next.js requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

For production:

```bash
npm run build
npm start
```

## Project structure

```text
app/                 App Router page, layout, CSS, and API route
components/          Interactive React dashboard
data/prospects.json  450 normalized prospect records
lib/                 Types and data access helpers
public/              Original WTS logo
```

## Data endpoint

`GET /api/prospects` returns the complete normalized `FoodIndustryProspect` dataset. The route uses Next.js' App Router route-handler convention and is statically generated because the data is local and read-only.

## Refreshing data

The current records are copied from the supplied data set. When the source workbooks are updated, regenerate `data/prospects.json` using the original import script, then replace this file and restart the Next development server.
