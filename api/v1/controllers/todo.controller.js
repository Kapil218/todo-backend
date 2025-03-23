import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { pool } from "../../db/index.js";

// Get all todos for a user
const getAllTodosForUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id; // Get user ID from authenticated request

  if (!userId) {
    throw new ApiError(403, "Unauthorized: User must be logged in");
  }

  const todos = await pool.query(
    "SELECT id, title, description FROM todos WHERE user_id = $1",
    [userId]
  );

  res
    .status(200)
    .json(new ApiResponse(200, todos.rows, "Todos fetched successfully"));
});

// Add a new todo
const addTodo = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const title = (req.body.title || "").trim();
  const description = (req.body.description || "").trim();

  if (!userId) {
    throw new ApiError(403, "Unauthorized: User must be logged in");
  }

  if ([title, description].some((field) => field === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const newTodo = await pool.query(
    `INSERT INTO todos (user_id, title, description) 
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, title, description]
  );

  if (newTodo.rowCount === 0) {
    throw new ApiError(500, "Failed to add todo");
  }

  res
    .status(201)
    .json(new ApiResponse(201, newTodo.rows[0], "Todo added successfully"));
});

// Remove a todo
const removeTodo = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new ApiError(403, "Unauthorized: User must be logged in");
  }

  if (!id) {
    throw new ApiError(400, "Todo ID is required");
  }

  const existingTodo = await pool.query(
    "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
    [id, userId]
  );

  if (existingTodo.rowCount === 0) {
    throw new ApiError(404, "Todo not found or not owned by user");
  }

  const deletedTodo = await pool.query("DELETE FROM todos WHERE id = $1", [id]);

  if (deletedTodo.rowCount === 0) {
    throw new ApiError(500, "Todo deletion failed");
  }

  res.status(200).json(new ApiResponse(200, null, "Todo removed successfully"));
});

export { getAllTodosForUser, addTodo, removeTodo };
