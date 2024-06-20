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

    async takeScreenShot() {
        const filepath = join(this.snapshotDirPath, `${this.ssNumber++}.png`);
        await this.page.screenshot({
            fullPage: true,
            path: resolve(filepath),
        });

        console.log("Screenshot Save:", resolve(filepath));
    }
}
