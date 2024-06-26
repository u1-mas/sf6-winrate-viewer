import { Signal } from "@preact/signals";
import Chart from "./chart.tsx";
import { WinrateDataByOppronentCharactor } from "../scripts/WinrateData.ts";
import { ChartJs } from "$fresh_charts/deps.ts";

export type ChartViewProps = {
  winrateData: Signal<{
    [dateString: string]: WinrateDataByOppronentCharactor;
  }>;
  chartData: Signal<
    ChartJs.ChartData<"line"> | null
  >;
};
export default function ChartView({ winrateData, chartData }: ChartViewProps) {
  const byDate = winrateData.value;
  const dates = Object.keys(byDate);
  if (dates.length === 0 || chartData.value === null) {
    return null;
  }

  return (
    <div class="my-[10px]">
      <div class="mx-auto">勝率</div>
      <Chart
        type="line"
        data={chartData.value}
      />
    </div>
  );
}
