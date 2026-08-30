# Backend Build Phases — Pharmacy Stock & Expiry Tracker

This document tracks the phased implementation of the Node.js/Express backend for the Pharmacy Stock & Expiry Tracker application.

---

## Phase 1: Project Setup & Base Configuration
**Status:** Completed

### Objectives
- Initialize Node.js project with Express framework
- Configure environment variables and MongoDB Atlas connection
- Set up project folder structure
- Install and configure core dependencies

### Deliverables
- [x] `package.json` with dependencies (Express, Mongoose, bcryptjs, jsonwebtoken, cors, express-validator, pdfkit, express-async-handler)
- [x] `.env` file with MongoDB URI, database name, JWT secret, and server port
- [x] `src/config/db.js` — MongoDB Atlas connection configuration
- [x] `src/server.js` — Main Express server entry point
- [x] `npm install` completed (197 packages added, 0 vulnerabilities)
- [x] Server starts successfully and connects to MongoDB (`MongoDB Connected: ac-jpubkvh-shard-00-02.4jz25t7.mongodb.net`)

### Verified
- Server runs on port 5000 in development mode
- MongoDB Atlas connection successful to `Pharmacy` database
- All 12 collections created with indexes via Python setup script

---

## Phase 2: Authentication & Authorization
**Status:** Completed

### Objectives
- Implement JWT-based authentication
- Create role-based access control middleware
- Build password hashing and verification utilities
- Implement token generation and validation

### Deliverables
- [x] `src/middleware/auth.js` — JWT verification + role checking middleware (`protect`, `authorize`)
- [x] `src/utils/jwt.js` — JWT token generation and verification utilities (inline in authController)
- [x] `src/utils/response.js` — Standard API response helper
- [x] `src/controllers/authController.js` — Login, register, profile endpoints
- [x] `src/routes/authRoutes.js` — Authentication route definitions
- [x] Password hashing with bcrypt (10 rounds)
- [x] Role-based middleware: `customer`, `shop_owner`, `super_admin`
- [x] Protected route wrapper

### Verified
- Customer self-registration works: `POST /api/auth/register` creates customer with hashed password
- Customer login works: `POST /api/auth/login` returns JWT token
- Protected route works: `GET /api/auth/profile` with Bearer token returns user profile
- Token payload contains user ID and role
- Password hashing verified via bcrypt pre-save hook in User model

---

## Phase 3: User & Shop Management
**Status:** Completed

### Objectives
- Implement User model and CRUD operations
- Implement Shop model and CRUD operations
- Super Admin can create/manage shops and shop owners
- Shop owners can update their own shop profile

### Deliverables
- [x] `src/models/User.js` — User schema with role, shopId, passwordHash
- [x] `src/models/Shop.js` — Shop schema with address, GST, contact info
- [x] `src/controllers/userController.js` — User CRUD operations
- [x] `src/controllers/shopController.js` — Shop CRUD operations
- [x] `src/routes/userRoutes.js` — User route definitions
- [x] `src/routes/shopRoutes.js` — Shop route definitions
- [x] Super Admin: Create/Read/Update/Delete shops and users
- [x] Shop Owner: Read/Update own shop, Read own staff
- [x] Customer: Read/Update own profile

### Verified
- Super Admin can create shop: `POST /api/shops` with name, address object, licenseNumber, gstNumber
- Super Admin can create shop owner: `POST /api/users` with role=shop_owner and shopId
- Shop Owner can fetch current shop: `GET /api/shops/current` returns shop details
- Customer gets 403 when trying to create shop (role-based authorization works)
- Shop model uses embedded address object matching ERD (street, city, state, pincode)

---

## Phase 4: Medicine Inventory Management
**Status:** Completed

### Objectives
- Implement Medicine model with all required fields
- Shop owners can CRUD medicines in their shop
- Customers can search/filter medicines publicly
- Enforce unique codeNumber and manufacture date validation

### Deliverables
- [x] `src/models/Medicine.js` — Medicine schema with all fields (type, system, codeNumber, imageUrl, manufactureDate, etc.)
- [x] `src/controllers/medicineController.js` — Medicine CRUD + search
- [x] `src/routes/medicineRoutes.js` — Medicine route definitions
- [x] Shop Owner: Full CRUD on own shop medicines
- [x] Customer: Search/filter medicines by name, type, system, category
- [x] Validation: codeNumber unique/not null, manufactureDate <= expiryDate
- [x] Indexes: text search on name/genericName, filters on type/system/shopId

### Verified
- Public search works: `GET /api/medicines` returns active medicines
- Shop Owner creates medicine: `POST /api/medicines` auto-assigns shopId from JWT
- Shop Owner updates medicine: `PUT /api/medicines/:id` updates stock, price
- Code number suggestions: `GET /api/medicines/suggestions/code-numbers` returns distinct code numbers for shop
- Medicine model includes: medicineType enum (6 types), medicineSystem enum (3 systems), codeNumber unique, manufactureDate, imageUrl, stock, price

---

## Phase 5: Order & Cart Management
**Status:** Completed

### Objectives
- Implement Order and Cart models
- Customers can manage cart and place orders
- Stock deduction on order placement
- Order cancellation with stock restoration

### Deliverables
- [x] `src/models/Order.js` — Order schema with items array, paymentStatus, orderStatus
- [x] `src/models/OrderItem.js` — Embedded order item schema
- [x] `src/models/CartItem.js` — Cart item schema
- [x] `src/controllers/orderController.js` — Order creation, cancellation, history
- [x] `src/controllers/cartController.js` — Cart CRUD operations
- [x] `src/routes/orderRoutes.js` — Order route definitions
- [x] `src/routes/cartRoutes.js` — Cart route definitions
- [x] Customer: Add to cart, update quantities, place orders, cancel own orders
- [x] Shop Owner: View shop orders, update order status
- [x] Automatic stock deduction and restoration

### Verified
- Customer adds item to cart: `POST /api/cart` with medicineId and quantity
- Customer views cart: `GET /api/cart` returns cart items with populated medicine details
- Customer places order: `POST /api/orders` creates order + order items, calculates total from medicine prices
- Customer views orders: `GET /api/orders` returns customer's order history
- Customer cancels order: `POST /api/orders/:id/cancel` updates status to cancelled
- Shop Owner views shop orders: `GET /api/orders` returns all orders for shop owner's shop
- Order items use `price` and `total` fields matching OrderItem schema

---

## Phase 6: Vendor, Supply & PDF Generation
**Status:** Completed

### Objectives
- Implement Vendor and Supply models
- Shop owners manage vendors and suppliers
- Supply entry with inventory update
- PDF generation for supplier documents

### Deliverables
- [x] `src/models/Vendor.js` — Vendor schema
- [x] `src/models/Supply.js` — Supply schema with codeNumber, batchNumber, expiryDate
- [x] `src/controllers/vendorController.js` — Vendor CRUD
- [x] `src/controllers/supplyController.js` — Supply CRUD + PDF generation
- [x] `src/routes/vendorRoutes.js` — Vendor route definitions
- [x] `src/routes/supplyRoutes.js` — Supply route definitions
- [x] `src/utils/pdfGenerator.js` — PDF generation utilities
- [x] Shop Owner: CRUD vendors (own shop), enter supplies, generate supplier PDFs
- [x] Super Admin: CRUD vendors (system-wide)
- [x] PDF includes: supplier details, code numbers, quantities, batch, expiry, supply date

### Verified
- Shop Owner creates vendor: `POST /api/vendors` auto-assigns shopId
- Shop Owner creates supply: `POST /api/supplies` with items array, updates medicine stock automatically
- Stock updated: Medicine stock increased from 200 to 300 after supply of 100 units
- PDF generation works: `GET /api/supplies/:id/pdf` returns 1450-byte PDF
- Vendor routes restricted to shop_owner and super_admin roles
- Supply routes restricted to shop_owner and super_admin roles

---

## Phase 7: Expiry Tracking, Reports & Notifications
**Status:** Completed

### Objectives
- Implement expiry monitoring and replacement workflow
- Generate financial and operational reports
- Notification system for out-of-stock medicines

### Deliverables
- [x] `src/models/ExpiryLog.js` — Expiry log schema
- [x] `src/models/Notification.js` — Notification schema
- [x] `src/models/Payment.js` — Payment schema
- [x] `src/models/VendorPayment.js` — Vendor payment schema
- [x] `src/controllers/expiryController.js` — Expiry tracking, replacement requests
- [x] `src/controllers/reportController.js` — Financial reports, PDF export
- [x] `src/controllers/notificationController.js` — Notification CRUD
- [x] `src/routes/expiryRoutes.js` — Expiry route definitions
- [x] `src/routes/reportRoutes.js` — Report route definitions
- [x] `src/routes/notificationRoutes.js` — Notification route definitions
- [x] Expiry monitoring: Flag medicines where expiryDate < today
- [x] Vendor-wise replacement requests
- [x] Financial reports: Revenue, profit, vendor-wise/customer-wise payments
- [x] Notifications: Out-of-stock alerts for customers
- [x] `src/controllers/alternativeController.js` — Alternative medicine suggestions
- [x] `src/routes/alternativeRoutes.js` — Alternative route definitions

### Verified
- Expiry logs route works: `GET /api/expiry-logs` returns logs (empty initially)
- Notifications route works: `GET /api/notifications` returns customer notifications
- Financial report works: `GET /api/reports/financial` returns totalRevenue and orders
- System analytics works: `GET /api/system/analytics` returns totalUsers, totalShops, totalOrders
- Alternatives route works: `GET /api/alternatives?medicineId=...` returns alternatives
- All routes protected with JWT and role-based authorization

---

## Phase 8: Validation, Error Handling & Final Checks
**Status:** Completed

### Objectives
- Add comprehensive input validation
- Implement global error handling middleware
- Add request logging and monitoring
- Final testing and code review

### Deliverables
- [x] `src/middleware/validation.js` — Input validation middleware using express-validator
- [x] `src/middleware/errorHandler.js` — Global error handling with status code detection
- [x] All controllers wrapped with try-catch and express-async-handler pattern
- [x] 404 handler for undefined routes (`app.use('*', ...)`)
- [x] Request validation for all POST/PUT endpoints (body, param, query validators)
- [x] Consistent error response format (`{ success, message, stack }`)
- [x] Security headers and CORS configuration (cors with credentials, origin control)
- [x] Final API endpoint testing (all 43+ endpoints verified)
- [x] Documentation review against SRS/CRUD requirements

### Verified
- 404 handler returns `{ success: false, message: 'Route not found' }` for unknown routes
- Error handler returns proper status codes and stack traces in development
- CORS configured with credentials support
- All route files registered in server.js
- Server starts on port 5000 with MongoDB connection
- Environment variables loaded from Backend/.env

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| PDF Generation | pdfkit |
| Validation | express-validator |
| Error Handling | express-async-handler |
| Environment | dotenv |
| CORS | cors |

---

## Database Collections

| Collection | Purpose |
|------------|---------|
| `users` | Customers, Shop Owners, Super Admin |
| `shops` | Pharmacy shop details |
| `medicines` | Medicine inventory with type/system/codeNumber |
| `orders` | Customer purchase orders |
| `order_items` | Individual order line items |
| `cart_items` | Customer shopping cart |
| `vendors` | Supplier/vendor management |
| `supplies` | New stock arrival records |
| `payments` | Financial transactions |
| `vendor_payments` | Vendor payment tracking |
| `expiry_logs` | Expired medicine tracking |
| `alternatives` | Alternative medicine suggestions (Aura DB) |
| `notifications` | Customer notifications |

---

## API Route Summary

| Module | Routes | Access |
|--------|--------|--------|
| `/api/auth` | Register, Login, Profile | Public/Customer |
| `/api/shops` | CRUD shops | Super Admin, Shop Owner |
| `/api/users` | CRUD users | Super Admin |
| `/api/medicines` | Search, CRUD medicines | Public/Shop Owner |
| `/api/orders` | Create, cancel, view orders | Customer/Shop Owner |
| `/api/cart` | Cart CRUD | Customer |
| `/api/vendors` | CRUD vendors | Shop Owner, Super Admin |
| `/api/supplies` | CRUD supplies, PDF | Shop Owner |
| `/api/expiry-logs` | Expiry tracking, replacements | Shop Owner |
| `/api/reports` | Financial reports, PDF | Shop Owner, Super Admin |
| `/api/notifications` | Notification CRUD | Customer |
| `/api/alternatives` | Alternative suggestions | Public |
| `/api/system` | Analytics, settings | Super Admin |

---

## Notes

- All route files are in `src/routes/`
- All controllers are in `src/controllers/`
- All models are in `src/models/`
- Middleware is in `src/middleware/`
- Utilities are in `src/utils/`
- Database config is in `src/config/`
- Main server entry is `src/server.js`
