import puppeteer, { Page } from "puppeteer";
import {
  WinrateData,
  WinrateDataByAct,
  WinrateDataByOppronentCharactor,
  WinrateDataByPlayerCharactor,
} from "./WinrateData.ts";

const url =
  "https://www.streetfighter.com/6/buckler/ja-jp/auth/loginep?redirect_url=/";

export class PageManager {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  static async build(email: string, password: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    );
    await page.goto(url, { "waitUntil": "networkidle2" });
    await page.waitForNetworkIdle();

    await page.waitForSelector("input[name=email]");
    await page.type("input[name=email]", email);
    await page.type("input[name=password]", password);

    await page.click("button[name=submit]");

    await page.waitForSelector("aside[class^=header_user_nav]");
    await page.waitForNetworkIdle();

    // cookie許可しないボタンを押す
    await page.waitForSelector(
      "button#CybotCookiebotDialogBodyButtonDecline",
    );
    await page.click("button#CybotCookiebotDialogBodyButtonDecline");
    await page.waitForNetworkIdle();

    await page.click("aside[class^=header_user_nav] dt");
    await page.waitForSelector("dl[class^=header_disp]");
    await page.click("li[class^=header_title] > a");
    await page.waitForNetworkIdle();
    await page.waitForSelector("aside#profile_nav");
    await page.click(
      "div[class^=profile_nav_inner] > ul > li:nth-child(2)",
    );

    console.log("complete build.");
    return new PageManager(page);
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
