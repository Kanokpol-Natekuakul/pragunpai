import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateOtp,
  generateToken,
  hashSecret,
  verifySecret,
} from "./crypto";

describe("crypto helpers", () => {
  describe("generateOtp", () => {
    it("generates a 6-digit numeric string", () => {
      const otp = generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("generates random codes that differ on successive runs", () => {
      const otp1 = generateOtp();
      const otp2 = generateOtp();
      // OTPs could theoretically be identical (1 in a million chance),
      // but for unit testing this is generally reliable enough.
      expect(otp1).not.toBe(otp2);
    });
  });

  describe("generateToken", () => {
    it("generates a 64-character hex string", () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
    });
  });

  describe("hashPassword and verifyPassword", () => {
    it("hashes and verifies passwords successfully", async () => {
      const password = "SuperSecretPassword123!";
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      
      const isCorrect = await verifyPassword(password, hash);
      expect(isCorrect).toBe(true);
      
      const isWrong = await verifyPassword("WrongPassword", hash);
      expect(isWrong).toBe(false);
    });
  });

  describe("hashSecret and verifySecret", () => {
    it("hashes and verifies short secrets successfully", async () => {
      const otp = "123456";
      const hash = await hashSecret(otp);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(otp);
      
      const isCorrect = await verifySecret(otp, hash);
      expect(isCorrect).toBe(true);
      
      const isWrong = await verifySecret("654321", hash);
      expect(isWrong).toBe(false);
    });

    it("returns false if hash is null or undefined", async () => {
      const isCorrectNull = await verifySecret("123456", null);
      expect(isCorrectNull).toBe(false);

      const isCorrectUndefined = await verifySecret("123456", undefined);
      expect(isCorrectUndefined).toBe(false);
    });
  });
});
