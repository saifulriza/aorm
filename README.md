# Array-ORM - Active Object Relational Mapping

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A lightweight reactive data management library that works seamlessly across all JavaScript environments.

## Features

- 🚀 **Lightweight & Fast**: Minimal overhead, maximum performance
- 🔄 **Reactive Data**: Subscribe to data changes with automatic updates
- 🔍 **Powerful Querying**: Filter, sort, and transform your data
- 🔗 **Relational Data**: Handle one-to-many and eager relationships
- 🌐 **Universal**: Works in browsers, Node.js, Deno, Bun & edge environments
- 🔒 **Type-Safe**: Full TypeScript support with generics

## Installation

```bash
# Using npm
npm install array-orm

# Using yarn
yarn add array-orm

# Using pnpm
pnpm add array-orm

# Using bun
bun add array-orm
```

## Quick Start

```javascript
import AORM from "array-orm";

// Create a collection
const users = new AORM([
  { id: 1, name: "Alice", age: 28 },
  { id: 2, name: "Bob", age: 32 },
  { id: 3, name: "Carol", age: 25 },
]);

// Query the data
const youngUsers = users.where("age", (age) => age < 30).get();
console.log("Young users:", youngUsers);
// Output: Young users: [{ id: 1, name: 'Alice', age: 28 }, { id: 3, name: 'Carol', age: 25 }]

// Subscribe to changes
users.subscribe((data) => {
  console.log("Updated users:", data);
});

// Make changes - subscribers will be notified
users.push({ id: 4, name: "Dave", age: 35 });
```

## Examples

### Basic Examples

#### Creating a Collection

```javascript
// Empty collection
const todos = new AORM();

// With initial data
const users = new AORM([
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
]);

// With TypeScript type safety
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

const products =
  new AORM() <
  Product >
  [
    { id: 1, name: "Laptop", price: 999, inStock: true },
    { id: 2, name: "Phone", price: 699, inStock: false },
  ];
```

#### Manipulating Data

```javascript
const todos = new AORM([
  { id: 1, text: "Learn AORM", completed: false },
  { id: 2, text: "Build app", completed: false },
]);

// Add a new item
todos.push({ id: 3, text: "Deploy app", completed: false });

// Update all items
todos.update((data) =>
  data.map((item) => ({
    ...item,
    updatedAt: new Date(),
  }))
);

// Update specific items
todos.update((data) =>
  data.map((item) => (item.id === 1 ? { ...item, completed: true } : item))
);

// Replace the entire collection
todos.set([{ id: 4, text: "New task", completed: false }]);

// Remove specific items
todos.remove((item) => item.completed);
```

### Querying Data

#### Filtering with `where()`

```javascript
const products = new AORM([
  { id: 1, name: "Laptop", price: 999, category: "electronics" },
  { id: 2, name: "Phone", price: 699, category: "electronics" },
  { id: 3, name: "Desk", price: 349, category: "furniture" },
  { id: 4, name: "Monitor", price: 499, category: "electronics" },
]);

// Simple equality check
const furniture = products.where("category", "furniture").get();
// Result: [{ id: 3, name: 'Desk', price: 349, category: 'furniture' }]

// Using a callback function
const expensiveProducts = products.where("price", (price) => price > 500).get();
// Result: [{ id: 1, name: 'Laptop', price: 999, ... }, { id: 2, name: 'Phone', price: 699, ... }]

// Chaining multiple queries
const affordableElectronics = products
  .where("category", "electronics")
  .where("price", (price) => price < 500)
  .get();
// Result: [{ id: 4, name: 'Monitor', price: 499, ... }]
```

#### Sorting with `orderBy()`

```javascript
const products = new AORM([
  { id: 1, name: "Laptop", price: 999 },
  { id: 2, name: "Phone", price: 699 },
  { id: 3, name: "Desk", price: 349 },
]);

// Sort by price (ascending by default)
const cheapestFirst = products.orderBy("price").get();
// Result: [{ id: 3, price: 349, ... }, { id: 2, price: 699, ... }, { id: 1, price: 999, ... }]

// Sort by price (descending)
const mostExpensiveFirst = products.orderBy("price", "desc").get();
// Result: [{ id: 1, price: 999, ... }, { id: 2, price: 699, ... }, { id: 3, price: 349, ... }]

// Chain with other methods
const cheapestElectronics = products
  .where("category", "electronics")
  .orderBy("price", "asc")
  .get();
```

#### Selecting Fields with `select()`

```javascript
const users = new AORM([
  { id: 1, name: "Alice", email: "alice@example.com", age: 28 },
  { id: 2, name: "Bob", email: "bob@example.com", age: 32 },
]);

// Select specific fields
const usernames = users.select("id", "name").get();
// Result: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

// Select with other query methods
const youngUserContacts = users
  .where("age", (age) => age < 30)
  .select("name", "email")
  .get();
// Result: [{ name: 'Alice', email: 'alice@example.com' }]
```

#### Removing Duplicates with `distinct()`

```javascript
const purchases = new AORM([
  { id: 1, product: "Laptop", category: "electronics", customer: "Alice" },
  { id: 2, product: "Phone", category: "electronics", customer: "Bob" },
  { id: 3, product: "Tablet", category: "electronics", customer: "Carol" },
  { id: 4, product: "Desk", category: "furniture", customer: "Alice" },
]);

// Get distinct categories
const categories = purchases.distinct("category").select("category").get();
// Result: [{ category: 'electronics' }, { category: 'furniture' }]

// Get distinct customers
const customers = purchases.distinct("customer").select("customer").get();
// Result: [{ customer: 'Alice' }, { customer: 'Bob' }, { customer: 'Carol' }]
```

### Reactive Features

#### Subscribing to Changes

```javascript
const counter = new AORM([{ count: 0 }]);

// Subscribe to changes
const unsubscribe = counter.subscribe((data) => {
  console.log("Current count:", data[0].count);
});

// Update value - will trigger subscriber
counter.update((data) => [{ count: data[0].count + 1 }]);
// Console output: Current count: 1

counter.update((data) => [{ count: data[0].count + 1 }]);
// Console output: Current count: 2

// Stop receiving updates
unsubscribe();

// This update won't trigger our subscriber
counter.update((data) => [{ count: data[0].count + 1 }]);
```

#### Building a Reactive UI

```javascript
const todoList = new AORM([{ id: 1, text: "Learn AORM", completed: false }]);

function updateUI(todos) {
  const todoElement = document.getElementById("todos");
  todoElement.innerHTML = "";

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.textContent = `${todo.completed ? "✓ " : ""}${todo.text}`;
    item.onclick = () => toggleTodo(todo.id);
    todoElement.appendChild(item);
  });

  document.getElementById("count").textContent = todos.length;
}

function toggleTodo(id) {
  todoList.update((todos) =>
    todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
}

// Connect UI to data
todoList.subscribe(updateUI);

// Add new todo via form
document.getElementById("todo-form").onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById("new-todo");
  todoList.push({
    id: Date.now(),
    text: input.value,
    completed: false,
  });
  input.value = "";
};
```

### Relational Data

#### One-to-Many Relationships

```javascript
// Authors with their books
const authors = new AORM([
  { id: 1, name: "J.K. Rowling" },
  { id: 2, name: "George Orwell" },
]);

const books = [
  { id: 101, title: "Harry Potter", authorId: 1 },
  { id: 102, title: "Fantastic Beasts", authorId: 1 },
  { id: 103, title: "1984", authorId: 2 },
  { id: 104, title: "Animal Farm", authorId: 2 },
];

// Link authors with their books
const authorsWithBooks = authors
  .hasMany(books, "id", "authorId", "books")
  .get();
// Result:
// [
//   { id: 1, name: 'J.K. Rowling', books: [{ id: 101, title: 'Harry Potter', ... }, { id: 102, ... }] },
//   { id: 2, name: 'George Orwell', books: [{ id: 103, title: '1984', ... }, { id: 104, ... }] }
// ]

// Query on the relationship
const rowling = authors
  .where("name", "J.K. Rowling")
  .hasMany(books, "id", "authorId", "books")
  .get();
// Result: [{ id: 1, name: 'J.K. Rowling', books: [{ id: 101, ... }, { id: 102, ... }] }]
```

#### Complex Relationships with `eager()`

```javascript
// Users, posts, and comments
const users = new AORM([
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
]);

const posts = [
  { id: 101, title: "Hello World", userId: 1 },
  { id: 102, title: "AORM is awesome", userId: 2 },
];

const comments = [
  { id: 201, text: "Great post!", postId: 101, userId: 2 },
  { id: 202, text: "I agree", postId: 101, userId: 1 },
  { id: 203, text: "Thanks!", postId: 102, userId: 1 },
];

// Users with their posts and comments on each post
const fullData = users.eager([[posts, "id", "userId", "posts"]]).get();

// Each post with its comments
const postsWithComments = new AORM(posts)
  .hasMany(comments, "id", "postId", "comments")
  .get();

// Putting it all together - users with posts and comments
const completeUserData = users
  .eager([
    [
      posts.map((post) => {
        const postComments = comments.filter((c) => c.postId === post.id);
        return { ...post, comments: postComments };
      }),
      "id",
      "userId",
      "posts",
    ],
  ])
  .get();
```

### Advanced Use Cases

#### Building a Todo Application

```javascript
// Define the store
const todoStore = new AORM([
  { id: 1, text: "Learn AORM", completed: false, priority: "high" },
  { id: 2, text: "Build a todo app", completed: false, priority: "medium" },
]);

// Add a new todo
function addTodo(text, priority = "medium") {
  todoStore.push({
    id: Date.now(),
    text,
    completed: false,
    priority,
  });
}

// Toggle completion status
function toggleTodo(id) {
  todoStore.update((todos) =>
    todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
}

// Delete a todo
function deleteTodo(id) {
  todoStore.remove((todo) => todo.id === id);
}

// Filter todos by completion status
function getCompletedTodos() {
  return todoStore.where("completed", true).get();
}

function getActiveTodos() {
  return todoStore.where("completed", false).get();
}

// Filter by priority
function getTodosByPriority(priority) {
  return todoStore.where("priority", priority).get();
}

// Sort by priority
function getTodosByPriorityOrder() {
  // Custom sort function for priority
  return todoStore.update((todos) => {
    const priorityRank = { high: 1, medium: 2, low: 3 };
    return [...todos].sort(
      (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
    );
  });
}

// UI Updates
todoStore.subscribe((todos) => {
  console.log("Todos updated:", todos);
  // Update UI here
});
```

#### Shopping Cart Implementation

```javascript
// Product catalog
const products = new AORM([
  { id: 1, name: "Laptop", price: 999, inStock: 5 },
  { id: 2, name: "Phone", price: 699, inStock: 10 },
  { id: 3, name: "Headphones", price: 199, inStock: 15 },
]);

// Shopping cart
const cart = new AORM([]);

// Add item to cart
function addToCart(productId, quantity = 1) {
  const product = products.where("id", productId).get()[0];

  if (!product || product.inStock < quantity) {
    console.error("Product not available in requested quantity");
    return false;
  }

  // Check if already in cart
  const existingItem = cart.where("productId", productId).get()[0];

  if (existingItem) {
    // Update quantity
    cart.update((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    );
  } else {
    // Add new item
    cart.push({
      id: Date.now(),
      productId,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  // Update inventory
  products.update((items) =>
    items.map((item) =>
      item.id === productId
        ? { ...item, inStock: item.inStock - quantity }
        : item
    )
  );

  return true;
}

// Remove from cart
function removeFromCart(cartItemId, quantity = null) {
  const cartItem = cart.where("id", cartItemId).get()[0];

  if (!cartItem) return false;

  if (quantity === null || quantity >= cartItem.quantity) {
    // Remove completely
    cart.remove((item) => item.id === cartItemId);

    // Restore inventory
    products.update((items) =>
      items.map((item) =>
        item.id === cartItem.productId
          ? { ...item, inStock: item.inStock + cartItem.quantity }
          : item
      )
    );
  } else {
    // Reduce quantity
    cart.update((items) =>
      items.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: item.quantity - quantity }
          : item
      )
    );

    // Restore inventory partially
    products.update((items) =>
      items.map((item) =>
        item.id === cartItem.productId
          ? { ...item, inStock: item.inStock + quantity }
          : item
      )
    );
  }

  return true;
}

// Calculate cart total
function getCartTotal() {
  return cart
    .get()
    .reduce((total, item) => total + item.price * item.quantity, 0);
}

// Subscribe to cart changes
cart.subscribe((items) => {
  console.log("Cart updated:", items);
  console.log("Total:", getCartTotal());
  // Update UI
});
```

## Platform Compatibility

AORM works seamlessly across all JavaScript environments:

### Browser (via CDN)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>AORM Browser Example</title>
    <script src="https://cdn.example.com/array-orm/dist/array-orm.umd.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        // AORM is available as a global variable
        const users = new AORM([
          { id: 1, name: "Alice", age: 28 },
          { id: 2, name: "Bob", age: 32 },
        ]);

        // Filter and display users
        const youngUsers = users.where("age", (age) => age < 30).get();
        console.log("Young users:", youngUsers);

        // Subscribe to changes
        users.subscribe((data) => {
          document.getElementById("userCount").textContent = data.length;
        });

        // Add a new user via button click
        document
          .getElementById("addUserBtn")
          .addEventListener("click", function () {
          .getElementById("addUserBtn")
          .addEventListener("click", function () {
            users.push({ id: 3, name: "Carol", age: 25 });
          });
      });
    </script>
  </head>
  <body>
    <h1>AORM Browser Demo</h1>
    <p>User count: <span id="userCount">0</span></p>
    <button id="addUserBtn">Add User</button>
  </body>
</html>
```

### Node.js (CommonJS)

```js
// Require syntax for CommonJS
const AORM = require("array-orm");

// Create a collection with data
const products = new AORM([
  { id: 1, name: "Laptop", price: 999, category: "electronics" },
  { id: 2, name: "Phone", price: 699, category: "electronics" },
  { id: 3, name: "Desk", price: 349, category: "furniture" },
]);

// Query and filter data
const electronicProducts = products
  .where("category", "electronics")
  .orderBy("price", "desc")
  .get();

console.log("Electronic products (highest price first):", electronicProducts);

// Subscribe to changes
const unsubscribe = products.subscribe((data) => {
  console.log("Updated products:", data);
});

// Update a product
products.update((data) =>
  data.map((item) => (item.id === 1 ? { ...item, price: 899 } : item))
);

// Unsubscribe when done
unsubscribe();
```

### Node.js/Deno/Bun (ESM)

```js
// Import syntax for ESM
import AORM from "array-orm";

// Sample data
const tasks = new AORM([
  { id: 1, title: "Learn AORM", completed: false },
  { id: 2, title: "Build app", completed: false },
]);

// Mark a task as completed
tasks.update((data) =>
  data.map((task) => (task.id === 1 ? { ...task, completed: true } : task))
);

// Get uncompleted tasks
const pendingTasks = tasks.where("completed", false).get();
console.log("Pending tasks:", pendingTasks);

// Add a new task
tasks.push({ id: 3, title: "Deploy to production", completed: false });
```

### TypeScript Usage

```ts
import AORM from "array-orm";

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

// Create typed collection
const users = new AORM<User>([
  { id: 1, name: "Alice", email: "alice@example.com", active: true },
  { id: 2, name: "Bob", email: "bob@example.com", active: false },
]);

// Type-safe operations
const activeUsers = users.where("active", true).get();
console.log("Active users:", activeUsers);

// Type-safe subscription
users.subscribe((data: User[]) => {
  console.log("Updated users:", data.length);
});
```

### Using with React

```jsx
import { useState, useEffect } from "react";
import AORM from "array-orm";

function UserList() {
  // Create AORM store outside component to persist between renders
  const userStore = new AORM([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

  const [users, setUsers] = useState(userStore.get());

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = userStore.subscribe(setUsers);
    return () => unsubscribe();
  }, []);

  const addUser = () => {
    userStore.push({ id: Date.now(), name: "New User" });
  };

  return (
    <div>
      <h1>Users ({users.length})</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button onClick={addUser}>Add User</button>
    </div>
  );
}
```

## API Reference

### Core Methods

| Method                                      | Description                                           |
| ------------------------------------------- | ----------------------------------------------------- |
| `constructor(data?: T[])`                   | Create a new AORM instance with optional initial data |
| `get()`                                     | Get the current data                                  |
| `set(newData: T[])`                         | Replace the entire data array                         |
| `update(updaterFn: (data: T[]) => T[])`     | Update data using a function                          |
| `push(item: T)`                             | Add a new item to the collection                      |
| `remove(predicateFn: (item: T) => boolean)` | Remove items that match the predicate                 |

### Query Methods

| Method                                                | Description                                      |
| ----------------------------------------------------- | ------------------------------------------------ |
| `where(field: keyof T, condition: any)`               | Filter data by field value or condition function |
| `select<K extends keyof T>(...fields: K[])`           | Select only specific fields                      |
| `orderBy(field: keyof T, direction: "asc" \| "desc")` | Sort data by field                               |
| `distinct(field: keyof T)`                            | Remove duplicates based on field value           |

### Relational Methods

| Method                                                                                  | Description                         |
| --------------------------------------------------------------------------------------- | ----------------------------------- |
| `hasMany<R>(relationData: R[], localKey: keyof T, foreignKey: keyof R, alias?: string)` | Create one-to-many relationship     |
| `eager<R>(relations: [R[], keyof T, keyof R, string?][])`                               | Load multiple relationships at once |

### Reactive Methods

| Method                                     | Description                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| `subscribe(callback: (data: T[]) => void)` | Subscribe to data changes, returns unsubscribe function |

## License

MIT
