import { Handlers } from "$fresh/server.ts";
import { openAppKv } from "../../services/kv.ts";

export const handler: Handlers = {
  GET: async (_req, _ctx) => {
    const kv = await openAppKv();
    const d = (await kv.get<Date>(["update_history"])).value;
    return new Response(JSON.stringify(d));
  },
};
