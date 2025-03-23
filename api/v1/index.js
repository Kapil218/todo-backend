import express from "express";
import todoRoutes from "./routes/todo.route.js";
import userRoutes from './routes/user.route.js'
const router = express.Router();

router.use("/todos", todoRoutes);
router.use("/users", userRoutes);

export default router;
