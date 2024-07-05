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
  try {
    for (let index = 0; index < retries; index++) {
      try {
        const acts = (await manager.getActs()).map((x) => Number.parseInt(x))
          .sort((a, b) => b - a);
        if (
          acts.length >
            ((await getKvData<string[]>(["acts"])).value?.length ?? 0)
        ) {
          await setKvData(["acts"], acts);
          return manager.createWinrateData(acts[0], acts[1]);
        } else {
          return manager.createWinrateData(acts[0]);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "Navigating frame was detached") {
            console.log(err.message);
            Deno.exit(0);
          }
        }
        if (index === retries - 1) {
          throw err;
        }
        console.log("Throw error. Retry: ", index);
      }
    }
  } finally {
    await manager.close();
  }
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
