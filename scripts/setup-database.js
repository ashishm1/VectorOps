#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'smart_receipts',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up PostgreSQL database...');
    
    // Read and execute create_tables.sql
    const createTablesPath = path.join(__dirname, '..', 'create_tables.sql');
    const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
    
    console.log('Creating tables...');
    await client.query(createTablesSQL);
    console.log('✅ Tables created successfully');
    
    // Read and execute demo_data.sql
    const demoDataPath = path.join(__dirname, '..', 'demo_data.sql');
    const demoDataSQL = fs.readFileSync(demoDataPath, 'utf8');
    
    console.log('Inserting demo data...');
    await client.query(demoDataSQL);
    console.log('✅ Demo data inserted successfully');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupDatabase(); 