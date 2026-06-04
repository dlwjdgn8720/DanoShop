import pool from "../db/connection.js";

/**
 * 리뷰 목록 조회
 */
export const getTextReviews = async (pid) => {
  const sql = `
    SELECT
      *  FROM review
    WHERE pid = ?
    ORDER BY rid DESC
  `;

  const [rows] = await pool.execute(sql, [pid]);

  return rows;
};

/**
 * 미디어 리뷰 조회
 */
export const getMediaReviews = async (pid) => {
  const sql = `
    SELECT
     *
    FROM media_review
    WHERE pid = ?
  `;

  const [rows] = await pool.execute(sql, [pid]);

  return rows;
};
