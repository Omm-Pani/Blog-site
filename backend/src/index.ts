import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { verify } from "hono/jwt";
// Create the main Hono app
const app = new Hono<{
  Variables: {
    userId: string;
  };
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

// app.get("/api/v1/blog/:id", (c) => {
//   const id = c.req.param("id");
//   console.log(id);
//   return c.text("get blog route");
// });

// app.post("/api/v1/blog", (c) => {
//   console.log(c.get("userId"));
//   return c.text("signin route");
// });
export default app;
