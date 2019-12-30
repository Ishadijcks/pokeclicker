class Wallet implements Feature {
    name: string = "Wallet";
    saveKey: string = "wallet";
    currencies: ArrayOfObservables<number>;

    defaults = {
        currencies: [0, 0, 0, 0, 0]
    };

    constructor() {
        this.currencies = new ArrayOfObservables(this.defaults.currencies);
    }

    public gainMoney(base: number, origin?: string) {
        OakItemRunner.use(GameConstants.OakItem.Amulet_Coin);

        let money = base;
        money *= OakItemRunner.getMoneyMultiplier();
        money *= AchievementHandler.getMoneyMultiplier();
        money *= EffectEngineRunner.getMoneyMultiplier();

        money = Math.floor(money);

        GameHelper.incrementObservable(player.statistics.totalMoney, money);
        GameController.animateCurrency(money, 'playerMoney');

        this.addAmount(new Amount(money, Currency.money))
    }

    public gainDungeonTokens(base: number, origin?: string) {
        let tokens = base;
        tokens *= EffectEngineRunner.getDungeonTokenMultiplier();

        tokens = Math.floor(tokens);

        GameHelper.incrementObservable(player.statistics.totalTokens, tokens);
        GameController.animateCurrency(tokens, 'playerMoneyDungeon');

        this.addAmount(new Amount(tokens, Currency.dungeonToken))
    }

    public gainQuestPoints(base: number, origin?: string) {
        let points = base;

        points = Math.floor(points);

        GameHelper.incrementObservable(player.statistics.totalQuestPoints, points);
        GameController.animateCurrency(points, 'playerMoneyQuest');

        this.addAmount(new Amount(points, Currency.questPoint))
    }

    public gainDiamonds(base: number, origin?: string) {
        let diamonds = base;

        diamonds = Math.floor(diamonds);

        GameHelper.incrementObservable(player.statistics.totalDiamonds, diamonds);

        this.addAmount(new Amount(diamonds, Currency.diamond))
    }

    public gainFarmPoints(base: number, origin?: string) {
        let points = base;

        points = Math.floor(points);

        // TODO Add total farmpoints statistic
        // GameHelper.incrementObservable(player.statistics.totalFarmPoints, points);

        this.addAmount(new Amount(points, Currency.farmPoint))
    }

    private addAmount(amount: Amount) {
        this.currencies[amount.currency] += amount.amount;
    };

    public hasAmount(amount: Amount) {
        return this.currencies[amount.currency] >= amount.amount;
    };

    public loseAmount(amount: Amount) {
        this.currencies[amount.currency] -= amount.amount;
    };


    initialize(): void {
    }

    canAccess(): boolean {
        return true;
    }

    fromJSON(json: object): void {
        if (json == null) {
            return
        }

        if (json["currencies"] == null) {
            this.currencies = new ArrayOfObservables(this.defaults.currencies);
        } else {
            let currenciesJson = json["currencies"];
            this.currencies = new ArrayOfObservables([
                currenciesJson[GameConstants.Currency.money],
                currenciesJson[GameConstants.Currency.questPoint],
                currenciesJson[GameConstants.Currency.dungeonToken],
                currenciesJson[GameConstants.Currency.diamond],
                currenciesJson[GameConstants.Currency.farmPoint],
            ]);
        }
    }

    toJSON(): object {
        return {
            "currencies": [
                this.currencies[GameConstants.Currency.money],
                this.currencies[GameConstants.Currency.questPoint],
                this.currencies[GameConstants.Currency.dungeonToken],
                this.currencies[GameConstants.Currency.diamond],
                this.currencies[GameConstants.Currency.farmPoint],
            ],
        }
    }

    update(delta: number): void {
        // This method intentionally left blank
    }
}
