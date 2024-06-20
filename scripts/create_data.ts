/// <reference lib="deno.unstable" />

import { saveToDatabase } from "./DataManager.ts";
import { PageManager } from "./PageManager.ts";

const retries = 3;
const createWinrateData = async () => {
  const email = Deno.env.get("EMAIL")!;
  const password = Deno.env.get("PASSWORD")!;

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
export const createData = async () => {
  const winrateData = await createWinrateData();
  if (winrateData === undefined) {
    return;
  }
  await saveToDatabase(winrateData);
};
