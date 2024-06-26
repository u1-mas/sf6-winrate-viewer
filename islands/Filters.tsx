import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import { useEffect } from "preact/hooks";
import ky from "ky";
import { ChartViewProps } from "../islands/ChartView.tsx";

type FiltersProps = {
  charactor: Signal<string>;
  act: Signal<string>;
  tableData: Signal<string[][] | null>;
  chartData: ChartViewProps["chartData"];
};
export default function Filters(
  { charactor, act, tableData, chartData }: FiltersProps,
) {
  const charactors = useSignal<string[]>([]);
  useEffect(() => {
    (async () => {
      console.log("fetch charactor");
      const resp = await ky.get("/api/charactors");
      const json: string[] = await resp.json();
      charactors.value = json.sort();
    })();
  }, [charactors]);

  const acts = [
    "act:4",
    "act:3",
    "act:2",
    "act:1",
    "act:0",
    "累計",
  ];
  act.value = acts[0];

  useSignalEffect(() => {
    (async () => {
      if (charactor.value === "" || act.value === "") {
        return;
      }

      console.log("fetch tableData");
      const params = new URLSearchParams({
        charactor: charactor.value,
        act: act.value,
      });
      const resp = await ky.get("/api/tableData", {
        searchParams: params,
      });
      tableData.value = await resp.json();
    })();
  });
  useSignalEffect(() => {
    (async () => {
      console.log("fetch chartData");
      const params = new URLSearchParams({
        charactor: charactor.value,
        act: act.value,
      });
      const resp = await ky.get("/api/chartData", {
        searchParams: params,
      });
      chartData.value = await resp.json();
    })();
  });

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
          value={charactor.value}
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
          onChange={(e) => {
            act.value = e.currentTarget.value;
            console.log("act change:", act.value);
          }}
          class="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5"
        >
          {acts.map((a) => <option value={a}>{a}</option>)}
        </select>
      </div>
    </>
  );
}
