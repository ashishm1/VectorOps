# Smart Receipts App

A Next.js application for managing receipts with AI-powered features, now using PostgreSQL for data persistence.

## Features

- 📱 Receipt upload and OCR processing
- 🤖 AI-powered receipt parsing and insights
- 💰 Spending tracking and budget management
- 👥 Split expense management
- 🔔 Smart notifications and alerts
- 📊 Financial analytics and reporting

## Database Setup

This app now uses PostgreSQL instead of dummy sample data. Follow these steps to set up the database:

### 1. Install PostgreSQL

Make sure you have PostgreSQL installed and running on your system.

### 2. Create Database

```sql
CREATE DATABASE smart_receipts;
```

### 3. Configure Environment Variables

Create a `.env.local` file with your PostgreSQL configuration:

```env
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=smart_receipts
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
```

### 4. Run Database Setup

```bash
npm run db:setup
```

This will create all tables and insert demo data.

### 5. Start Development Server

```bash
npm run dev
```

## API Endpoints

- `GET /api/health` - Database health check
- `GET /api/receipts?email=user@example.com` - Get user receipts
- `POST /api/receipts` - Create new receipt
- `GET /api/quotas?email=user@example.com` - Get user quotas
- `POST /api/quotas` - Update user quota

## Database Schema

The app uses the following main tables:
- `users` - User accounts
- `receipts` - Receipt transactions
- `line_items` - Individual items in receipts
- `warranty_info` - Product warranty tracking
- `split_info` - Split expense information
- `split_participants` - Participants in splits
- `user_quotas` - Monthly spending budgets
- `notifications` - User notifications

See `create_tables.sql` for the complete schema.
# VectorOps
# VectorOps
