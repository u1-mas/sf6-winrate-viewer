/// <reference lib="deno.unstable" />

import { PageManager } from "./PageManager.ts";
import { WinrateData } from "./WinrateData.ts";

const retries = 3;
export const createWinrateData = async () => {
  const email = Deno.env.get("EMAIL") || "sample@example.com";
  const password = Deno.env.get("PASSWORD") || "dummy_password";
  console.log({ email });

  for (let index = 0; index < retries; index++) {
    try {
      // webからjsonにする
      const manager = await PageManager.build(email, password);
      return await manager.createWinrateData();
    } catch (err) {
      console.log("Throw error. Retry: ", index);
      if (index === retries - 1) {
        throw err;
      }
    }
  }
};

const initDatabase = async () => {
  if (Deno.env.get("CI") == "true") {
    return await Deno.openKv(Deno.env.get("DENO_KV_URL"));
  } else {
    Deno.mkdirSync("database", { recursive: true });
    return await Deno.openKv("database/kv");
  }
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

export const createData = async () => {
  const winrateData = await createWinrateData();
  if (winrateData === undefined) {
    return;
  }
  await saveToDatabase(winrateData);
};
