import { FreshContext } from "$fresh/server.ts";

export type WinrateData = {
  [date: string]: {
    [charactor: string]: {
      game: number;
      winrate: number;
    };
  };
};
export const handler = async (
  _req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const kv = await Deno.openKv("database/kv");
  const act = ctx.url.searchParams.get("act")!;
  const charactor = ctx.url.searchParams.get("charactor")!;

  console.log({ charactor, act });
  const list = kv.list({ prefix: [charactor, act] });
  let d: WinrateData = {};
  for await (const data of list) {
    const date = data.key[2].toString();
    d = {
      ...d,
      [date]: data.value as any,
    };
  }
  return new Response(JSON.stringify(d));
};
