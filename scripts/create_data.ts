/// <reference lib="deno.unstable" />

import { saveToDatabase } from "./DataManager.ts";
import { PageManager } from "./PageManager.ts";

const email = Deno.env.get("EMAIL")!;
const password = Deno.env.get("PASSWORD")!;
let dirPath = "";
const retries = 3;
export const createData = async () => {
    for (let index = 0; index < retries; index++) {
        try {
            // webからjsonにする
            const manager = await PageManager.build(email, password);
            await manager.checkWinrateByCharactor();
            dirPath = manager.tempDirPath;
            await manager.close();
            break;
        } catch (err) {
            console.log("Throw error. Retry: ", index);
            if (index === retries) {
                throw err;
            }
        }
    }

    // jsonをDBにいれる
    await saveToDatabase(dirPath);
    Deno.removeSync(dirPath, { recursive: true });
};
