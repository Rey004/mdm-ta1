# Inventory Management System (Full-Stack CRUD Application)

A modern, responsive full-stack **Inventory Management System** web application designed to track products, manage stock levels, and alert on low-stock items.

---

## 🛠️ Technology Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router, React 19) + [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Backend Server:** [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) REST API
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/) *(with resilient auto-fallback)*
- **Data Communication:** HTTP RESTful JSON exchange using JavaScript Fetch API

---

## ✨ Features & Implemented Objectives

1. **Product Management (CRUD - Create, Read, Update, Delete):**
   - **Product Details:** Tracks Product ID, Product Name, Category, Stock Quantity, and Unit Price.
   - **Add Product:** Form with non-negative validation for quantity and price.
   - **View / List Products:** Real-time table displaying inventory with auto-calculated total valuation.
   - **Inline Stock Adjustments:** Quick `+` and `-` buttons with real-time database updates.
   - **Edit & Delete:** Update product price/quantity and delete records with safe in-app confirmation modal.

2. **Dynamic Live Search & Filter (No Page Reload):**
   - Asynchronous search by **Product Name**, **Product ID**, or **Category** using Fetch API.
   - **Low-Stock Filter:** One-click filter to display items requiring restocking.

3. **Dynamic Low-Stock Alerts:**
   - Prominent alert status banner highlighting items with stock $\le 5$ units or depleted ($0$ units).

4. **Edge-Case Validation & Safeguards:**
   - **Negative Stock Underflow:** Server and client reject reducing stock below 0 (`HTTP 400 Bad Request`).
   - **Non-negative Values:** Validation prevents negative price or quantity values.
   - **Duplicate ID Guard:** Enforces unique Product IDs.
   - **Zero Results Empty State:** Clean user feedback when search finds no matching products.

5. **Demo Utilities:**
   - **Reset Sample Data:** 1-click button to reset catalog to 5 standard test products for demonstration.

---

## 📁 Project Structure

```
mdm-ta1/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection & fallback configuration
│   │   ├── controllers/
│   │   │   └── productController.js# Core CRUD & stock update logic
│   │   ├── models/
│   │   │   └── Product.js          # Mongoose schema for product entity
│   │   ├── routes/
│   │   │   └── productRoutes.js    # Express REST API endpoints
│   │   └── server.js               # Express app entry point
│   ├── .env.example                # Example environment variables
│   ├── package.json
│   └── test-api.js                 # Automated API test suite
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css         # Tailwind styling
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Main interactive dashboard UI
│   │   ├── lib/
│   │   │   └── api.ts              # Fetch API client
│   │   └── types/
│   │       └── inventory.ts        # TypeScript interfaces
│   ├── .env.local                  # Frontend environment configuration
│   └── package.json
│
├── demonstrate.md                  # Step-by-step viva presentation guide
├── package.json                    # Root scripts
├── README.md                       # Documentation
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas connection URI)

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start Express server (runs on http://localhost:5000)
npm run dev
```

> **Note:** Configure `backend/.env` with your MongoDB URI:
> ```env
> PORT=5000
> MONGODB_URI=mongodb://127.0.0.1:27017/inventory_db
> ```

### 3. Frontend Setup
```bash
# Navigate to frontend (in a second terminal)
cd frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all products (supports `?search=` and `?lowStock=true`) |
| `GET` | `/api/products/alerts/low-stock` | Get products with quantity $\le 5$ |
| `POST` | `/api/products` | Create a new product record |
| `PUT` | `/api/products/:id` | Update product details (price, quantity, name, category) |
| `PATCH` | `/api/products/:id/stock` | Adjust stock quantity or apply delta (`{ delta: +1 / -1 }`) |
| `DELETE` | `/api/products/:id` | Delete product record by ID |
| `POST` | `/api/products/seed` | Reset inventory to 5 standard test products |

---

## 🧪 Automated Testing

Run the automated test suite to verify all CRUD endpoints and edge cases:
```bash
node backend/test-api.js
```

---

## 🎓 Viva / Demonstration Guide

For a full step-by-step presentation script mapping to every academic objective with speaking points and viva Q&A, refer to **[`demonstrate.md`](./demonstrate.md)**.
