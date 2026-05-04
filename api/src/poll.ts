import { DurableObject } from "cloudflare:workers";

export class Poll extends DurableObject {
  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    // Boilerplate for DO fetch
    return new Response("Poll Durable Object");
  }
}
