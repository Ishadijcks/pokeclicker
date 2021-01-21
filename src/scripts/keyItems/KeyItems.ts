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
            new KeyItem(KeyItems.KeyItem.Coin_case, 'A case for holding money', null, true, undefined, 'Coin Case'),
            new KeyItem(KeyItems.KeyItem.Pokeball_bag, 'A small bag that can hold many different types of PokéBalls', null, true, undefined, 'Pokéball Bag'),
            new KeyItem(KeyItems.KeyItem.Town_map, 'A very convenient map that can be viewed anytime. It even shows you your present location in the region', () => {
                return App.game.statistics.routeKills[GameConstants.Region.kanto][1]() >= GameConstants.ROUTE_KILLS_NEEDED;
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
            new KeyItem(KeyItems.KeyItem.Laboratory_key, 'This key grants access to the Laboratory on Cinnabar Island',
                () => {
                    return App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex('Pokemon Mansion')]() > 0;
                }, undefined, undefined, 'Laboratory Key'),
            // TODO obtain somewhere at the start
            new KeyItem(KeyItems.KeyItem.Dungeon_ticket, 'This ticket grants access to all dungeons in the Kanto region and beyond,<br/><strong>Tip:</strong> You gain Dungeon Tokens by capturing Pokémon', null, false, () => {
                Information.show({
                    steps: [
                        {
                            element: document.getElementById('pokeballSelector'),
                            intro: 'Select which Pokéball types to catch Pokémon with based on their caught/shiny status.<br/><i><sup>Hover over the column titles for more info.</sup></i><br/><br/>Capturing Pokémon gains you <img title="Dungeon Tokens\nGained by capturing Pokémon" src="assets/images/currency/dungeonToken.svg" height="25px"> Dungeon Tokens.',
                        },
                    ],
                });
            }, 'Dungeon Ticket'),
            new KeyItem(KeyItems.KeyItem.Super_rod, 'The best fishing rod for catching wild water Pokémon', () => {
                return App.game.statistics.routeKills[GameConstants.Region.kanto][12]() >= GameConstants.ROUTE_KILLS_NEEDED;
            }, undefined, undefined, 'Super Rod'),
            // TODO obtain somewhere at the start
            new KeyItem(KeyItems.KeyItem.Holo_caster, 'A device that allows users to receive and view hologram clips at any time. It’s also used to chat with others', undefined, undefined, undefined, 'Holo Caster'),
            new KeyItem(KeyItems.KeyItem.Mystery_egg, 'A mysterious Egg obtained from Mr. Pokémon. This allows you to use the Pokémon Day Care to help improve your Pokémons attack; some baby Pokémon can only be found through breeding too!', () => {
                return App.game.statistics.routeKills[GameConstants.Region.kanto][5]() >= GameConstants.ROUTE_KILLS_NEEDED;
            }, undefined, undefined, 'Mystery Egg'),
            new KeyItem(KeyItems.KeyItem.Safari_ticket, 'This ticket grants access to the Safari Zone right outside Fuchsia City'),
            new KeyItem(KeyItems.KeyItem.Wailmer_pail, 'This is a tool for watering Berries to allow you to operate the farm.', () => {
                return MapHelper.accessToRoute(14, GameConstants.Region.kanto);
            }, undefined, undefined, 'Wailmer Pail'),

            new KeyItem(KeyItems.KeyItem.Explorer_kit, 'A bag filled with convenient tools for exploring. It provides access to the Underground', undefined, undefined, undefined, 'Explorer Kit'),
            // TODO buy for 500 quest points
            new KeyItem(KeyItems.KeyItem.Event_calendar, 'This calendar will keep you up to date on the latest events', undefined, undefined, undefined, 'Event Calender'),
            new KeyItem(KeyItems.KeyItem.Shard_case, 'A case specifically designed for holding shards', undefined, undefined, undefined, 'Shard Case'),
            new KeyItem(KeyItems.KeyItem.DNA_splicers, 'A splicer that fuses certain Pokémon', () => {
                return App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex('Giant Chasm')]() > 0;
            }, undefined, undefined, 'DNA Splicers'),
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
        'Laboratory_key',
        'Dungeon_ticket',
        'Super_rod',
        'Holo_caster',
        'Mystery_egg',
        'Safari_ticket',
        'Wailmer_pail',
        'Explorer_kit',
        'Event_calendar',
        'Shard_case',
        'DNA_splicers'
    }
}
