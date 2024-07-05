import { Page } from "puppeteer";
import { join, resolve } from "@std/path";

export class ScreenshotManager {
  snapshotDirPath: string = "snapshots";
  ssNumber: number = 0;
  constructor() {
    Deno.mkdirSync(this.snapshotDirPath, { recursive: true });
  }

  async takeScreenShot(
    page: Page,
    prefix: string = "",
    withHtml: boolean = false,
  ) {
    const filename = join(
      this.snapshotDirPath,
      prefix === "" ? `${this.ssNumber++}` : `${this.ssNumber++}_${prefix}`,
    ).replaceAll(":", "_");
    await page.screenshot({
      fullPage: true,
      path: resolve(filename + ".png"),
    });
    console.log("Screenshot Save:", resolve(filename + ".png"));

    try {
      if (withHtml) {
        await Deno.writeTextFile(
          resolve(filename + ".html"),
          await page.content(),
        );
        console.log("Html Save:", resolve(filename, ".html"));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  }
}
