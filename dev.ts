#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import { loadSync } from "$std/dotenv/mod.ts";
import config from "./fresh.config.ts";

// import "$std/dotenv/load.ts";

if (!(Deno.readTextFileSync instanceof Function)) {
    // Avoid errors that occur in deno deploy: https://github.com/denoland/deno_std/issues/1957
    console.warn(
        `Deno.readTextFileSync is not a function: No .env data was read.`,
    );
} else {
    loadSync({ export: true, allowEmptyValues: true });
}

await dev(import.meta.url, "./main.ts", config);
