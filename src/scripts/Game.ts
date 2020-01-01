/**
 * Main game class.
 */
class Game {
    interval;
    undergroundCounter: number;
    public static achievementCounter: number = 0;

    public breeding: Breeding;
    public pokeballs: Pokeballs;
    public wallet: Wallet;
    public keyItems: KeyItems;
    public badgeCase: BadgeCase;

    private _gameState: KnockoutObservable<GameConstants.GameState>;

    /**
     * TODO(@Isha) pass all features through the constructor
     */
    constructor(
        breeding: Breeding,
        pokeballs: Pokeballs,
        wallet: Wallet,
        keyItems: KeyItems,
        badgeCase: BadgeCase
    ) {
        this.breeding = breeding;
        this.pokeballs = pokeballs;
        this.wallet = wallet;
        this.keyItems = keyItems;
        this.badgeCase = badgeCase

        this._gameState = ko.observable(GameConstants.GameState.paused);


        player = Save.load();

        AchievementHandler.initialize();
    }

    load() {
        // TODO(@Isha) Refactor this saving logic
        let saveJSON = localStorage.getItem("save");
        if (saveJSON !== null) {
            let saveObject = JSON.parse(saveJSON);
            this.breeding.fromJSON(saveObject[this.breeding.saveKey]);
            this.pokeballs.fromJSON(saveObject[this.pokeballs.saveKey]);
            this.wallet.fromJSON(saveObject[this.wallet.saveKey]);
            this.keyItems.fromJSON(saveObject[this.keyItems.saveKey]);
            this.badgeCase.fromJSON(saveObject[this.badgeCase.saveKey]);
        }
    }

    initialize() {
        this.breeding.initialize();
        this.pokeballs.initialize();
        this.keyItems.initialize();


        // TODO refactor to proper initialization methods
        OakItemRunner.loadOakItems();
        Battle.generateNewEnemy();
        Safari.load();
        Save.loadMine();
        Underground.energyTick(Underground.getEnergyRegenTime());
        DailyDeal.generateDeals(Underground.getDailyDealsMax(), new Date());
        QuestHelper.generateQuests(player.questLevel, player.questRefreshes, new Date());
        QuestHelper.loadCurrentQuests(player.currentQuests);
        if (!player.tutorialComplete()) {
            QuestLineHelper.createTutorial();
            QuestLineHelper.tutorial.resumeAt(player.tutorialProgress(), player.tutorialState);
        }

        this.gameState = GameConstants.GameState.fighting
    }

    start() {
        console.log("game started");
        if (player.starter === GameConstants.Starter.None) {
            StartSequenceRunner.start()
        }
        this.interval = setInterval(this.gameTick.bind(this), GameConstants.TICK_TIME);
    }

    stop() {
        clearTimeout(this.interval);
    }

    gameTick() {
        // Update tick counters
        this.undergroundCounter += GameConstants.TICK_TIME;
        FarmRunner.counter += GameConstants.TICK_TIME;
        EffectEngineRunner.counter += GameConstants.TICK_TIME;
        Game.achievementCounter += GameConstants.TICK_TIME;
        if (Game.achievementCounter > GameConstants.ACHIEVEMENT_TICK) {
            Game.achievementCounter = 0;
            AchievementHandler.checkAchievements();
        }
        Save.counter += GameConstants.TICK_TIME;
        Underground.counter += GameConstants.TICK_TIME;

        GameHelper.counter += GameConstants.TICK_TIME;
        switch (this.gameState) {
            case GameConstants.GameState.fighting: {
                Battle.counter += GameConstants.TICK_TIME;
                if (Battle.counter > GameConstants.BATTLE_TICK) {
                    Battle.tick();
                }
                break;
            }
            case GameConstants.GameState.gym: {
                GymBattle.counter += GameConstants.TICK_TIME;
                if (GymBattle.counter > GameConstants.BATTLE_TICK) {
                    GymBattle.tick();
                }
                GymRunner.tick();
                break;
            }
            case GameConstants.GameState.dungeon: {
                DungeonBattle.counter += GameConstants.TICK_TIME;
                if (DungeonBattle.counter > GameConstants.BATTLE_TICK) {
                    DungeonBattle.tick();
                }
                DungeonRunner.tick();
                break;
            }
        }

        if (Save.counter > GameConstants.SAVE_TICK) {
            let now = new Date();
            if (new Date(player._lastSeen).toLocaleDateString() !== now.toLocaleDateString()) {
                player.questRefreshes = 0;
                QuestHelper.quitAllQuests();
                QuestHelper.clearQuests();
                QuestHelper.generateQuests(player.questLevel, player.questRefreshes, now);
                DailyDeal.generateDeals(Underground.getDailyDealsMax(), now);
                Notifier.notify("It's a new day! Your quests and underground deals have been updated.", GameConstants.NotificationOption.info);
            }
            player._lastSeen = Date.now();
            Save.store(player);
        }

        if (Underground.counter > GameConstants.UNDERGROUND_TICK) {
            Underground.energyTick(Math.max(0, Underground.energyTick() - 1));
            if (Underground.energyTick() == 0) {
                Underground.gainEnergy();
                Underground.energyTick(Underground.getEnergyRegenTime());
            }
            Underground.counter = 0;
        }

        if (FarmRunner.counter > GameConstants.FARM_TICK) {
            FarmRunner.tick();
        }

        if (EffectEngineRunner.counter > GameConstants.EFFECT_ENGINE_TICK) {
            EffectEngineRunner.tick();
        }

        if (GameHelper.counter > 60 * 1000) {
            GameHelper.updateTime();
        }
    }

    save() {

    }

    // Knockout getters/setters
    get gameState() {
        return this._gameState()
    }

    set gameState(value) {
        this._gameState(value)
    }
}
