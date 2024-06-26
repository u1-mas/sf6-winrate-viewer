import { Signal } from "@preact/signals";

type TableViewProps = {
  tableData: Signal<string[][] | null>;
};
export default function TableView(
  { tableData }: TableViewProps,
) {
  if (tableData.value === null) {
    return null;
  }
  console.log({ tableData: tableData.value });
  return (
    <div className="whitespace-nowrap overflow-auto w-[100%] max-h-[500px] mt-[100px]">
      <table className="table-auto">
        <thead className="sticky top-0 z-10 ">
          <tr className="bg-gray-200">
            <th className="sticky left-0  bg-white border ">
              {tableData.value[0][0]}
            </th>
            {tableData.value[0].slice(1).map((h) => (
              <th className="px-4 py-2 border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.value.slice(1).map((r, i) => (
            <tr key={i}>
              <td className="px-4 py-2 sticky left-0 z-[2] bg-slate-100 border">
                {r[0]} {/* 日付 */}
              </td>
              {r.slice(1).map((d) => (
                <td className="px-4 py-2 border">
                  <span dangerouslySetInnerHTML={{ __html: d }}></span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
