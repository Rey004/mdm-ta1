# 🎓 Project Demonstration Guide (For Viva / Lab Exam)

**Project Name:** Inventory Management System (Full-Stack CRUD Application)  
**Technology Stack:**  
- **Frontend:** Next.js (React) + Tailwind CSS  
- **Backend:** Node.js + Express REST API  
- **Database:** MongoDB (via Mongoose ODM)  

---

## ⚡ Quick 1-Minute Pre-Demo Check

Both servers should be running:
1. **Backend Server:** `http://localhost:5000` (Express + MongoDB)
2. **Frontend App:** Open your browser at **`http://localhost:3000`**

*(If you ever need to reset to clean test data before or during the demo, just click the **"Reset Sample Data"** button at the top right of the page!)*

---

## 📋 Step-by-Step Demonstration Script (Objective-by-Objective)

Follow this exact order to demonstrate every requirement clearly to Mam:

---

### Step 1: Introduction & Architecture Overview
**What to say to Mam:**
> *"Mam, this is an Inventory Management System designed as a full-stack web application. The frontend is built using Next.js and Tailwind CSS, communicating via HTTP JSON requests with a Node.js Express backend, which stores and queries data in a MongoDB database using Mongoose."*

---

### Step 2: View / List Products (Objective: Read)
**What to do:**
1. Point to the **Product Records Table** on the screen.
2. Show the initial products:
   - `101`: Dell Laptop (Electronics, Stock: 12, Price: $750)
   - `102`: Wireless Mouse (Electronics, Stock: 3, Price: $25)
   - `103`: Office Chair (Furniture, Stock: 8, Price: $120)
   - `104`: Spiral Notebook (Stationery, Stock: 4, Price: $5)
   - `105`: Gel Pen (Stationery, Stock: 0, Price: $10)

**What to say to Mam:**
> *"Mam, on page load, the frontend uses the JavaScript Fetch API to call `GET /api/products` on our Express backend. The backend retrieves the records from MongoDB and returns them as JSON, rendering all product details including Product ID, Name, Category, Stock Quantity, Price, and Total Valuation."*

---

### Step 3: Add a New Product (Objective: Create)
**What to do:**
1. Scroll to the **"Add New Product"** form at the top.
2. Enter the following test values:
   - **Product ID:** `106`
   - **Product Name:** `USB-C Hub`
   - **Category:** `Electronics`
   - **Quantity:** `15`
   - **Price:** `20.00`
3. Click the **"Add Product"** button.
4. Point to the table: `106 - USB-C Hub` immediately appears in the list!

**What to say to Mam:**
> *"Here, when I click 'Add Product', a `POST /api/products` request is sent with the JSON payload. The backend creates a new document in MongoDB and updates the list dynamically without refreshing the page."*

---

### Step 4: Input Validation (Objective: Non-negative Quantity & Price)
**What to do to demonstrate edge-case validation:**
1. In the **"Add New Product"** form, enter:
   - **Product ID:** `107`
   - **Product Name:** `Test Item`
   - **Category:** `Test`
   - **Quantity:** `-5`  *(Negative value)*
   - **Price:** `-10`  *(Negative value)*
2. Click **"Add Product"**.
3. Point to the **Red Error Alert Banner** that appears:
   > *"Validation Error: Quantity cannot be negative (must be ≥ 0)."*

**What to say to Mam:**
> *"Mam, we have implemented strict validation both on the client side and inside our Mongoose schema to guarantee that negative values for stock quantity or price are rejected."*

---

### Step 5: Dynamic Search & Filter without Page Reload (Objective: Search)
**What to do:**
1. Go to the search bar: *"Search by Name, ID, or Category..."*.
2. Type **`Mouse`**  
   *(Notice: The table immediately filters to show only the Wireless Mouse without reloading the page!)*
3. Clear it and type **`Stationery`**  
   *(Notice: The table instantly filters to show Spiral Notebook and Gel Pen!)*
4. Type **`101`**  
   *(Notice: Directly searches by Product ID to find Dell Laptop!)*
5. Click **"Clear Filters"** or backspace to show all products again.

**What to say to Mam:**
> *"The search is completely dynamic. As the user types, a query is sent to `GET /api/products?search=...`, and the matching products are updated in real-time using React state and the Fetch API without a full page reload."*

---

### Step 6: Low-Stock Alerts (Objective: Low-Stock Warning)
**What to do:**
1. Point to the **Low-Stock Alert Status Banner** (amber box above the form).
2. Show how it displays:
   - `Wireless Mouse (3 left)`
   - `Spiral Notebook (4 left)`
   - `Gel Pen (0 left - Out of Stock)`
3. Click the **"Filter Low Stock (≤ 5)"** button next to the search bar.
4. Show how the table now only displays the products requiring restocking!

**What to say to Mam:**
> *"Mam, inventory tracking requires knowing when stock is low. Our system automatically checks if `quantity <= 5`. Any item below this threshold is flagged dynamically in the alert banner and table."*

---

### Step 7: Update Stock & Negative Stock Edge Case (Objective: Update & Edge Case)
**What to do:**
1. Look at **Wireless Mouse** (`Stock: 3`).
2. Click the **`[+]`** button once.
   - Stock becomes `4`, and a green notification confirms the update.
3. Look at **Gel Pen** (`Stock: 0 - Out of Stock`).
4. Click the **`[-]`** button on Gel Pen.
5. Point to the **Yellow Warning Banner**:
   > *"Edge Case Safeguard: Cannot reduce stock below zero! Current stock of Gel Pen is 0."*

**What to say to Mam:**
> *"Mam, here is our key edge case: an inventory system must never allow stock to fall below zero. If someone attempts to reduce stock when it is already zero, the backend rejects it with an HTTP 400 Bad Request, and our frontend alerts the user."*

---

### Step 8: Edit Price / Quantity (Objective: Update)
**What to do:**
1. Click the **Edit (Pencil Icon)** on any product (e.g., Office Chair).
2. A clean popup opens showing its current Quantity and Price.
3. Change the Price from `$120` to `$110`.
4. Click **"Save Changes"**.
5. The price updates immediately in the table.

---

### Step 9: Delete Product Record (Objective: Delete)
**What to do:**
1. Find any item you added (e.g., `USB-C Hub`).
2. Click the **Trash Can (Delete)** icon.
3. The **"Confirm Deletion"** popup modal appears with product details.
4. Click the red **"Delete Record"** button.
5. The product is immediately removed from the table and deleted from MongoDB!

**What to say to Mam:**
> *"This sends a `DELETE /api/products/:id` request to the Express server, which uses Mongoose `findByIdAndDelete()` to permanently remove the document from MongoDB."*

---

## 💡 Quick Viva / Oral Questions Cheat Sheet

If Mam asks technical questions, here are the exact answers:

| Question | Answer to Give |
| :--- | :--- |
| **Q1. Which HTTP methods did you use for CRUD?** | **Create:** `POST /api/products`<br/>**Read:** `GET /api/products`<br/>**Update:** `PUT /api/products/:id` & `PATCH /api/products/:id/stock`<br/>**Delete:** `DELETE /api/products/:id` |
| **Q2. Where is the data stored?** | In a **MongoDB database** (`inventory_db`) via **Mongoose**. If MongoDB is offline, it also has an automatic resilient in-memory fallback. |
| **Q3. How does search work without page reload?** | React captures the input's `onChange` event and triggers the JavaScript `Fetch API` asynchronously. It updates the React component state, which re-renders only the table component. |
| **Q4. How do you prevent negative stock?** | In the backend `updateStock` controller, we check `if (product.quantity + delta < 0)`, and return `400 Bad Request: "Cannot reduce stock below zero"`. The frontend also includes a client-side safeguard. |
| **Q5. Where are the schemas defined?** | In [`backend/src/models/Product.js`](file:///c:/Users/acer/OneDrive/Desktop/mdm-ta1/backend/src/models/Product.js) using `new mongoose.Schema({ productId, name, category, quantity, price })`. |

---

## 🧪 Automated Test Command
If Mam asks: *"Did you write automated tests for edge cases?"*  
Open a terminal in the project folder and run:
```bash
node backend/test-api.js
```
It will run through all 8 test cases and print:
```text
✅ All Objectives & Edge Cases Verified!
```
