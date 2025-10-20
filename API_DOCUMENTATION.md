# SuperMarket ERP API Documentation

## Overview

This document describes the REST API endpoints required by the SuperMarket ERP frontend application. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL:** `https://api.supermarket-erp.com/api`

**Authentication:** Bearer token required for all endpoints except login.

**Content-Type:** `application/json`

---

## 1. Authentication

### `POST /api/auth/login`
- **Description:** Authenticate user and return access token
- **Request Body:**
```json
{
  "email": "admin@supermarket.com",
  "password": "password123"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@supermarket.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```
- **Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### `POST /api/auth/logout`
- **Description:** Invalidate current user session
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 2. Products

### `GET /api/products`
- **Description:** Retrieve all products with optional filtering and pagination
- **Query Parameters:**
  - `search` (string) - Search by name or SKU
  - `category` (string) - Filter by category
  - `limit` (number, default: 50) - Number of items per page
  - `offset` (number, default: 0) - Number of items to skip
  - `sortBy` (string) - Sort field (name, price, stock, created_at)
  - `sortOrder` (string) - Sort direction (asc, desc)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "sku": "PRD001",
        "name": "Bananes Bio",
        "category": "Fruits & Légumes",
        "price": 2.99,
        "cost": 1.50,
        "stock": 45,
        "minStock": 20,
        "supplier": "Bio Market",
        "barcode": "1234567890123",
        "image": "https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:45:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### `POST /api/products`
- **Description:** Create a new product
- **Request Body:**
```json
{
  "sku": "PRD002",
  "name": "Lait Entier 1L",
  "category": "Produits Laitiers",
  "price": 1.89,
  "cost": 1.20,
  "stock": 30,
  "minStock": 15,
  "supplier": "Laiterie Central",
  "barcode": "1234567890124",
  "image": "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "sku": "PRD002",
    "name": "Lait Entier 1L",
    "category": "Produits Laitiers",
    "price": 1.89,
    "cost": 1.20,
    "stock": 30,
    "minStock": 15,
    "supplier": "Laiterie Central",
    "barcode": "1234567890124",
    "image": "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg",
    "createdAt": "2024-01-20T15:30:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```
- **Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "sku": "SKU already exists",
    "price": "Price must be greater than 0"
  }
}
```

### `GET /api/products/:id`
- **Description:** Retrieve a specific product by ID
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "PRD001",
    "name": "Bananes Bio",
    "category": "Fruits & Légumes",
    "price": 2.99,
    "cost": 1.50,
    "stock": 45,
    "minStock": 20,
    "supplier": "Bio Market",
    "barcode": "1234567890123",
    "image": "https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```
- **Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

### `PUT /api/products/:id`
- **Description:** Update an existing product
- **Request Body:**
```json
{
  "name": "Bananes Bio Premium",
  "price": 3.49,
  "stock": 60,
  "minStock": 25
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "PRD001",
    "name": "Bananes Bio Premium",
    "category": "Fruits & Légumes",
    "price": 3.49,
    "cost": 1.50,
    "stock": 60,
    "minStock": 25,
    "supplier": "Bio Market",
    "barcode": "1234567890123",
    "image": "https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

### `DELETE /api/products/:id`
- **Description:** Delete a product
- **Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```
- **Response (409):**
```json
{
  "success": false,
  "error": "Cannot delete product with existing stock"
}
```

---

## 3. Stock Management

### `GET /api/stock`
- **Description:** Retrieve stock levels for all products with filtering options
- **Query Parameters:**
  - `lowStock` (boolean) - Filter products with stock <= minStock
  - `outOfStock` (boolean) - Filter products with stock = 0
  - `category` (string) - Filter by product category
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "stockItems": [
      {
        "productId": 1,
        "sku": "PRD001",
        "name": "Bananes Bio",
        "category": "Fruits & Légumes",
        "currentStock": 45,
        "minStock": 20,
        "maxStock": 100,
        "stockValue": 67.50,
        "status": "in_stock",
        "lastUpdated": "2024-01-20T14:45:00Z"
      }
    ],
    "summary": {
      "totalProducts": 150,
      "lowStockCount": 12,
      "outOfStockCount": 3,
      "totalStockValue": 45678.90
    }
  }
}
```

### `POST /api/stock/adjust`
- **Description:** Adjust stock quantity for a product
- **Request Body:**
```json
{
  "productId": 1,
  "adjustmentType": "add",
  "quantity": 25,
  "reason": "Réception marchandise",
  "reference": "BON-2024-001"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "productId": 1,
    "previousStock": 45,
    "newStock": 70,
    "adjustment": 25,
    "adjustmentType": "add",
    "reason": "Réception marchandise",
    "reference": "BON-2024-001",
    "adjustedBy": "admin@supermarket.com",
    "adjustedAt": "2024-01-20T16:30:00Z"
  }
}
```

### `POST /api/stock/transfer`
- **Description:** Transfer stock between locations or adjust for inventory corrections
- **Request Body:**
```json
{
  "productId": 1,
  "fromLocation": "warehouse",
  "toLocation": "store_floor",
  "quantity": 15,
  "reason": "Restocking shelves"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "transferId": "TRF-2024-001",
    "productId": 1,
    "fromLocation": "warehouse",
    "toLocation": "store_floor",
    "quantity": 15,
    "status": "completed",
    "transferredBy": "admin@supermarket.com",
    "transferredAt": "2024-01-20T17:00:00Z"
  }
}
```

---

## 4. Suppliers

### `GET /api/suppliers`
- **Description:** Retrieve all suppliers with optional filtering
- **Query Parameters:**
  - `search` (string) - Search by name or contact
  - `category` (string) - Filter by supplier category
- **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bio Market",
      "contact": "Jean Dupont",
      "email": "contact@biomarket.fr",
      "phone": "01 23 45 67 89",
      "address": "123 Rue de la Bio, 75001 Paris",
      "category": "Fruits & Légumes Bio",
      "paymentTerms": "30 days",
      "taxId": "FR12345678901",
      "isActive": true,
      "createdAt": "2024-01-10T09:00:00Z",
      "updatedAt": "2024-01-15T11:30:00Z"
    }
  ]
}
```

### `POST /api/suppliers`
- **Description:** Create a new supplier
- **Request Body:**
```json
{
  "name": "Laiterie Central",
  "contact": "Marie Martin",
  "email": "info@laiterie-central.fr",
  "phone": "01 23 45 67 90",
  "address": "456 Avenue du Lait, 69000 Lyon",
  "category": "Produits Laitiers",
  "paymentTerms": "15 days",
  "taxId": "FR98765432109"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Laiterie Central",
    "contact": "Marie Martin",
    "email": "info@laiterie-central.fr",
    "phone": "01 23 45 67 90",
    "address": "456 Avenue du Lait, 69000 Lyon",
    "category": "Produits Laitiers",
    "paymentTerms": "15 days",
    "taxId": "FR98765432109",
    "isActive": true,
    "createdAt": "2024-01-20T18:00:00Z",
    "updatedAt": "2024-01-20T18:00:00Z"
  }
}
```

### `GET /api/suppliers/:id`
- **Description:** Retrieve a specific supplier by ID
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bio Market",
    "contact": "Jean Dupont",
    "email": "contact@biomarket.fr",
    "phone": "01 23 45 67 89",
    "address": "123 Rue de la Bio, 75001 Paris",
    "category": "Fruits & Légumes Bio",
    "paymentTerms": "30 days",
    "taxId": "FR12345678901",
    "isActive": true,
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### `PUT /api/suppliers/:id`
- **Description:** Update an existing supplier
- **Request Body:**
```json
{
  "contact": "Jean-Pierre Dupont",
  "phone": "01 23 45 67 88",
  "paymentTerms": "45 days"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bio Market",
    "contact": "Jean-Pierre Dupont",
    "email": "contact@biomarket.fr",
    "phone": "01 23 45 67 88",
    "address": "123 Rue de la Bio, 75001 Paris",
    "category": "Fruits & Légumes Bio",
    "paymentTerms": "45 days",
    "taxId": "FR12345678901",
    "isActive": true,
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-20T18:30:00Z"
  }
}
```

### `DELETE /api/suppliers/:id`
- **Description:** Delete a supplier
- **Response (200):**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

---

## 5. Sales (POS)

### `GET /api/sales`
- **Description:** Retrieve sales transactions with filtering and pagination
- **Query Parameters:**
  - `from` (date) - Start date (YYYY-MM-DD)
  - `to` (date) - End date (YYYY-MM-DD)
  - `cashier` (string) - Filter by cashier name
  - `limit` (number, default: 50)
  - `offset` (number, default: 0)
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": 1,
        "transactionId": "TXN-2024-001",
        "date": "2024-01-20T15:30:00Z",
        "items": [
          {
            "productId": 1,
            "sku": "PRD001",
            "name": "Bananes Bio",
            "quantity": 2,
            "unitPrice": 2.99,
            "totalPrice": 5.98
          }
        ],
        "subtotal": 5.98,
        "tax": 1.20,
        "total": 7.18,
        "paymentMethod": "cash",
        "cashier": "Alice Dubois",
        "customerId": null,
        "status": "completed"
      }
    ],
    "pagination": {
      "total": 1547,
      "limit": 50,
      "offset": 0,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### `POST /api/sales`
- **Description:** Create a new sale transaction
- **Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 2.99
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 1.89
    }
  ],
  "paymentMethod": "card",
  "cashier": "Alice Dubois",
  "customerId": null,
  "discount": 0,
  "notes": "Regular customer"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "transactionId": "TXN-2024-002",
    "date": "2024-01-20T16:45:00Z",
    "items": [
      {
        "productId": 1,
        "sku": "PRD001",
        "name": "Bananes Bio",
        "quantity": 2,
        "unitPrice": 2.99,
        "totalPrice": 5.98
      },
      {
        "productId": 2,
        "sku": "PRD002",
        "name": "Lait Entier 1L",
        "quantity": 1,
        "unitPrice": 1.89,
        "totalPrice": 1.89
      }
    ],
    "subtotal": 7.87,
    "tax": 1.57,
    "discount": 0,
    "total": 9.44,
    "paymentMethod": "card",
    "cashier": "Alice Dubois",
    "customerId": null,
    "status": "completed",
    "notes": "Regular customer"
  }
}
```

### `GET /api/sales/:id`
- **Description:** Retrieve a specific sale transaction
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "transactionId": "TXN-2024-001",
    "date": "2024-01-20T15:30:00Z",
    "items": [
      {
        "productId": 1,
        "sku": "PRD001",
        "name": "Bananes Bio",
        "quantity": 2,
        "unitPrice": 2.99,
        "totalPrice": 5.98
      }
    ],
    "subtotal": 5.98,
    "tax": 1.20,
    "total": 7.18,
    "paymentMethod": "cash",
    "cashier": "Alice Dubois",
    "customerId": null,
    "status": "completed"
  }
}
```

### `PUT /api/sales/:id`
- **Description:** Process refund for a sale transaction
- **Request Body:**
```json
{
  "action": "refund",
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "reason": "Product damaged"
    }
  ],
  "refundMethod": "cash",
  "processedBy": "manager@supermarket.com"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "refundId": "REF-2024-001",
    "originalSaleId": 1,
    "refundAmount": 2.99,
    "refundMethod": "cash",
    "processedBy": "manager@supermarket.com",
    "processedAt": "2024-01-20T17:30:00Z",
    "status": "completed"
  }
}
```

---

## 6. Reports

### `GET /api/reports/sales`
- **Description:** Generate sales reports with date range and grouping options
- **Query Parameters:**
  - `from` (date, required) - Start date (YYYY-MM-DD)
  - `to` (date, required) - End date (YYYY-MM-DD)
  - `groupBy` (string) - Group by: day, week, month (default: day)
  - `category` (string) - Filter by product category
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-14",
      "to": "2024-01-20",
      "groupBy": "day"
    },
    "summary": {
      "totalSales": 15678.90,
      "totalTransactions": 234,
      "averageTransaction": 67.00,
      "topSellingCategory": "Fruits & Légumes"
    },
    "dailyData": [
      {
        "date": "2024-01-14",
        "sales": 2345.67,
        "transactions": 45,
        "averageTransaction": 52.13
      },
      {
        "date": "2024-01-15",
        "sales": 2890.45,
        "transactions": 52,
        "averageTransaction": 55.58
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Fruits & Légumes",
        "sales": 4567.89,
        "percentage": 29.1
      },
      {
        "category": "Produits Laitiers",
        "sales": 3456.78,
        "percentage": 22.1
      }
    ]
  }
}
```

### `GET /api/reports/stock`
- **Description:** Generate stock reports with current levels and movements
- **Query Parameters:**
  - `category` (string) - Filter by product category
  - `lowStock` (boolean) - Include only low stock items
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 150,
      "totalStockValue": 45678.90,
      "lowStockItems": 12,
      "outOfStockItems": 3,
      "averageStockLevel": 67.5
    },
    "stockLevels": [
      {
        "productId": 1,
        "sku": "PRD001",
        "name": "Bananes Bio",
        "category": "Fruits & Légumes",
        "currentStock": 45,
        "minStock": 20,
        "stockValue": 67.50,
        "daysOfStock": 15,
        "status": "adequate"
      }
    ],
    "recentMovements": [
      {
        "productId": 1,
        "type": "sale",
        "quantity": -5,
        "date": "2024-01-20T15:30:00Z",
        "reference": "TXN-2024-001"
      },
      {
        "productId": 1,
        "type": "adjustment",
        "quantity": 25,
        "date": "2024-01-20T16:30:00Z",
        "reference": "BON-2024-001"
      }
    ]
  }
}
```

---

## 7. Dashboard

### `GET /api/dashboard/summary`
- **Description:** Get dashboard summary statistics and key metrics
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "sales": {
      "today": 12345.67,
      "yesterday": 11234.56,
      "thisWeek": 67890.12,
      "thisMonth": 234567.89,
      "growth": {
        "daily": 9.9,
        "weekly": 12.5,
        "monthly": 8.2
      }
    },
    "transactions": {
      "today": 156,
      "yesterday": 142,
      "thisWeek": 987,
      "thisMonth": 4321,
      "averageValue": 79.13
    },
    "products": {
      "total": 150,
      "active": 147,
      "lowStock": 12,
      "outOfStock": 3,
      "newThisWeek": 5
    },
    "stock": {
      "totalValue": 45678.90,
      "turnoverRate": 2.3,
      "daysOfInventory": 45
    },
    "alerts": [
      {
        "type": "low_stock",
        "message": "12 products have low stock levels",
        "priority": "medium",
        "count": 12
      },
      {
        "type": "out_of_stock",
        "message": "3 products are out of stock",
        "priority": "high",
        "count": 3
      }
    ],
    "recentActivity": [
      {
        "type": "sale",
        "description": "Sale completed by Alice Dubois",
        "amount": 67.89,
        "timestamp": "2024-01-20T17:45:00Z"
      },
      {
        "type": "stock_adjustment",
        "description": "Stock adjusted for Bananes Bio",
        "quantity": 25,
        "timestamp": "2024-01-20T16:30:00Z"
      }
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "error message"
  }
}
```

### `401 Unauthorized`
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### `403 Forbidden`
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### `404 Not Found`
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### `409 Conflict`
```json
{
  "success": false,
  "error": "Resource conflict",
  "details": "SKU already exists"
}
```

### `500 Internal Server Error`
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Rate Limit:** 1000 requests per hour per API key
- **Headers:**
  - `X-RateLimit-Limit`: Request limit per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

## Pagination

For endpoints that return lists, pagination follows this format:

```json
{
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Date Formats

- All dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Query parameters accept date format: `YYYY-MM-DD`
- All times are in UTC

## Currency

- All monetary values are in EUR (Euros)
- Prices are represented as decimal numbers with 2 decimal places