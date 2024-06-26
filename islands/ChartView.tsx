import { Signal } from "@preact/signals";
import Chart from "./chart.tsx";
import { ChartJs } from "$fresh_charts/deps.ts";

export type ChartViewProps = {
  chartData: Signal<
    ChartJs.ChartData<"line"> | null
  >;
};
export default function ChartView({ chartData }: ChartViewProps) {
  if (chartData.value === null) {
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
