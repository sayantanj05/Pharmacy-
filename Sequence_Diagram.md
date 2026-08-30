# Sequence Diagrams — Pharmacy Stock & Expiry Tracker

## 1. Search Medicine (with Alternatives and Notifications)

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant AURA as Aura DB
    participant NOTIF as Notification Service

    C->>FE: Search medicine by name/type/system
    FE->>API: GET /api/medicines?query=...
    API->>DB: Query medicines collection
    DB-->>API: Return medicine list
    API-->>FE: Return search results with images
    FE-->>C: Display medicine list

    alt Medicine found in stock
        C->>FE: Select medicine & purchase
        FE->>API: POST /api/orders
        API->>DB: Create order & deduct stock
        DB-->>API: Order confirmed
        API-->>FE: Order success response
        FE-->>C: Show order confirmation
    else Medicine out of stock
        FE->>API: Check alternatives
        API->>AURA: Query alternative medicines
        AURA-->>API: Return alternatives list
        API-->>FE: Return available alternatives
        FE-->>C: Show alternative suggestions

        alt Alternative selected
            C->>FE: Select alternative medicine
            FE->>API: POST /api/orders (alternative)
            API->>DB: Create order & deduct stock
            DB-->>API: Order confirmed
            API-->>FE: Order success response
            FE-->>C: Show order confirmation
        else No alternative selected / none available
            FE->>API: POST /api/notifications
            API->>NOTIF: Create out-of-stock notification
            NOTIF->>DB: Store notification record
            DB-->>NOTIF: Notification saved
            NOTIF-->>API: Notification created
            API-->>FE: Notification success
            FE-->>C: Show "Medicine Not Available" notification
        end
    end
```

---

## 2. Purchase Medicine

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant PDF as PDF Generator

    C->>FE: Browse medicines & add to cart
    FE->>FE: Validate cart items & calculate total
    FE->>API: POST /api/orders (items, totalAmount)
    API->>DB: Check stock availability
    DB-->>API: Stock available

    API->>DB: Create order record
    API->>DB: Deduct quantityInStock for each item
    API->>DB: Create payment record
    DB-->>API: Order & payment saved

    alt Order successful
        API-->>FE: Return order confirmation with orderId
        FE-->>C: Display order success & receipt
    else Stock insufficient
        API-->>FE: Return error: insufficient stock
        FE-->>C: Show error message
    end

    C->>FE: Request invoice/receipt PDF
    FE->>API: GET /api/orders/{orderId}/pdf
    API->>DB: Fetch order details
    DB-->>API: Return order data
    API->>PDF: Generate invoice PDF
    PDF-->>API: Return PDF URL
    API-->>FE: Return PDF download link
    FE-->>C: Download / view PDF
```

---

## 3. Enter New Supply & Generate Supplier PDF

```mermaid
sequenceDiagram
    actor SO as Shop Owner
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant PDF as PDF Generator

    SO->>FE: Navigate to "New Supply" page
    FE->>API: GET /api/medicines (for code number lookup)
    API->>DB: Fetch medicine list
    DB-->>API: Return medicines
    API-->>FE: Display medicine selection

    SO->>FE: Enter supply details (codeNumber, quantity, batchNumber, expiryDate, supplierId)
    FE->>API: POST /api/supplies (supply details)
    API->>DB: Validate medicine exists by codeNumber
    DB-->>API: Medicine found

    API->>DB: Create supply record
    API->>DB: Update quantityInStock (add supplied quantity)
    DB-->>API: Supply saved & stock updated
    API-->>FE: Supply entry success

    SO->>FE: Request supplier PDF
    FE->>API: GET /api/supplies/{supplyId}/pdf
    API->>DB: Fetch supply + supplier details
    DB-->>API: Return supply data
    API->>PDF: Generate supplier PDF (items, quantities, batch, expiry, supplier info)
    PDF-->>API: Return PDF URL
    API-->>FE: Return PDF download/share link
    FE-->>SO: Display PDF preview & share options
```

---

## 4. Track Expiry & Request Replacement

```mermaid
sequenceDiagram
    actor SO as Shop Owner
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant NOTIF as Notification Service

    SO->>FE: Request expired medicines list
    FE->>API: GET /api/expiry-logs?status=expired
    API->>DB: Query medicines where expiryDate < today
    DB-->>API: Return expired medicines list
    API-->>FE: Return expired items with vendor details
    FE-->>SO: Display vendor-wise expired items

    SO->>FE: Select items & request replacement from vendor
    FE->>API: POST /api/expiry-logs/replacement (medicineIds, vendorId)
    API->>DB: Update expiry logs: replacementRequested = true
    API->>DB: Create replacement request record
    DB-->>API: Replacement request saved
    API-->>FE: Replacement request success
    FE-->>SO: Show confirmation & vendor contact

    opt Notify vendor (if integrated)
        API->>NOTIF: Send replacement request notification to vendor
        NOTIF->>DB: Store vendor notification
        DB-->>NOTIF: Notification saved
        NOTIF-->>API: Notification sent
    end
```

---

## 5. Generate Financial Report

```mermaid
sequenceDiagram
    actor SO as Shop Owner
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant PDF as PDF Generator

    SO->>FE: Select report type & period (Day/Week/Month/Year)
    FE->>API: GET /api/reports/financial?period=month&type=revenue
    API->>DB: Query orders within date range
    DB-->>API: Return order records
    API->>DB: Query payments within date range
    DB-->>API: Return payment records

    API->>API: Calculate revenue, profit, vendor-wise & customer-wise totals
    API-->>FE: Return report data (charts, tables)
    FE-->>SO: Display financial dashboard

    SO->>FE: Request PDF export of report
    FE->>API: GET /api/reports/financial/pdf?period=month
    API->>DB: Re-fetch aggregated data
    DB-->>API: Return report data
    API->>PDF: Generate financial report PDF
    PDF-->>API: Return PDF URL
    API-->>FE: Return PDF download link
    FE-->>SO: Download / share report PDF
```

---

## 6. Manage Inventory (Add / Update Medicine)

```mermaid
sequenceDiagram
    actor SO as Shop Owner
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    SO->>FE: Navigate to "Add Medicine" form
    FE->>API: GET /api/medicines/code-number/suggestions (optional)
    API->>DB: Fetch existing code numbers
    DB-->>API: Return code number list
    API-->>FE: Display suggestions

    SO->>FE: Fill medicine details (name, codeNumber, type, system, quantityUnit, imageUrl, manufactureDate, expiryDate, etc.)
    FE->>API: POST /api/medicines (medicine payload)
    API->>API: Validate required fields (codeNumber not null, unique, manufactureDate <= expiryDate)
    
    alt Validation failed
        API-->>FE: Return validation errors
        FE-->>SO: Show error messages
    else Validation passed
        API->>DB: Insert medicine record
        DB-->>API: Medicine created
        API-->>FE: Return created medicine
        FE-->>SO: Show success & updated inventory list
    end

    SO->>FE: Update medicine details
    FE->>API: PUT /api/medicines/{id} (updated fields)
    API->>DB: Update medicine record
    DB-->>API: Medicine updated
    API-->>FE: Return updated medicine
    FE-->>SO: Refresh inventory view
```

---

## 7. Manage Users & Vendors (Super Admin)

```mermaid
sequenceDiagram
    actor SA as Super Admin
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    SA->>FE: Navigate to User Management
    FE->>API: GET /api/users
    API->>DB: Query all users
    DB-->>API: Return user list
    API-->>FE: Display users with roles
    FE-->>SA: Show user table

    SA->>FE: Add new user (name, email, role, password)
    FE->>API: POST /api/users
    API->>API: Validate email uniqueness & role
    API->>DB: Create user record with hashed password
    DB-->>API: User created
    API-->>FE: Return created user
    FE-->>SA: Show success & updated user list

    SA->>FE: Navigate to Vendor Management
    FE->>API: GET /api/vendors
    API->>DB: Query all vendors
    DB-->>API: Return vendor list
    API-->>FE: Display vendors
    FE-->>SA: Show vendor table

    SA->>FE: Add / Update vendor details
    FE->>API: POST /api/vendors (or PUT /api/vendors/{id})
    API->>DB: Save vendor record
    DB-->>API: Vendor saved
    API-->>FE: Return vendor data
    FE-->>SA: Show success & updated vendor list
```

---

## 8. Customer Self-Registration

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant EMAIL as Email Service

    C->>FE: Navigate to "Sign Up" page
    FE->>C: Display registration form (name, email, password, phone, address)
    C->>FE: Fill registration details & submit
    FE->>API: POST /api/auth/register (name, email, password, phone, address)
    API->>API: Validate input fields & email format
    API->>DB: Check if email already exists
    DB-->>API: Email not found

    API->>DB: Create customer user record with role=customer
    DB-->>API: Customer account created
    API-->>FE: Return success & user details
    FE-->>C: Show registration success & redirect to login

    opt Welcome Email
        API->>EMAIL: Send welcome email to customer
        EMAIL-->>API: Email sent
    end

    C->>FE: Navigate to "Login" page
    FE->>C: Display login form (email, password)
    C->>FE: Enter credentials & submit
    FE->>API: POST /api/auth/login (email, password)
    API->>DB: Query user by email
    DB-->>API: Return user record
    API->>API: Verify password hash
    API->>API: Generate JWT token
    API-->>FE: Return token & user role
    FE->>FE: Store token in localStorage
    FE-->>C: Redirect to customer dashboard
```

---

## 9. Register Shop Owner by Super Admin

```mermaid
sequenceDiagram
    actor SA as Super Admin
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas
    participant EMAIL as Email Service

    SA->>FE: Navigate to "Register Shop Owner" page
    FE->>API: GET /api/shops (for shop selection/creation)
    API->>DB: Query existing shops
    DB-->>API: Return shop list
    API-->>FE: Display shop options

    SA->>FE: Create new shop or select existing shop & enter shop owner details (name, email, phone, shop details)
    FE->>API: POST /api/shops (if new shop) + POST /api/users (shop owner)
    API->>API: Validate shop details & owner information
    API->>DB: Create shop record
    DB-->>API: Shop created
    API->>DB: Create shop owner user record with role=shop_owner & shopId
    DB-->>API: Shop owner account created
    API-->>FE: Return success & credentials
    FE-->>SA: Show success message

    opt Send Credentials to Shop Owner
        API->>EMAIL: Send account details email to shop owner
        EMAIL-->>API: Email sent
    end
```

---

## 10. Register Supplier by Shop Owner

```mermaid
sequenceDiagram
    actor SO as Shop Owner
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    SO->>FE: Navigate to "Register Supplier" page
    FE->>API: GET /api/shops/current (get shop context)
    API->>DB: Query shop by shop owner's shopId
    DB-->>API: Return shop details
    API-->>FE: Display shop context

    SO->>FE: Enter supplier details (name, contact person, email, phone, address, GST number)
    FE->>API: POST /api/vendors (supplier payload)
    API->>API: Validate supplier information
    API->>DB: Check if vendor email already exists
    DB-->>API: Email not found

    API->>DB: Create vendor/supplier record linked to shop
    DB-->>API: Supplier registered
    API-->>FE: Return created supplier
    FE-->>SO: Show success & updated supplier list
```

---

## 11. Customer Update Profile

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    C->>FE: Navigate to "My Profile"
    FE->>API: GET /api/users/profile (Authorization header)
    API->>DB: Query user by userId
    DB-->>API: Return user profile
    API-->>FE: Display profile data
    FE-->>C: Show profile form

    C->>FE: Update profile fields (name, phone, address)
    FE->>API: PUT /api/users/profile (updated fields)
    API->>API: Validate input
    API->>DB: Update user record
    DB-->>API: Profile updated
    API-->>FE: Return updated profile
    FE-->>C: Show success message
```

---

## 12. Customer Cancel Order

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    C->>FE: View order history
    FE->>API: GET /api/orders?customerId={id}
    API->>DB: Query customer orders
    DB-->>API: Return order list
    API-->>FE: Display orders
    FE-->>C: Show order list

    C->>FE: Select order to cancel
    FE->>API: POST /api/orders/{orderId}/cancel
    API->>API: Validate order can be cancelled (status check)
    API->>DB: Update order status to "cancelled"
    API->>DB: Restore quantityInStock for each item
    DB-->>API: Order cancelled & stock restored
    API-->>FE: Return cancellation confirmation
    FE-->>C: Show cancellation success
```

---

## 13. Customer Manage Cart

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    C->>FE: Browse medicines
    FE->>API: GET /api/medicines
    API->>DB: Query medicines
    DB-->>API: Return medicine list
    API-->>FE: Display medicines
    FE-->>C: Show medicine catalog

    C->>FE: Add item to cart
    FE->>API: POST /api/cart (medicineId, quantity)
    API->>DB: Check stock availability
    DB-->>API: Stock available
    API->>DB: Create cart item
    DB-->>API: Cart item added
    API-->>FE: Return updated cart
    FE-->>C: Show cart updated

    C->>FE: Update cart item quantity
    FE->>API: PUT /api/cart/{cartItemId} (new quantity)
    API->>DB: Update cart item
    DB-->>API: Cart updated
    API-->>FE: Return updated cart
    FE-->>C: Show cart updated

    C->>FE: Remove item from cart
    FE->>API: DELETE /api/cart/{cartItemId}
    API->>DB: Delete cart item
    DB-->>API: Cart item removed
    API-->>FE: Return updated cart
    FE-->>C: Show cart updated
```

---

## 14. Shop Owner Delete Medicine

```mermaid
sequenceDiagram
    actor SO as Shop Owner
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    SO->>FE: View inventory
    FE->>API: GET /api/medicines?shopId={id}
    API->>DB: Query medicines by shopId
    DB-->>API: Return medicine list
    API-->>FE: Display inventory
    FE-->>SO: Show medicine list

    SO->>FE: Select medicine to delete
    FE->>API: DELETE /api/medicines/{id}
    API->>API: Validate medicine belongs to shop
    API->>DB: Check if medicine has active orders
    DB-->>API: No active orders

    API->>DB: Soft delete (isActive = false) or hard delete
    DB-->>API: Medicine deleted
    API-->>FE: Return success
    FE-->>SO: Show deletion confirmation & refresh inventory
```

---

## 15. Super Admin Manage Users/Shops/Vendors

```mermaid
sequenceDiagram
    actor SA as Super Admin
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB Atlas

    SA->>FE: Navigate to "Manage Shops"
    FE->>API: GET /api/shops
    API->>DB: Query all shops
    DB-->>API: Return shop list
    API-->>FE: Display shops
    FE-->>SA: Show shop table

    SA->>FE: Create new shop
    FE->>API: POST /api/shops (shop details)
    API->>API: Validate shop data
    API->>DB: Create shop record
    DB-->>API: Shop created
    API-->>FE: Return created shop
    FE-->>SA: Show success

    SA->>FE: Update shop details
    FE->>API: PUT /api/shops/{id} (updated fields)
    API->>DB: Update shop record
    DB-->>API: Shop updated
    API-->>FE: Return updated shop
    FE-->>SA: Show success

    SA->>FE: Delete shop
    FE->>API: DELETE /api/shops/{id}
    API->>API: Validate no active shop owners/medicines
    API->>DB: Delete shop record
    DB-->>API: Shop deleted
    API-->>FE: Return success
    FE-->>SA: Show success & refresh list

    SA->>FE: Navigate to "Manage Users"
    FE->>API: GET /api/users
    API->>DB: Query all users
    DB-->>API: Return user list
    API-->>FE: Display users with roles
    FE-->>SA: Show user table

    SA->>FE: Update user role/status
    FE->>API: PUT /api/users/{id} (role, isActive)
    API->>DB: Update user record
    DB-->>API: User updated
    API-->>FE: Return updated user
    FE-->>SA: Show success

    SA->>FE: Delete user
    FE->>API: DELETE /api/users/{id}
    API->>DB: Delete user record
    DB-->>API: User deleted
    API-->>FE: Return success
    FE-->>SA: Show success & refresh list
```

---

## Notes

- All sequence diagrams follow the lifeline order: **Actor → Frontend → Backend API → Data Store / External Service**.
- Alternative flows (alt/else) represent conditional branching based on business rules.
- Notifications and PDF generation are shown as asynchronous or triggered flows where applicable.
- Real-time updates (stock deduction, expiry monitoring) are handled via API callbacks and database updates.
- Authentication/authorization steps are implied at the API layer for all user-originated requests.
