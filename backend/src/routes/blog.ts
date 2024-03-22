import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "@omm_pani/blog-common";
export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const jwt = c.req.header("Authorization") || "";

  if (!jwt) {
    c.status(403);
    return c.json({ error: "No Authorization" });
  }

  // const token = jwt.split(" ")[1];
  const user = await verify(jwt, c.env.JWT_SECRET);
  if (!user) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  c.set("userId", user.id);

  await next();
});

blogRouter.post("/", async (c) => {
  const userId = c.get("userId");
  console.log(userId);

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const { success } = createPostInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "incorrect inputs",
    });
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });
  return c.json({
    id: post.id,
  });
});

blogRouter.put("/", async (c) => {
  const userId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const { success } = updatePostInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "incorrect inputs",
    });
  }

  const post = await prisma.post.update({
    where: {
      id: body.id,
      authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.text("post updated");
});
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.user.findMany();

  return c.json(blogs);
});

blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  return c.json({ blog });
});
