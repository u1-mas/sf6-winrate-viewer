import { FreshContext } from "$fresh/server.ts";
import { ChartViewProps } from "../../islands/ChartView.tsx";
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

  const list = (await Array.fromAsync(kv.list<WinrateDataByOppronentCharactor>({
    prefix: [charactor, act],
  }))).map((x) => ({ date: x.key[2].toString(), value: x.value }));
  if (list.length === 0) {
    return new Response(JSON.stringify({ error: "Nothing data" }), {
      status: 404,
    });
  }

  const charactors = Object.keys(list[list.length - 1].value).filter((x) =>
    x !== "all"
  );
  const datasets = charactors.map((c) => ({
    label: c,
    data: Object.values(list.map((x) => x.value[c]?.winrate)), // 新キャラ対応
  }));
  const data: ChartViewProps["chartData"]["value"] = {
    datasets: datasets,
    labels: list.map((x) => x.date),
  };
  return new Response(JSON.stringify(data));
};
