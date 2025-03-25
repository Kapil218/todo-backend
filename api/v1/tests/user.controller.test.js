import { pool } from "../../../db/index.js";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { hashValue, compareValue } from "../utils/bcrypt.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtTokens.js";
import ApiError from "../utils/ApiError.js";

jest.mock("../../../db/index.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("../utils/bcrypt.js", () => ({
  hashValue: jest.fn(),
  compareValue: jest.fn(),
}));

jest.mock("../utils/jwtTokens.js", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

describe("User Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      mockReq.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const hashedPassword = "hashedPassword123";
      const newUser = {
        id: 1,
        name: mockReq.body.name,
        email: mockReq.body.email,
      };

      hashValue.mockResolvedValueOnce(hashedPassword);
      pool.query
        .mockResolvedValueOnce({ rowCount: 0 }) // User doesn't exist
        .mockResolvedValueOnce({ rows: [newUser], rowCount: 1 }); // User created

      await registerUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(hashValue).toHaveBeenCalledWith(mockReq.body.password);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: newUser,
          statusCode: 201,
        })
      );
    });

    it("should throw error if required fields are missing", async () => {
      mockReq.body = {
        name: "",
        email: "",
        password: "",
      };

      await expect(registerUser(mockReq, mockRes)).rejects.toThrow(ApiError);
    });

    it("should throw error if user already exists", async () => {
      mockReq.body = {
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
      };

      pool.query.mockResolvedValueOnce({ rowCount: 1 }); // User exists

      await expect(registerUser(mockReq, mockRes)).rejects.toThrow(ApiError);
    });
  });

  describe("loginUser", () => {
    it("should login user successfully", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      const user = {
        id: 1,
        name: "Test User",
        email: mockReq.body.email,
        password: "hashedPassword",
      };

      const accessToken = "test-access-token";
      const refreshToken = "test-refresh-token";

      pool.query.mockResolvedValueOnce({ rows: [user], rowCount: 1 });
      compareValue.mockResolvedValueOnce(true);
      generateAccessToken.mockResolvedValueOnce(accessToken);
      generateRefreshToken.mockResolvedValueOnce(refreshToken);
      pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Update refresh token

      await loginUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(compareValue).toHaveBeenCalledWith(
        mockReq.body.password,
        user.password
      );
      expect(generateAccessToken).toHaveBeenCalledWith(
        user.id,
        user.name,
        user.email
      );
      expect(generateRefreshToken).toHaveBeenCalledWith(user.id);
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if required fields are missing", async () => {
      mockReq.body = {
        email: "",
        password: "",
      };

      await expect(loginUser(mockReq, mockRes)).rejects.toThrow(ApiError);
    });

    it("should throw error if user not found", async () => {
      mockReq.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(loginUser(mockReq, mockRes)).rejects.toThrow(ApiError);
    });

    it("should throw error if password is incorrect", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const user = {
        id: 1,
        name: "Test User",
        email: mockReq.body.email,
        password: "hashedPassword",
      };

      pool.query.mockResolvedValueOnce({ rows: [user], rowCount: 1 });
      compareValue.mockResolvedValueOnce(false);

      await expect(loginUser(mockReq, mockRes)).rejects.toThrow(ApiError);
    });
  });
});
