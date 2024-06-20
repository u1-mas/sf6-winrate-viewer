import { Signal } from "@preact/signals";
import { WinrateData } from "../routes/api/winrateData.ts";

export const fetchWinrateData = async (
  winrateData: Signal<WinrateData>,
  charactor: string,
  act: string,
) => {
  const resp = await fetch(
    new URL(
      `http://localhost:8000/api/winrateData?charactor=${charactor}&act=${act}`,
    ),
  );
  winrateData.value = await resp.json() as WinrateData;
};
