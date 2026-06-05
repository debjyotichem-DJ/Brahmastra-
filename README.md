# 🧪 D-Chemistry

The ultimate full-stack, monorepo online teaching platform designed for JEE, NEET, ISC, and ICSE students. Built for Debajyoti Haldar.

![D-Chemistry Banner](https://via.placeholder.com/1200x400/4ECDC4/FFFFFF?text=D-Chemistry+Platform)

## 🌟 Platform Features

### 🖥️ Next.js Web App (`apps/web`)
*   **Immersive Test Engine**: NTA-style full-screen UI with live timer, question palette, and KaTeX mathematical rendering.
*   **AI Chatbot**: Integrated Gemini 2.0 Flash AI tutor that understands context and can speak both English and Bengali.
*   **Video & PDF Viewer**: Custom HLS.js adaptive bitrate player with auto-progress tracking and secure PDF viewing.
*   **Interactive Dashboard**: Dynamic quote of the day, streak tracking, and course progress bars.
*   **Bilingual**: Full i18n support (English + Bengali) across the entire platform.

### 📱 React Native Mobile App (`apps/mobile`)
*   **Cross-Platform**: Built with Expo SDK 51 & Expo Router for seamless iOS and Android support.
*   **NativeWind UI**: Styled with Tailwind CSS for React Native, matching the web design system.
*   **Offline Ready**: Utilizes AsyncStorage and TanStack Query for robust caching.

### ⚙️ Node.js Backend (`packages/backend`)
*   **Secure API**: Express + TypeScript architecture with JWT, rate limiting, and Role-Based Access Control (RBAC).
*   **PostgreSQL & Prisma**: 23+ optimized database models covering everything from payments to test attempts.
*   **Integrations**: 
    *   **Payments**: Razorpay
    *   **Storage**: AWS S3 + Cloudinary
    *   **Live Class**: Agora
    *   **AI**: Google Gemini
    *   **Notifications**: Firebase Cloud Messaging (FCM)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v20+)
*   pnpm (v8+)
*   Docker (for local PostgreSQL database)

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   *   Copy `.env.example` to `.env` in the root directory.
   *   Fill in your actual database credentials, JWT secrets, and API keys.

3. **Start the Database (Docker):**
   ```bash
   cd packages/backend
   docker-compose up -d
   ```

4. **Initialize Prisma & Seed Database:**
   ```bash
   cd packages/backend
   npx prisma generate
   npx prisma db push
   pnpm run seed
   ```

### Running the Apps

You can run the entire platform concurrently from the root directory:

```bash
pnpm run dev
```

Or individually:
*   **Backend**: `pnpm --filter @d-chemistry/backend run dev` (Runs on `http://localhost:4000`)
*   **Web**: `pnpm --filter @d-chemistry/web run dev` (Runs on `http://localhost:3000`)
*   **Mobile**: `cd apps/mobile && npx expo start` (Opens Metro bundler)

---

## 🎨 Design System

The platform strictly follows the D-Chemistry brand guidelines:
*   **Primary**: Teal/Mint (`#4ECDC4`)
*   **Accent**: Amber (`#F5A623`)
*   **Dark**: Charcoal (`#2D3142`)
*   **Background**: Light Blue-Grey (`#F0F4F8`)
*   **Typography**: *Inter* (Sans) and *Syne* (Headings)

---

## 📜 License & Copyright

Designed and developed exclusively for Debajyoti Haldar's **D-Chemistry**. All rights reserved.
