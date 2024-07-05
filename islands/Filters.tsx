import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import ky from "ky";
import { ChartViewProps } from "../islands/ChartView.tsx";

type FiltersProps = {
  tableData: Signal<string[][] | null>;
  chartData: ChartViewProps["chartData"];
  charactors: string[];
  acts: string[];
};
export default function Filters(
  { tableData, chartData, acts, charactors }: FiltersProps,
) {
  const act = useSignal<string>(acts[0]);
  const charactor = useSignal<string>("luke");

  useSignalEffect(() => {
    (async () => {
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
    <div class="flex my-2">
      <div class="flex flex-col min-w-20">
        <label htmlFor="charactor" class="font-medium text-sm text-stone-600">
          キャラクター
        </label>
        <select
          name="charactor"
          id="charactor"
          class="p-2 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          onChange={(e) => {
            charactor.value = e.currentTarget.value;
            console.log(`charactor change: ${charactor.value}`);
          }}
          value={charactor.value}
        >
          {charactors.map((c) => (
            <option
              value={c}
            >
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col mx-2 min-w-20">
        <label htmlFor="act" class="font-medium text-sm text-stone-600">
          Act
        </label>
        <select
          name="act"
          id="act"
          onChange={(e) => {
            act.value = e.currentTarget.value;
            console.log("act change:", act.value);
          }}
          class="p-2 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        >
          {acts.map((a) => <option value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
}
