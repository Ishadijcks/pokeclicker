class KeyItems implements Feature {
    name = 'Key Items';
    saveKey = 'keyItems';

    itemList: KeyItem[];

    defaults: Record<string, any>;

    constructor() {
        this.itemList = [];
    }

    initialize() {
        this.itemList = [
            new KeyItem(KeyItems.KeyItem.Teachy_tv, 'A television set that is tuned to a program with useful tips for novice TRAINERS', null, true, undefined, 'Teachy TV'),
            new KeyItem(KeyItems.KeyItem.Coin_case, 'A case for holding money. It can hold up to 1,000,000 coins', null, true, undefined, 'Coin Case'),
            new KeyItem(KeyItems.KeyItem.Pokeball_bag, 'A tiny bag that can hold up to 4 different types of PokéBalls', null, true, undefined, 'Pokéball Bag'),
            new KeyItem(KeyItems.KeyItem.Town_map, 'A very convenient map that can be viewed anytime. It even shows you your present location in the region', function () {
                return App.game.statistics.routeKills[1]() >= GameConstants.ROUTE_KILLS_NEEDED;
            }, false, () => {
                Information.show({
                    steps: [
                        {
                            element: document.getElementById('townMap'),
                            intro: 'This is the Town Map,<br/>Use this to move to between different Routes, Towns and Dungeons.',
                        },
                    ],
                });
            }, 'Town Map'),
            // TODO obtain somewhere at the start
            new KeyItem(KeyItems.KeyItem.Factory_key, 'This pass serves as an ID card for gaining access to the Pokéball factory that lies along Route 13', undefined, undefined, undefined, 'Factory Key'),
            new KeyItem(KeyItems.KeyItem.Dungeon_ticket, 'This ticket grants access to all dungeons in the Kanto region,<br/><strong>Tip:</strong> You gain Dungeon Tokens by capturing Pokémon', null, false, () => {
                Information.show({
                    steps: [
                        {
                            element: document.getElementById('pokeballSelector'),
                            intro: 'Select which Pokéball types to catch Pokémon with based on their caught/shiny status.<br/><i><sup>Hover over the column titles for more info.</sup></i><br/><br/>Capturing Pokémon gains you <img title="Dungeon Tokens\nGained by capturing Pokémon" src="assets/images/currency/dungeonToken.png" height="25px"> Dungeon Tokens.',
                        },
                    ],
                });
            }, 'Dungeon Ticket'),
            new KeyItem(KeyItems.KeyItem.Super_rod, 'The best fishing rod for catching wild water Pokémon', function () {
                return App.game.statistics.routeKills[12]() >= GameConstants.ROUTE_KILLS_NEEDED;
            }, undefined, undefined, 'Super Rod'),
            // TODO obtain somewhere at the start
            new KeyItem(KeyItems.KeyItem.Holo_caster, 'A device that allows users to receive and view hologram clips at any time. It’s also used to chat with others', undefined, undefined, undefined, 'Holo Caster'),
            new KeyItem(KeyItems.KeyItem.Mystery_egg, 'A mysterious Egg obtained from Mr. Pokémon. This allows you to use the Pokémon Day Care', function () {
                return App.game.statistics.routeKills[5]() >= GameConstants.ROUTE_KILLS_NEEDED;
            }, undefined, undefined, 'Mystery Egg'),
            new KeyItem(KeyItems.KeyItem.Safari_ticket, 'This ticket grants access to the Safari Zone in Fuchsia City'),
            new KeyItem(KeyItems.KeyItem.Wailmer_pail, 'This is a tool for watering Berries you planted to make them grow more quickly', function () {
                return MapHelper.accessToRoute(14, GameConstants.Region.kanto);
            }, undefined, undefined, 'Wailmer Pail'),

            new KeyItem(KeyItems.KeyItem.Explorer_kit, 'A bag filled with convenient tools for exploring. It provides access to the Underground', undefined, undefined, undefined, 'Explorer Kit'),
            // TODO buy for 500 quest points
            new KeyItem(KeyItems.KeyItem.Event_calendar, 'This calendar will keep you up to date on the latest events', undefined, undefined, undefined, 'Event Calender'),
            new KeyItem(KeyItems.KeyItem.Shard_case, 'A case specifically designed for holding shards', undefined, undefined, undefined, 'Shard Case'),
        ];
    }

    hasKeyItem(item: KeyItems.KeyItem) {
        if (this.itemList[item] == undefined) {
            return false;
        }
        return this.itemList[item].isUnlocked;
    }

    gainKeyItem(item: KeyItems.KeyItem) {
        if (!this.hasKeyItem(item)) {
            KeyItemController.showGainModal(item);
            this.itemList[item].unlock();
        }
    }

    canAccess(): boolean {
        return true;
    }

    fromJSON(json: Record<string, any>): void {
        for (const key in json) {
            if (json.hasOwnProperty(key)) {
                if (json[key] === true) {
                    // Unlock to dispose unlocker if needed
                    this.itemList[KeyItems.KeyItem[key]].unlock();
                }
            }
        }

        // Gain the item in case the requirements changed.
        for (const keyItem of this.itemList) {
            if (!keyItem.isUnlocked && keyItem.unlockReq !== null) {
                if (keyItem.unlockReq()) {
                    App.game.keyItems.gainKeyItem(keyItem.name);
                }
            }
        }
    }

    toJSON(): Record<string, any> {
        const save = {};
        for (let i = 0; i < this.itemList.length; i++) {
            save[KeyItems.KeyItem[this.itemList[i].name]] = this.itemList[i].isUnlocked;
        }
        return save;
    }

    update(delta: number): void {
        // This method intentionally left blank
    }
}

namespace KeyItems {
    export enum KeyItem {
        'Teachy_tv',
        'Coin_case',
        'Pokeball_bag',
        'Town_map',
        'Factory_key',
        'Dungeon_ticket',
        'Super_rod',
        'Holo_caster',
        'Mystery_egg',
        'Safari_ticket',
        'Wailmer_pail',
        'Explorer_kit',
        'Event_calendar',
        'Shard_case'
    }
}
