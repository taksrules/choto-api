# API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Agents](#agents)
- [Assets](#assets)
- [Rentals](#rentals)
- [Payments](#payments)
- [Admin](#admin)
- [Borehole](#borehole)

## Authentication
Base path: `/auth`

### Register User
```http
POST /auth/register
```
**Description:** Register a new user in the system
**Authentication:** Not required
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string"
}
```
**Response:** Returns the created user object

### Login
```http
POST /auth/login
```
**Description:** Authenticate user and receive access token
**Authentication:** Not required
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:** Sets HTTP-only cookie with JWT token

### Get User Profile
```http
GET /auth/profile
```
**Description:** Retrieve authenticated user's profile details
**Authentication:** Required (JWT)
**Response:** Returns user profile information

### Update User Profile
```http
PATCH /auth/profile
```
**Description:** Update user profile details
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phoneNumber": "string (optional)",
  "location": "string (optional)"
}
```

### Get Verification Code
```http
GET /auth/verification-code
```
**Description:** Get verification code for pending user
**Authentication:** Required (JWT)

### Activate User
```http
PATCH /auth/activate
```
**Description:** Activate user account with verification code
**Request Body:**
```json
{
  "email": "string",
  "verificationCode": "string"
}
```

## Agents
Base path: `/agent`

### Register Agent
```http
POST /agent/register
```
**Description:** Register a new agent with PENDING status
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "userId": "number",
  "level": "string (BASIC|STANDARD|MAX)",
  "address": "string"
}
```

### Get Agent Profile
```http
GET /agent/:id
```
**Description:** Retrieve agent profile details including assigned assets
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Agent ID (number)

### Get Agent Balance
```http
GET /agent/:id/balance
```
**Description:** Retrieve current balance and debt of the agent
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Agent ID (number)

### Update Agent Profile
```http
PATCH /agent/:id
```
**Description:** Update agent profile details
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Agent ID (number)
**Request Body:**
```json
{
  "level": "string (optional)",
  "address": "string (optional)"
}
```

### Verify User
```http
POST /agent/verify-user
```
**Description:** Verify a user using verification code
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "email": "string",
  "verificationCode": "string"
}
```

### Distribute Tokens
```http
POST /agent/distribute-ttokens
```
**Description:** Distribute tokens to users for services
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "email": "string",
  "agentId": "number",
  "tokens": "number"
}
```

## Assets
Base path: `/asset`

### Register Asset
```http
POST /asset/register
```
**Description:** Register a new asset in the system
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "name": "string",
  "assetType": "string",
  "agentId": "number"
}
```

### Update Asset Status
```http
PATCH /asset/:id/status
```
**Description:** Update asset status (rented or available)
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Asset ID (number)
**Request Body:**
```json
{
  "status": "string (RENTED|AVAILABLE)"
}
```

### Get Agent Assets
```http
GET /asset/:id/assets
```
**Description:** Retrieve all assets assigned to an agent
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Agent ID (number)

### Get Asset Details
```http
GET /asset/:id
```
**Description:** Retrieve asset details including rental history
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Asset ID (number)

### Verify Asset
```http
GET /asset/:qrCode
```
**Description:** Retrieve asset details by QR code
**Authentication:** Required (JWT)
**Parameters:**
- `qrCode`: Asset QR Code (string)

## Rentals
Base path: `/rentals`

### Create Rental
```http
POST /rentals/create
```
**Description:** Create a new rental record
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "assetId": "number",
  "userId": "number",
  "rentalDate": "string (ISO date)"
}
```

### Return Rental
```http
PATCH /rentals/:id/return
```
**Description:** Mark a rental as returned
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Rental ID (number)

### Get Active Rentals
```http
GET /rentals/active
```
**Description:** Retrieve all active rentals
**Authentication:** Required (JWT)

### Get Rental Details
```http
GET /rentals/:id
```
**Description:** Retrieve specific rental details
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Rental ID (number)

### Book Fridge
```http
POST /rentals/fridge/book
```
**Description:** Book a fridge rental
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "fridgeId": "number",
  "userId": "number",
  "startDate": "string (ISO date)"
}
```

## Borehole
Base path: `/borehole`

### Generate Purchase Code
```http
POST /borehole/purchase
```
**Description:** Generate a purchase code for borehole water
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "boreholeId": "number",
  "amountLiters": "number"
}
```

### Generate Agent Code
```http
POST /borehole/agent-code
```
**Description:** Generate agent code after payment confirmation
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "purchaseCode": "string"
}
```

### Generate Token Code
```http
POST /borehole/token-code
```
**Description:** Generate final token code for borehole meter
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "purchaseCode": "string",
  "agentCode": "string"
}
```

## Admin
Base path: `/admin`

### Approve Agent
```http
PATCH /admin/approve-agent
```
**Description:** Approve a new agent and allocate initial tokens
**Authentication:** Required (JWT Admin)
**Request Body:**
```json
{
  "agentId": "number"
}
```

### Get All Users
```http
GET /admin/users
```
**Description:** Retrieve paginated list of all users
**Authentication:** Required (JWT Admin)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Users per page (default: 10)

### Get All Agents
```http
GET /admin/agents
```
**Description:** Retrieve paginated list of all agents
**Authentication:** Required (JWT Admin)
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Agents per page (default: 10)

### Assign Role
```http
POST /admin/assign-role
```
**Description:** Assign a new role to a user
**Authentication:** Required (JWT Admin)
**Request Body:**
```json
{
  "userId": "number",
  "role": "string (ADMIN|AGENT|USER)"
}
```

### Get System Overview
```http
GET /admin/overview
```
**Description:** Retrieve system-wide statistics
**Authentication:** Required (JWT Admin)

## Payments
Base path: `/payments`

### Make Payment
```http
POST /payments/make
```
**Description:** Create a payment record
**Authentication:** Required (JWT)
**Request Body:**
```json
{
  "amount": "number",
  "userId": "number",
  "paymentType": "string",
  "description": "string"
}
```

### Get Payment Details
```http
GET /payments/:id
```
**Description:** Retrieve specific payment record
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Payment ID (number)

### Get Transaction Details
```http
GET /payments/:id/transaction
```
**Description:** Retrieve specific transaction details
**Authentication:** Required (JWT)
**Parameters:**
- `id`: Transaction ID (number)

### Get User Payments
```http
GET /payments/user
```
**Description:** Retrieve all payments for authenticated user
**Authentication:** Required (JWT)

## General Notes

### Authentication
- Most endpoints require JWT authentication
- JWT token is provided via HTTP-only cookie after login
- Include the JWT token in the Authorization header: `Authorization: Bearer <token>`

### Error Responses
All endpoints may return the following error responses:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Requested resource not found
- `500 Internal Server Error`: Server-side error

### Pagination
Endpoints that return lists often support pagination with query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Date Formats
All dates should be provided and are returned in ISO 8601 format:
- Example: `2024-03-20T15:30:00Z`
```

This documentation provides a comprehensive overview of all available endpoints, their requirements, and expected request/response formats. Frontend developers can use this as a reference for implementing API calls in their applications.

Let me know if you need any clarification or additional details for specific endpoints!