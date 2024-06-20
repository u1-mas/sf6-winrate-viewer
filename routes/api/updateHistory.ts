import { FreshContext } from "$fresh/server.ts";
import { openAppKv } from "../../services/kv.ts";

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const kv = await openAppKv();
  const d = (await kv.get(["update_history"])).value;
  return new Response(JSON.stringify(d));
};
