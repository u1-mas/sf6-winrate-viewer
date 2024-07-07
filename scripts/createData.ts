/// <reference lib="deno.unstable" />

import { getKvData, openAppKv, setKvData } from "../services/kv.ts";
import { PageManager } from "./PageManager.ts";
import { WinrateData } from "./WinrateData.ts";

const retries = 3;
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

  const buildManager = () => {
    for (let i = 0; i < retries; i++) {
      try {
        return PageManager.build(email, password);
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }

        console.log("Throw error. Retry: ", i);
      }
    }
  };
  const manager = await buildManager()!;
  const charactors = (await manager.getCharactors()).map((x) =>
    x.replaceAll(" ", "_")
  );
  await setKvData(["charactors"], charactors);
  const acts = (await manager.getActs()).map((x) => Number.parseInt(x))
    .sort((a, b) => b - a);
  const beforeActs = (await getKvData<string[]>(["acts"])).value ?? [];
  const buildWrData = async () => {
    const func = () =>
      acts.length > beforeActs.length
        ? manager.createWinrateData(acts[0], acts[1])
        : manager.createWinrateData(acts[0]);
    for (let i = 0; i < retries; i++) {
      try {
        return await func();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        console.log("Throw error. Retry.");
      }
    }
  };
  const wrData = await buildWrData();
  await setKvData(["acts"], acts);
  await manager.close();
  return wrData;
};

export const saveToDatabase = async (winrateData: WinrateData) => {
  const kv = await openAppKv();
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
