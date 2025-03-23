import { Router } from "express";
import {
  addTodo,
  removeTodo,
  getAllTodosForUser,
} from "../controllers/todo.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(authMiddleware, getAllTodosForUser);
router.route("/addTodo").post(authMiddleware, addTodo);
router.route("/removeTodo/:id").delete(authMiddleware, removeTodo);

export default router;
