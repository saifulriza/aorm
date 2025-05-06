import { describe, it, expect } from "vitest";
import AORM from "../src/index";

describe("AORM Query Methods", () => {
  // Define interface untuk type safety
  interface Person {
    id: number;
    name: string;
    age: number;
    role: string;
    active: boolean;
  }

  const testData: Person[] = [
    { id: 1, name: "John", age: 30, role: "developer", active: true },
    { id: 2, name: "Jane", age: 25, role: "designer", active: true },
    { id: 3, name: "Bob", age: 40, role: "manager", active: false },
    { id: 4, name: "Alice", age: 35, role: "developer", active: true },
    { id: 5, name: "Tom", age: 28, role: "designer", active: false },
  ];

  it("should filter data with where method using value condition", () => {
    const aorm = new AORM<Person>(testData);
    const result = aorm.where("role", "developer").get();

    expect(result).toEqual([
      { id: 1, name: "John", age: 30, role: "developer", active: true },
      { id: 4, name: "Alice", age: 35, role: "developer", active: true },
    ]);
  });

  it("should filter data with where method using function condition", () => {
    const aorm = new AORM<Person>(testData);
    const result = aorm.where("age", (age: number) => age > 30).get();

    expect(result).toEqual([
      { id: 3, name: "Bob", age: 40, role: "manager", active: false },
      { id: 4, name: "Alice", age: 35, role: "developer", active: true },
    ]);
  });

  it("should select specific fields from data", () => {
    const aorm = new AORM<Person>(testData);
    type PersonSubset = Pick<Person, "id" | "name">;
    const result = aorm.select("id", "name").get() as PersonSubset[];

    expect(result).toEqual([
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "Bob" },
      { id: 4, name: "Alice" },
      { id: 5, name: "Tom" },
    ]);
  });

  it("should order data ascending by field", () => {
    const aorm = new AORM<Person>(testData);
    const result = aorm.orderBy("name").get();

    expect(result[0].name).toBe("Alice");
    expect(result[4].name).toBe("Tom");
  });

  it("should order data descending by field", () => {
    const aorm = new AORM<Person>(testData);
    const result = aorm.orderBy("age", "desc").get();

    expect(result[0].age).toBe(40); // Bob
    expect(result[4].age).toBe(25); // Jane
  });

  it("should return distinct values by field", () => {
    const aorm = new AORM<Person>(testData);
    const result = aorm.distinct("role").get();

    expect(result.length).toBe(3); // developer, designer, manager
    expect(result.map((item) => item.role).sort()).toEqual(
      ["developer", "designer", "manager"].sort()
    );
  });

  it("should support chaining multiple query methods", () => {
    const aorm = new AORM<Person>(testData);
    type PersonSubset = Pick<Person, "id" | "name" | "age">;
    const result = aorm
      .where("active", true)
      .orderBy("age", "desc")
      .select("id", "name", "age")
      .get() as PersonSubset[];

    expect(result).toEqual([
      { id: 4, name: "Alice", age: 35 },
      { id: 1, name: "John", age: 30 },
      { id: 2, name: "Jane", age: 25 },
    ]);
  });
});
