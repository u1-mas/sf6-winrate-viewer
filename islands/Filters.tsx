import { effect, Signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { fetchWinrateData } from "../components/fetchWinrateData.tsx";
import { WinrateData } from "../routes/api/winrateData.ts";
import { Switch } from "@headlessui/react";

type FiltersProps = {
  charactor: Signal<string>;
  act: Signal<string>;
  withAll: Signal<boolean>;
  winrateData: Signal<WinrateData>;
};
export default function Filters(
  { charactor, act, winrateData, withAll }: FiltersProps,
) {
  effect(async () => {
    await fetchWinrateData(winrateData, charactor.value, act.value);
  });

  const charactors = useSignal<string[]>([]);
  useEffect(() => {
    (async () => {
      console.log("fetch charactor");
      const resp = await fetch("http://localhost:8000/api/charactor");
      const json: string[] = await resp.json();
      charactors.value = json.sort();
      charactor.value = charactors.value[0];
    })();
  }, [charactors]);

  const acts = [
    "act:0",
    "act:1",
    "act:2",
    "act:3",
    "act:4",
    "累計",
  ];
  act.value = acts[0];
  return (
    <>
      <div class="flex">
        <label htmlFor="charactor">
          使用キャラクター:
        </label>
        <select
          name="charactor"
          id="charactor"
          class="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5"
          onChange={(e) => {
            charactor.value = e.currentTarget.value;
            console.log(`charactor change: ${charactor.value}`);
          }}
        >
          {charactors.value.map((hero) => (
            <option
              value={hero}
            >
              {hero}
            </option>
          ))}
        </select>
      </div>
      <div class="flex">
        <label htmlFor="act">Act:</label>
        <select
          name="act"
          id="act"
          onChange={(e) => act.value = e.currentTarget.value}
          class="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5"
        >
          {acts.map((a) => <option value={a}>{a}</option>)}
        </select>
      </div>
      <Switch
        checked={withAll.value}
        onChange={() => {
          withAll.value = !withAll.value;
          console.log(withAll.value);
        }}
        className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
      >
        <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
      </Switch>
    </>
  );
}
