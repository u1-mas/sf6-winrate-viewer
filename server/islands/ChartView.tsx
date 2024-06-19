import { Signal } from "@preact/signals";
import { WinrateData } from "../routes/api/winrateData.ts";
import Chart from "./chart.tsx";

type ViewerProps = {
    winrateData: Signal<WinrateData>;
    withAll: Signal<boolean>;
};
export default function Viewer({ winrateData, withAll }: ViewerProps) {
    const byDate = winrateData.value;
    const dates = Object.keys(byDate);
    if (dates.length == 0) {
        return null;
    }
    const byCharactor = byDate[dates[0]];
    const charactors = Object.keys(byCharactor).sort();
    const mode: "game" | "winrate" = "game";
    const datasets = charactors.map((c) => ({
        label: c,
        data: Object.values(byDate).map((res) => res[c][mode]),
    })).filter((d) => d.label !== "all" || !withAll);

    return (
        <>
            <Chart
                type="line"
                data={{
                    labels: dates,
                    datasets: datasets,
                }}
            />
        </>
    );
}
