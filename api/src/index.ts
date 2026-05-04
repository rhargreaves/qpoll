import { Hono } from "hono";

type Bindings = {
  POLL: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/poll", async (c) => {
  // Skeleton for creating a new poll
  const id = c.env.POLL.newUniqueId();
  // Logic to initialize the poll would go here
  return c.json({ id: id.toString() });
});

app.get("/poll/:id", async (c) => {
  // Skeleton for connecting to a poll
  const id = c.req.param("id");
  return c.json({ message: `Poll ${id} endpoint` });
});

export default app;

export { Poll } from "./poll";
