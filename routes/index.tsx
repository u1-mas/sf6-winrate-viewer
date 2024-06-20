import { useSignal } from "@preact/signals";
import { WinrateData } from "./api/winrateData.ts";
import Filters from "../islands/Filters.tsx";
import TableView from "../islands/TableView.tsx";
import Viewer from "../islands/ChartView.tsx";

export default function Home() {
  const charactor = useSignal("");
  const act = useSignal("");
  const withAll = useSignal(false);
  const winrateData = useSignal<WinrateData>({});
  return (
    <div class="min-h-screen px-4 py-8 min-w-screen bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
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
