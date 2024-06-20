import { useSignal } from "@preact/signals";
import Filters from "../islands/Filters.tsx";
import TableView from "../islands/TableView.tsx";
import Viewer from "../islands/ChartView.tsx";
import { WinrateDataByOppronentCharactor } from "../scripts/WinrateData.ts";

export default function Home() {
  const charactor = useSignal("luke");
  const act = useSignal("");
  const withAll = useSignal(false);
  const winrateData = useSignal<{
    [dateString: string]: WinrateDataByOppronentCharactor;
  }>({});
  return (
    <div class="min-h-screen px-4 py-8 min-w-screen bg-[#e7f3c7]">
      <div className="container mx-auto">
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>

        <Filters
          winrateData={winrateData}
          charactor={charactor}
          withAll={withAll}
          act={act}
        />
        <Viewer winrateData={winrateData} withAll={withAll} />
        <TableView winrateData={winrateData} withAll={withAll} />
      </div>
    </div>
  );
}
