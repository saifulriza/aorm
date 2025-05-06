import { describe, it, expect } from "vitest";
import AORM from "../src/index";

describe("AORM Relationship Methods", () => {
  // Define interfaces untuk type safety
  interface User {
    id: number;
    name: string;
  }

  interface Post {
    id: number;
    user_id: number;
    title: string;
    comments?: Comment[];
  }

  interface Comment {
    id: number;
    post_id: number;
    text: string;
  }

  const users: User[] = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 3, name: "Bob" },
  ];

  const posts: Post[] = [
    { id: 101, user_id: 1, title: "John Post 1" },
    { id: 102, user_id: 1, title: "John Post 2" },
    { id: 103, user_id: 2, title: "Jane Post 1" },
    { id: 104, user_id: 3, title: "Bob Post 1" },
    { id: 105, user_id: 3, title: "Bob Post 2" },
    { id: 106, user_id: 3, title: "Bob Post 3" },
  ];

  const comments: Comment[] = [
    { id: 201, post_id: 101, text: "Comment 1 on John Post 1" },
    { id: 202, post_id: 101, text: "Comment 2 on John Post 1" },
    { id: 203, post_id: 103, text: "Comment 1 on Jane Post 1" },
    { id: 204, post_id: 104, text: "Comment 1 on Bob Post 1" },
  ];

  it("should establish hasMany relationship", () => {
    // Menggunakan generic type User
    const usersAORM = new AORM<User>(users);
    // Hasil akan memiliki tipe User & {posts: Post[]}
    type UserWithPosts = User & { posts: Post[] };
    const result = usersAORM
      .hasMany<Post>(posts, "id", "user_id", "posts")
      .get() as UserWithPosts[];

    expect(result[0].posts.length).toBe(2); // John has 2 posts
    expect(result[1].posts.length).toBe(1); // Jane has 1 post
    expect(result[2].posts.length).toBe(3); // Bob has 3 posts

    expect(result[0].posts[0].title).toBe("John Post 1");
    expect(result[0].posts[1].title).toBe("John Post 2");
  });

  it("should handle hasMany with empty relationships", () => {
    const emptyPosts: Post[] = [];
    const usersAORM = new AORM<User>(users);
    type UserWithPosts = User & { posts: Post[] };
    const result = usersAORM
      .hasMany<Post>(emptyPosts, "id", "user_id", "posts")
      .get() as UserWithPosts[];

    // Should have empty arrays for all users
    expect(result[0].posts).toEqual([]);
    expect(result[1].posts).toEqual([]);
    expect(result[2].posts).toEqual([]);
  });

  it("should establish nested relationships with eager loading", () => {
    const usersAORM = new AORM<User>(users);

    // Menggunakan generic untuk posts with comments
    type PostWithComments = Post & { comments: Comment[] };
    const postsWithComments = new AORM<Post>(posts)
      .hasMany<Comment>(comments, "id", "post_id", "comments")
      .get() as PostWithComments[];

    // Menggunakan generic untuk hasil akhir
    type UserWithPostsAndComments = User & { posts: PostWithComments[] };
    const result = usersAORM
      .hasMany<PostWithComments>(postsWithComments, "id", "user_id", "posts")
      .get() as UserWithPostsAndComments[];

    // John's first post should have 2 comments
    expect(result[0].posts[0].comments.length).toBe(2);
    // Jane's post should have 1 comment
    expect(result[1].posts[0].comments.length).toBe(1);
    // Bob's first post should have 1 comment
    expect(result[2].posts[0].comments.length).toBe(1);
    // Bob's other posts should have 0 comments
    expect(result[2].posts[1].comments.length).toBe(0);
  });

  it("should support eager loading with multiple relations", () => {
    const usersAORM = new AORM<User>(users);

    // Define the relations dengan type generics
    const relations: [Post[], keyof User, keyof Post, string][] = [
      [posts, "id", "user_id", "posts"],
    ];

    type UserWithPosts = User & { posts: Post[] };
    const result = usersAORM.eager(relations).get() as UserWithPosts[];

    // Check if relations are loaded correctly
    expect(result[0].posts.length).toBe(2); // John has 2 posts
    expect(result[1].posts.length).toBe(1); // Jane has 1 post
    expect(result[2].posts.length).toBe(3); // Bob has 3 posts
  });
});
