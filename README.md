# Stellar Inventory

Stellar Inventory is a full-stack web application designed for real-time product exploration. It leverages **cursor-based pagination** (keyset pagination) to dynamically load and display products in a performant table, avoiding the performance degradation associated with traditional `LIMIT / OFFSET` paging on large datasets.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** CSS
- **Routing & Networking:** Fetch API, Base64 Cursor Handlers

### Backend
- **Framework:** Node.js + Express
- **Database:** PostgreSQL (Neon Serverless PostgreSQL Database)
- **Database Driver:** `pg` (node-postgres)
- **Environment Management:** `dotenv`
- **Security:** `cors` (configured with strict origin filtering)

---

## 📂 Project Structure

```text
codevector/
├── backend/
│   ├── controllers/      # Request handlers for product routes
│   │   └── productController.js
│   ├── models/           # Keyset pagination & Database querying logic
│   │   └── productModel.js
│   ├── routes/           # Express router configuration
│   │   └── productRoutes.js
│   ├── db.js             # Neon PostgreSQL Connection Pool setup
│   ├── app.js            # Express app middleware and route integration
│   ├── server.js         # Port configuration & server bootstrap
│   ├── seed.js           # Populates the Database with initial catalog data
│   └── .env              # Backend local environment config
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryFilter.jsx # Filters products by category
│   │   │   ├── ProductTable.jsx   # Tabular display of products
│   │   │   └── LoadMoreButton.jsx # Button to fetch next page of products
│   │   ├── App.jsx       # State management for products list & pagination logic
│   │   ├── main.jsx      # React entrypoint
│   │   └── index.css     # Global modern dark themes & custom components layout
│   ├── .env              # Frontend local environment config
│   └── vite.config.js    # Vite configurations (dev-server configurations)
└── README.md             # Project documentation (this file)
```

---

## 🔑 Environment Setup

Before running either application, configure your environment variables.

### 1. Backend Config
Create or edit `backend/.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
PORT=3001
FRONTEND_URL=http://localhost:5173
```

- `DATABASE_URL`: Connection string to your PostgreSQL (Neon) database.
- `PORT`: Port on which the backend server runs (default: 3001).
- `FRONTEND_URL`: URL of the frontend application. The backend enforces strict CORS checks allowing only this origin to consume the API.

### 2. Frontend Config
Create or edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

- `VITE_API_URL`: The full URL pointing directly to the backend API instance (not using relative routing or local dev-server proxy).

---

## 🚀 Getting Started

Follow these steps to run the backend database seeding and start both development servers.

### Prerequisite
Ensure [Node.js](https://nodejs.org/) (v18+) is installed.

---

### Step 1: Install Dependencies
Run the install command inside both directories:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Seed the Database
Ensure your Neon PostgreSQL instance is active and populated using the provided seed script. This populates categories (`Electronics`, `Clothing`, `Books`, `Home`, `Sports`, `Beauty`) and mock product catalogs.

```bash
cd ../backend
npm run seed
```

---

### Step 3: Start the Backend Dev Server
The backend is set up with hot-reloading using `nodemon`. Run the following command inside the `backend` folder:

```bash
npm run dev
```
The console will verify connection details:
`Server running on port 3001`

---

### Step 4: Start the Frontend Dev Server
Run the Vite development server inside the `frontend` folder:

```bash
cd ../frontend
npm run dev
```
Vite will start the dev server, typically on `http://localhost:5173`. Open this URL in your web browser.

---

## 📐 Key Architectures

### Keyset (Cursor) Pagination Design
The product query implements Base64-encoded cursor pagination using a compound cursor: `(created_at, id)`.
This prevents duplicate/skipped entries when products are added or deleted between pagination loads, and is significantly faster than standard `OFFSET` queries.

#### Database Keyset Query Mechanism:
```sql
SELECT * FROM products
WHERE ($1::text IS NULL OR category = $1)
  AND (created_at, id) < ($2::timestamptz, $3::uuid)
ORDER BY created_at DESC, id DESC
LIMIT $4;
```

#### Pagination Lifecycle:
1. The backend reads base64-encoded `cursor` parameters from frontend HTTP requests.
2. The cursor is decoded into `created_at` and `id` values.
3. The database queries matching rows where the pair `(created_at, id)` is lexicographically less than the decoded cursor values.
4. The backend encodes the final row's `(created_at, id)` tuple into a base64 string `nextCursor` and returns it inside the JSON response.
5. The frontend appends new products to its current state and holds the returned `nextCursor` value. If a user clicks **Load More**, the frontend sends a new fetch request containing `cursor=nextCursor`.

### Cors Protection
In compliance with REST API security best practices, wildcard (`*`) access is disabled. The Express backend employs `cors` configured strictly with the `FRONTEND_URL` from local environment variables, ensuring secure cross-origin transactions:

```javascript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
```
