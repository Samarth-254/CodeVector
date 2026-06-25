import { pool } from './db.js';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];
const TOTAL_ROWS = 200000;
const BATCH_SIZE = 1000;

async function seed() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  
  try {
    console.log('Creating table and indexes if they do not exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        category TEXT,
        price NUMERIC(10,2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_created_at_id 
      ON products (created_at DESC, id DESC);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_created_at_id 
      ON products (category, created_at DESC, id DESC);
    `);

    console.log('Checking if table already contains data...');
    const { rows } = await client.query('SELECT COUNT(*) FROM products');
    const count = parseInt(rows[0].count, 10);
    if (count >= TOTAL_ROWS) {
      console.log(`Database already has ${count} products. Skipping seeding.`);
      return;
    }

    console.log(`Starting seed: inserting ${TOTAL_ROWS - count} products in batches of ${BATCH_SIZE}...`);
    
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const timeSpan = Date.now() - twoYearsAgo.getTime();

    const start = Date.now();
    let inserted = count;

    while (inserted < TOTAL_ROWS) {
      const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_ROWS - inserted);
      const valuePlaceholders = [];
      const values = [];

      for (let i = 0; i < currentBatchSize; i++) {
        const productIndex = inserted + i + 1;
        const name = `Product ${productIndex}`;
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const price = parseFloat((Math.random() * (1000 - 10) + 10).toFixed(2));
        const randomTime = new Date(twoYearsAgo.getTime() + Math.random() * timeSpan);

        const paramOffset = i * 4;
        valuePlaceholders.push(`($${paramOffset + 1}, $${paramOffset + 2}, $${paramOffset + 3}, $${paramOffset + 4})`);
        values.push(name, category, price, randomTime);
      }

      const query = `
        INSERT INTO products (name, category, price, created_at)
        VALUES ${valuePlaceholders.join(', ')}
      `;

      await client.query(query, values);
      inserted += currentBatchSize;

      if (inserted % 10000 === 0 || inserted === TOTAL_ROWS) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`Inserted ${inserted} / ${TOTAL_ROWS} products (${elapsed}s)...`);
      }
    }

    console.log(`Seeding completed successfully in ${((Date.now() - start) / 1000).toFixed(2)}s!`);
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
