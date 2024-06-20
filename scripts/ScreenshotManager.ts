import { Page } from "puppeteer";
import { join, resolve } from "@std/path";

export class ScreenshotManager {
    snapshotDirPath: string = "snapshots";
    page: Page;
    ssNumber: number = 0;
    constructor(page: Page) {
        this.page = page;
        Deno.mkdirSync(this.snapshotDirPath, { recursive: true });
    }

    async takeScreenShot(prefix: string = "", withHtml: boolean = false) {
        const filename = join(
            this.snapshotDirPath,
            prefix === ""
                ? `${this.ssNumber++}`
                : `${this.ssNumber++}_${prefix}`,
        );
        await this.page.screenshot({
            fullPage: true,
            path: resolve(filename + ".png"),
        });
        console.log("Screenshot Save:", resolve(filename + ".png"));

        try {
            if (withHtml) {
                await Deno.writeTextFile(
                    resolve(filename + ".html"),
                    await this.page.content(),
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
