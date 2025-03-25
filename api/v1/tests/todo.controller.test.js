import { pool } from "../../db/index.js";
import {
  getAllTodosForUser,
  addTodo,
  removeTodo,
} from "../controllers/todo.controller.js";
import ApiError from "../utils/ApiError.js";

jest.mock("../../db/index.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("Todo Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      user: { id: 1 },
      body: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getAllTodosForUser", () => {
    it("should get all todos for authenticated user", async () => {
      const mockTodos = [
        { id: 1, title: "Test Todo", description: "Test Description" },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockTodos });

      await getAllTodosForUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
        mockReq.user.id,
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockTodos,
          statusCode: 200,
        })
      );
    });

    it("should throw error if user is not authenticated", async () => {
      mockReq.user = null;

      await expect(getAllTodosForUser(mockReq, mockRes)).rejects.toThrow(
        ApiError
      );
    });
  });

  describe("addTodo", () => {
    it("should add a new todo successfully", async () => {
      mockReq.body = {
        title: "New Todo",
        description: "New Description",
      };
      const mockNewTodo = { id: 1, ...mockReq.body };
      pool.query.mockResolvedValueOnce({ rows: [mockNewTodo], rowCount: 1 });

      await addTodo(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
        mockReq.user.id,
        mockReq.body.title,
        mockReq.body.description,
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockNewTodo,
          statusCode: 201,
        })
      );
    });

    it("should throw error if title or description is missing", async () => {
      mockReq.body = { title: "", description: "" };

      await expect(addTodo(mockReq, mockRes)).rejects.toThrow(ApiError);
    });

    it("should throw error if todo creation fails", async () => {
      mockReq.body = {
        title: "New Todo",
        description: "New Description",
      };
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(addTodo(mockReq, mockRes)).rejects.toThrow(ApiError);
    });
  });

  describe("removeTodo", () => {
    it("should remove a todo successfully", async () => {
      mockReq.params = { id: "1" };
      pool.query
        .mockResolvedValueOnce({ rowCount: 1 }) // For checking todo existence
        .mockResolvedValueOnce({ rowCount: 1 }); // For deletion

      await removeTodo(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 200,
          message: expect.any(String),
        })
      );
    });

    it("should throw error if todo not found", async () => {
      mockReq.params = { id: "999" };
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(removeTodo(mockReq, mockRes)).rejects.toThrow(ApiError);
    });

    it("should throw error if todo deletion fails", async () => {
      mockReq.params = { id: "1" };
      pool.query
        .mockResolvedValueOnce({ rowCount: 1 }) // For checking todo existence
        .mockResolvedValueOnce({ rowCount: 0 }); // For deletion failure

      await expect(removeTodo(mockReq, mockRes)).rejects.toThrow(ApiError);
    });
  });
});
