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
  const list = kv.list<WinrateDataByOppronentCharactor>({
    prefix: [charactor, act],
  });
  const listTemp = [];
  for await (const l of list) {
    listTemp.push({ date: l.key[2].toString(), value: l.value });
  }
  const charactors = Object.keys(listTemp[0].value);
  const datasets = [];
  for (const charactor of charactors) {
    datasets.push({
      label: charactor,
      data: Object.values(
        listTemp.map((x) => x.value[charactor].winrate),
      ),
    });
  }
  const data: ChartViewProps["chartData"]["value"] = {
    datasets: datasets,
    labels: listTemp.map((x) => x.date),
  };
  return new Response(JSON.stringify(data));
};
