/// <reference path="upgrades/Upgrade.ts" />

/**
 * Required modules before porting:
 * Save.ts
 * upgrades/Upgrade.ts
 * towns/Town.ts - Town, TownList
 * worldmap/MapHelper.ts
 * items/Item.ts - ItemList
 */

/**
 * Information about the player.
 * All player variables need to be saved.
 */

class Player {

    public achievementsCompleted: { [name: string]: boolean };

    private _route: KnockoutObservable<number>;

    private _region: KnockoutObservable<GameConstants.Region>;
    private _town: KnockoutObservable<Town>;
    private starter: KnockoutObservable<GameConstants.Starter>;
    private _timeTraveller = false;

    constructor(savedPlayer?) {
        const saved: boolean = (savedPlayer != null);
        savedPlayer = savedPlayer || {};
        this._lastSeen = savedPlayer._lastSeen || 0;
        this._timeTraveller = savedPlayer._timeTraveller || false;
        if (this._lastSeen > Date.now()) {
            Notifier.notify({
                title: 'Welcome Time Traveller!',
                message: 'Please ensure you keep a backup of your old save as travelling through time can cause some serious problems.\n\nAny Pokemon you may have obtained in the future could cease to exist which could corrupt your save file!',
                type: NotificationConstants.NotificationOption.danger,
                timeout: GameConstants.HOUR,
            });
            this._timeTraveller = true;
        }
        this._region = ko.observable(savedPlayer._region);
        if (MapHelper.validRoute(savedPlayer._route, savedPlayer._region)) {
            this._route = ko.observable(savedPlayer._route);
        } else {
            switch (savedPlayer._region) {
                case 0:
                    this._route = ko.observable(1);
                    break;
                case 1:
                    this._route = ko.observable(29);
                    break;
                case 2:
                    this._route = ko.observable(101);
                    break;
                case 3:
                    this._route = ko.observable(201);
                    break;
                default:
                    this._route = ko.observable(1);
                    this._region = ko.observable(GameConstants.Region.kanto);
            }
        }

        this._town = ko.observable(TownList['Pallet Town']);
        this.starter = ko.observable(savedPlayer.starter != undefined ? savedPlayer.starter : GameConstants.Starter.None);

        // TODO(@Isha) move to underground classes.
        const mineInventory = (savedPlayer.mineInventory || [])
            // TODO: Convert this to object spread after we're on TS modules
            .map((v) => Object.assign({}, v, { amount: ko.observable(v.amount) }));
        this.mineInventory = ko.observableArray(mineInventory);

        this.achievementsCompleted = savedPlayer.achievementsCompleted || {};

        const today = new Date();
        const lastSeen = new Date(this._lastSeen);

        this._lastSeen = Date.now();

        this.effectList = Save.initializeEffects(savedPlayer.effectList || {});
        this.effectTimer = Save.initializeEffectTimer(savedPlayer.effectTimer || {});
        this.highestRegion = ko.observable(savedPlayer.highestRegion || 0);

    }

    // TODO(@Isha) move to underground classes.
    public mineInventory: KnockoutObservableArray<any>;

    public _lastSeen: number;

    public effectList: { [name: string]: KnockoutObservable<number> } = {};
    public effectTimer: { [name: string]: KnockoutObservable<string> } = {};

    private highestRegion: KnockoutObservable<GameConstants.Region>;

    get route(): KnockoutObservable<number> {
        return this._route;
    }

    set route(value: KnockoutObservable<number>) {
        this._route = value;
    }

    get region(): GameConstants.Region {
        return this._region();
    }

    set region(value: GameConstants.Region) {
        this._region(value);
    }

    get town(): KnockoutObservable<Town> {
        return this._town;
    }

    set town(value: KnockoutObservable<Town>) {
        this._town = value;
    }

    // TODO(@Isha) move to underground classes.
    public hasMineItems() {
        for (let i = 0; i < this.mineInventory().length; i++) {
            if (this.mineInventory()[i].amount() > 0) {
                return true;
            }
        }
        return false;
    }

    // TODO(@Isha) move to underground classes.
    public mineInventoryIndex(id: number): number {
        return player.mineInventory().findIndex(i => i.id == id);
    }

    // TODO(@Isha) move to underground classes.
    public getUndergroundItemAmount(id: number) {
        return player.mineInventory().find(i => i.id == id)?.amount() || 0;
    }

    public toJSON() {
        const keep = [
            '_route',
            '_region',
            'starter',
            // TODO(@Isha) remove.
            'mineInventory',
            // TODO(@Isha) remove.
            '_mineLayersCleared',
            'achievementsCompleted',
            '_lastSeen',
            '_timeTraveller',
            'gymDefeats',
            'achievementsCompleted',
            'effectList',
            'effectTimer',
            'highestRegion',
        ];
        const plainJS = ko.toJS(this);
        return Save.filter(plainJS, keep);
    }
}
