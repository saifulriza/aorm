# AORM Platform Compatibility Examples

AORM is designed to work seamlessly across various JavaScript environments. Here are examples for each platform:

## Browser (via CDN)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>AORM Browser Example</title>
    <script src="https://cdn.example.com/aorm/dist/aorm.umd.js"></script>
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

## Node.js (CommonJS)

```js
// Require syntax for CommonJS
const AORM = require("aorm");

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

## Node.js/Deno/Bun (ESM)

```js
// Import syntax for ESM
import AORM from "aorm";

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

## Cloudflare Workers / Edge Functions

```js
import AORM from "aorm";

export default {
  async fetch(request, env, ctx) {
    // Create an in-memory store with AORM
    const visitors = new AORM([]);

    // Add current visitor
    const userAgent = request.headers.get("User-Agent") || "Unknown";
    visitors.push({
      timestamp: new Date().toISOString(),
      userAgent,
    });

    return new Response(
      JSON.stringify({
        message: "Hello from AORM in Cloudflare Workers!",
        visitorCount: visitors.get().length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
```

## TypeScript

```ts
import AORM from "aorm";

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

## Using with React

```jsx
import { useState, useEffect } from "react";
import AORM from "aorm";

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
