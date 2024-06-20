import puppeteer, { Page } from "puppeteer";
import { WinrateData } from "./WinrateData.ts";

const url =
  "https://www.streetfighter.com/6/buckler/ja-jp/auth/loginep?redirect_url=/";

export class PageManager {
  page: Page;
  tempDirPath: string;
  constructor(page: Page) {
    this.page = page;
    this.tempDirPath = Deno.makeTempDirSync({ prefix: "sf6-winrate_" });
    console.log(this.tempDirPath);
  }

  static async build(email: string, password: string) {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
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

    return new PageManager(page);
  }

  async close() {
    await this.page.browser().close();
  }

  async checkWinrateByCharactor() {
    await this.page.waitForSelector(playNavClass);
    await this.page.click(`${playNavClass} > li:nth-child(5)`); // キャラクター別対戦数
    await this.page.waitForSelector(
      "article[class^=winning_rate_winning_rate]",
    );

    const filters = await this.page.$$(
      "aside[class^=filter_nav_filter_nav] select",
    ); // 0: ACT, 1: mode
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
    console.log({ charactorNumber });
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
    for (let idx = 0; idx < charactorNumber; idx++) {
      await this.page.waitForNetworkIdle();
      await changeCharactor(idx);
      let wrByCharactor = {};
      const playerCharactor = (await this.page.$eval(
        "span[class^=winning_rate_name]",
        (node) => node.innerText,
      ) as string).toLowerCase().replaceAll(" ", "_");
      console.log({ playerCharactor });
      for (const act of acts) {
        console.log(act);
        await filters[0].select(act.value);
        await this.page.waitForNetworkIdle();
        const winrates = await this.page.$$(
          "div[class^=winning_rate_inner] > ul > li",
        );
        let wrByAct = {};
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
          wrByAct = {
            ...wrByAct,
            [opponentCharactor]: {
              game: parseInt(game.replace("戦", "")),
              winrate: parseFloat(winrate),
            },
          };
        }
        wrByCharactor = {
          ...wrByCharactor,
          [act.text.toLowerCase()]: wrByAct,
        };
      }
      const writeData: WinrateData = {
        byAct: wrByCharactor,
        dateString: new Date().toISOString().split("T")[0],
        playerCharactor: playerCharactor.toLowerCase(),
      };
      Deno.writeTextFileSync(
        `${this.tempDirPath}/winrate_${
          playerCharactor.replaceAll(" ", "_") // DEE JAY -> DEE_JAY
            .replaceAll(".", "_") // E.HONDA -> E_HONDA
        }_${writeData.dateString}.json`,
        JSON.stringify(writeData, null, 2),
        {
          createNew: true,
        },
      );
    }

    console.log("Write winrate json");
  }
}

const playNavClass = "aside[class^=play_nav_play_nav] > div > ul";
