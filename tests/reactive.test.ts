import { describe, it, expect, vi, beforeEach } from "vitest";
import AORM from "../src/index";

describe("AORM Reactive Functionality", () => {
  // Define interface for type safety
  interface TestItem {
    id: number;
    name?: string;
    value?: number;
    active?: boolean;
  }

  let aorm: AORM<TestItem>;
  let mockSubscriber1: any;
  let mockSubscriber2: any;

  beforeEach(() => {
    aorm = new AORM<TestItem>([{ id: 1, name: "Item 1" }]);
    mockSubscriber1 = vi.fn();
    mockSubscriber2 = vi.fn();
  });

  it("should immediately call subscriber with current data when subscribed", () => {
    const unsubscribe = aorm.subscribe(mockSubscriber1);

    expect(mockSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockSubscriber1).toHaveBeenCalledWith([{ id: 1, name: "Item 1" }]);

    unsubscribe();
  });

  it("should notify all subscribers when data is set", () => {
    const unsubscribe1 = aorm.subscribe(mockSubscriber1);
    const unsubscribe2 = aorm.subscribe(mockSubscriber2);

    // Clear initial calls made during subscription
    vi.clearAllMocks();

    aorm.set([{ id: 2, name: "Item 2" }]);

    expect(mockSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockSubscriber1).toHaveBeenCalledWith([{ id: 2, name: "Item 2" }]);

    expect(mockSubscriber2).toHaveBeenCalledTimes(1);
    expect(mockSubscriber2).toHaveBeenCalledWith([{ id: 2, name: "Item 2" }]);

    unsubscribe1();
    unsubscribe2();
  });

  it("should notify all subscribers when data is updated", () => {
    const unsubscribe1 = aorm.subscribe(mockSubscriber1);
    const unsubscribe2 = aorm.subscribe(mockSubscriber2);

    // Clear initial calls made during subscription
    vi.clearAllMocks();

    aorm.update((data) => [...data, { id: 2, name: "Item 2" }]);

    expect(mockSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockSubscriber1).toHaveBeenCalledWith([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    expect(mockSubscriber2).toHaveBeenCalledTimes(1);
    expect(mockSubscriber2).toHaveBeenCalledWith([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    unsubscribe1();
    unsubscribe2();
  });

  it("should notify all subscribers when an item is pushed", () => {
    const unsubscribe = aorm.subscribe(mockSubscriber1);

    // Clear initial calls made during subscription
    vi.clearAllMocks();

    aorm.push({ id: 2, name: "Item 2" });

    expect(mockSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockSubscriber1).toHaveBeenCalledWith([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    unsubscribe();
  });

  it("should notify all subscribers when items are removed", () => {
    aorm.push({ id: 2, name: "Item 2", active: false });
    aorm.push({ id: 3, name: "Item 3", active: true });

    const unsubscribe = aorm.subscribe(mockSubscriber1);

    // Clear initial calls made during subscription
    vi.clearAllMocks();

    aorm.remove((item) => item.active === false);

    expect(mockSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockSubscriber1).toHaveBeenCalledWith([
      { id: 1, name: "Item 1" },
      { id: 3, name: "Item 3", active: true },
    ]);

    unsubscribe();
  });

  it("should stop notifying after unsubscribe", () => {
    const unsubscribe = aorm.subscribe(mockSubscriber1);

    // Clear initial calls made during subscription
    vi.clearAllMocks();

    unsubscribe();

    aorm.set([{ id: 99, name: "New Item" }]);

    expect(mockSubscriber1).not.toHaveBeenCalled();
  });

  it("should support multiple subscribe/unsubscribe operations", () => {
    const unsubscribe1 = aorm.subscribe(mockSubscriber1);

    // Clear initial calls
    vi.clearAllMocks();

    aorm.push({ id: 2, name: "Item 2" });
    expect(mockSubscriber1).toHaveBeenCalledTimes(1);

    const unsubscribe2 = aorm.subscribe(mockSubscriber2);
    vi.clearAllMocks();

    aorm.push({ id: 3, name: "Item 3" });
    expect(mockSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockSubscriber2).toHaveBeenCalledTimes(1);

    unsubscribe1();
    vi.clearAllMocks();

    aorm.push({ id: 4, name: "Item 4" });
    expect(mockSubscriber1).not.toHaveBeenCalled();
    expect(mockSubscriber2).toHaveBeenCalledTimes(1);

    unsubscribe2();
  });

  it("should allow subscribing to query results", () => {
    // Add more data for querying
    aorm.push({ id: 2, name: "Item 2", value: 10 });
    aorm.push({ id: 3, name: "Item 3", value: 20 });

    // Create the query with proper types
    const query = aorm.where(
      "value",
      (v: number): v is number => v !== undefined && v > 15
    );
    const querySubscriber = vi.fn();

    const unsubscribe = query.subscribe(querySubscriber);

    expect(querySubscriber).toHaveBeenCalledTimes(1);
    expect(querySubscriber).toHaveBeenCalledWith([
      { id: 3, name: "Item 3", value: 20 },
    ]);

    unsubscribe();
  });
});
