/// <reference lib="deno.unstable" />

import { PageManager } from "./PageManager.ts";
import { WinrateData } from "./WinrateData.ts";

const retries = 1;
export const createWinrateData = async () => {
  const email = Deno.env.get("EMAIL");
  const password = Deno.env.get("PASSWORD");
  if (
    email === undefined || email === "" || password === undefined ||
    password === ""
  ) {
    console.log("undefined email or password. exit.");
    return;
  }

  for (let index = 0; index < retries; index++) {
    try {
      // webからjsonにする
      const manager = await PageManager.build();
      await manager.transitionPlayPage(email, password);
      return await manager.createWinrateData();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "Navigating frame was detached") {
          console.log(err.message);
          Deno.exit(0);
        }
      }
      console.log("Throw error. Retry: ", index);
      if (index === retries - 1) {
        throw err;
      }
    }
  }
};

export const saveToDatabase = async (winrateData: WinrateData) => {
  const kv = await Deno.openKv(Deno.env.get("DENO_KV_URL"));
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
  console.log(await kv.set(["update_history"], new Date()));
};

export const createData = async () => {
  const winrateData = await createWinrateData();
  if (winrateData === undefined) {
    return;
  }
  await saveToDatabase(winrateData);
};
