import { Signal } from "@preact/signals";
import { ChartJs, FreshChart } from "../components/Chart.tsx";

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
      <FreshChart
        type="line"
        data={chartData.value}
      />
    </div>
  );
}
