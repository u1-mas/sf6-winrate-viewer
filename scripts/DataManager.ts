import { WinrateData } from "./WinrateData.ts";

const initDatabase = async () => {
  if (typeof Deno.env.get("DENO_DEPLOYMENT_ID") !== "string") {
    Deno.mkdirSync("database", { recursive: true });
  }
  return await Deno.openKv(Deno.env.get("DATABASE"));
};
let kv: Deno.Kv;
export const saveToDatabase = async (winrateData: WinrateData) => {
  kv = await initDatabase();
  const date = Object.keys(winrateData)[0];
  const byPlayerCharactor = winrateData[date];
  const playerCharactors = Object.keys(byPlayerCharactor);
  for (const playerCharactor of playerCharactors) {
    const byAct = byPlayerCharactor[playerCharactor];
    const acts = Object.keys(byAct);
    for (const act of acts) {
      const byOpponents = byAct[act];
      await kv.set([playerCharactor, act.toLowerCase(), date], byOpponents);
    }
  }
};
