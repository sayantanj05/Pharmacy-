# ERD Diagram — Pharmacy Stock & Expiry Tracker (NoSQL / MongoDB)

## Mermaid ER Diagram

```mermaid
erDiagram
    USERS ||--o| ORDERS : places
    USERS ||--o| PAYMENTS : makes
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ CART_ITEMS : has in cart
    USERS {
        ObjectId _id
        string name
        string email
        string passwordHash
        string role
        string phone
        boolean isActive
        date createdAt
        date updatedAt
    }

    SHOPS ||--o{ USERS : employs
    SHOPS ||--o{ MEDICINES : stocks
    SHOPS {
        ObjectId _id
        string shopName
        string address
        string phone
        string email
        string gstNumber
        boolean isActive
        date createdAt
        date updatedAt
    }

    MEDICINES ||--o{ ORDER_ITEMS : "ordered in"
    MEDICINES ||--o{ EXPIRY_LOGS : "tracked in"
    MEDICINES ||--o{ ALTERNATIVES : "has alternatives"
    MEDICINES }|--|| VENDORS : "supplied by"
    MEDICINES }|--|| SHOPS : "belongs to"
    MEDICINES {
        ObjectId _id
        ObjectId shopId
        string name
        string genericName
        string category
        string medicineType
        string quantityUnit
        string medicineSystem
        string codeNumber
        string imageUrl
        date manufactureDate
        string manufacturer
        ObjectId vendorId
        string batchNumber
        date expiryDate
        number quantityInStock
        number minStockLevel
        number pricePerUnit
        number costPrice
        string description
        boolean isActive
        date createdAt
        date updatedAt
    }

    VENDORS ||--o{ MEDICINES : supplies
    VENDORS ||--o{ VENDOR_PAYMENTS : "receives payment"
    VENDORS ||--o{ EXPIRY_LOGS : "replacement for"
    VENDORS {
        ObjectId _id
        string name
        string contactPerson
        string email
        string phone
        string address
        string gstNumber
        boolean isActive
        date createdAt
        date updatedAt
    }

    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        ObjectId _id
        ObjectId customerId
        number totalAmount
        string paymentStatus
        string orderStatus
        date orderDate
        date updatedAt
    }

    ORDER_ITEMS {
        ObjectId _id
        ObjectId orderId
        ObjectId medicineId
        string medicineName
        number quantity
        number unitPrice
        number totalPrice
    }

    PAYMENTS ||--|| VENDORS : "paid to"
    PAYMENTS {
        ObjectId _id
        ObjectId vendorId
        ObjectId userId
        number amount
        string paymentMethod
        string paymentStatus
        date paymentDate
        string notes
    }

    VENDOR_PAYMENTS {
        ObjectId _id
        ObjectId vendorId
        number amount
        string paymentMethod
        string paymentStatus
        date paymentDate
        string notes
    }

    EXPIRY_LOGS {
        ObjectId _id
        ObjectId medicineId
        ObjectId vendorId
        string medicineName
        number quantityExpired
        date expiryDate
        boolean replacementRequested
        date replacementDate
        string status
        date createdAt
    }

    ALTERNATIVES {
        ObjectId _id
        ObjectId originalMedicineId
        ObjectId alternativeMedicineId
        string alternativeName
        number similarityScore
        boolean isAvailable
        date createdAt
    }

    NOTIFICATIONS {
        ObjectId _id
        ObjectId userId
        string type
        string title
        string message
        ObjectId medicineId
        boolean isRead
        date createdAt
    }

    SUPPLIES {
        ObjectId _id
        ObjectId medicineId
        string codeNumber
        number quantitySupplied
        string batchNumber
        date expiryDate
        ObjectId supplierId
        date supplyDate
        boolean pdfGenerated
        string pdfUrl
        date createdAt
    }

    CART_ITEMS {
        ObjectId _id
        ObjectId userId
        ObjectId medicineId
        string medicineName
        number quantity
        number unitPrice
        date createdAt
        date updatedAt
    }
```

## Collection Schemas (JSON Document Structure)

### 1. Users Collection
Stores all user types (Customer, Shop Owner, Super Admin). Shop owners are created by Super Admin and linked to a shop.

```json
{
  "_id": { "$oid": "..." },
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "bcrypt_hash",
  "role": "shop_owner",
  "phone": "+91-9876543210",
  "shopId": { "$oid": "shop_id" },
  "isActive": true,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" },
  "updatedAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 2. Shops Collection
Stores shop details registered by Super Admin.

```json
{
  "_id": { "$oid": "..." },
  "shopName": "ABC Pharmacy",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "phone": "+91-9876543210",
  "email": "abcpharmacy@example.com",
  "gstNumber": "GST123456789",
  "isActive": true,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" },
  "updatedAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 2. Medicines Collection
Main inventory collection with embedded stock and expiry info.

```json
{
  "_id": { "$oid": "..." },
  "shopId": { "$oid": "shop_id" },
  "name": "Paracetamol 500mg",
  "genericName": "Acetaminophen",
  "category": "Painkiller",
  "medicineType": "Tablet",
  "quantityUnit": "no_of_tablets",
  "medicineSystem": "Allopathy",
  "codeNumber": "MED-001",
  "imageUrl": "https://example.com/images/paracetamol.jpg",
  "manufactureDate": { "$date": "2026-01-15" },
  "manufacturer": "ABC Pharma",
  "vendorId": { "$oid": "vendor_id" },
  "batchNumber": "BATCH-001",
  "expiryDate": { "$date": "2026-12-31" },
  "quantityInStock": 150,
  "minStockLevel": 20,
  "pricePerUnit": 2.50,
  "costPrice": 1.80,
  "description": "Used for pain relief and fever reduction",
  "isActive": true,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" },
  "updatedAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 3. Vendors Collection
Supplier and vendor management.

```json
{
  "_id": { "$oid": "..." },
  "name": "XYZ Pharmaceuticals",
  "contactPerson": "Jane Smith",
  "email": "contact@xyzpharma.com",
  "phone": "+91-9876543211",
  "address": {
    "street": "456 Industrial Area",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001"
  },
  "gstNumber": "GST123456789",
  "isActive": true,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" },
  "updatedAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 4. Orders Collection
Customer purchase orders.

```json
{
  "_id": { "$oid": "..." },
  "customerId": { "$oid": "customer_user_id" },
  "items": [
    {
      "medicineId": { "$oid": "medicine_id" },
      "medicineName": "Paracetamol 500mg",
      "quantity": 2,
      "unitPrice": 2.50,
      "totalPrice": 5.00
    }
  ],
  "totalAmount": 5.00,
  "paymentStatus": "paid",
  "orderStatus": "completed",
  "orderDate": { "$date": "2026-08-29T10:30:00Z" },
  "updatedAt": { "$date": "2026-08-29T10:30:00Z" }
}
```

### 5. Payments Collection
Tracks all financial transactions.

```json
{
  "_id": { "$oid": "..." },
  "vendorId": { "$oid": "vendor_id" },
  "userId": { "$oid": "user_id" },
  "amount": 1500.00,
  "paymentMethod": "bank_transfer",
  "paymentStatus": "completed",
  "paymentDate": { "$date": "2026-08-29T00:00:00Z" },
  "notes": "Monthly payment for August",
  "createdAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 6. ExpiryLogs Collection
Tracks expired medicines and replacement requests.

```json
{
  "_id": { "$oid": "..." },
  "medicineId": { "$oid": "medicine_id" },
  "vendorId": { "$oid": "vendor_id" },
  "medicineName": "Paracetamol 500mg",
  "quantityExpired": 50,
  "expiryDate": { "$date": "2026-08-15" },
  "replacementRequested": true,
  "replacementDate": { "$date": "2026-08-20" },
  "status": "replaced",
  "createdAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 7. Alternatives Collection (Aura DB)
Stores alternative medicine suggestions for out-of-stock items. A single medicine can have multiple alternative medicines.

```json
{
  "_id": { "$oid": "..." },
  "originalMedicineId": { "$oid": "medicine_id" },
  "alternativeMedicineId": { "$oid": "alt_medicine_id" },
  "alternativeName": "Crocin 500mg",
  "similarityScore": 0.95,
  "isAvailable": true,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 8. Notifications Collection
Stores notifications sent to customers when their desired medicine is not found in inventory and no alternatives are available.

```json
{
  "_id": { "$oid": "..." },
  "userId": { "$oid": "customer_user_id" },
  "type": "out_of_stock",
  "title": "Medicine Not Available",
  "message": "The medicine you searched for (Paracetamol 500mg) is currently not available in our inventory.",
  "medicineId": { "$oid": "medicine_id" },
  "isRead": false,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 9. Supplies Collection
Stores supply entry records when new stock arrives from suppliers.

```json
{
  "_id": { "$oid": "..." },
  "medicineId": { "$oid": "medicine_id" },
  "codeNumber": "MED-001",
  "quantitySupplied": 200,
  "batchNumber": "BATCH-2026-001",
  "expiryDate": { "$date": "2027-06-30" },
  "supplierId": { "$oid": "vendor_id" },
  "supplyDate": { "$date": "2026-08-29T00:00:00Z" },
  "pdfGenerated": true,
  "pdfUrl": "https://example.com/pdfs/supply-MED-001-2026-08-29.pdf",
  "createdAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

### 10. Cart Items Collection
Stores shopping cart items for customers before checkout.

```json
{
  "_id": { "$oid": "..." },
  "userId": { "$oid": "customer_user_id" },
  "medicineId": { "$oid": "medicine_id" },
  "medicineName": "Paracetamol 500mg",
  "quantity": 2,
  "unitPrice": 2.50,
  "createdAt": { "$date": "2026-08-29T00:00:00Z" },
  "updatedAt": { "$date": "2026-08-29T00:00:00Z" }
}
```

## Relationship Summary

| Relationship | Type | MongoDB Pattern |
|--------------|------|-----------------|
| User → Orders | One-to-Many | Reference (Order stores customerId) |
| Order → OrderItems | One-to-Many | Embedded array in Order |
| Medicine → Vendor | Many-to-One | Reference (Medicine stores vendorId) |
| Medicine → ExpiryLogs | One-to-Many | Reference (ExpiryLog stores medicineId) |
| Vendor → Medicines | One-to-Many | Reference |
| Vendor → Payments | One-to-Many | Reference (Payment stores vendorId) |
| Medicine → Alternatives | One-to-Many | Reference (Alternative stores originalMedicineId) |
| User → Notifications | One-to-Many | Reference (Notification stores userId) |
| Medicine → Supplies | One-to-Many | Reference (Supply stores medicineId) |
| Vendor → Supplies | One-to-Many | Reference (Supply stores supplierId) |
| Shop → Medicines | One-to-Many | Reference (Medicine stores shopId) |
| Shop → Users | One-to-Many | Reference (User stores shopId) |
| User → Cart Items | One-to-Many | Reference (CartItem stores userId) |
| Medicine → Cart Items | One-to-Many | Reference (CartItem stores medicineId) |

## Index Recommendations

```javascript
// Users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "shopId": 1 })

// Shops
db.shops.createIndex({ "shopName": 1 })
db.shops.createIndex({ "gstNumber": 1 })

// Medicines
db.medicines.createIndex({ "vendorId": 1 })
db.medicines.createIndex({ "shopId": 1 })
db.medicines.createIndex({ "expiryDate": 1 })
db.medicines.createIndex({ "name": "text", "genericName": "text" })
db.medicines.createIndex({ "quantityInStock": 1 })
db.medicines.createIndex({ "medicineType": 1 })
db.medicines.createIndex({ "quantityUnit": 1 })
db.medicines.createIndex({ "medicineSystem": 1 })
db.medicines.createIndex({ "codeNumber": 1 }, { unique: true })
db.medicines.createIndex({ "manufactureDate": 1 })

// Orders
db.orders.createIndex({ "customerId": 1 })
db.orders.createIndex({ "orderDate": -1 })

// Payments
db.payments.createIndex({ "vendorId": 1 })
db.payments.createIndex({ "paymentDate": -1 })

// ExpiryLogs
db.expirylogs.createIndex({ "expiryDate": 1 })
db.expirylogs.createIndex({ "vendorId": 1 })
db.expirylogs.createIndex({ "status": 1 })

// Notifications
db.notifications.createIndex({ "userId": 1 })
db.notifications.createIndex({ "isRead": 1 })
db.notifications.createIndex({ "createdAt": -1 })

// Supplies
db.supplies.createIndex({ "medicineId": 1 })
db.supplies.createIndex({ "supplierId": 1 })
db.supplies.createIndex({ "supplyDate": -1 })
db.supplies.createIndex({ "batchNumber": 1 })

// Cart Items
db.cartitems.createIndex({ "userId": 1 })
db.cartitems.createIndex({ "medicineId": 1 })
```
