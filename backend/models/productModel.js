import { pool } from '../db.js';

export const getProducts = async ({ category, cursor, limit }) => {
  const parsedLimit = parseInt(limit, 10) || 20;
  let decodedCursor = null;

  if (cursor) {
    try {
      const jsonStr = Buffer.from(cursor, 'base64').toString('utf8');
      decodedCursor = JSON.parse(jsonStr);
    } catch (err) {
      console.error('Failed to decode cursor:', err);
    }
  }

  let query;
  let params;

  const categoryFilter = category || null;

  if (decodedCursor && decodedCursor.created_at && decodedCursor.id) {
    query = `
      SELECT * FROM products
      WHERE ($1::text IS NULL OR category = $1)
        AND (created_at, id) < ($2::timestamptz, $3::uuid)
      ORDER BY created_at DESC, id DESC
      LIMIT $4
    `;
    params = [categoryFilter, decodedCursor.created_at, decodedCursor.id, parsedLimit];
  } else {
    query = `
      SELECT * FROM products
      WHERE ($1::text IS NULL OR category = $1)
      ORDER BY created_at DESC, id DESC
      LIMIT $2
    `;
    params = [categoryFilter, parsedLimit];
  }

  const { rows } = await pool.query(query, params);

  let nextCursor = null;
  if (rows.length === parsedLimit) {
    const lastRow = rows[rows.length - 1];
    const cursorObj = {
      created_at: lastRow.created_at,
      id: lastRow.id
    };
    nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64');
  }

  return {
    data: rows,
    nextCursor
  };
};
