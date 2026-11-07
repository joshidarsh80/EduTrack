# EduTrack – Full-Stack Learning Management System

EduTrack is a modern, production-oriented Full-Stack Learning Management System built for computer engineering education. It features interactive video learning with modular curricula, persistent progress tracking, role-based access control (Student and Instructor), course creation, and a course marketplace.

## 🚀 Key Features

- **Authentication System**: Real Firebase Authentication supporting Email/Password, Google Sign-in, persistent sessions, password reset, and user profile management.
- **Role-Based Access Control**:
  - **Student**: Enroll in free courses, stream video lessons, take notes, mark lessons completed, and track progress.
  - **Instructor**: Manage courses, author modules and lessons, embed YouTube videos, toggle publish/draft status, and monitor student enrollment metrics.
- **Zero-Trust Security**: Server-side Firestore security rules block unauthorized role elevation, prevent tampering with foreign courses, and isolate student records.
- **Interactive Video Player**: Embeds YouTube video lectures with automated progress tracking and sequential curriculum navigation.
- **Persistent Real-Time Progress**: Lesson completions are persisted directly in Cloud Firestore.
- **Modern Responsive Design**: Built with Tailwind CSS, clean white/slate aesthetic, deep forest-green accents, and responsive layout for mobile, tablet, and desktop.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Routing**: React Router DOM (v7)
- **Backend & Database**: Firebase Cloud Firestore
- **Authentication**: Firebase Auth (Email/Password & Google OAuth)
- **Deployment**: Vercel & GitHub Actions ready (includes `vercel.json` SPA rewrites)

---

## 📦 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/edutrack.git
   cd edutrack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` or verify `firebase-applet-config.json` exists in root:
   ```bash
   cp .env.example .env
   ```

4. **Start the local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run production build**:
   ```bash
   npm run build
   ```

---

## 🛡️ Administrative Setup: Promoting an Account to Instructor

In accordance with strict zero-trust database principles, users cannot grant themselves instructor permissions from the client. To promote any registered user to an Instructor:

1. Open the [Firebase Console](https://console.firebase.google.com).
2. Select your project and navigate to **Firestore Database**.
3. Open the **`users`** collection.
4. Select the document corresponding to the target user's **UID** (found on the user's Student Profile or via the Roles Guide button in the app).
5. Locate the `role` field (or click **Add field** with Field name: `role`, Type: `string`).
6. Set the Value to:
   ```
   instructor
   ```
7. Click **Save**. The user's role updates in real-time in the application without requiring a re-login.

---

## ☁️ Vercel Deployment

1. Push your repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import your repository.
3. Vercel automatically detects Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add the variables from `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_DATABASE_ID`
5. Click **Deploy**. Vercel will build the SPA, and `vercel.json` ensures direct URL routing functions seamlessly.
