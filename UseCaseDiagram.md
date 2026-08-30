# Use Case Diagram — Pharmacy Stock & Expiry Tracker

## Actors

| Actor | Description |
|-------|-------------|
| Customer | Self-registers on the platform, searches inventory by type (Tablets, Capsules, Syrups, Suspensions, Sachets, Creams) and medical system (Allopathy, Homeopathy, Ayurvedic), receives alternative suggestions, gets notified when medicine is unavailable, manages own profile, orders, cart, and notifications |
| Shop Owner | Registered by Super Admin, manages inventory (CRUD), monitors expiry, generates reports, registers suppliers, manages own shop vendors, orders, supplies, expiry logs, and shop profile |
| Super Admin (Supplier) | Registers shop owners and shop details, manages system-wide users, shops, and vendors (CRUD), configures system settings, oversees system-wide analytics |

## Mermaid Use Case Diagram

```mermaid
usecaseDiagram
    actor Customer
    actor "Shop Owner" as Owner
    actor "Super Admin (Supplier)" as Admin

    package "Pharmacy Stock & Expiry Tracker" {
        usecase "Search Medicines" as UC1
        usecase "Purchase Medicine" as UC2
        usecase "View Alternative Medicines" as UC3
        usecase "Receive Out-of-Stock Notification" as UC4
        usecase "Manage Inventory" as UC5
        usecase "Track Expiry Dates" as UC6
        usecase "Generate Expired Medicines List" as UC7
        usecase "Request Replacement from Vendor" as UC8
        usecase "Generate Revenue & Profit Report" as UC9
        usecase "View Vendor-wise Payments" as UC10
        usecase "View Customer-wise Payments" as UC11
        usecase "Manage Vendors" as UC12
        usecase "Manage Users & Roles" as UC13
        usecase "View System Analytics" as UC14
        usecase "Enter New Supply" as UC15
        usecase "Generate Supplier PDF" as UC16
        usecase "Customer Self-Registration" as UC17
        usecase "Register Shop Owner" as UC18
        usecase "Register Supplier" as UC19
        usecase "Update Profile" as UC20
        usecase "Cancel Order" as UC21
        usecase "Manage Cart" as UC22
        usecase "Update Shop Profile" as UC23
        usecase "Manage Shops" as UC24
        usecase "Update System Settings" as UC25
    }

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC17
    Customer --> UC20
    Customer --> UC21
    Customer --> UC22

    Owner --> UC5
    Owner --> UC6
    Owner --> UC7
    Owner --> UC8
    Owner --> UC9
    Owner --> UC10
    Owner --> UC11
    Owner --> UC12
    Owner --> UC15
    Owner --> UC16
    Owner --> UC19
    Owner --> UC21
    Owner --> UC23

    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC18
    Admin --> UC24
    Admin --> UC25

    UC3 .> UC1 : <<extend>>
    UC4 .> UC3 : <<extend>>
    UC8 .> UC7 : <<extend>>
    UC16 .> UC15 : <<extend>>
```

## Text-Based Use Case Descriptions

### Customer Use Cases

| ID | Use Case | Description |
|----|----------|-------------|
| UC1 | Search Medicines | Customer searches for medicines by name, category, type (Tablets, Capsules, Syrups, Suspensions, Sachets, Creams), medical system (Allopathy, Homeopathy, Ayurvedic), or brand, and views medicine images. |
| UC2 | Purchase Medicine | Customer purchases available medicines; stock is updated in real time. |
| UC3 | View Alternative Medicines | **Extends UC1:** If searched medicine is out of stock, system suggests available alternatives from Aura DB. |
| UC4 | Receive Out-of-Stock Notification | **Extends UC3:** If no alternatives are available, system notifies customer that desired medicine is not found. |

### Shop Owner Use Cases

| ID | Use Case | Description |
|----|----------|-------------|
| UC5 | Manage Inventory | Shop Owner adds, updates, or removes medicines; maintains minimal JIT stock levels; classifies medicines by type (Tablets, Capsules, Syrups, Suspensions, Sachets, Creams), quantity unit, and medical system (Allopathy, Homeopathy, Ayurvedic); assigns a unique mandatory code number, manufacture date, and image URL to each medicine. |
| UC6 | Track Expiry Dates | System continuously monitors expiry dates of all inventory items. |
| UC7 | Generate Expired Medicines List | Shop Owner requests a list of all expired medicines for a given period. |
| UC8 | Request Replacement from Vendor | **Extends UC7:** System generates vendor-wise list of expired items for replacement requests. |
| UC9 | Generate Revenue & Profit Report | Shop Owner views revenue and profit for Day/Week/Month/Year. |
| UC10 | View Vendor-wise Payments | Shop Owner views payments made to each vendor for a selected period. |
| UC11 | View Customer-wise Payments | Shop Owner views payments received from customers for a selected period. |
| UC12 | Manage Vendors | Shop Owner manages vendor records, contacts, and supply agreements. |
| UC15 | Enter New Supply | Shop Owner enters supply details (code number, quantity, batch number, expiry date, supplier ID) when new stock arrives. |
| UC16 | Generate Supplier PDF | **Extends UC15:** System generates a shareable PDF document for the supplier listing all supplied items with details. |
| UC17 | Customer Self-Registration | Customer signs up themselves through the application interface and creates an account. |
| UC18 | Register Shop Owner | Super Admin registers a new shop owner and associated shop details. |
| UC19 | Register Supplier | Shop Owner registers supplier details after being created by the Super Admin. |
| UC20 | Update Profile | Customer updates their own profile information (name, phone, address). |
| UC21 | Cancel Order | Customer cancels their own order; Shop Owner cancels or voids orders within their shop. |
| UC22 | Manage Cart | Customer adds, updates, and removes items from their shopping cart. |
| UC23 | Update Shop Profile | Shop Owner updates their own shop information (name, address, contact details). |
| UC24 | Manage Shops | Super Admin creates, reads, updates, and deletes shop records. |
| UC25 | Update System Settings | Super Admin configures and updates system-wide settings and parameters. |

### Super Admin (Supplier) Use Cases

| ID | Use Case | Description |
|----|----------|-------------|
| UC12 | Manage Vendors | Super Admin manages vendor records, contacts, and supply agreements. |
| UC13 | Manage Users & Roles | Super Admin creates and manages user accounts with role-based access. |
| UC14 | View System Analytics | Super Admin views high-level system analytics and overall platform health. |
