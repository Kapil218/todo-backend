import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for Render PostgreSQL
});

const connectDB = async () => {
  try {
    const connectionInstance = await pool.connect();
    console.log(
      `Connected to PostgreSQL database ${connectionInstance.database}`
    );
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
export { pool };
