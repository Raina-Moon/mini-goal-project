# 🚀 Mini Goal Tracker

## 📌 Project Overview
Mini Goal Tracker is a **fullstack project** where users can set short-time goals (e.g., reading for 10 minutes). If they switch apps or leave, they fail the session. Successful completions earn badges, which users can share.

- **Frontend:** Next.js (TypeScript, App Router)
- **Backend:** Express.js (Node.js, TypeScript)
- **Database:** PostgreSQL
- **State Management:** Zustand (or React hooks)
- **Authentication:** JWT

---

## 📂 Folder Structure
```
mini-goal-tracker/
│── backend/              # Express.js backend
│   ├── src/
│   │   ├── routes/       # API routes (goal.ts, auth.ts)
│   │   ├── db.ts         # PostgreSQL connection
│   │   ├── server.ts     # Express server
│   ├── .env              # Environment variables
│   ├── package.json      # Backend dependencies
│   ├── tsconfig.json     # TypeScript config
│── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js pages & layouts
│   │   ├── components/   # Reusable UI components
│   │   ├── utils/        # API functions
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   ├── tsconfig.json     # TypeScript config
│── .gitignore            # Ignore node_modules, .env
```

---

## 🛠️ Setup Instructions
### 1️⃣ Install Dependencies
Clone the repository and install dependencies:
```sh
git clone https://github.com/your-repo/mini-goal-tracker.git
cd mini-goal-tracker
```
#### **Backend**
```sh
cd backend
npm install
```
#### **Frontend**
```sh
cd ../frontend
npm install
```

### 2️⃣ Set Up Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
DB_USER=your_username
DB_HOST=localhost
DB_NAME=mini_goal_tracker
DB_PASS=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

### 3️⃣ Run the Project
#### **Start the Backend**
```sh
cd backend
npm run dev
```
#### **Start the Frontend**
```sh
cd ../frontend
npm run dev
```
Open **http://localhost:3000** in the browser.

---

## 📌 API Endpoints
### **User Authentication**
- `POST /api/auth/signup` → Register a new user
- `POST /api/auth/login` → Authenticate user & issue JWT

### **Goals Management**
- `POST /api/goals` → Create a new goal
- `GET /api/goals/:user_id` → Get user’s goals
- `PATCH /api/goals/:id` → Update goal status
- `DELETE /api/goals/:id` → Delete a goal

### **Badges & Sharing**
- `GET /api/badges` → Fetch earned badges
- `POST /api/share` → Share achievements

---

## 🎨 Frontend Features
✅ **Goal Form:** Users set up goals (title & duration)
✅ **Timer Lock:** Prevents switching apps until time ends
✅ **Goal Completion:** Tracks success/failure
✅ **Badges & Sharing:** Reward system for completed goals
✅ **Authentication:** Users can sign up & log in

---

## 🚀 Deployment
### **Backend (Railway/Render)**
1. Push backend to GitHub
2. Deploy on Railway/Render
3. Add environment variables

### **Frontend (Vercel)**
1. Push frontend to GitHub
2. Deploy on Vercel
3. Connect it to backend URL

---

## 🔥 Future Enhancements
- **Social Features:** Leaderboards, friend challenges
- **Real-time Tracking:** WebSockets for live goal updates
- **Mobile Support:** PWA for better mobile experience

---

## 💡 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

🚀 **Happy Coding!** 😊

