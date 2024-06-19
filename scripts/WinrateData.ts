/**
 * WinrateDataByDate -> WinrateDataByAct -> WinrateDataByCharactor
 */
export type WinrateData = {
    dateString: string; // YYYY-DD-MM
    playerCharactor: string;
    byAct: {
        [act: string]: {
            [opponentCharactor: string]: {
                game: number;
                winrate: number;
            };
        };
    };
};
export type WinrateDataByAct = WinrateData["byAct"][string];
export type WinrateDataByCharactor = WinrateDataByAct["result"];
