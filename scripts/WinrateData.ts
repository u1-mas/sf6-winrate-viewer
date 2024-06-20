/**
 * WinrateDataByDate -> WinrateDataByAct -> WinrateDataByCharactor
 */
export type WinrateData = {
  [dateString: string]: {
    [playerCharactor: string]: {
      [act: string]: {
        [opponentCharactor: string]: {
          game: number;
          winrate: number;
        };
      };
    };
  };
};
export type WinrateDataByPlayerCharactor = WinrateData[string];
export type WinrateDataByAct = WinrateDataByPlayerCharactor[string];
export type WinrateDataByOppronentCharactor = WinrateDataByAct[string];
