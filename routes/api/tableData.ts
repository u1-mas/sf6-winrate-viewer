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
  const listTemp1 = [];
  for await (const l of list) {
    listTemp1.push(l);
  }

  const listTemp2: [string, { game: number; winrate: number }[]][] = [];
  for await (const l of listTemp1) {
    const date = l.key[2].toString();
    const value = l.value;
    const sorted = Object.entries(value).sort((a, b) => a[0] > b[0] ? 1 : -1)
      .filter((x) => x[0] !== "all").map((x) => x[1]);
    listTemp2.push([date, sorted]);
  }

  const charactors = Object.keys(listTemp1[0].value).sort((a, b) =>
    a > b ? 1 : -1
  ).filter((x) => x !== "all");

  // diffを追加する
  const resp = [];
  for (let i = 0; i < listTemp2.length; i++) {
    const targetDayData = listTemp2[i];
    if (i === 0) {
      resp.push(
        [
          targetDayData[0],
          ...targetDayData[1].map((v) => `${v.game} / ${v.winrate}%`),
        ],
      );
      continue;
    }
    const yesterdayData = listTemp2[i - 1][1];
    const withDiff = targetDayData[1].map((elem, j) => {
      const gameDiff = elem.game - yesterdayData[j].game;

      if (gameDiff === 0) {
        return elem;
      }
      const currentWin = elem.game * (elem.winrate / 100);
      const currentLose = elem.game - currentWin;
      const yesterdayWin = yesterdayData[j].game * (elem.winrate / 100);
      const yesterdayLose = yesterdayData[j].game - yesterdayWin;
      const winDiff = currentWin - yesterdayWin;
      const loseDiff = currentLose - yesterdayLose;
      return {
        ...elem,
        gameDiff: elem.game - yesterdayData[j].game,
        winrateDiff: elem.winrate - yesterdayData[j].winrate,
        winDiff: Math.round(winDiff),
        loseDiff: Math.round(loseDiff),
      };
    });
    resp.push(
      [
        targetDayData[0],
        ...withDiff.map((v) => {
          if ("gameDiff" in v) {
            return `${v.game} / ${v.winrate}% ( ${
              formatDiffWithColor(v.winrateDiff)
            }% ) / ${v.gameDiff} ( ${v.winDiff} : ${v.loseDiff} )`;
          } else {
            return `${v.game} / ${v.winrate}%`;
          }
        }),
      ],
    );
  }

  return new Response(JSON.stringify([
    ["日付", ...charactors],
    ...resp,
  ]));
};

const formatDiffWithColor = (diff: number, round?: boolean) => {
  if (diff === 0) {
    return `0`;
  } else if (diff < 0) {
    const content = round ? Math.floor(diff) : diff.toFixed(2);
    return `<span class="text-blue-500">${content}</span>`;
  } else {
    const content = round ? Math.ceil(diff) : diff.toFixed(2);
    return `<span class="text-red-500">+${content}</span>`;
  }
};
