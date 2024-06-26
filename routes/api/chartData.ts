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
    const listTemp = [];
    for await (const l of list) {
        listTemp.push(l);
    }
    const datasets = [];
    for await (const l of listTemp) {
        const temp = Object.entries(l.value).filter((x) => x[0] !== "all").sort(
            (a, b) => a[0] > b[0] ? 1 : -1,
        ).map((x) => x[1].winrate.toFixed(2));
        datasets.push(temp);
    }
    const labels = Object.keys(listTemp[0].value);
    return new Response(JSON.stringify({
        labels,
        datasets,
    }));
};
