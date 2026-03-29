# 🌸 Kalawati Marriage Lawn — Full Stack MERN Project

A complete **Admin-controlled Marriage Hall booking website** built with the MERN stack.

---

## 📁 Project Structure

```
kalawati-marriage-lawn/
├── kalawati-backend/      ← Node.js + Express + MongoDB
└── kalawati-frontend/     ← React + Vite + Tailwind CSS
```

---

## 🚀 Quick Start

### Step 1 — Clone & Setup Backend

```bash
cd kalawati-backend
npm install
cp .env.example .env
```

Fill in your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kalawati
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Kalawati Marriage Lawn <your_email@gmail.com>

CLIENT_URL=http://localhost:5173
```

### Step 2 — Seed the Database

```bash
# Creates admin user + default packages + content + testimonials
npm run seed
```

**Admin credentials after seed:**
- Email: `admin@kalawati.com`
- Password: `admin@123`
- ⚠️ Change the password after first login!

### Step 3 — Start Backend

```bash
npm run dev     # Starts on http://localhost:5000
```

### Step 4 — Setup & Start Frontend

```bash
cd ../kalawati-frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

---

## 🌐 Pages & Routes

### Public Pages
| Route | Page |
|-------|------|
| `/` | Homepage (hero, gallery, packages, testimonials — all from DB) |
| `/gallery` | Gallery with category filters |
| `/booking` | Booking form |
| `/about` | About page |
| `/contact` | Contact page |
| `/login` | Login |
| `/register` | Register |

### User (Logged In)
| Route | Page |
|-------|------|
| `/dashboard` | My bookings, edit profile, change password |

### Admin Panel
| Route | Page |
|-------|------|
| `/admin` | Dashboard with stats |
| `/admin/bookings` | All bookings — approve / reject / complete |
| `/admin/gallery` | Upload / hide / delete gallery images |
| `/admin/content` | Edit hero, about, CTA sections + images |
| `/admin/packages` | Create / edit / delete packages |
| `/admin/testimonials` | Add / hide / delete testimonials |
| `/admin/users` | View / block / delete users |

---

## 🔑 API Endpoints

### Auth
```
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me              (Protected)
```

### Bookings
```
POST  /api/bookings             (User)
GET   /api/bookings/my          (User)
PATCH /api/bookings/:id/cancel  (User)
GET   /api/bookings/admin/all   (Admin)
GET   /api/bookings/admin/stats (Admin)
PATCH /api/bookings/admin/:id/status (Admin)
```

### Gallery
```
GET    /api/gallery              (Public)
GET    /api/gallery/admin/all    (Admin)
POST   /api/gallery/admin        (Admin — multipart)
PUT    /api/gallery/admin/:id    (Admin)
DELETE /api/gallery/admin/:id    (Admin)
```

### Packages
```
GET    /api/packages             (Public)
GET    /api/packages/admin/all   (Admin)
POST   /api/packages/admin       (Admin)
PUT    /api/packages/admin/:id   (Admin)
DELETE /api/packages/admin/:id   (Admin)
```

### Site Content (Homepage)
```
GET /api/content/home               (Public)
GET /api/content/testimonials       (Public)
GET /api/content/admin/all          (Admin)
PUT /api/content/admin/:section     (Admin — multipart)
POST/PUT/DELETE /api/content/admin/testimonials (Admin)
```

### Users
```
PUT    /api/users/profile            (User)
PUT    /api/users/change-password    (User)
GET    /api/users/admin/all          (Admin)
PATCH  /api/users/admin/:id/block    (Admin)
DELETE /api/users/admin/:id          (Admin)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS |
| State | React Query (server state), Context API (auth) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT, bcryptjs |
| File Upload | Multer + Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Frontend → Vercel, Backend → Render, DB → MongoDB Atlas |

---

## ☁️ Deployment

### Frontend (Vercel)
```bash
cd kalawati-frontend
npm run build
# Push to GitHub → Connect to Vercel → Done
```
Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend.onrender.com
```

Update `src/services/api.js` baseURL to use `import.meta.env.VITE_API_URL`.

### Backend (Render)
1. Push `kalawati-backend` to GitHub
2. Create Web Service on Render
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in Render dashboard

---

## 📧 Gmail App Password Setup

1. Go to Google Account → Security → 2-Step Verification → Enable
2. Go to App Passwords → Create password for "Mail"
3. Use that 16-character password as `EMAIL_PASS` in `.env`

---

## 📌 Important Notes

- **First admin** is created via `npm run seed:admin`
- **Homepage is fully dynamic** — admin can edit hero text, images, packages, testimonials from the dashboard
- **Gallery images** are stored on Cloudinary — no local storage needed
- **Booking email notifications** are sent to customers on booking + status change
- **JWT expires in 7 days** by default — configure in `.env`
