import { loadSync } from "$std/dotenv/mod.ts";
import { WinrateData } from "./WinrateData.ts";
import { createWinrateData, saveToDatabase } from "./createData.ts";

const ci = Deno.env.get("CI") === "true";
if (!ci) {
  loadSync({ export: true, allowEmptyValues: true });
}

let winrateData;
if (
  !ci &&
  !Deno.args.some((a) => a === "--force") &&
  (await Deno.stat("./temp.json")).isFile
) {
  console.log("temp.json found. use temp.");
  winrateData = JSON.parse(
    Deno.readTextFileSync("./temp.json"),
  ) as WinrateData;
} else {
  winrateData = await createWinrateData();
}

if (winrateData === undefined) {
  Deno.exit(0);
}

await saveToDatabase(winrateData);
Deno.exit(0);
