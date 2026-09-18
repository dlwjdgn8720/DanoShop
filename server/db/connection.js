import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "danoshop",
});

//DB connect test
pool
  .getConnection()
  .then((conn) => {
    console.log(`✅ MySQL 연결 성공!! (${process.env.DB_HOST || "localhost"}/${process.env.DB_NAME || "danoshop"})`);
    conn.release();
  })
  .catch((err) => console.log("❌ MySQL 연결 실패:", err.message));

export default pool;
