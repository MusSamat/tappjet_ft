import { describe, it, expect } from "vitest";
import { uuid } from "@/lib/utils/uuid";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("uuid", () => {
  it("returns a v4-format UUID string", () => {
    expect(uuid()).toMatch(UUID_RE);
  });

  it("returns a different value each call", () => {
    const ids = new Set(Array.from({ length: 20 }, uuid));
    expect(ids.size).toBe(20);
  });

  it("version nibble is always '4'", () => {
    for (let i = 0; i < 10; i++) {
      expect(uuid()[14]).toBe("4");
    }
  });

  it("variant nibble is 8, 9, a, or b", () => {
    for (let i = 0; i < 10; i++) {
      expect(["8", "9", "a", "b"]).toContain(uuid()[19]);
    }
  });
});
