/// <reference path="../../declarations/GameHelper.d.ts" />

class DungeonRunner {

    public static dungeon: Dungeon;
    public static timeLeft: KnockoutObservable<number> = ko.observable(GameConstants.DUNGEON_TIME);
    public static timeLeftPercentage: KnockoutObservable<number> = ko.observable(100);

    public static fighting: KnockoutObservable<boolean> = ko.observable(false);
    public static map: DungeonMap;
    public static chestsOpened: number;
    public static currentTileType;
    public static fightingBoss: KnockoutObservable<boolean> = ko.observable(false);
    public static defeatedBoss: KnockoutObservable<boolean> = ko.observable(false);
    public static dungeonFinished: KnockoutObservable<boolean> = ko.observable(false);

    public static initializeDungeon(dungeon) {
        if (!dungeon.isUnlocked()) {
            return false;
        }
        DungeonRunner.dungeon = dungeon;

        if (!DungeonRunner.hasEnoughTokens()) {
            Notifier.notify({
                message: 'You don\'t have enough dungeon tokens',
                type: NotificationConstants.NotificationOption.danger,
            });
            return false;
        }
        App.game.wallet.loseAmount(new Amount(DungeonRunner.dungeon.tokenCost, GameConstants.Currency.dungeonToken));

        DungeonRunner.timeLeft(GameConstants.DUNGEON_TIME);
        DungeonRunner.map = new DungeonMap(GameConstants.DUNGEON_SIZE + player.region);
        DungeonRunner.chestsOpened = 0;
        DungeonRunner.currentTileType = ko.pureComputed(() => {
            return DungeonRunner.map.currentTile().type;
        });
        DungeonRunner.fightingBoss(false);
        DungeonRunner.defeatedBoss(false);
        DungeonRunner.dungeonFinished(false);
        App.game.gameState = GameConstants.GameState.dungeon;
    }

    public static tick() {
        if (this.timeLeft() <= 0) {
            if (this.defeatedBoss()) {
                this.dungeonWon();
            } else {
                this.dungeonLost();
            }
        }
        this.timeLeft(this.timeLeft() - GameConstants.DUNGEON_TICK);
        this.timeLeftPercentage(Math.floor(this.timeLeft() / GameConstants.DUNGEON_TIME * 100));
    }

    /**
     * Handles the click event in the dungeon view
     */
    public static handleClick() {
        if (DungeonRunner.fighting() && !DungeonBattle.catching()) {
            DungeonBattle.clickAttack();
        } else if (DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.entrance) {
            DungeonRunner.dungeonLeave();
        } else if (DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.chest) {
            DungeonRunner.openChest();
        } else if (DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.boss && !DungeonRunner.fightingBoss()) {
            DungeonRunner.startBossFight();
        }
    }

    public static openChest() {
        if (DungeonRunner.map.currentTile().type() !== GameConstants.DungeonTile.chest) {
            return;
        }

        DungeonRunner.chestsOpened++;
        const random: number = GameConstants.randomIntBetween(0, DungeonRunner.dungeon.itemList.length - 1);
        const input: string = GameConstants.BattleItemType[DungeonRunner.dungeon.itemList[random]];
        let amount = 1;
        if (EffectEngineRunner.isActive(GameConstants.BattleItemType.Item_magnet)()) {
            if (Math.random() < 0.5) {
                amount += 1;
            }
        }
        Notifier.notify({
            message: `Found ${amount} ${GameConstants.humanifyString(input)} in a dungeon chest`,
            type: NotificationConstants.NotificationOption.success,
            setting: NotificationConstants.NotificationSetting.dungeon_item_found,
        });
        ItemList[input].gain(amount);
        DungeonRunner.map.currentTile().type(GameConstants.DungeonTile.empty);
        DungeonRunner.map.currentTile().calculateCssClass();
        if (DungeonRunner.chestsOpened == GameConstants.DUNGEON_CHEST_SHOW) {
            DungeonRunner.map.showChestTiles();
        }
        if (DungeonRunner.chestsOpened == GameConstants.DUNGEON_MAP_SHOW) {
            DungeonRunner.map.showAllTiles();
        }
    }

    public static startBossFight() {
        if (DungeonRunner.map.currentTile().type() !== GameConstants.DungeonTile.boss || DungeonRunner.fightingBoss()) {
            return;
        }

        DungeonRunner.fightingBoss(true);
        DungeonBattle.generateNewBoss();
    }

    public static dungeonLeave() {
        if (DungeonRunner.map.currentTile().type() !== GameConstants.DungeonTile.entrance || DungeonRunner.dungeonFinished()) {
            return;
        }

        DungeonRunner.dungeonFinished(true);
        DungeonRunner.fighting(false);
        DungeonRunner.fightingBoss(false);
        MapHelper.moveToTown(DungeonRunner.dungeon.name);
    }

    private static dungeonLost() {
        if (!DungeonRunner.dungeonFinished()) {
            DungeonRunner.dungeonFinished(true);
            DungeonRunner.fighting(false);
            DungeonRunner.fightingBoss(false);
            MapHelper.moveToTown(DungeonRunner.dungeon.name);
            Notifier.notify({
                message: 'You could not complete the dungeon in time',
                type: NotificationConstants.NotificationOption.danger,
            });
        }
    }

    public static dungeonWon() {
        if (!DungeonRunner.dungeonFinished()) {
            DungeonRunner.dungeonFinished(true);
            GameHelper.incrementObservable(App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(DungeonRunner.dungeon.name)]);
            MapHelper.moveToTown(DungeonRunner.dungeon.name);
            // TODO award loot with a special screen
            Notifier.notify({
                message: 'You have successfully completed the dungeon',
                type: NotificationConstants.NotificationOption.success,
            });
        }
    }

    public static timeLeftSeconds = ko.pureComputed(() => {
        return (Math.ceil(DungeonRunner.timeLeft() / 10) / 10).toFixed(1);
    })

    public static dungeonCompleted(dungeon: Dungeon, includeShiny: boolean) {
        const possiblePokemon: PokemonNameType[] = dungeon.allPokemon;
        return RouteHelper.listCompleted(possiblePokemon, includeShiny);
    }

    public static hasEnoughTokens() {
        return App.game.wallet.hasAmount(new Amount(DungeonRunner.dungeon.tokenCost, GameConstants.Currency.dungeonToken));
    }
}
