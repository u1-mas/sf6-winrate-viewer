import { useSignal } from "@preact/signals";
import Filters from "../islands/Filters.tsx";
import TableView from "../islands/TableView.tsx";
import Viewer from "../islands/ChartView.tsx";
import { WinrateDataByOppronentCharactor } from "../scripts/WinrateData.ts";
import UpdateHistory from "../islands/UpdateHistory.tsx";

export default function Home() {
  const charactor = useSignal("luke");
  const act = useSignal("");
  const winrateData = useSignal<{
    [dateString: string]: WinrateDataByOppronentCharactor;
  }>({});
  const tableData = useSignal<string[][] | null>(null);
  const chartData = useSignal<
    { labels: string[]; datasets: number[][] } | null
  >(null);
  return (
    <div class="min-h-screen px-4 py-8 min-w-screen bg-[#e7f3c7]">
      <div className="container mx-auto">
        <UpdateHistory />
        <Filters
          winrateData={winrateData}
          charactor={charactor}
          act={act}
          tableData={tableData}
          chartData={chartData}
        />
        <Viewer winrateData={winrateData} chartData={chartData} />
        <TableView
          tableData={tableData}
        />
      </div>
    </div>
  );
}
