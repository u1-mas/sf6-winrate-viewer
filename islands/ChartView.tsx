import { Signal } from "@preact/signals";
import Chart from "./chart.tsx";
import { WinrateDataByOppronentCharactor } from "../scripts/WinrateData.ts";

type ViewerProps = {
  winrateData: Signal<{
    [dateString: string]: WinrateDataByOppronentCharactor;
  }>;
  withAll: Signal<boolean>;
};
export default function Viewer({ winrateData, withAll }: ViewerProps) {
  const byDate = winrateData.value;
  const dates = Object.keys(byDate);
  if (dates.length == 0) {
    return null;
  }
  const byOpponentCharactor = byDate[dates[0]];
  const charactors = Object.keys(byOpponentCharactor).sort();
  const mode: "game" | "winrate" = "game";
  const datasets = charactors.map((c) => ({
    label: c,
    data: Object.values(byDate).map((res) => res[c][mode]),
  })).filter((d) => d.label !== "all" || !withAll);

  return (
    <Chart
      type="line"
      data={{
        labels: dates,
        datasets: datasets,
      }}
    />
  );
}
