# Nancy Teaches Mandarin

**Nancy Teaches Mandarin** is a comprehensive, interactive platform designed to make learning Mandarin Chinese accessible, engaging, and aesthetically pleasing. Built with a mobile-first approach, it guides students through the structured HSK (Hanyu Shuiping Kaoshi) curriculum, offering a curated learning experience that adapts to their progress.

Beyond standard lessons, the platform emphasizes a user-centric design with a soothing pastel color palette and modern glassmorphism UI/UX, ensuring a stress-free environment for language acquisition. Features include robust user progression tracking, multi-language interface support (English, Simplified & Traditional Chinese), and secure profile management. Whether you are a beginner starting with HSK 1 or advancing to higher levels, Nancy Teaches Mandarin provides the tools and structure needed to master the language.

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [SQLite](https://www.sqlite.org/) (via [Prisma](https://www.prisma.io/)) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (v5) |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) |
| **PDF Rendering** | [react-pdf](https://github.com/wojtekmaj/react-pdf) |

## ✨ Features

### 课程管理 (Course Management)
- **HSK Course Curriculum**: Structured learning paths for HSK levels 1-6.
- **Lesson Content Types**:
  - 🎬 **Video**: YouTube video embedding with protected playback.
  - 🎧 **Audio**: Local MP3 file upload and in-page playback.
  - 📄 **Document**: Local PDF file upload with secure in-app reading.
- **Drag & Drop Reordering**: Admin can reorder lesson content with DnD.
- **Inline Editing**: Edit titles and descriptions directly in the lesson view.

### 文件上传 (File Upload)
- **Local File Upload**: Upload MP3 and PDF files directly from local device.
- **Auto Title Fill**: File name automatically fills the title field (without extension).
- **YouTube Title Fetch**: Auto-fetch video title from YouTube ID.

### PDF 阅读器 (PDF Reader)
- **Canvas Rendering**: PDF rendered directly on canvas (no download prompts).
- **Page Navigation**: Previous/Next page controls.
- **Zoom Controls**: Zoom in/out functionality.
- **Security**: Right-click disabled to prevent unauthorized downloads.

### 用户系统 (User System)
- **User Authentication**: Secure Login & Registration.
- **User Profile Management**:
  - Update Display Name & Avatar.
  - Change Password with security checks.
- **Role-based Access**: Admin can manage content; students view only.

### 国际化 (Internationalization)
- **Multi-language Support**: English, Simplified Chinese (简体), Traditional Chinese (繁體).
- **Seamless Switching**: Language toggle in navigation header.

## 🎨 Design System

- **Colors**: Pastel palette (Coral `#FF6B6B`, Ivory `#FFF8E7`, Background `#fffef5`)
- **UI Components**: Glassmorphism cards, rounded buttons, smooth transitions.
- **Mobile-first**: Responsive design optimized for mobile devices.

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
├── app/                    # Next.js App Router pages & API routes
│   ├── api/upload/         # File upload endpoint
│   └── [locale]/           # Internationalized routes
├── components/             # Reusable React components
│   ├── auth/               # Login/Register forms
│   ├── content/            # PdfViewer, ProtectedVideo, etc.
│   ├── hsk/                # HSK specific components
│   ├── layout/             # Header, Footer
│   ├── lesson/             # LessonContentItem
│   ├── profile/            # User profile components
│   └── ui/                 # Generic UI elements (Buttons, Cards)
├── lib/                    # Utilities (Auth, Prisma, i18n, actions)
└── ...
locales/                    # i18n translation files (en.json, sc.json, tc.json)
prisma/                     # Database schema
public/uploads/             # Uploaded files (audio/, docs/)
```

## 📝 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload` | POST | Upload MP3/PDF files |
| `/api/auth/*` | - | NextAuth authentication endpoints |

## 🔐 Admin Features

Access admin features by logging in with an admin account (role: `admin`):
- Add/Edit/Delete lessons
- Upload content (video, audio, documents)
- Reorder lesson content via drag & drop
- Edit lesson titles and descriptions inline
