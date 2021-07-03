/// <reference path="../../declarations/GameHelper.d.ts" />

class Mine {
    public static maxSkips = 5;
    public static grid: Array<Array<KnockoutObservable<number>>>;
    public static rewardGrid: Array<Array<any>>;
    public static itemsFound: KnockoutObservable<number> = ko.observable(0);
    public static itemsBuried: KnockoutObservable<number> = ko.observable(0);
    public static rewardNumbers: Array<number>;
    public static surveyResult = ko.observable(null);
    public static skipsRemaining = ko.observable(Mine.maxSkips)

    // 0 represents the Mine.Tool.Chisel but it's not loaded here yet.
    public static toolSelected: KnockoutObservable<Mine.Tool> = ko.observable(0);
    private static loadingNewLayer = true;

    public static loadMine() {
        const tmpGrid = [];
        const tmpRewardGrid = [];
        Mine.rewardNumbers = [];
        Mine.itemsBuried(0);
        Mine.surveyResult(null);
        for (let i = 0; i < App.game.underground.getSizeY(); i++) {
            const row = [];
            const rewardRow = [];
            for (let j = 0; j < Underground.sizeX; j++) {
                row.push(ko.observable(Math.min(5, Math.max(1, Math.floor(Math.random() * 2 + Math.random() * 3) + 1))));
                rewardRow.push(0);
            }
            tmpGrid.push(row);
            tmpRewardGrid.push(rewardRow);
        }
        Mine.grid = tmpGrid;
        Mine.rewardGrid = tmpRewardGrid;

        let added = 0;
        for (let i = 0; i < App.game.underground.getMaxItems(); i++) {
            const item = UndergroundItem.getRandomItem();
            const x = Mine.getRandomCoord(Underground.sizeX, item.space[0].length);
            const y = Mine.getRandomCoord(App.game.underground.getSizeY(), item.space.length);
            const res = Mine.canAddReward(x, y, item);
            if (res) {
                Mine.addReward(x, y, item);
                added = added + 1;
            }
        }

        // Check in case player upgrade min above max
        const min = Math.min(App.game.underground.getMinItems(), App.game.underground.getMaxItems());
        while (added < min) {
            const item = UndergroundItem.getRandomItem();
            const x = Mine.getRandomCoord(Underground.sizeX, item.space[0].length);
            const y = Mine.getRandomCoord(App.game.underground.getSizeY(), item.space.length);
            const res = Mine.canAddReward(x, y, item);
            if (res) {
                Mine.addReward(x, y, item);
                added = added + 1;
                //This should loop until it's added.
            }
        }

        Mine.loadingNewLayer = false;
        Mine.itemsFound(0);

        Underground.showMine();

        //Check if Explosive_Charge is equipped.
        if (App.game.oakItems.isActive(OakItems.OakItem.Explosive_Charge)) {
            const tiles = App.game.oakItems.calculateBonus(OakItems.OakItem.Explosive_Charge);
            for (let i = 1; i < tiles; i++) {
                const x = GameConstants.randomIntBetween(0, App.game.underground.getSizeY() - 1);
                const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
                this.breakTile(x, y, 1);
            }
        }
    }

    private static getRandomCoord(max: number, size: number): number {
        return Math.floor(Math.random() * (max - size));
    }

    private static canAddReward(x: number, y: number, reward: UndergroundItem): boolean {
        if (Mine.alreadyHasRewardId(reward.id)) {
            return false;
        }
        this.rotateReward(reward);
        if (y + reward.space.length >= App.game.underground.getSizeY() || x + reward.space[0].length >= Underground.sizeX) {
            return false;
        }
        for (let i = 0; i < reward.space.length; i++) {
            for (let j = 0; j < reward.space[i].length; j++) {
                if (reward.space[i][j] !== 0) {
                    if (Mine.rewardGrid[i + y][j + x] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private static alreadyHasRewardId(id: number): boolean {
        for (const row of Mine.rewardGrid) {
            for (const item of row) {
                if (item.value === id) {
                    return true;
                }
            }
        }
        return false;
    }

    private static addReward(x: number, y: number, reward: UndergroundItem) {
        for (let i = 0; i < reward.space.length; i++) {
            for (let j = 0; j < reward.space[i].length; j++) {
                if (reward.space[i][j].value != 0) {
                    Mine.rewardGrid[i + y][j + x] = {
                        ...reward.space[i][j],
                        revealed: 0,
                    };
                }
            }
        }
        GameHelper.incrementObservable(Mine.itemsBuried);
        Mine.rewardNumbers.push(reward.id);
    }

    private static rotateReward(reward): UndergroundItem {
        let rotations = Math.floor(Math.random() * 4);

        while (rotations-- > 0) {
            reward.space = reward.space[0].map((val, index) => reward.space.map(row => row[index]).reverse());
        }

        const currentRotation = this.calculateRotation(reward);

        reward.space = reward.space.map(r => r.map(v => {
            v.rotations = currentRotation;
            return v;
        }));

        return reward;
    }

    private static calculateRotation(reward): number {
        let indexX = 0;

        const indexY = reward.space.findIndex(y => {
            indexX = y.findIndex(x => !x.x && !x.y);
            return indexX >= 0;
        });

        return (indexX ? 1 : 0) + (indexY ? 2 : 0);
    }

    public static survey() {
        if (Mine.surveyResult()) {
            $('#mine-survey-result').tooltip('show');
            return;
        }

        const surveyCost = App.game.underground.getSurvey_Cost();
        if (App.game.underground.energy < surveyCost) {
            return;
        }

        const tiles = App.game.underground.getSurvey_Efficiency();
        for (let i = 0; i < tiles; i++) {
            const x = GameConstants.randomIntBetween(0, this.getHeight() - 1);
            const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
            this.breakTile(x, y, 5);
        }

        App.game.underground.energy -= surveyCost;
        const rewards = Mine.rewardSummary();
        Mine.updatesurveyResult(rewards);
    }

    private static rewardSummary() {
        return Mine.rewardNumbers.reduce((res, id) => {
            const reward = UndergroundItem.list.find(x => x.id == id);

            if (ItemList[reward.valueType]) {
                res.evoItems++;
            } else {
                switch (reward.valueType) {
                    case 'Diamond': {
                        res.totalValue += reward.value;
                        break;
                    }
                    case 'Mine Egg': {
                        res.fossils++;
                        break;
                    }
                    default: {
                        res.plates++;
                    }
                }
            }
            return res;
        }, {fossils: 0, plates: 0, evoItems: 0, totalValue: 0});
    }

    private static updatesurveyResult(summary) {
        const text = [];
        if (summary.fossils) {
            text.push(`Fossils: ${summary.fossils}`);
        }
        if (summary.evoItems) {
            text.push(`Evolution Items: ${summary.evoItems}`);
        }
        if (summary.plates) {
            text.push(`Shard Plates: ${summary.plates}`);
        }
        text.push(`Diamond Value: ${summary.totalValue}`);

        Mine.surveyResult(text.join('<br>'));
        $('#mine-survey-result').tooltip('show');
    }

    public static click(i: number, j: number) {
        if (Mine.toolSelected() == Mine.Tool.Hammer) {
            Mine.hammer(i, j);
        } else {
            Mine.chisel(i, j);
        }
    }

    private static hammer(x: number, y: number) {
        if (App.game.underground.energy >= Underground.HAMMER_ENERGY) {
            if (x < 0 || y < 0) {
                return;
            }
            let hasMined = false;
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (Mine.grid[Mine.normalizeY(x + i)][Mine.normalizeX(y + j)]() > 0) {
                        hasMined = true;
                    }
                    this.breakTile(x + i, y + j, 1);
                }
            }
            if (hasMined) {
                App.game.underground.energy -= Underground.HAMMER_ENERGY;
            }
        }
    }

    private static chisel(x: number, y: number) {
        if (Mine.grid[x][y]() > 0) {
            if (App.game.underground.energy >= Underground.CHISEL_ENERGY) {
                this.breakTile(x, y, 2);
                App.game.underground.energy -= Underground.CHISEL_ENERGY;
            }
        }
    }

    private static bomb() {
        let tiles = App.game.underground.getBombEfficiency();
        if (App.game.underground.energy >= Underground.BOMB_ENERGY) {
            while (tiles-- > 0) {
                const x = GameConstants.randomIntBetween(0, this.getHeight() - 1);
                const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
                this.breakTile(x, y, 2);
            }
            App.game.underground.energy -= Underground.BOMB_ENERGY;
        }
    }

    private static async skipLayer(shouldConfirm = true): Promise<void> {
        if (!this.skipsRemaining()) {
            return;
        }

        if (!shouldConfirm || await Notifier.confirm({
            title: 'Underground',
            message: 'Skip this mine layer?',
            type: NotificationConstants.NotificationOption.warning,
            confirm: 'skip',
        })) {
            setTimeout(Mine.completed, 1500);
            Mine.loadingNewLayer = true;
            GameHelper.incrementObservable(this.skipsRemaining, -1);
        }
    }

    private static breakTile(_x: number, _y: number, layers = 1) {
        const x = Mine.normalizeY(_x);
        const y = Mine.normalizeX(_y);
        const newlayer = Math.max(0, Mine.grid[x][y]() - layers);

        Mine.grid[x][y](newlayer);

        const reward = Mine.rewardGrid[x][y];
        if (newlayer == 0 && reward != 0 && reward.revealed != 1) {
            reward.revealed = 1;
            const image = Underground.getMineItemById(reward.value).undergroundImage;
            $(`div[data-i=${x}][data-j=${y}]`).html(`<div class="mineReward size-${reward.sizeX}-${reward.sizeY} pos-${reward.x}-${reward.y} rotations-${reward.rotations}" style="background-image: url('${image}');"></div>`);
            Mine.checkItemsRevealed();
        }
    }

    private static normalizeX(x: number): number {
        return Math.min(Underground.sizeX - 1, Math.max(0, x));
    }

    private static normalizeY(y: number): number {
        return Math.min(this.getHeight() - 1, Math.max(0, y));
    }

    public static getHeight(): number {
        return this.rewardGrid ? this.rewardGrid.length : 0;
    }

    public static checkItemsRevealed() {
        for (let i = 0; i < Mine.rewardNumbers.length; i++) {
            if (Mine.checkItemRevealed(Mine.rewardNumbers[i])) {
                Underground.gainMineItem(Mine.rewardNumbers[i]);
                const itemName = Underground.getMineItemById(Mine.rewardNumbers[i]).name;
                Notifier.notify({
                    message: `You found ${GameHelper.anOrA(itemName)} ${GameConstants.humanifyString(itemName)}`,
                    type: NotificationConstants.NotificationOption.success,
                });

                if (App.game.oakItems.isActive(OakItems.OakItem.Treasure_Scanner)) {
                    const giveDouble = App.game.oakItems.calculateBonus(OakItems.OakItem.Treasure_Scanner) / 100;
                    let random = Math.random();
                    if (giveDouble >= random) {
                        Underground.gainMineItem(Mine.rewardNumbers[i]);
                        Notifier.notify({
                            message: `You found an extra ${GameConstants.humanifyString(itemName)} in the Mine!`,
                            type: NotificationConstants.NotificationOption.success,
                            title: 'Treasure Scanner',
                            timeout: 4000,
                        });

                        random = Math.random();
                        if (giveDouble >= random) {
                            Underground.gainMineItem(Mine.rewardNumbers[i]);
                            Notifier.notify({
                                message: `Lucky! You found another ${GameConstants.humanifyString(itemName)}!`,
                                type: NotificationConstants.NotificationOption.success,
                                title: 'Treasure Scanner',
                                timeout: 6000,
                            });

                            random = Math.random();
                            if (giveDouble >= random) {
                                Underground.gainMineItem(Mine.rewardNumbers[i]);
                                Notifier.notify({
                                    message: `Jackpot! You found another ${GameConstants.humanifyString(itemName)}!`,
                                    type: NotificationConstants.NotificationOption.success,
                                    title: 'Treasure Scanner',
                                    timeout: 8000,
                                });
                            }
                        }
                    }
                }

                App.game.oakItems.use(OakItems.OakItem.Treasure_Scanner);
                Mine.itemsFound(Mine.itemsFound() + 1);
                GameHelper.incrementObservable(App.game.statistics.undergroundItemsFound);
                Mine.rewardNumbers.splice(i, 1);
                i--;
                Mine.checkCompleted();
            }
        }
    }

    public static checkItemRevealed(id: number) {
        for (let i = 0; i < Underground.sizeX; i++) {
            for (let j = 0; j < this.getHeight(); j++) {
                if (Mine.rewardGrid[j][i] != 0) {
                    if (Mine.rewardGrid[j][i].value == id) {
                        if (Mine.rewardGrid[j][i].revealed === 0) {
                            return false;
                        }
                    }
                }
            }
        }
        App.game.oakItems.use(OakItems.OakItem.Cell_Battery);
        return true;
    }

    public static checkCompleted() {
        if (Mine.itemsFound() >= Mine.itemsBuried()) {
            // Don't resolve queued up calls to checkCompleted() until completed() is finished and sets loadingNewLayer to false
            if (Mine.loadingNewLayer == true) {
                return;
            }
            Mine.loadingNewLayer = true;
            setTimeout(Mine.completed, 1500);
            GameHelper.incrementObservable(App.game.statistics.undergroundLayersMined);

            if (this.skipsRemaining() < this.maxSkips) {
                GameHelper.incrementObservable(this.skipsRemaining);
            }
        }
    }

    private static completed() {
        Notifier.notify({
            message: 'You dig deeper...',
            type: NotificationConstants.NotificationOption.info,
        });
        ko.cleanNode(document.getElementById('mineBody'));
        App.game.oakItems.use(OakItems.OakItem.Explosive_Charge);
        Mine.loadMine();
        ko.applyBindings(null, document.getElementById('mineBody'));
    }

    public static loadSavedMine(mine) {
        this.grid = mine.grid.map(row => row.map(val => ko.observable(val))),
        this.rewardGrid = mine.rewardGrid;
        this.itemsFound(mine.itemsFound);
        this.itemsBuried(mine.itemsBuried);
        this.rewardNumbers = mine.rewardNumbers;
        this.loadingNewLayer = false;
        this.surveyResult(mine.surveyResult ?? this.surveyResult());
        this.skipsRemaining(mine.skipsRemaining ?? this.maxSkips);

        Underground.showMine();
        // Check if completed in case the mine was saved after completion and before creating a new mine
        // TODO: Remove setTimeout after TypeScript module migration is complete. Needed so that `App.game` is available
        setTimeout(Mine.checkCompleted, 0);
    }

    public static save(): Record<string, any> {
        if (this.grid == null) {
            Mine.loadMine();
        }
        const mineSave = {
            grid: this.grid.map(row => row.map(val => val())),
            rewardGrid: this.rewardGrid,
            itemsFound: this.itemsFound(),
            itemsBuried: this.itemsBuried(),
            rewardNumbers: this.rewardNumbers,
            surveyResult: this.surveyResult(),
            skipsRemaining: this.skipsRemaining(),
        };
        return mineSave;
    }
}

namespace Mine {
    export enum Tool {
        'Chisel' = 0,
        'Hammer' = 1,
    }
}
