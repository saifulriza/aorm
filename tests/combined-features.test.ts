import { describe, it, expect, vi } from "vitest";
import AORM from "../src/index";

describe("AORM Combined Features", () => {
  interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    isActive: boolean;
  }

  interface ProductWithCategory extends Product {
    category_id: number;
  }

  // Create a fresh copy of products for each test to avoid shared state between tests
  const getProducts = (): Product[] => [
    {
      id: 1,
      name: "Laptop",
      category: "Electronics",
      price: 1200,
      stock: 5,
      isActive: true,
    },
    {
      id: 2,
      name: "Phone",
      category: "Electronics",
      price: 800,
      stock: 10,
      isActive: true,
    },
    {
      id: 3,
      name: "Chair",
      category: "Furniture",
      price: 150,
      stock: 20,
      isActive: false,
    },
    {
      id: 4,
      name: "Desk",
      category: "Furniture",
      price: 300,
      stock: 7,
      isActive: true,
    },
    {
      id: 5,
      name: "Tablet",
      category: "Electronics",
      price: 500,
      stock: 0,
      isActive: false,
    },
    {
      id: 6,
      name: "Bookshelf",
      category: "Furniture",
      price: 250,
      stock: 3,
      isActive: true,
    },
  ];

  it("should support chaining with reactivity", () => {
    const aorm = new AORM<Product>(getProducts());
    const mockSubscriber = vi.fn();

    // Create a filtered, sorted view and subscribe to it
    const activeElectronics = aorm
      .where("isActive", true)
      .where("category", "Electronics")
      .orderBy("price", "desc");

    const unsubscribe = activeElectronics.subscribe(mockSubscriber);

    // Check initial data
    expect(mockSubscriber).toHaveBeenCalledWith([
      {
        id: 1,
        name: "Laptop",
        category: "Electronics",
        price: 1200,
        stock: 5,
        isActive: true,
      },
      {
        id: 2,
        name: "Phone",
        category: "Electronics",
        price: 800,
        stock: 10,
        isActive: true,
      },
    ]);

    // Clear the mock
    vi.clearAllMocks();

    // Add a new item to the AORM instance
    aorm.push({
      id: 7,
      name: "Smart Watch",
      category: "Electronics",
      price: 300,
      stock: 15,
      isActive: true,
    });

    // Create a new filtered query that should include the new item
    const updatedActiveElectronics = aorm
      .where("isActive", true)
      .where("category", "Electronics")
      .orderBy("price", "desc");

    // Subscribe to the new query
    const newMockSubscriber = vi.fn();
    const newUnsubscribe =
      updatedActiveElectronics.subscribe(newMockSubscriber);

    // Verify the subscriber receives the updated data with new item included
    expect(newMockSubscriber).toHaveBeenCalledWith([
      {
        id: 1,
        name: "Laptop",
        category: "Electronics",
        price: 1200,
        stock: 5,
        isActive: true,
      },
      {
        id: 2,
        name: "Phone",
        category: "Electronics",
        price: 800,
        stock: 10,
        isActive: true,
      },
      {
        id: 7,
        name: "Smart Watch",
        category: "Electronics",
        price: 300,
        stock: 15,
        isActive: true,
      },
    ]);

    unsubscribe();
    newUnsubscribe();
  });

  it("should handle complex querying with multiple where conditions", () => {
    // Use a fresh copy of products to avoid shared state with other tests
    const aorm = new AORM<Product>(getProducts());

    const result = aorm
      .where("price", (p: number) => p > 200)
      .where("stock", (s: number) => s > 0)
      .where("isActive", true)
      .get();

    expect(result).toEqual([
      {
        id: 1,
        name: "Laptop",
        category: "Electronics",
        price: 1200,
        stock: 5,
        isActive: true,
      },
      {
        id: 2,
        name: "Phone",
        category: "Electronics",
        price: 800,
        stock: 10,
        isActive: true,
      },
      {
        id: 4,
        name: "Desk",
        category: "Furniture",
        price: 300,
        stock: 7,
        isActive: true,
      },
      {
        id: 6,
        name: "Bookshelf",
        category: "Furniture",
        price: 250,
        stock: 3,
        isActive: true,
      },
    ]);
  });

  it("should maintain reactivity with eager loading relationships", () => {
    interface Category {
      id: number;
      name: string;
    }

    interface ProductDetail {
      product_id: number;
      description: string;
      specifications: string;
    }

    const categories: Category[] = [
      { id: 1, name: "Electronics" },
      { id: 2, name: "Furniture" },
      { id: 3, name: "Books" },
    ];

    const productDetails: ProductDetail[] = [
      {
        product_id: 1,
        description: "High-end laptop",
        specifications: "16GB RAM, 512GB SSD",
      },
      {
        product_id: 2,
        description: "Smartphone",
        specifications: "6GB RAM, 128GB Storage",
      },
      {
        product_id: 4,
        description: "Office desk",
        specifications: "Wood, 120x60cm",
      },
    ];

    const productsWithCategories = getProducts().map((product) => ({
      ...product,
      category_id:
        product.category === "Electronics"
          ? 1
          : product.category === "Furniture"
          ? 2
          : 3,
    }));

    const aorm = new AORM<ProductWithCategory>(productsWithCategories);
    const mockSubscriber = vi.fn();

    // First add category relationships
    const withCategories = aorm.hasMany<Category>(
      categories,
      "category_id",
      "id",
      "categoryInfo"
    );

    // Then add product details
    const withCategoriesAndDetails = withCategories.hasMany<ProductDetail>(
      productDetails,
      "id",
      "product_id",
      "details"
    );

    const unsubscribe = withCategoriesAndDetails.subscribe(mockSubscriber);

    // Check initial call
    expect(mockSubscriber).toHaveBeenCalledTimes(1);

    // Verify some of the relationships
    const result = mockSubscriber.mock.calls[0][0];

    // Check category relationships
    const laptop = result.find((p: any) => p.id === 1);
    expect(laptop.categoryInfo[0].name).toBe("Electronics");

    // Check details relationship
    expect(laptop.details[0].specifications).toBe("16GB RAM, 512GB SSD");

    // Check item without details
    const chair = result.find((p: any) => p.id === 3);
    expect(chair.details).toEqual([]);

    unsubscribe();
  });
});
