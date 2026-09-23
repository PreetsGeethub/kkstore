import request from "supertest";
import app from "../src/app.js";

describe("Health check", () => {
  test("GET / should return KK Store API status", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "KK Store API Running",
    });
  });
});