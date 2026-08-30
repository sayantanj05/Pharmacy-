# Admin Frontend — Pharmacy Stock & Expiry Tracker

## Setup Complete

The Admin Frontend has been created at `C:\Users\sayan\OneDrive\Desktop\Pharmacy\Admin_Frontend\` with all required dependencies installed.

## Tech Stack

- **React.js** — UI library
- **React Router DOM** — Client-side routing
- **Bootstrap 5** — CSS framework
- **Framer Motion** — Animations
- **React Icons** — Icon library
- **jQuery** — DOM manipulation (included via Bootstrap bundle)
- **Axios** — HTTP client
- **Vite** — Build tool and dev server

## Dependencies Installed

```bash
npm install
```

- 96 packages added
- Dev server runs on `http://localhost:3000`
- Proxies `/api` requests to `http://localhost:5000`

## Project Structure

```
Admin_Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Medicines.jsx
│   │   ├── Orders.jsx
│   │   ├── Vendors.jsx
│   │   ├── Supplies.jsx
│   │   ├── ExpiryLogs.jsx
│   │   ├── Reports.jsx
│   │   ├── Notifications.jsx
│   │   ├── Cart.jsx
│   │   ├── Profile.jsx
│   │   ├── Users.jsx
│   │   └── Shops.jsx
│   ├── services/
│   │   └── api.js
│   ├── context/
│   ├── assets/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

## Running the Frontend

```bash
cd C:\Users\sayan\OneDrive\Desktop\Pharmacy\Admin_Frontend
npm run dev
```

Server starts at `http://localhost:3000`

## Backend Integration

- Vite proxy configured in `vite.config.js` to forward `/api/*` to `http://localhost:5000`
- Backend must be running on port 5000

## Role-Based Access

- **Customer**: Dashboard, Medicines, Orders, Vendors, Supplies, Expiry Logs, Reports, Notifications, Cart, Profile
- **Shop Owner**: Same as Customer
- **Super Admin**: All of the above + Users, Shops

## Key Features

- JWT authentication with token stored in localStorage
- Responsive sidebar with role-based menu items
- Framer Motion animations for page transitions
- Bootstrap 5 components and grid
- React Icons for consistent iconography
- CRUD modals for Medicines, Vendors, Users, Shops
- PDF download for Supplies and Reports
- Cart management with checkout
- Order cancellation for customers
