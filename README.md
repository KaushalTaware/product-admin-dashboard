# Product Admin Dashboard

A responsive Product Admin Dashboard built with **Next.js, React, Tailwind CSS, Axios, and DummyJSON API**.

The application allows users to log in, browse products, search and filter products, sort results, view product details, and perform add, edit, and delete operations.

## 🚀 Live Demo

**Live Application:** Add your Vercel deployment URL here

**GitHub Repository:** Add your GitHub repository URL here

---

## ✨ Features

### 🔐 Authentication

* Login using DummyJSON authentication API
* Required credentials:

  * Username: `emilys`
  * Password: `emilyspass`
* Stores authentication token in `localStorage`
* Protected product routes
* Logout functionality
* Prevents multiple login requests while login is in progress
* Displays API error messages for invalid credentials

### 📦 Product Management

* Product listing with:

  * Product image
  * Title
  * Category
  * Price
  * Rating
  * Stock
* Responsive desktop table
* Responsive mobile product cards
* Product details page
* Add new product
* Edit existing product
* Delete product with confirmation popup

### 🔎 Search

* Product search using DummyJSON search API
* Debounced search to reduce unnecessary API requests
* Search automatically resets pagination to page 1
* Handles fast typing and prevents stale API responses from replacing newer results

### 🏷️ Filtering

* Category list loaded from DummyJSON
* Filter products by category
* Search and category filtering are handled separately because DummyJSON does not support both operations together in a single endpoint

### ↕️ Sorting

Products can be sorted by:

* Title
* Price
* Rating

Both ascending and descending order are supported.

### 📄 Pagination

* Uses DummyJSON `limit` and `skip`
* Page size options:

  * 10
  * 20
  * 50
* Previous/Next buttons
* Page number navigation
* Displays the current product range, for example:

  * `Showing 21–40 of 194`

### 🔗 URL State

The following values are stored in the URL:

* Page
* Page size
* Search
* Category
* Sort field
* Sort order

Example:

`/products?page=2&pageSize=20&search=phone&sortBy=price&order=asc`

This allows the current product view to be reproduced after refreshing or sharing the URL.

### ⚠️ Error & Loading Handling

* Loading states
* Empty states
* API error messages
* Retry option
* Invalid product ID handling
* Invalid URL values are safely handled

---

## 🛠️ Tech Stack

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| Next.js      | React framework and routing    |
| React        | UI development                 |
| Tailwind CSS | Styling and responsive design  |
| Axios        | API requests                   |
| DummyJSON    | Authentication and product API |
| JavaScript   | Application logic              |
| Vercel       | Deployment                     |

---

## 📁 Project Structure

```text
product-admin-dashboard/
│
├── app/
│   ├── login/
│   │   └── page.jsx
│   │
│   ├── products/
│   │   ├── page.jsx
│   │   ├── ProductsClient.jsx
│   │   ├── add/
│   │   │   └── page.jsx
│   │   └── [id]/
│   │       ├── page.jsx
│   │       └── edit/
│   │           └── page.jsx
│
├── components/
│   └── ProtectedRoutes.jsx
│
├── context/
│   └── authContext.jsx
│
├── lib/
│   ├── axios.js
│   ├── authApi.js
│   └── productApi.js
│
├── public/
│
├── .env.local
├── package.json
└── README.md
```

---

## 🔌 API Integration

The application uses the DummyJSON API.

Base URL:

```text
https://dummyjson.com
```

### Authentication

```text
POST /auth/login
```

### Products

```text
GET /products
GET /products/{id}
GET /products/search?q={query}
GET /products/categories
GET /products/category/{category}
POST /products/add
PUT /products/{id}
DELETE /products/{id}
```

---

## 🔐 Axios Configuration

A shared Axios instance is used for API communication.

The Axios request interceptor automatically reads the authentication token from `localStorage` and adds it to requests:

```text
Authorization: Bearer <token>
```

A response interceptor is also used to handle API errors centrally.

This keeps API configuration in one place instead of repeating it across components.

---

## 💾 Add, Edit & Delete Behavior

DummyJSON simulates product mutations but does not permanently save changes to the API.

To provide a better user experience, the application stores locally created and updated products in `localStorage`.

Therefore:

* Added products remain visible after refresh
* Edited products remain updated after refresh
* Deleted products remain hidden in the application

These changes are local to the browser and are not persisted on the DummyJSON server.

---

## 🔄 Handling Search Race Conditions

One challenge was handling multiple search requests when a user types quickly.

For example:

```text
p → ph → pho → phone
```

The API responses may return in a different order than the requests were sent.

To prevent an older response from replacing a newer result, a request ID is maintained using `useRef`.

Only the latest request is allowed to update the product list.

This was also tested using an artificial API delay.

---

## 🧩 Problem Faced & Solution

One problem I faced was that the product page failed during the Vercel build because `useSearchParams()` required a Suspense boundary.

I solved it by moving the client-side product logic into a separate `ProductsClient` component and wrapping it with React `Suspense`.

As a result, the build completed successfully and the application deployed correctly on Vercel.

---

## 🤖 AI Assistance

AI tools were used during development for:

* Understanding Next.js concepts
* Debugging errors
* Reviewing implementation approaches
* Improving component structure
* Understanding API and React behavior

All generated code was reviewed, tested, and modified manually. I understand the implementation and can explain the code and make changes to it.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
```

### 2. Navigate into the project

```bash
cd product-admin-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create environment file

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔑 Login Credentials

Use the credentials provided by DummyJSON:

```text
Username: emilys
Password: emilyspass
```

---

## 🏗️ Build for Production

Run:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

---

## 📱 Responsive Design

The dashboard is designed for both desktop and mobile devices.

### Desktop

Products are displayed in a table with actions for:

* View
* Edit
* Delete

### Mobile

Products are displayed as responsive cards for better usability on smaller screens.

---

## 📌 Important Notes

* DummyJSON is used as the backend API.
* Product mutations are simulated by DummyJSON.
* Locally added, edited, and deleted products are maintained using browser `localStorage`.
* Authentication is based on the DummyJSON login API.
* Search and category filtering use separate API endpoints because DummyJSON does not provide a combined search + category endpoint.
* No React Query, SWR, or ready-made table/pagination library is used.

---

## 📋 Assignment Checklist

* [x] Login
* [x] Authentication protection
* [x] Logout
* [x] Product listing
* [x] Responsive table/cards
* [x] Pagination
* [x] Page size selection
* [x] Search
* [x] Debounced search
* [x] Stale response handling
* [x] Category filtering
* [x] Sorting
* [x] URL-based state
* [x] Product details
* [x] Invalid product handling
* [x] Add product
* [x] Edit product
* [x] Delete product
* [x] Delete confirmation
* [x] Loading states
* [x] Empty states
* [x] Error handling
* [x] Retry functionality
* [x] Shared Axios configuration
* [x] Protected routes
* [x] Responsive UI
* [x] Vercel deployment

---

## 👨‍💻 Author

**Kaushal Taware**

MERN / Full Stack Developer

Built with Next.js, React, Tailwind CSS, Axios and DummyJSON.
