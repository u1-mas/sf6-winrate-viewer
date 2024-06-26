// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $api_charactors from "./routes/api/charactors.ts";
import * as $api_tableData from "./routes/api/tableData.ts";
import * as $api_updateHistory from "./routes/api/updateHistory.ts";
import * as $api_winrateData from "./routes/api/winrateData.ts";
import * as $index from "./routes/index.tsx";
import * as $ChartView from "./islands/ChartView.tsx";
import * as $Filters from "./islands/Filters.tsx";
import * as $TableView from "./islands/TableView.tsx";
import * as $UpdateHistory from "./islands/UpdateHistory.tsx";
import * as $chart from "./islands/chart.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.ts": $_middleware,
    "./routes/api/charactors.ts": $api_charactors,
    "./routes/api/tableData.ts": $api_tableData,
    "./routes/api/updateHistory.ts": $api_updateHistory,
    "./routes/api/winrateData.ts": $api_winrateData,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/ChartView.tsx": $ChartView,
    "./islands/Filters.tsx": $Filters,
    "./islands/TableView.tsx": $TableView,
    "./islands/UpdateHistory.tsx": $UpdateHistory,
    "./islands/chart.tsx": $chart,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
