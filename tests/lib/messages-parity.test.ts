import { describe, expect, it } from "vitest";
import ru from "@/messages/ru.json";
import kg from "@/messages/kg.json";

type Json = Record<string, unknown>;

/** Flatten a nested message object into dot-path leaf keys. */
function leafKeys(obj: Json, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" && !Array.isArray(v)
      ? leafKeys(v as Json, path)
      : [path];
  });
}

const ruKeys = leafKeys(ru as Json);
const kgKeys = leafKeys(kg as Json);
const ruSet = new Set(ruKeys);
const kgSet = new Set(kgKeys);

describe("i18n message parity (ru ⇄ kg)", () => {
  it("kg has every key ru has", () => {
    const missing = ruKeys.filter((k) => !kgSet.has(k));
    expect(missing, `kg.json is missing keys:\n${missing.join("\n")}`).toEqual([]);
  });

  it("ru has every key kg has", () => {
    const missing = kgKeys.filter((k) => !ruSet.has(k));
    expect(missing, `ru.json is missing keys:\n${missing.join("\n")}`).toEqual([]);
  });

  it("has no duplicate leaf keys", () => {
    expect(new Set(ruKeys).size).toBe(ruKeys.length);
    expect(new Set(kgKeys).size).toBe(kgKeys.length);
  });

  it("has no empty string values in either locale", () => {
    const emptyIn = (obj: Json) =>
      leafKeys(obj).filter((path) => {
        const val = path
          .split(".")
          .reduce<unknown>((acc, seg) => (acc as Json)?.[seg], obj);
        return typeof val === "string" && val.trim() === "";
      });
    expect(emptyIn(ru as Json)).toEqual([]);
    expect(emptyIn(kg as Json)).toEqual([]);
  });
});
