# Choto API

A NestJS-based REST API for managing asset rentals, agent operations, and borehole water distribution.

## Features

- **Authentication**
  - User registration and login with JWT
  - Role-based access control (Admin, Agent, User)
  - User verification system

- **Asset Management**
  - Asset registration and tracking
  - QR code-based asset verification
  - Rental history tracking
  - Asset status management

- **Agent Operations**
  - Agent registration and approval system
  - Token distribution
  - Balance and debt tracking
  - Asset assignment

- **Borehole Water System**
  - Three-step verification process:
    1. Purchase code generation
    2. Agent code verification
    3. Token code generation
  - Water quantity tracking
  - Payment integration

- **Rental System**
  - Asset rental management
  - Token-based payment system
  - Rental history tracking
  - Return processing

- **Payment Processing**
  - Multiple payment methods (Ecocash, Innbucks, Cash)
  - Payment verification
  - Transaction history
  - Balance management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd choto-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/choto_db"
JWT_ACCESS_TOKEN_SECRET="your-secret-key"
JWT_ACCESS_TOKEN_EPIRATION_MS="3600000"
PORT=3000
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Debug mode
npm run start:debug
```

## API Documentation

API documentation is available at `/api/docs` when running the application. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── admin/         # Admin-related functionality
├── agent/         # Agent management
├── asset/         # Asset management
├── auth/          # Authentication and authorization
├── borehole/      # Borehole water system
├── payments/      # Payment processing
├── rentals/       # Rental management
└── users/         # User management
```

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:
- User
- Agent
- Asset
- Rental
- Payment
- Transaction
- Borehole-related models

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
