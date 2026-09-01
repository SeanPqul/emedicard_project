# eMediCard

A digital health card management system for municipal health departments. Streamlines health permit applications, document verification, payment processing, orientation tracking, and digital QR health card issuance.

---

## Repository Structure

```text
.
├── apps/
│   ├── mobile/       # React Native (Expo SDK 54) mobile app for applicants
│   └── webadmin/     # Next.js 15 admin dashboard for inspectors & admins
└── backend/          # Backend services & database
    ├── convex/       # Convex real-time functions, schema, & storage
    └── ocr-service/  # Tesseract.js microservice for document OCR
```

---

## Tech Stack

* **Monorepo Orchestration**: [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) Workspaces
* **Mobile App**: React Native (0.81), Expo (SDK 54), Expo Router, FSD Architecture
* **Web Admin**: Next.js 15 (App Router), React 19, Tailwind CSS v4
* **Backend Platform**: [Convex](https://www.convex.dev/) (Serverless real-time database & storage)
* **Authentication**: [Clerk](https://clerk.com/) (Role-based access control)
* **Payments**: Maya Gateway Integration

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Copy the example environment files for each service:

```bash
cp backend/.env.example backend/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/webadmin/.env.example apps/webadmin/.env.local
```

### 3. Development

Start all services (mobile, webadmin, convex backend) concurrently:

```bash
pnpm dev
```

Or run individual services:

```bash
pnpm dev --filter=mobile    # Expo dev client
pnpm dev --filter=webadmin  # Next.js dev server
pnpm dev --filter=backend   # Convex dev server
```

---
