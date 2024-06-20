import puppeteer, { Page } from "puppeteer";
import {
  WinrateData,
  WinrateDataByAct,
  WinrateDataByOppronentCharactor,
  WinrateDataByPlayerCharactor,
} from "./WinrateData.ts";
import { ScreenshotManager } from "./ScreenshotManager.ts";

const url =
  "https://www.streetfighter.com/6/buckler/ja-jp/auth/loginep?redirect_url=/";

export class PageManager {
  page: Page;
  screenshotManager: ScreenshotManager;

  constructor(page: Page) {
    this.page = page;
    this.screenshotManager = new ScreenshotManager(this.page);
  }

  static async build() {
    let browser;
    if (Deno.env.get("CI") === "true") {
      browser = await puppeteer.launch({
        slowMo: 100,
      });
    } else {
      browser = await puppeteer.launch({
        headless: false,
      });
    }
    const page = await browser.newPage();

    return new PageManager(page);
  }

  async transitionPlayPage(email: string, password: string) {
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    );
    await this.page.goto(url, { "waitUntil": "networkidle2" });
    await this.page.waitForNetworkIdle();

    await this.screenshotManager.takeScreenShot("start_page");
    // cookieボタンがあったら押す
    try {
      await this.page.waitForSelector(
        "button#CybotCookiebotDialogBodyButtonDecline",
        {
          timeout: 3000,
        },
      );
      await this.screenshotManager.takeScreenShot("check_cookie_1");

      await this.page.click("button#CybotCookiebotDialogBodyButtonDecline");
    } catch (_) {
      console.log("cookie button is missing. skip.");
    }

    try {
      await this.page.waitForSelector("select[name=country]", {
        timeout: 3000,
      });
      await this.page.select("select[name=country]", "JP");
      await this.page.select("select[name=birthYear]", "1999");
      await this.page.select("select[name=birthMonth]", "10");
      await this.page.select("select[name=birthDay]", "22");
      await this.screenshotManager.takeScreenShot("birthday_check");

      await this.page.click("button[name=submit]");
    } catch (_) {
      console.log("nothing birthday check. skip.");
    }

    await this.page.waitForSelector("input[name=email]");
    await this.screenshotManager.takeScreenShot("login_page");

    await this.page.type("input[name=email]", email);
    await this.page.type("input[name=password]", password);
    await this.screenshotManager.takeScreenShot("input_user_data");

    Deno.writeTextFileSync("temp.html", await this.page.content());
    await this.page.click("button[name=submit]");
    console.log("click submit button.");
    // await this.page.waitForNetworkIdle();

    await this.screenshotManager.takeScreenShot("main_page");
    await this.page.waitForSelector("aside[class^=header_user_nav]");

    await this.page.waitForNetworkIdle();

    // cookieボタンがあったら押す
    try {
      await this.page.waitForSelector(
        "button#CybotCookiebotDialogBodyButtonDecline",
      );
      await this.screenshotManager.takeScreenShot("check_cookie_2");
      await this.page.click("button#CybotCookiebotDialogBodyButtonDecline");
      await this.page.waitForNetworkIdle();
    } catch (_) {
      console.log("cookie button is missing. skip.");
    }

    await this.page.click("aside[class^=header_user_nav] dt");
    await this.page.waitForSelector("dl[class^=header_disp]");
    await this.page.click("li[class^=header_title] > a");
    await this.page.waitForNetworkIdle();
    await this.page.waitForSelector("aside#profile_nav");
    await this.page.click(
      "div[class^=profile_nav_inner] > ul > li:nth-child(2)",
    );
    await this.page.waitForNetworkIdle();
    await this.screenshotManager.takeScreenShot("transition_playpage");
    console.log("complete transition playpage.");
  }

  async close() {
    await this.page.browser().close();
  }

  async createWinrateData(): Promise<WinrateData> {
    await this.page.waitForSelector(playNavClass);
    await this.page.click(`${playNavClass} > li:nth-child(5)`); // キャラクター別対戦数
    await this.page.waitForSelector(
      "article[class^=winning_rate_winning_rate]",
    );

    // 0: ACT, 1: mode
    const filters = await this.page.$$(
      "aside[class^=filter_nav_filter_nav] select",
    );
    await filters[1].select("2"); // ランクマッチ
    const acts: { value: string; text: string }[] = await filters[0].$$eval(
      "option",
      (options) =>
        options.map((option) => ({
          value: option.value,
          text: option.text,
        })),
    );

    const charactorNumber = await this.page.$$eval(
      "div[class^=winning_rate_inner] > ul > li",
      (nodes) => nodes.length,
    );
    const changeCharactor = async (cN: number) => {
      await this.page.click("div[class^=winning_rate_select_character]");
      await this.page.waitForNetworkIdle();
      await this.page.waitForSelector(
        "ul[class^=winning_rate_character_list]",
      );
      const selectCharactors = await this.page.$$(
        "ul[class^=winning_rate_character_list] > li",
      );
      await selectCharactors[cN].click();
      await this.page.click("button[class^=modal_search__btn]");
      await this.page.waitForNetworkIdle();
    };

    let byPlayerCharactor: WinrateDataByPlayerCharactor = {};
    for (let idx = 0; idx < charactorNumber; idx++) {
      await this.page.waitForNetworkIdle();
      await changeCharactor(idx);

      const playerCharactor = (await this.page.$eval(
        "span[class^=winning_rate_name]",
        (node) => node.innerText,
      ) as string).toLowerCase().replaceAll(" ", "_");
      console.log({ playerCharactor });

      let byAct: WinrateDataByAct = {};
      for (const act of acts) {
        console.log(act);
        await filters[0].select(act.value);
        await this.page.waitForNetworkIdle();
        const winrates = await this.page.$$(
          "div[class^=winning_rate_inner] > ul > li",
        );
        let byOpponentCharactor: WinrateDataByOppronentCharactor = {};
        for await (const winrateByCharactor of winrates) {
          const opponentCharactor = (await winrateByCharactor.$eval(
            "p[class^=winning_rate_name]",
            (node) => node.innerText,
          ) as string).toLowerCase().replaceAll(" ", "_");
          const game: string = await winrateByCharactor.$eval(
            "p[class^=winning_rate_rate]",
            (node) => node.innerText,
          );
          const winrate: string = await winrateByCharactor
            .$eval(
              "div[class^=winning_rate_graf] > p[class^=winning_rate_number] > span",
              (node) => node.innerText,
            );
          byOpponentCharactor = {
            ...byOpponentCharactor,
            [opponentCharactor]: {
              game: parseInt(game.replace("戦", "")),
              winrate: parseFloat(winrate),
            },
          };
        }

        byAct = {
          ...byAct,
          [act.text.toLowerCase()]: byOpponentCharactor,
        };
      }
      byPlayerCharactor = {
        ...byPlayerCharactor,
        [playerCharactor]: byAct,
      };
    }

    const dateString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return {
      [dateString]: byPlayerCharactor,
    };
  }
}

const playNavClass = "aside[class^=play_nav_play_nav] > div > ul";
