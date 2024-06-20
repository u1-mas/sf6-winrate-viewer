import { WinrateData } from "../routes/api/winrateData.ts";
import { Signal } from "@preact/signals";

type TableViewProps = {
  winrateData: Signal<WinrateData>;
  withAll: Signal<boolean>;
};
export default function TableView({ winrateData, withAll }: TableViewProps) {
  const byDate = winrateData?.value;
  if (byDate == null) {
    return null;
  }
  const dates = Object.keys(byDate);
  if (dates.length == 0) {
    return null;
  }
  const charactors = Object.keys(byDate[dates[0]]).filter((c) =>
    c !== "all" || !withAll
  ).sort();
  return (
    <div className="whitespace-nowrap overflow-auto w-[100%] max-h-[500px] mt-[100px] top-0">
      <table className="table-auto">
        <thead className=" sticky top-0 z-10 ">
          <tr className="bg-gray-200">
            <th className="sticky left-0  bg-white border ">
              日付
            </th>
            {charactors.map((c) => <th className="px-4 py-2 border">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {dates.map((d, i) => (
            <tr key={i}>
              <td className="px-4 py-2 sticky left-0 z-[2] bg-slate-100 border">
                {d}
              </td>
              {charactors.map((c) => (
                <td className="px-4 py-2 border">
                  <span>
                    {byDate[d][c].game} / {byDate[d][c].winrate}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
