/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { loadSync } from "$std/dotenv/mod.ts";

// import "$std/dotenv/load.ts";
if (!(Deno.readTextFileSync instanceof Function)) {
    // Avoid errors that occur in deno deploy: https://github.com/denoland/deno_std/issues/1957
    console.warn(
        `Deno.readTextFileSync is not a function: No .env data was read.`,
    );
} else {
    loadSync({ export: true, allowEmptyValues: true });
}

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
