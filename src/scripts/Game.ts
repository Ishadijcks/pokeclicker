/// <reference path="../declarations/DataStore/BadgeCase.d.ts" />
/// <reference path="../declarations/GameHelper.d.ts" />

/**
 * Main game class.
 */
class Game {
    interval;
    public static achievementCounter = 0;

    // Features

    private _gameState: KnockoutObservable<GameConstants.GameState>;

    /**
     * TODO(@Isha) pass all features through the constructor
     */
    constructor(
        public update: Update,
        public breeding: Breeding,
        public pokeballs: Pokeballs,
        public wallet: Wallet,
        public keyItems: KeyItems,
        public badgeCase: BadgeCase,
        public oakItems: OakItems,
        public categories: PokemonCategories,
        public party: Party,
        public shards: Shards,
        public underground: Underground,
        public farming: Farming,
        public logbook: LogBook,
        public redeemableCodes: RedeemableCodes,
        public statistics: Statistics,
        public quests: Quests,
        public specialEvents: SpecialEvents,
        public discord: Discord,
        public achievementTracker: AchievementTracker,
        public lab: Lab,
        public multiplier: Multiplier
    ) {
        this._gameState = ko.observable(GameConstants.GameState.paused);

        AchievementHandler.initialize(multiplier);
        ResearchHandler.initialize();
        FarmController.initialize();
        EffectEngineRunner.initialize(multiplier);
    }

    load() {
        const saveJSON = localStorage.getItem('save');

        const saveObject = JSON.parse(saveJSON || '{}');

        Object.keys(this).filter(key => this[key]?.saveKey).forEach(key => {
            try {
                const saveKey = this[key].saveKey;
                // Load our save object or the default save data
                this[key].fromJSON(saveObject[saveKey] || this[key].toJSON());
            } catch (error) {
                console.error('Unable to load sava data from JSON for:', key, '\nError:\n', error);
            }
        });
    }

    initialize() {
        this.breeding.initialize();
        this.pokeballs.initialize();
        this.keyItems.initialize();
        this.oakItems.initialize();
        this.underground.initialize();
        this.farming.initialize();
        this.specialEvents.initialize();
        this.lab.initialize();
        this.load();

        // TODO refactor to proper initialization methods
        Battle.generateNewEnemy();
        this.farming.resetAuras();
        this.lab.resetEffects();
        //Safari.load();
        Underground.energyTick(this.underground.getEnergyRegenTime());
        DailyDeal.generateDeals(this.underground.getDailyDealsMax(), new Date());
        BerryDeal.generateDeals(new Date());
        Weather.generateWeather(new Date());

        this.gameState = GameConstants.GameState.fighting;
    }

    start() {
        console.log(`[${GameConstants.formatDate(new Date())}] %cGame started`, 'color:#2ecc71;font-weight:900;');
        if (player.starter === GameConstants.Starter.None) {
            StartSequenceRunner.start();
        }
        this.interval = setInterval(this.gameTick.bind(this), GameConstants.TICK_TIME);
    }

    stop() {
        clearTimeout(this.interval);
    }

    gameTick() {
        // Acheivements
        Game.achievementCounter += GameConstants.TICK_TIME;
        if (Game.achievementCounter >= GameConstants.ACHIEVEMENT_TICK) {
            Game.achievementCounter = 0;
            AchievementHandler.checkAchievements();
            GameHelper.incrementObservable(App.game.statistics.secondsPlayed);
        }

        // Battles
        switch (this.gameState) {
            case GameConstants.GameState.fighting: {
                Battle.counter += GameConstants.TICK_TIME;
                if (Battle.counter >= GameConstants.BATTLE_TICK) {
                    Battle.tick();
                }
                break;
            }
            case GameConstants.GameState.gym: {
                GymBattle.counter += GameConstants.TICK_TIME;
                if (GymBattle.counter >= GameConstants.BATTLE_TICK) {
                    GymBattle.tick();
                }
                GymRunner.tick();
                break;
            }
            case GameConstants.GameState.dungeon: {
                DungeonBattle.counter += GameConstants.TICK_TIME;
                if (DungeonBattle.counter >= GameConstants.BATTLE_TICK) {
                    DungeonBattle.tick();
                }
                DungeonRunner.tick();
                break;
            }
            case GameConstants.GameState.battleFrontier: {
                BattleFrontierBattle.counter += GameConstants.TICK_TIME;
                if (BattleFrontierBattle.counter >= GameConstants.BATTLE_FRONTIER_TICK) {
                    BattleFrontierBattle.tick();
                }
                BattleFrontierRunner.tick();
                break;
            }
        }

        // Auto Save
        Save.counter += GameConstants.TICK_TIME;
        if (Save.counter > GameConstants.SAVE_TICK) {
            const old = new Date(player._lastSeen);
            const now = new Date();

            // Check if it's a new day
            if (old.toLocaleDateString() !== now.toLocaleDateString()) {
                // Give the player a free quest refresh
                this.quests.freeRefresh(true);
                //Refresh the Underground deals
                DailyDeal.generateDeals(this.underground.getDailyDealsMax(), now);
                BerryDeal.generateDeals(now);
                Notifier.notify({
                    title: 'It\'s a new day!',
                    message: 'Your Underground deals have been updated.<br/><i>You have a free quest refresh.</i>',
                    type: NotificationConstants.NotificationOption.info,
                    timeout: 3e4,
                });
            }

            // Check if it's a new hour
            if (old.getHours() !== now.getHours()) {
                Weather.generateWeather(now);
            }

            // Save the game
            player._lastSeen = Date.now();
            Save.store(player);
        }

        // Underground
        Underground.counter += GameConstants.TICK_TIME;
        if (Underground.counter >= GameConstants.UNDERGROUND_TICK) {
            Underground.energyTick(Math.max(0, Underground.energyTick() - 1));
            if (Underground.energyTick() == 0) {
                // Check completed in case mine is locked out
                Mine.checkCompleted();
                this.underground.gainEnergy();
                Underground.energyTick(this.underground.getEnergyRegenTime());
            }
            Underground.counter = 0;
        }

        // Farm
        this.farming.update(GameConstants.TICK_TIME / GameConstants.SECOND);

        // Lab
        this.lab.update(GameConstants.TICK_TIME / GameConstants.SECOND);

        // Effect Engine (battle items)
        EffectEngineRunner.counter += GameConstants.TICK_TIME;
        if (EffectEngineRunner.counter >= GameConstants.EFFECT_ENGINE_TICK) {
            EffectEngineRunner.tick();
        }

        // Game timers
        GameHelper.counter += GameConstants.TICK_TIME;
        if (GameHelper.counter >= GameConstants.MINUTE) {
            GameHelper.tick();
        }
    }

    save() {

    }

    // Knockout getters/setters
    get gameState() {
        return this._gameState();
    }

    set gameState(value) {
        this._gameState(value);
    }
}
