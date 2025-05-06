import { describe, it, expect, vi } from "vitest";
import AORM from "../src/index";

describe("AORM Core Functionality", () => {
  // Define interfaces untuk type safety
  interface TestItem {
    id: number;
    name?: string;
    value?: number;
    active?: boolean;
  }

  it("should initialize with empty data by default", () => {
    const aorm = new AORM<TestItem>();
    expect(aorm.get()).toEqual([]);
  });

  it("should initialize with provided data", () => {
    const testData: TestItem[] = [{ id: 1, name: "Test" }];
    const aorm = new AORM<TestItem>(testData);
    expect(aorm.get()).toEqual(testData);
  });

  it("should set data correctly", () => {
    const aorm = new AORM<TestItem>();
    const newData: TestItem[] = [{ id: 1, name: "Test" }];
    aorm.set(newData);
    expect(aorm.get()).toEqual(newData);
  });

  it("should update data with updater function", () => {
    const aorm = new AORM<TestItem>([{ id: 1, value: 5 }]);
    aorm.update((data) =>
      data.map((item) => ({ ...item, value: item.value! * 2 }))
    );
    expect(aorm.get()).toEqual([{ id: 1, value: 10 }]);
  });

  it("should push items to the data array", () => {
    const aorm = new AORM<TestItem>([{ id: 1 }]);
    aorm.push({ id: 2 });
    expect(aorm.get()).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("should remove items based on predicate function", () => {
    const aorm = new AORM<TestItem>([
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ]);
    aorm.remove((item) => item.active === false);
    expect(aorm.get()).toEqual([
      { id: 1, active: true },
      { id: 3, active: true },
    ]);
  });

  it("should notify subscribers when data changes", () => {
    const aorm = new AORM<TestItem>([{ id: 1 }]);
    const mockSubscriber = vi.fn();

    const unsubscribe = aorm.subscribe(mockSubscriber);

    // Initial call
    expect(mockSubscriber).toHaveBeenCalledTimes(1);
    expect(mockSubscriber).toHaveBeenCalledWith([{ id: 1 }]);

    // Update data and check if subscriber is called
    aorm.set([{ id: 2 }]);
    expect(mockSubscriber).toHaveBeenCalledTimes(2);
    expect(mockSubscriber).toHaveBeenCalledWith([{ id: 2 }]);

    // Unsubscribe and ensure no more calls
    unsubscribe();
    aorm.set([{ id: 3 }]);
    expect(mockSubscriber).toHaveBeenCalledTimes(2); // Still 2 calls
  });
});
