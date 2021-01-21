/// <reference path="CaughtIndicatingItem.ts" />

class EggItem extends CaughtIndicatingItem {

    type: GameConstants.EggItemType;

    constructor(type: GameConstants.EggItemType, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.questPoint, displayName?: string) {
        super(GameConstants.EggItemType[type], basePrice, currency, undefined, displayName);
        this.type = type;
    }

    use(): boolean {
        if (player.itemList[this.name()]() <= 0) {
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
            player.loseItem(this.name(), 1);
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


ItemList['Fire_egg']     = new EggItem(GameConstants.EggItemType.Fire_egg, 1000, undefined, 'Fire Egg');
ItemList['Water_egg']    = new EggItem(GameConstants.EggItemType.Water_egg, 1000, undefined, 'Water Egg');
ItemList['Grass_egg']    = new EggItem(GameConstants.EggItemType.Grass_egg, 1000, undefined, 'Grass Egg');
ItemList['Fighting_egg'] = new EggItem(GameConstants.EggItemType.Fighting_egg, 1000, undefined, 'Fighting Egg');
ItemList['Electric_egg'] = new EggItem(GameConstants.EggItemType.Electric_egg, 1000, undefined, 'Electric Egg');
ItemList['Dragon_egg']   = new EggItem(GameConstants.EggItemType.Dragon_egg, 1000, undefined, 'Dragon Egg');
ItemList['Pokemon_egg']  = new EggItem(GameConstants.EggItemType.Pokemon_egg, 1000, undefined, 'Pokémon Egg');
ItemList['Mystery_egg']  = new EggItem(GameConstants.EggItemType.Mystery_egg, 700, undefined, 'Mystery Egg');
