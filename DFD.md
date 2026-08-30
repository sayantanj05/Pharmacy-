# Data Flow Diagrams (DFD) — Pharmacy Stock & Expiry Tracker

## DFD Level 0 — Context Diagram

Level 0 shows the entire system as a single process and its interactions with external entities (users and external systems).

```mermaid
flowchart LR
    subgraph External["External Entities"]
        C[Customer]
        SO[Shop Owner]
        SA[Super Admin / Supplier]
        DB[(MongoDB Atlas)]
        AURA[(Aura DB)]
    end

    subgraph System["Pharmacy Stock & Expiry Tracker"]
        P0[0.0\nPharmacy System]
    end

    C -->|Search / Purchase / View Alternatives| P0
    SO -->|Manage Inventory / Track Expiry / Generate Reports / Enter Supply| P0
    SA -->|Manage Vendors / Manage Users / View Analytics| P0
    P0 -->|Medicine Details / Orders / Receipts / Notifications| C
    P0 -->|Inventory Lists / Expiry Reports / PDFs / Analytics| SO
    P0 -->|System Reports / User Management| SA
    P0 -->|Store / Retrieve Data| DB
    P0 -->|Query Alternative Medicines| AURA
```

---

## DFD Level 1 — System Decomposition

Level 1 breaks the system into major functional processes and shows data flows between them.

```mermaid
flowchart TD
    C[Customer]
    SO[Shop Owner]
    SA[Super Admin / Supplier]
    DB[(MongoDB Atlas)]
    AURA[(Aura DB)]
    PDF[(PDF Generator)]

    subgraph System["Pharmacy Stock & Expiry Tracker — Level 1"]
        1["1.0\nManage Inventory"]
        2["2.0\nProcess Orders"]
        3["3.0\nHandle Search & Alternatives"]
        4["4.0\nTrack Expiry & Replacements"]
        5["5.0\nManage Users & Vendors"]
        6["6.0\nGenerate Reports"]
        7["7.0\nHandle Notifications"]
        8["8.0\nSupply Management & PDF Generation"]
        9["9.0\nCustomer Self-Registration"]
        10["10.0\nRegister Shop Owner"]
        11["11.0\nRegister Supplier"]
    end

    C -->|Search Query| 3
    C -->|Place Order| 2
    C -->|View Notifications| 7
    C -->|Self-Register| 9

    SO -->|Add / Update Medicine| 1
    SO -->|View Inventory| 1
    SO -->|Confirm Order| 2
    SO -->|Enter Supply Details| 8
    SO -->|Request Expiry Report| 4
    SO -->|Request Replacement| 4
    SO -->|Request Reports| 6
    SO -->|Manage Vendors| 5
    SO -->|Register Supplier| 11

    SA -->|Manage Users| 5
    SA -->|Manage Vendors| 5
    SA -->|View System Analytics| 6
    SA -->|Register Shop Owner| 10

    1 <-->|Medicine Data| DB
    2 <-->|Order Data| DB
    3 <-->|Medicine Catalog| DB
    3 <-->|Alternative Queries| AURA
    4 <-->|Expiry Logs| DB
    5 <-->|User / Vendor Data| DB
    6 <-->|Payment / Transaction Data| DB
    7 <-->|Notification Data| DB
    8 <-->|Supply Data| DB
    8 -->|Generate PDF| PDF
    PDF -->|PDF URL / Download| SO
    9 -->|Create Customer Account| DB
    10 -->|Create Shop & Shop Owner| DB
    11 -->|Create Supplier Account| DB

    3 -->|Out of Stock Event| 7
    2 -->|Stock Update| 1
    2 -->|Payment Record| 6
    8 -->|Update Quantity| 1
    9 -->|Login Success| C
```

---

## DFD Level 2 — Detailed Process Flows

### 2.1 Manage Inventory (1.0)

```mermaid
flowchart TD
    SO[Shop Owner]
    DB[(MongoDB Atlas)]

    subgraph P1["1.0 Manage Inventory"]
        1.1["1.1\nAdd / Update Medicine"]
        1.2["1.2\nView Inventory"]
        1.3["1.3\nUpdate Stock Level"]
    end

    SO -->|Medicine Details\n(codeNumber, type, system, quantityUnit, imageUrl, manufactureDate, expiryDate)| 1.1
    SO -->|Search / Filter Request| 1.2
    SO -->|Quantity Adjustment| 1.3

    1.1 -->|Validate & Store Medicine| DB
    1.2 -->|Retrieve Medicine List| DB
    1.3 -->|Update quantityInStock| DB

    1.3 -.->|Trigger Reorder Alert| 1.1
```

### 2.2 Process Orders (2.0)

```mermaid
flowchart TD
    C[Customer]
    SO[Shop Owner]
    DB[(MongoDB Atlas)]

    subgraph P2["2.0 Process Orders"]
        2.1["2.1\nCreate Order"]
        2.2["2.2\nUpdate Stock"]
        2.3["2.3\nRecord Payment"]
    end

    C -->|Medicine Selection & Quantity| 2.1
    2.1 -->|Validate Availability| 2.2
    2.2 -->|Confirm Stock Deduction| 2.1
    2.1 -->|Generate Order| DB
    2.2 -->|Deduct quantityInStock| DB
    SO -->|Confirm / Reject Order| 2.1
    C -->|Payment Confirmation| 2.3
    2.3 -->|Store Payment Record| DB
    2.3 -->|Trigger Report Update| P6[6.0 Generate Reports]
```

### 2.3 Handle Search & Alternatives (3.0)

```mermaid
flowchart TD
    C[Customer]
    DB[(MongoDB Atlas)]
    AURA[(Aura DB)]
    P7[7.0 Handle Notifications]

    subgraph P3["3.0 Handle Search & Alternatives"]
        3.1["3.1\nSearch Medicines"]
        3.2["3.2\nSuggest Alternatives"]
    end

    C -->|Search Query\n(name, type, system, category)| 3.1
    3.1 -->|Query Medicines| DB
    DB -->|Return Results| 3.1
    3.1 -->|Medicine Details + Images| C

    3.1 -->|Out of Stock Event| 3.2
    3.2 -->|Query Alternatives| AURA
    AURA -->|Alternative Medicine List| 3.2
    3.2 -->|Show Alternatives| C

    3.2 -->|No Alternative Found| P7
```

### 2.4 Track Expiry & Replacements (4.0)

```mermaid
flowchart TD
    SO[Shop Owner]
    DB[(MongoDB Atlas)]

    subgraph P4["4.0 Track Expiry & Replacements"]
        4.1["4.1\nMonitor Expiry Dates"]
        4.2["4.2\nGenerate Expired List"]
        4.3["4.3\nRequest Replacement"]
    end

    DB -->|Medicine Records| 4.1
    4.1 -->|Check expiryDate vs Today| 4.1
    4.1 -->|Flag Expired Medicines| DB

    SO -->|Request Expired List| 4.2
    4.2 -->|Query Expired Medicines| DB
    4.2 -->|Expired Medicines Report| SO

    SO -->|Select Expired Items & Vendor| 4.3
    4.3 -->|Create Replacement Request| DB
    4.3 -->|Vendor-wise Replacement List| SO
```

### 2.5 Manage Users & Vendors (5.0)

```mermaid
flowchart TD
    SA[Super Admin]
    SO[Shop Owner]
    DB[(MongoDB Atlas)]

    subgraph P5["5.0 Manage Users & Vendors"]
        5.1["5.1\nManage Users"]
        5.2["5.2\nManage Vendors"]
    end

    SA -->|Add / Update / Delete Users| 5.1
    5.1 -->|Store User Records| DB

    SO -->|Add / Update Vendor Details| 5.2
    SA -->|Add / Update Vendor Details| 5.2
    5.2 -->|Store Vendor Records| DB

    5.1 -->|User Role Data| P6[6.0 Generate Reports]
    5.2 -->|Vendor Data| P6[6.0 Generate Reports]
```

### 2.6 Generate Reports (6.0)

```mermaid
flowchart TD
    SO[Shop Owner]
    SA[Super Admin]
    DB[(MongoDB Atlas)]

    subgraph P6["6.0 Generate Reports"]
        6.1["6.1\nFinancial Reports"]
        6.2["6.2\nPayment Reports"]
        6.3["6.3\nAnalytics Dashboard"]
    end

    SO -->|Request Revenue / Profit Report| 6.1
    6.1 -->|Query Orders & Payments| DB
    6.1 -->|Revenue & Profit Data| SO

    SO -->|Request Vendor-wise Payments| 6.2
    SO -->|Request Customer-wise Payments| 6.2
    6.2 -->|Query Payment Records| DB
    6.2 -->|Payment Reports| SO

    SA -->|Request System Analytics| 6.3
    6.3 -->|Aggregate Data| DB
    6.3 -->|System Analytics| SA
```

### 2.7 Handle Notifications (7.0)

```mermaid
flowchart TD
    P3[3.0 Handle Search & Alternatives]
    C[Customer]
    DB[(MongoDB Atlas)]

    subgraph P7["7.0 Handle Notifications"]
        7.1["7.1\nCreate Notification"]
        7.2["7.2\nView Notifications"]
    end

    P3 -->|Medicine Not Found + No Alternatives| 7.1
    7.1 -->|Generate Notification Record| DB
    7.1 -->|Title, Message, Medicine Reference| DB

    C -->|Request Notifications| 7.2
    7.2 -->|Query User Notifications| DB
    7.2 -->|Notification List| C
```

### 2.8 Supply Management & PDF Generation (8.0)

```mermaid
flowchart TD
    SO[Shop Owner]
    DB[(MongoDB Atlas)]
    PDF[(PDF Generator)]

    subgraph P8["8.0 Supply Management & PDF Generation"]
        8.1["8.1\nEnter Supply Details"]
        8.2["8.2\nUpdate Inventory"]
        8.3["8.3\nGenerate Supplier PDF"]
    end

    SO -->|Code Number, Quantity, Batch No., Expiry Date, Supplier ID| 8.1
    8.1 -->|Validate Medicine Exists| DB
    8.1 -->|Create Supply Record| DB

    8.1 -->|Trigger Stock Update| 8.2
    8.2 -->|Update quantityInStock| DB

    SO -->|Request PDF| 8.3
    8.3 -->|Fetch Supply Details| DB
    8.3 -->|Generate PDF Document| PDF
    PDF -->|PDF URL / File| 8.3
    8.3 -->|Shareable PDF| SO
```

---

## Data Flow Summary

| Process | Inputs | Outputs | Data Store |
|---------|--------|---------|------------|
| 1.0 Manage Inventory | Medicine details, stock adjustments | Updated inventory, reorder alerts | MongoDB Atlas |
| 2.0 Process Orders | Medicine selection, payment confirmation | Order confirmation, stock deduction | MongoDB Atlas |
| 3.0 Handle Search & Alternatives | Search query | Medicine results, alternative suggestions | MongoDB Atlas, Aura DB |
| 4.0 Track Expiry & Replacements | Expiry scan, replacement request | Expired list, vendor-wise replacement report | MongoDB Atlas |
| 5.0 Manage Users & Vendors | User/Vendor details | User accounts, vendor records | MongoDB Atlas |
| 6.0 Generate Reports | Report request | Revenue, profit, payment reports | MongoDB Atlas |
| 7.0 Handle Notifications | Out-of-stock event | Notification records | MongoDB Atlas |
| 8.0 Supply Management & PDF Generation | Supply details, PDF request | Supply records, updated stock, PDF | MongoDB Atlas, PDF Generator |
| 9.0 Customer Self-Registration | Registration details | Customer account | MongoDB Atlas |
| 10.0 Register Shop Owner | Shop owner details, shop details | Shop record, shop owner account | MongoDB Atlas |
| 11.0 Register Supplier | Supplier details | Supplier account | MongoDB Atlas |

---

## External Data Stores

| Data Store | Description | Used By |
|------------|-------------|---------|
| MongoDB Atlas | Primary database for medicines, users, orders, payments, expiry logs, alternatives, notifications, supplies | All processes |
| Aura DB | Alternative medicine suggestion engine | 3.0 Handle Search & Alternatives |
| PDF Generator | Generates shareable supplier PDFs | 8.0 Supply Management & PDF Generation |

---

## Notes

- All data flows between processes and data stores use RESTful or GraphQL APIs.
- Real-time updates ensure stock levels, expiry status, and notifications are immediately reflected.
- The PDF generation process is asynchronous to avoid blocking the supply entry workflow.
- Notifications are triggered automatically when a medicine search yields no results and no alternatives are available.
