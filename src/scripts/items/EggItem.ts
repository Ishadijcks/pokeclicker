/// <reference path="CaughtIndicatingItem.ts" />

class EggItem extends CaughtIndicatingItem {

    type: GameConstants.EggItemType;

    constructor(type: GameConstants.EggItemType, displayName?: string) {
        super(GameConstants.EggItemType[type], {displayName: displayName, imageDirectory: 'egg' });
        this.type = type;
    }

    use(): boolean {
        if (this.amount() <= 0) {
            return false;
        }

        let success: boolean;
        if (this.type === GameConstants.EggItemType.Pokemon_egg) {
            success = App.game.breeding.gainPokemonEgg(pokemonMap.random(GameConstants.TotalPokemonsPerRegion[player.highestRegion()]));
        } else if (this.type === GameConstants.EggItemType.Mystery_egg) {
            success = App.game.breeding.gainRandomEgg();
        } else {
            const etype = EggType[GameConstants.EggItemType[this.type].split('_')[0]];
            success = App.game.breeding.gainEgg(App.game.breeding.createTypedEgg(etype));
        }

        if (success) {
            this.gain(-1);
        }
        return success;
    }

    getCaughtStatus(): CaughtStatus {
        switch (this.type) {
            case (GameConstants.EggItemType.Pokemon_egg): {
                // random pokemon
                return CaughtStatus.NotCaught;
            }
            case (GameConstants.EggItemType.Mystery_egg): {
                return App.game.breeding.getAllCaughtStatus();
            }
            default: {
                const etype = EggType[GameConstants.EggItemType[this.type].split('_')[0]];
                return App.game.breeding.getTypeCaughtStatus(etype);
            }
        }
    }

}

ItemList['Fire_egg']     = new EggItem(GameConstants.EggItemType.Fire_egg, 'Fire Egg');
ItemList['Water_egg']    = new EggItem(GameConstants.EggItemType.Water_egg, 'Water Egg');
ItemList['Grass_egg']    = new EggItem(GameConstants.EggItemType.Grass_egg, 'Grass Egg');
ItemList['Fighting_egg'] = new EggItem(GameConstants.EggItemType.Fighting_egg, 'Fighting Egg');
ItemList['Electric_egg'] = new EggItem(GameConstants.EggItemType.Electric_egg, 'Electric Egg');
ItemList['Dragon_egg']   = new EggItem(GameConstants.EggItemType.Dragon_egg, 'Dragon Egg');
ItemList['Pokemon_egg']  = new EggItem(GameConstants.EggItemType.Pokemon_egg, 'Pokémon Egg');
ItemList['Mystery_egg']  = new EggItem(GameConstants.EggItemType.Mystery_egg, 'Mystery Egg');

ShopEntriesList['Fire Egg']     = new ShopItem('Fire Egg', ItemList['Fire_egg'], 1000, Currency.questPoint);
ShopEntriesList['Water Egg']    = new ShopItem('Water Egg', ItemList['Water_egg'], 1000, Currency.questPoint);
ShopEntriesList['Grass Egg']    = new ShopItem('Grass Egg', ItemList['Grass_egg'], 1000, Currency.questPoint);
ShopEntriesList['Fighting Egg'] = new ShopItem('Fighting Egg', ItemList['Fighting_egg'], 1000, Currency.questPoint);
ShopEntriesList['Electric Egg'] = new ShopItem('Electric Egg', ItemList['Electric_egg'], 1000, Currency.questPoint);
ShopEntriesList['Dragon Egg']   = new ShopItem('Dragon Egg', ItemList['Dragon_egg'], 1000, Currency.questPoint);
ShopEntriesList['Pokemon Egg']  = new ShopItem('Pokemon Egg', ItemList['Pokemon_egg'], 1000, Currency.questPoint);
ShopEntriesList['Mystery Egg']  = new ShopItem('Mystery Egg', ItemList['Mystery_egg'], 700, Currency.questPoint);
