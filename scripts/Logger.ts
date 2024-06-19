import { Logger } from "@deno-lib/logger";

const appLogger = new Logger();
await appLogger.initFileLogger("logs", {
  rotate: true,
});
export { appLogger };
