import { describe, it, expect } from "vitest";
import { normalizeApiError } from "./api-error";

describe("normalizeApiError", () => {
  it("handles Error with 401 message", () => {
    const err = new Error("Bright Data auth failed (401): Unauthorized");
    const { message, status } = normalizeApiError(err);
    expect(status).toBe(401);
    expect(message).toContain("Authentication");
  });

  it("handles Error with timeout", () => {
    const err = new Error("Request timed out");
    const { message, status } = normalizeApiError(err);
    expect(status).toBe(504);
    expect(message).toContain("timed out");
  });

  it("handles generic Error", () => {
    const err = new Error("Something went wrong");
    const { message, status } = normalizeApiError(err);
    expect(status).toBe(500);
    expect(message).toBe("Something went wrong");
  });

  it("handles non-Error", () => {
    const { message, status } = normalizeApiError("string error");
    expect(status).toBe(500);
    expect(message).toBe("string error");
  });
});
