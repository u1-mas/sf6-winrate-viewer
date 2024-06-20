import { WinrateData } from "./WinrateData.ts";

if (typeof Deno.env.get("DENO_DEPLOYMENT_ID") !== "string") {
  Deno.mkdirSync("database", { recursive: true });
}
const kv = await Deno.openKv(Deno.env.get("DATABASE"));

const setDb = async (winrateByDate: WinrateData) => {
  const date = winrateByDate.dateString;
  const playerCharactor = winrateByDate.playerCharactor;
  const acts = Object.keys(winrateByDate.byAct);
  for (const act of acts) {
    const byOpponents = winrateByDate.byAct[act];
    await kv.set([playerCharactor, act, date], byOpponents);
  }
};

export const saveToDatabase = async (dirPath: string) => {
  const dir = Deno.readDirSync(dirPath);
  for (const entry of dir) {
    if (!entry.isFile) {
      continue;
    }
    const file = Deno.readTextFileSync(`${dirPath}/${entry.name}`);
    const json = JSON.parse(file) as WinrateData;
    await setDb(json);
  }
};
