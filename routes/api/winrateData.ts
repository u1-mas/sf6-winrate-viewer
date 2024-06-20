import { FreshContext } from "$fresh/server.ts";
import { WinrateDataByOppronentCharactor } from "../../scripts/WinrateData.ts";
import { openAppKv } from "../../services/kv.ts";

export const handler = async (
  _req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const kv = await openAppKv();
  const act = ctx.url.searchParams.get("act")!;
  const charactor = ctx.url.searchParams.get("charactor")!;

  const list = kv.list<WinrateDataByOppronentCharactor>({
    prefix: [charactor, act],
  });
  let d: {
    [dateString: string]: WinrateDataByOppronentCharactor;
  } = {};
  for await (const data of list) {
    const date = data.key[2].toString();
    d = {
      ...d,
      [date]: data.value,
    };
  }
  return new Response(JSON.stringify(d));
};
