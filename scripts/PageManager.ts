import puppeteer, { Browser, Page } from "puppeteer";
import {
  WinrateData,
  WinrateDataByAct,
  WinrateDataByOppronentCharactor,
  WinrateDataByPlayerCharactor,
} from "./WinrateData.ts";
import { ScreenshotManager } from "./ScreenshotManager.ts";

const authUrl =
  "https://www.streetfighter.com/6/buckler/ja-jp/auth/loginep?redirect_url=/";

export class PageManager {
  browser: Browser;
  screenshotManager: ScreenshotManager;
  playpageUrl: string = "";

  constructor(browser: Browser) {
    this.browser = browser;
    this.screenshotManager = new ScreenshotManager();
  }

  static async build(email: string, password: string) {
    let browser;
    let page;
    if (Deno.env.get("CI") === "true") {
      browser = await puppeteer.launch({
        slowMo: 100,
      });
      page = await browser.newPage();
      page.setDefaultNavigationTimeout(100000);
      page.setDefaultTimeout(100000);
    } else {
      browser = await puppeteer.launch({
        headless: false,
        devtools: true,
      });
      page = await browser.newPage();
    }

    const manager = new PageManager(browser);
    await manager.transitionPlayPage(page, email, password);
    return manager;
  }

  async close() {
    await this.browser.close();
  }

  async transitionPlayPage(page: Page, email: string, password: string) {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    );
    await page.goto(authUrl, { "waitUntil": "networkidle2" });
    await page.waitForNetworkIdle();

    await this.screenshotManager.takeScreenShot(page, "start_page");
    // cookieボタンがあったら押す
    try {
      await page.waitForSelector(
        "button#CybotCookiebotDialogBodyButtonDecline",
        {
          timeout: 3000,
        },
      );
      await this.screenshotManager.takeScreenShot(page, "check_cookie_1");

      await page.click("button#CybotCookiebotDialogBodyButtonDecline");
    } catch (_) {
      console.log("cookie button is missing. skip.");
    }

    // 本人確認のための生年月日を入れる
    try {
      await page.waitForSelector("select[name=country]", {
        timeout: 3000,
      });
      await page.select("select[name=country]", "JP");
      await page.select("select[name=birthYear]", "1999");
      await page.select("select[name=birthMonth]", "10");
      await page.select("select[name=birthDay]", "22");
      await this.screenshotManager.takeScreenShot(page, "birthday_check");

      await page.click("button[name=submit]");
    } catch (_) {
      console.log("nothing birthday check. skip.");
    }

    await page.waitForSelector("input[name=email]");
    await this.screenshotManager.takeScreenShot(page, "login_page");

    await page.type("input[name=email]", email);
    await page.type("input[name=password]", password);
    await this.screenshotManager.takeScreenShot(page, "input_user_data");

    await page.click("button[name=submit]");

    await page.waitForSelector("aside[class^=header_user_nav]");
    // await this.screenshotManager.takeScreenShot("after_header_user_nav", true);

    // cookieボタンがあったら押す
    try {
      await page.waitForSelector(
        "button#CybotCookiebotDialogBodyButtonDecline",
      );
      await this.screenshotManager.takeScreenShot(page, "check_cookie_2");
      await page.click("button#CybotCookiebotDialogBodyButtonDecline");
    } catch (_) {
      console.log("cookie button is missing. skip.");
    }

    await page.click("aside[class^=header_user_nav] dt");
    await page.waitForSelector("dl[class^=header_disp]");
    await this.screenshotManager.takeScreenShot(page, "header_disp");

    await page.waitForSelector("li[class^=header_title]");
    await page.click("li[class^=header_title] > a", { delay: 1000 });
    await page.waitForSelector("aside#profile_nav");
    await this.screenshotManager.takeScreenShot(page, "profile_nav");

    await page.click(
      "div[class^=profile_nav_inner] > ul > li:nth-child(2)", // PLAYボタン
      { delay: 1000 },
    );
    await this.screenshotManager.takeScreenShot(page, "click_play");

    await Promise.any([
      page.waitForNetworkIdle(),
      page.waitForSelector("aside[class^=play_nav_play_nav]"),
    ]);
    await this.screenshotManager.takeScreenShot(page, "transition_playpage");
    this.playpageUrl = page.url();
    console.log("complete transition playpage.");
  }

  private async openPlayPage(purpose: string) {
    console.log("open play page for " + purpose + ".");
    const newPage = await this.browser.newPage();
    await newPage.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    );
    await newPage.goto(this.playpageUrl, { "waitUntil": "networkidle2" });
    return newPage;
  }

  async getActs(): Promise<string[]> {
    const page = await this.openPlayPage("get acts");
    return page.$$eval(
      "aside[class^=filter_nav_filter_nav__] dd:nth-of-type(1) > select > option",
      (elem) => elem.map((x) => x.value),
    );
  }

  async createWinrateData(): Promise<WinrateData> {
    const page = await this.openPlayPage("create winrate data");
    await page.waitForSelector(playNavClass);
    await page.click(`${playNavClass} > li:nth-child(5)`, { delay: 1000 }); // キャラクター別対戦数
    await page.waitForSelector(
      "article[class^=winning_rate_winning_rate]",
    );
    await this.screenshotManager.takeScreenShot(page, "by_charactor");
    // 0: ACT, 1: mode
    const filters = await page.$$(
      "aside[class^=filter_nav_filter_nav] select",
    );
    await filters[1].select("2"); // ランクマッチ
    console.log("select rank_match");
    await this.screenshotManager.takeScreenShot(page, "select_rank_match");
    const acts: { value: string; text: string }[] = await filters[0].$$eval(
      "option",
      (options) =>
        options.map((option) => ({
          value: option.value,
          text: option.text,
        })),
    );
    console.log({ acts });

    const charactorNumber = await page.$$eval(
      "div[class^=winning_rate_inner] > ul > li",
      (nodes) => nodes.length,
    );
    console.log({ charactorNumber });
    const changeCharactor = async (cN: number) => {
      console.log({ cN });
      for (let i = 0; i < 3; i++) {
        try {
          await page.waitForSelector(
            "div[class^=winning_rate_select_character]",
            {
              visible: true,
              timeout: 1000,
            },
          );
          await page.click("div[class^=winning_rate_select_character]");
          await page.waitForSelector(
            "ul[class^=winning_rate_character_list]",
            { timeout: 1000 },
          );
          break;
        } catch (err) {
          if (err instanceof Error) {
            if (i === 2) {
              throw err;
            }
          }
        }
      }

      const selectCharactors = await page.$$(
        "ul[class^=winning_rate_character_list] > li",
      );
      await selectCharactors[cN].click({ delay: 1000 });
      await this.screenshotManager.takeScreenShot(
        page,
        `select_${await selectCharactors[cN].$eval(
          "dl > dt",
          (elem) => elem.innerText,
        )}`,
      );
      await page.click("button[class^=modal_search__btn]");
    };

    let byPlayerCharactor: WinrateDataByPlayerCharactor = {};
    for (let idx = 0; idx < charactorNumber; idx++) {
      await changeCharactor(idx);

      const playerCharactor = (await page.$eval(
        "span[class^=winning_rate_name]",
        (node) => node.innerText,
      ) as string).toLowerCase().replaceAll(" ", "_");
      console.log({ playerCharactor });
      await this.screenshotManager.takeScreenShot(
        page,
        `selected_${playerCharactor}`,
      );

      let byAct: WinrateDataByAct = {};
      for (const act of acts) {
        console.log(act);
        await filters[0].select(act.value);
        this.screenshotManager.takeScreenShot(
          page,
          `${act.text}_by_${playerCharactor}`,
        );

        const winrates = await page.$$(
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
