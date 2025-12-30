# Nancy Teaches Mandarin

**Nancy Teaches Mandarin** is a comprehensive, interactive platform designed to make learning Mandarin Chinese accessible, engaging, and aesthetically pleasing. Built with a mobile-first approach, it guides students through the structured HSK (Hanyu Shuiping Kaoshi) curriculum, offering a curated learning experience that adapts to their progress.

Beyond standard lessons, the platform emphasizes a user-centric design with a soothing pastel color palette and modern glassmorphism UI/UX, ensuring a stress-free environment for language acquisition. Features include robust user progression tracking, multi-language interface support (English, Simplified & Traditional Chinese), and secure profile management. Whether you are a beginner starting with HSK 1 or advancing to higher levels, Nancy Teaches Mandarin provides the tools and structure needed to master the language.

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [SQLite](https://www.sqlite.org/) (via [Prisma](https://www.prisma.io/)) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (v5) |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) |

## ✨ Features

- **HSK Course Curriculum**: Structured learning paths for different HSK levels.
- **User Authentication**: Secure Login & Registration system.
- **User Profile Management**:
  - Update Display Name & Avatar.
  - Change Password with security checks.
  - Responsive Profile UI.
- **Multi-language Support**: Seamless switching between English, Simplified Chinese, and Traditional Chinese.
- **Responsive Design**: Mobile-first approach with a modern, glassmorphism-inspired UI.
- **Admin Dashboard**: (In Progress) Management interface for content and users.

## 🎨 Design System

- **Colors**: Pastel palette (Coral, Ivory, Soft Green) for a welcoming learning environment.
- **UI Components**: Glassmorphism cards, rounded buttons, and smooth transitions.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nancy-teaches-mandarin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   AUTH_SECRET="your-secret-key-at-least-32-chars" # Generate with `openssl rand -base64 32`
   ```

4. **Database Setup**
   Initialize the SQLite database and generate Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/       # Reusable React components
│   ├── auth/         # Login/Register forms
│   ├── hsk/          # HSK specific components
│   ├── layout/       # Header, Footer, Sidebar
│   ├── profile/      # User profile components
│   └── ui/           # Generic UI elements (Buttons, Cards)
├── lib/              # Utilities (Auth, Prisma, i18n)
├── types/            # TypeScript type definitions
└── ...
messages/             # i18n translation files (en.json, sc.json, tc.json)
prisma/               # Database schema and migrations
```
