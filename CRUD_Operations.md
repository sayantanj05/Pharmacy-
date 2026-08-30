# CRUD Operations by User Role

## Overview

This document outlines the possible CRUD (Create, Read, Update, Delete) operations that each user role can perform on the main entities of the Pharmacy Stock & Expiry Tracker system.

---

## 1. Customer

| Operation | Medicines | Orders | Notifications | Profile | Cart |
|-----------|-----------|--------|---------------|---------|------|
| **Create** | - | Place new order, Add to cart | - | Self-register account | Add items to cart |
| **Read** | Search, view details & images, view alternatives | View order history & status | View notifications | View own profile | View cart items |
| **Update** | - | Cancel order (if allowed) | Mark notifications as read | Update profile (name, phone, address) | Update cart quantities |
| **Delete** | - | Cancel order | Delete read notifications | Delete own account | Remove items from cart |

**Notes:**
- Customers cannot modify inventory or system data.
- Customers can only access their own orders and notifications.

---

## 2. Shop Owner

| Operation | Medicines | Supplies | Vendors | Orders | Expiry Logs | Reports | Shop Profile |
|-----------|-----------|----------|---------|--------|-------------|---------|--------------|
| **Create** | Add new medicine | Enter supply details | Register supplier | Process orders | Log expired medicines | Generate reports | Update shop info |
| **Read** | View inventory, search, filter by type/system | View supply history | View vendor list & details | View customer orders | View expired items, replacement status | Revenue, profit, payment reports | View shop details |
| **Update** | Update medicine details, stock levels | Update supply records | Update vendor information | Update order status | Update replacement status | Refresh reports | Update shop profile |
| **Delete** | Remove medicines from inventory | Delete supply records | Remove vendors | Cancel/void orders | Delete expiry logs | - | - |

**Notes:**
- Shop Owners can only manage medicines, supplies, and vendors within their own shop (`shopId`).
- Shop Owners cannot manage other shops or system-wide users.

---

## 3. Super Admin (Supplier)

| Operation | Shops | Users | Vendors | System Settings | Analytics |
|-----------|-------|-------|---------|-----------------|-----------|
| **Create** | Create new shop | Register shop owners, create user accounts | Register system-wide vendors | Configure system parameters | - |
| **Read** | View all shops, shop details | View all users, roles, permissions | View all vendors across shops | View system configuration | View system-wide analytics, revenue, usage stats |
| **Update** | Update shop details | Update user roles, activate/deactivate accounts | Update vendor master data | Update system settings | - |
| **Delete** | Delete shops | Delete user accounts | Delete vendors | Reset system configuration | - |

**Notes:**
- Super Admin has full system access across all shops.
- Super Admin registers Shop Owners and their associated shop details.
- Super Admin can view aggregated data across all shops but typically does not manage day-to-day inventory.

---

## 4. Entity-Level CRUD Matrix

| Entity | Customer | Shop Owner | Super Admin |
|--------|----------|------------|-------------|
| **Users** | Read own profile, Update own profile | Read own shop staff, Update own shop staff | Create users, Read all users, Update all users, Delete users |
| **Shops** | - | Read own shop, Update own shop | Create shops, Read all shops, Update all shops, Delete shops |
| **Medicines** | Read search/details | Create, Read own shop medicines, Update own shop medicines, Delete own shop medicines | Read all medicines (system-wide) |
| **Orders** | Create own orders, Read own orders, Cancel own orders | Read shop orders, Update order status | Read all orders |
| **Vendors** | - | Create, Read own vendors, Update own vendors, Delete own vendors | Create, Read all vendors, Update all vendors, Delete all vendors |
| **Supplies** | - | Create, Read own supplies, Update own supplies, Delete own supplies | Read all supplies |
| **Expiry Logs** | - | Create, Read own logs, Update replacement status, Delete own logs | Read all logs |
| **Notifications** | Create (triggered), Read own, Update read status, Delete own | - | - |
| **Reports** | - | Generate financial, expiry, supply reports | Generate system analytics reports |
| **PDFs** | Download own invoices | Generate supplier PDFs, download reports | - |

---

## 5. Access Control Summary

| Data Scope | Customer | Shop Owner | Super Admin |
|------------|----------|------------|-------------|
| Own data only | Yes | Yes (within shop) | No (system-wide access) |
| Shop-level data | No | Yes (own shop only) | Yes (all shops) |
| System-wide data | No | No | Yes |

---

## 6. Special Constraints

- **Code Number** on medicines must be unique and not null (enforced at API level).
- **Manufacture Date** must be earlier than or equal to Expiry Date.
- **Supply entries** require valid `medicineId` and `supplierId` references.
- **Vendor-wise replacement** requests are restricted to the Shop Owner's own shop medicines.
- **Customer self-registration** is open; Shop Owner and Super Admin accounts require admin creation.
