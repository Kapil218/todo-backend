import { jest } from "@jest/globals";
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
  let mockNext;

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
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("getAllTodosForUser", () => {
    it("should get all todos for a user successfully", async () => {
      const mockTodos = [
        { id: 1, title: "Test Todo 1" },
        { id: 2, title: "Test Todo 2" },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockTodos });

      await getAllTodosForUser(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
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

      await expect(getAllTodosForUser(mockReq, mockRes, mockNext)).rejects.toThrow(
        ApiError
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("addTodo", () => {
    it("should add a new todo successfully", async () => {
      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
      };

      const mockNewTodo = { id: 1, ...mockReq.body };
      pool.query.mockResolvedValueOnce({ rows: [mockNewTodo], rowCount: 1 });

      await addTodo(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
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

      await expect(addTodo(mockReq, mockRes, mockNext)).rejects.toThrow(ApiError);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw error if todo creation fails", async () => {
      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
      };
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(addTodo(mockReq, mockRes, mockNext)).rejects.toThrow(ApiError);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("removeTodo", () => {
    it("should delete a todo successfully", async () => {
      mockReq.params = { id: "1" };
      pool.query
        .mockResolvedValueOnce({ rowCount: 1 }) // Todo exists
        .mockResolvedValueOnce({ rowCount: 1 }); // Deletion successful

      await removeTodo(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if todo doesn't exist", async () => {
      mockReq.params = { id: "999" };
      pool.query.mockResolvedValueOnce({ rowCount: 0 }); // Todo doesn't exist

      await expect(removeTodo(mockReq, mockRes, mockNext)).rejects.toThrow(ApiError);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw error if deletion fails", async () => {
      mockReq.params = { id: "1" };
      pool.query
        .mockResolvedValueOnce({ rowCount: 1 }) // Todo exists
        .mockResolvedValueOnce({ rowCount: 0 }); // Deletion fails

      await expect(removeTodo(mockReq, mockRes, mockNext)).rejects.toThrow(ApiError);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
