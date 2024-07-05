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
    <div class="my-2 bg-white p-6 rounded-xl shadow-lg">
      <div class="mx-auto">勝率</div>
      <FreshChart
        type="line"
        data={chartData.value}
      />
    </div>
  );
}
