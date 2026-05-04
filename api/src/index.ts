import { Hono } from "hono";

type Bindings = {
  POLL: DurableObjectNamespace;
};

// Simple slugify function
function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

const app = new Hono<{ Bindings: Bindings }>();

// Endpoint to create a new poll
app.post("/api/polls", async (c) => {
  const { name } = await c.req.json<{ name: string }>();

  if (!name || name.trim() === "") {
    return c.json({ error: "Poll name cannot be empty" }, 400);
  }

  const baseSlug = slugify(name);
  const uniqueIdentifier = Date.now().toString(36); // Simple unique suffix
  const pollSlug = `${baseSlug}-${uniqueIdentifier}`;

  const id = c.env.POLL.idFromName(pollSlug);
  const stub = c.env.POLL.get(id);

  // Make an internal request to the Durable Object to store the poll details
  const doResponse = await stub.fetch("http://do/poll", {
    method: "POST",
    body: JSON.stringify({ id: pollSlug, name }),
    headers: { "Content-Type": "application/json" },
  });

  if (doResponse.status === 201) {
    return c.json({ id: pollSlug, name }, 201);
  } else {
    // Forward error from DO
    return new Response(doResponse.body, {
      status: doResponse.status,
      headers: doResponse.headers,
    });
  }
});

// Endpoint to get a specific poll by slug
app.get("/api/polls/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!slug) {
    return c.json({ error: "Poll slug cannot be empty" }, 400);
  }

  const id = c.env.POLL.idFromName(slug);
  const stub = c.env.POLL.get(id);

  // Make an internal request to the Durable Object to retrieve the poll details
  const doResponse = await stub.fetch("http://do/poll", { method: "GET" });

  if (doResponse.status === 200) {
    return new Response(doResponse.body, {
      status: 200,
      headers: doResponse.headers,
    });
  } else {
    // Forward 404 or other error from DO
    return new Response(doResponse.body, {
      status: doResponse.status,
      headers: doResponse.headers,
    });
  }
});

export default app;

export { Poll } from "./poll";
