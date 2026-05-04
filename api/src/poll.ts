import { DurableObject } from "cloudflare:workers";

export class Poll extends DurableObject {
  state: DurableObjectState;
  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
    this.state = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/poll") {
      const { id, name } = await request.json<{ id: string; name: string }>();
      await this.state.storage.put("name", name);
      await this.state.storage.put("id", id);
      return new Response(JSON.stringify({ message: "Poll created", id, name }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else if (request.method === "GET" && url.pathname === "/poll") {
      const name = await this.state.storage.get("name");
      const id = await this.state.storage.get("id");
      if (name) {
        return new Response(JSON.stringify({ id, name }), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Poll not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid Durable Object operation" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
