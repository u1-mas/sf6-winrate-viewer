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
  const list = await Array.fromAsync(kv.list<WinrateDataByOppronentCharactor>({
    prefix: [charactor, act],
  }));
  const charactors = Object.keys(list[list.length - 1].value).sort().filter((
    x,
  ) => x !== "all");
  console.log({ charactors });
  const gameData = list.map((l) => ({
    dateString: l.key[2].toString(),
    data: charactors.reduce(
      (prev, c) => ({ ...prev, [c]: l.value[c] ?? undefined }),
      {},
    ) as { [charactor: string]: { game: number; winrate: number } | undefined },
  }));

  const withDiff = gameData.map(({ data, dateString }, i) => {
    if (i === 0) {
      return [
        dateString,
        ...charactors.map((c) => `${data[c]?.game} / ${data[c]?.winrate}`),
      ];
    }

    const yesterdayData = gameData[i - 1].data;
    const temp = charactors.map((c) => {
      const t = data[c];
      const y = yesterdayData[c];
      if (t === undefined || y === undefined) {
        return "-"; // 新キャラ用
      }
      return calculateDiff(t, y);
    });
    return [dateString, ...temp];
  });

  return new Response(JSON.stringify([
    ["日付", ...charactors],
    ...withDiff,
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

const calculateDiff = (today, yesterday): string => {
  const gameDiff = today.game - yesterday.game;
  if (gameDiff === 0) {
    return `${today.game} / ${yesterday.winrate}`;
  }

  const winrateDiff = today.winrate - yesterday.winrate;
  const currentWin = today.game * (yesterday.winrate / 100);
  const yesterdayWin = yesterday.game *
    (today.winrate / 100);
  const winDiff = currentWin - yesterdayWin;
  const loseDiff = (today.game - currentWin) -
    (today.game - yesterdayWin);
  return `${today.game} / ${today.winrate}% ( ${
    formatDiffWithColor(winrateDiff)
  } ) / ${gameDiff} ( ${Math.round(winDiff)} : ${Math.round(loseDiff)} )`;
};
