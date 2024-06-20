import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET: () => {
    return new Response(JSON.stringify(["luke", "jamie", "a.k.i.", "gouki"]));
  },
};
