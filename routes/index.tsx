import { useSignal } from "@preact/signals";
import Filters from "../islands/Filters.tsx";
import TableView from "../islands/TableView.tsx";
import Viewer, { ChartViewProps } from "../islands/ChartView.tsx";
import UpdateHistory from "../islands/UpdateHistory.tsx";

export default function Home() {
  const charactor = useSignal("luke");
  const act = useSignal("");
  const tableData = useSignal<string[][] | null>(null);
  const chartData: ChartViewProps["chartData"] = useSignal(null);
  return (
    <div class="min-h-screen px-4 py-8 min-w-screen bg-[#e7f3c7]">
      <div className="container mx-auto">
        <UpdateHistory />
        <Filters
          charactor={charactor}
          act={act}
          tableData={tableData}
          chartData={chartData}
        />
        <Viewer chartData={chartData} />
        <TableView
          tableData={tableData}
        />
      </div>
    </div>
  );
}
