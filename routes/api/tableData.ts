import { FreshContext } from "$fresh/server.ts";
import { WinrateDataByOppronentCharactor } from "../../scripts/WinrateData.ts";
import { openAppKv } from "../../services/kv.ts";

export const handler = async (
  _req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const kv = await openAppKv();
  const act = ctx.url.searchParams.get("act");
  const charactor = ctx.url.searchParams.get("charactor");
  if (act === null || charactor === null) {
    return new Response(JSON.stringify({ error: "Missing parameter" }), {
      status: 400,
    });
  }
  const list = kv.list<WinrateDataByOppronentCharactor>({
    prefix: [charactor, act],
  });
  const listTemp: [string, WinrateDataByOppronentCharactor][] = [];
  for await (const l of list) {
    const date = l.key[2].toString();
    listTemp.push([date, l.value]);
  }
  const charactors = Object.keys(listTemp[0][1]).sort().filter((x) =>
    x !== "all"
  );
  const resp = listTemp.map((val) => {
    return [
      val[0],
      ...convertToArray(val[1]),
    ];
  });
  return new Response(JSON.stringify([
    ["日付", ...charactors],
    ...resp,
  ]));
};

const convertToArray = (
  wrData: WinrateDataByOppronentCharactor,
) => {
  return Object.entries(wrData).filter((x) => x[0] !== "all").sort((x, y) =>
    x[0] > y[0] ? 1 : -1
  ).map(
    (v) => (`${v[1].game} / ${v[1].winrate}`),
  );
};
