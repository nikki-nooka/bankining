# 🏦 Mini Pawn Broker Module (Bankining)

Welcome to the **Mini Pawn Broker Module**! This is a modern, high-performance web application designed to help pawn brokers manage loans, track payments, and maintain automated ledger entries seamlessly.

**Live Demo**: [https://bankining-319l.vercel.app/](https://bankining-319l.vercel.app/)

---

## ✨ Features

- **Dashboard & Search**: A vibrant, modern dashboard with a beautiful mesh-gradient background. Includes a powerful search bar to find loans instantly by ID or Customer Name.
- **Advanced Filtering**: Filter loans by Category (Jewelry, Electronics, Vehicles, etc.) or sort them by Date and Amount (High to Low, Low to High).
- **Loan Origination**: Create new loans with detailed parameters (Interest Rate, Gross/Net Weight, Estimated Value).
- **Payment Processing**: Record partial or full payments. The system automatically calculates interest versus principal allocation.
- **Automated Ledger**: Every loan disbursement and payment automatically generates dual-entry ledger records to track cash flow perfectly.
- **Professional IDs**: Clean, professional loan IDs (e.g., `ID: 0001`).

---

## 🛠 Tech Stack & Architecture

This application was built using cutting-edge, production-ready technologies:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) + React
- **Styling**: Vanilla CSS with modern aesthetics, glassmorphism, and dynamic animations.
- **Backend/API**: Next.js Server Actions (SSR)
- **Database**: [Supabase](https://supabase.com/) PostgreSQL (Serverless connection pooler)
- **ORM**: [Prisma 7](https://www.prisma.io/) with the native Node.js Postgres driver (`pg` + `@prisma/adapter-pg`)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🗄 Database Schema

The database utilizes three core models:

1. **Loan**: Tracks the customer, principal amount, interest rate, pledged item details (weights and category), and real-time remaining balance.
2. **Payment**: Records every individual payment made against a loan, breaking it down into Principal Paid and Interest Paid.
3. **LedgerEntry**: A double-entry accounting log that records debits and credits for Cash/Bank Accounts, Loan Accounts, and Interest Income.

---

## 🚀 Running Locally

To run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nikki-nooka/-Mini-Pawn-Broker-Module.git
   cd -Mini-Pawn-Broker-Module
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   POSTGRES_PRISMA_URL="postgres://[USER]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
   POSTGRES_URL_NON_POOLING="postgres://[USER]:[PASSWORD]@[HOST]:5432/postgres"
   ```

4. **Sync the Database Schema:**
   *(Use the direct connection to bypass the pooler when pushing the schema)*
   ```bash
   POSTGRES_PRISMA_URL=$POSTGRES_URL_NON_POOLING npx prisma db push --accept-data-loss
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app!

---

## 📦 Deployment (Vercel)

This app is optimized for serverless deployment on Vercel. 
- The `build` script in `package.json` intentionally skips `prisma db push` because Supabase's connection pooler does not support schema modifications during automated builds. 
- Ensure your Vercel Environment Variables are set specifically for the **Production** environment before deploying!

---

*Built for excellence in modern pawn broker management.*
