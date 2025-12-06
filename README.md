# DevTinder 🔥

_A full-stack matchmaking and networking platform with real-time chat, payments, and email automation._

DevTinder is a production-style full-stack application inspired by modern social platforms. It is built to explore real-world engineering challenges such as authentication, scalable APIs, payments, background jobs, and real-time messaging.

This project focuses on writing clean, maintainable code while solving practical problems like deployment, session management, cross-origin communication, and event-driven flows.

---

## 🌐 Live Demo

Frontend: https://dev-tidner.netlify.app/feed
Backend API: https://dev-tinder-backend-r1ek.onrender.com

---

## 🛠 Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS + DaisyUI
- Redux Toolkit
- React Router
- Axios
- Socket.IO (client)

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- Stripe
- Nodemailer / Resend
- Node-Cron
- date-fns
- JWT + Secure Cookies

### Deployment

- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas
- Email Service: Resend
- Payments: Stripe

---

## ✨ Features

### Authentication & User Management

- Secure login/signup using cookie-based sessions
- Edit profile functionality
- Route protection based on auth state
- Logout with session invalidation

### Matching System

- Tinder-style swipe feature
- Send / accept / reject connection requests
- Mutual match logic
- Connections and request management views

### Premium Membership (Stripe Integration)

- Stripe Checkout workflow
- Webhook-based payment verification
- Tiered subscription model:
  - Free
  - Silver
  - Gold
- Feature-based access control
- Guards against invalid upgrades

### Real-Time Chat (Socket.IO)

- Private one-to-one messaging
- Room-based WebSocket communication
- Message persistence
- Chat UI with history loader
- Planned: restrict chat to only matched users

### Email Automation

- Welcome email on signup
- Login notifications
- Daily email summary of connection activity
- HTML email templates
- Timezone-aware timestamps

### UI Experience

- Toast notifications
- Responsive design
- Protected navigation
- Real-time UI updates

---

## 🧩 Architecture Overview

- Frontend and backend deployed independently
- Centralized state management with Redux Toolkit
- Cookie-based authentication across domains
- WebSocket rooms per user session
- Stripe handled fully server-side
- Cron jobs for scheduled jobs
- Environment isolation via `.env` configurations

---

## 🚀 Deployment Overview

This project was initially deployed using AWS EC2 and later migrated to free hosting services for easier maintenance and faster iteration.

### Current Setup

- Frontend hosted on Netlify
- Backend hosted on Render
- MongoDB through Atlas
- Email delivery using Resend
- Stripe in production mode

Deployment challenges solved:

- CORS handling
- Cross-origin cookie control
- Certificate-free HTTPS issues
- Secure environment variables
- Stateful backend processes
