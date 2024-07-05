import { signal } from "@preact/signals";
import Filters from "../islands/Filters.tsx";
import TableView from "../islands/TableView.tsx";
import Viewer, { ChartViewProps } from "../islands/ChartView.tsx";
import { getKvData } from "../services/kv.ts";

export default async function Home() {
  const acts = (await getKvData<string[]>(["acts"])).value ?? [];
  const charactors =
    (await getKvData<string[]>(["charactors"])).value?.map((x) =>
      x.toLowerCase()
    ) ?? [];
  const history = (await getKvData<string>(["update_history"])).value;
  console.log({ history });

  const tableData = signal<string[][] | null>(null);
  const chartData: ChartViewProps["chartData"] = signal(null);
  return (
    <div class="min-h-screen px-4 py-8 min-w-screen bg-[#e7f3c7]">
      <div className="container mx-auto">
        <p>updated: {history}</p>
        <Filters
          acts={acts}
          charactors={charactors}
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
