# Software Requirements Specification (SRS)
## Pharmacy Stock & Expiry Tracker Real-Time Application

**Version:** 1.0  
**Date:** 2026-08-29  
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the functional and non-functional requirements for the **Pharmacy Stock & Expiry Tracker Real-Time Application**. The system enables pharmacy stakeholders to manage inventory, track stock levels, monitor expiry dates, and generate financial reports.

### 1.2 Scope
The application supports three user roles: **Customers**, **Super Admin (Supplier)**, and **Shop Owners**. It provides real-time inventory management, expiry tracking, alternative medicine suggestions, and financial analytics.

### 1.3 Definitions and Acronyms
| Term | Description |
|------|-------------|
| JIT | Just-In-Time inventory philosophy |
| API | Application Programming Interface |
| SRS | Software Requirements Specification |
| SPA | Single Page Application |
| Medicine Type | Form of medicine: Tablet, Capsule, Syrup, Suspension, Sachet, Cream |
| Quantity Unit | Measurement unit based on medicine type: grams, ml, number of tablets, etc. |
| Medicine System | Medical system classification: Allopathy, Homeopathy, Ayurvedic |
| Code Number | Unique and mandatory identifier for medicines assigned by the user who adds the medicine details |
| Medicine Image URL | URL string pointing to the image of the medicine for display in the application |
| Manufacture Date | Date when the medicine was manufactured |
| Supply Entry | Record of new stock arrival containing code number, quantity, batch number, expiry date, and supplier ID |
| Supply PDF | Shareable PDF document generated for suppliers detailing supplied items |

---

## 2. Overall Description

### 2.1 Product Perspective
The system is a standalone web-based real-time application designed for pharmacy inventory and financial management. It integrates with MongoDB Atlas for primary data storage and Aura DB for alternative medicine suggestion logic.

### 2.2 User Classes and Characteristics

| User Role | Description |
|-----------|-------------|
| Customer | Views medicines, purchases items, receives alternative suggestions for out-of-stock medicines, self-registers on the platform, manages own profile, orders, and notifications |
| Shop Owner | Registered by Super Admin, manages inventory, monitors expiry, generates reports, manages vendors and customers, registers supplier details, manages shop profile |
| Super Admin (Supplier) | Registers shop owners and shop details, manages system-wide users, shops, and vendors, oversees system-wide vendor management and analytics |

### 2.3 Operating Environment
- **Frontend:** Web browser with JavaScript support
- **Backend:** Node.js server environment
- **Database:** MongoDB Atlas (primary), Aura DB (alternative medicine logic)

---

## 3. Functional Requirements

### 3.1 Inventory Management
- The system shall allow shop owners to maintain minimal inventory per item, supporting a Just-In-Time (JIT) philosophy to reduce overhead costs.
- The system shall provide real-time stock level tracking for all medicines.
- The system shall update inventory quantities automatically upon sales and purchases.

### 3.2 Expiry Tracking
- The system shall monitor expiry dates for all medicines in inventory.
- The system shall generate a list of expired medicines upon shop owner command.
- The system shall prepare a vendor-wise list of expired items to facilitate replacement requests from vendors.

### 3.3 Alternative Medicine Suggestions
- When a customer requests a medicine that is out of stock, the system shall suggest available alternative medicines.
- If no alternatives are available, the system shall display an appropriate message to the customer.

### 3.4 Notifications
- The system shall generate a notification when a customer searches for a medicine that is not found in inventory and no alternatives are available.
- The notification shall inform the customer that the desired medicine is currently unavailable.
- The system shall allow customers to receive notifications through the application interface.

### 3.5 Financial Reporting
- The system shall generate revenue and profit reports for any given period (Day, Week, Month, Year) for shop owners.
- The system shall display vendor-wise payments for the selected period.
- The system shall display customer-wise payments for the selected period.

### 3.6 User Management
- The system shall support role-based access control for Customers, Shop Owners, and Super Admin (Supplier).
- The system shall authenticate and authorize users based on their assigned roles.
- New customers shall be able to sign up themselves through the application interface.
- The system shall allow customers to login after self-registration.
- Shop owners and shop details shall be registered only by the Super Admin.
- Shop owners shall be able to register supplier details after being created by the Super Admin.

### 3.7 Medicine Types and Units
- The system shall classify medicines into the following types: Tablets, Capsules, Syrups, Suspensions, Sachets, and Creams.
- The system shall assign quantity units based on medicine type: grams for tablets/sachets/creams, ml for syrups/suspensions, and number of tablets/capsules for countable forms.
- The system shall validate quantity entries according to the selected medicine type and unit.

### 3.8 Medicine System Classification
- The system shall categorize medicines by medical system: Allopathy, Homeopathy, and Ayurvedic.
- The system shall allow filtering and searching of medicines by medical system.
- The system shall maintain separate inventory and reporting for each medical system category.

### 3.9 Medicine Code Number
- The system shall allow the user who adds medicine details to enter a unique code number for each medicine.
- The system shall store and display the code number as an identifier for the medicine.
- The system shall validate that the code number is unique and not null across all medicines.

### 3.10 Medicine Image
- The system shall allow the user who adds medicine details to upload or provide a URL for the medicine image.
- The system shall store the medicine image URL and display it in search results, inventory lists, and order details.
- The system shall validate that the provided image URL is accessible and properly formatted.

### 3.11 Supply Entry and PDF Generation
- When new supply arrives, the shop owner shall enter the item code number, quantity, batch number, expiry date, and supplier ID.
- The system shall create a supply entry record linking the medicine to the supplier and updating inventory quantity.
- The system shall generate a shareable PDF document favoring the suppliers, listing all items supplied in the batch.
- The PDF shall include supplier details, item code numbers, quantities, batch numbers, expiry dates, and the date of supply.
- The system shall allow the shop owner to download or share the generated PDF with the supplier.

### 3.12 Manufacture Date
- The system shall record the manufacture date for each medicine.
- The system shall validate that the manufacture date is not later than the expiry date.
- The system shall display the manufacture date in inventory lists and medicine details.

### 3.13 CRUD Operations by Role
- **Customer CRUD:**
  - Create: Self-register account, place orders, add items to cart, trigger notifications (out-of-stock)
  - Read: Search/view medicines, view own orders and order history, view own notifications, view own profile, view cart
  - Update: Update own profile (name, phone, address), mark notifications as read, update cart quantities, cancel own orders
  - Delete: Delete own account, remove items from cart, delete read notifications, cancel orders
  - Constraints: Customers cannot modify inventory, medicines, vendors, or system data. Customers can only access their own data.

- **Shop Owner CRUD:**
  - Create: Add new medicines, enter supply details, register suppliers, process orders, log expired medicines, generate reports, update shop profile
  - Read: View own shop inventory, search/filter medicines, view supply history, view own vendors, view customer orders, view expiry logs, view reports, view shop details
  - Update: Update medicine details and stock levels, update supply records, update vendor information, update order status, update replacement status, update shop profile, refresh reports
  - Delete: Remove medicines from inventory, delete supply records, remove vendors, cancel/void orders, delete expiry logs
  - Constraints: Shop Owners can only manage data within their own shop (`shopId`). Cannot manage other shops or system-wide users.

- **Super Admin CRUD:**
  - Create: Create new shops, register shop owners, create user accounts, register system-wide vendors, configure system settings
  - Read: View all shops and shop details, view all users and roles, view all vendors across shops, view system configuration, view system-wide analytics
  - Update: Update shop details, update user roles and account status, update vendor master data, update system settings
  - Delete: Delete shops, delete user accounts, delete vendors, reset system configuration
  - Constraints: Super Admin has full system access across all shops but typically does not manage day-to-day inventory.

---

## 5. System Features

### 5.1 Frontend
| Technology | Purpose |
|------------|---------|
| React.js | Component-based UI development |
| Angular | Alternative SPA framework support |
| Bootstrap | Responsive UI styling and layout |
| React Icons | Iconography for the user interface |
| Framer Motion | Animations and transitions |
| jQuery | DOM manipulation and event handling |

### 5.2 Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Server-side JavaScript runtime |
| Express.js | RESTful API and GraphQL server framework |
| Java (Future) | Planned backend migration upon request |

### 5.3 Database
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Primary database for inventory, users, transactions, and reports |
| Aura DB | Alternative medicine suggestion engine and related data |

### 5.4 APIs
- RESTful APIs for standard CRUD operations and data exchange.
- GraphQL APIs for flexible, real-time data querying and mutations.

---

## 6. External Interface Requirements

### 6.1 User Interfaces
- Responsive web interface compatible with desktop and mobile browsers.
- Dashboard views for Shop Owners and Super Admin with analytics charts and tables.
- Customer-facing product search and alternative suggestion interfaces.

### 6.2 Software Interfaces
- MongoDB Atlas connection for primary data persistence.
- Aura DB integration for alternative medicine data queries.
- Third-party notification services (if applicable for expiry alerts).

---

## 7. Non-Functional Requirements

### 7.1 Performance
- The system shall provide real-time updates for stock levels and expiry status.
- Page load times shall not exceed 3 seconds under normal network conditions.
- Database queries for reports shall complete within 5 seconds.

### 7.2 Security
- All API communications shall use HTTPS.
- User authentication shall be implemented with secure token-based mechanisms.
- Role-based access control shall restrict data access based on user roles.

### 7.3 Reliability
- The system shall maintain 99.5% uptime during business hours.
- Data backups shall be performed automatically on a scheduled basis.

### 7.4 Maintainability
- The codebase shall follow modular architecture patterns.
- Future migration to Java-based backend shall be supported without major re-architecture.

---

## 8. Appendices

### Appendix A: User Stories
- As a **Shop Owner**, I want to classify medicines by type (Tablets, Capsules, Syrups, Suspensions, Sachets, Creams) with appropriate quantity units so that inventory is managed accurately.
- As a **Customer**, I want to search and filter medicines by type so that I can find the right form of medicine I need.
- As a **Shop Owner**, I want to categorize medicines by medical system (Allopathy, Homeopathy, Ayurvedic) so that inventory is organized by treatment philosophy.
- As a **Customer**, I want to search and filter medicines by medical system so that I can find medicines according to my preference.
- As a **Shop Owner**, I want to assign a unique and mandatory code number to each medicine when adding it to inventory so that medicines can be easily identified.
- As a **Shop Owner**, I want to record the manufacture date for each medicine so that I can track product freshness and validate it against expiry date.
- As a **Shop Owner**, I want to upload or provide an image URL for each medicine so that customers can visually identify medicines.
- As a **Customer**, I want to see medicine images in search results and details so that I can easily identify the correct medicine.
- As a **Shop Owner**, I want to enter supply details (code number, quantity, batch number, expiry date, supplier) when new stock arrives so that inventory is updated accurately.
- As a **Shop Owner**, I want the system to generate a shareable PDF for suppliers detailing the supplied items so that I can share it with the supplier for confirmation.
- As a **Shop Owner**, I want to generate an expiry list so that I can request replacements from vendors.
- As a **Customer**, I want alternative medicine suggestions when my requested item is out of stock.
- As a **Customer**, I want to receive a notification when my desired medicine is not found in the inventory.
- As a **Shop Owner**, I want to view revenue and profit reports for specific periods to analyze business performance.
- As a **Customer**, I want to self-register on the platform so that I can search medicines and make purchases.
- As a **Customer**, I want to login after registration so that I can access my account and order history.
- As a **Customer**, I want to update my profile information so that my details are current.
- As a **Customer**, I want to cancel my orders when needed so that I can manage my purchases.
- As a **Customer**, I want to manage my cart (add, update, remove items) so that I can prepare for checkout.
- As a **Customer**, I want to view and manage my notifications so that I can stay informed.
- As a **Super Admin**, I want to register shop owners and shop details so that only authorized persons can manage pharmacy inventory.
- As a **Super Admin**, I want to create, read, update, and delete user accounts so that I can manage system access.
- As a **Super Admin**, I want to create, read, update, and delete shops so that I can manage pharmacy locations.
- As a **Super Admin**, I want to manage system-wide vendor data so that vendor information is consistent across all shops.
- As a **Shop Owner**, I want to register supplier details so that I can manage supply entries and generate supplier PDFs.
- As a **Shop Owner**, I want to add, update, and delete medicines in my shop inventory so that stock levels are accurate.
- As a **Shop Owner**, I want to manage supply entries (add, update, delete) so that inventory is updated correctly.
- As a **Shop Owner**, I want to manage my shop vendors (add, update, delete) so that supplier relationships are maintained.
- As a **Shop Owner**, I want to cancel or void orders when necessary so that order management is accurate.
- As a **Shop Owner**, I want to view and manage expiry logs so that I can handle replacements.
- As a **Shop Owner**, I want to update my shop profile so that shop information is current.
- As a **Super Admin**, I want to manage vendor and customer data at a system level.

### Appendix B: Future Enhancements
- Backend migration to Java upon business requirement.
- Mobile application development for on-the-go inventory management.
- Integration with pharmacy billing systems.
