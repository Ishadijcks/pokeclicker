///<reference path="../shop/Shop.ts"/>
///<reference path="../items/Pokeball.ts"/>
///<reference path="../items/BattleItem.ts"/>
///<reference path="../items/Berry.ts"/>
///<reference path="../items/EnergyRestore.ts"/>
///<reference path="../items/EvolutionStone.ts"/>
///<reference path="../items/PokeBlock.ts"/>
///<reference path="../items/Vitamin.ts"/>
class Town {
    private _name: KnockoutObservable<string>;
    private _gym?: KnockoutObservable<Gym>;
    private _shop?: KnockoutObservable<Shop>;
    private _dungeon?: KnockoutObservable<Dungeon>;
    private _reqRoutes: number[];

    constructor(name: string, routes: number[], shop?: Shop, dungeon?: Dungeon) {
        this._name = ko.observable(name);
        this._gym = ko.observable(gymList[name]);
        this._reqRoutes = routes;
        this._shop = ko.observable(shop);
        this._dungeon = ko.observable(dungeon);
    }

    get name(): KnockoutObservable<string> {
        return this._name;
    }

    get reqRoutes(): number[] {
        return this._reqRoutes;
    }

    get gym(): KnockoutObservable<Gym> {
        return this._gym;
    }

    get shop(): KnockoutObservable<Shop> {
        return this._shop;
    }

    get dungeon(): KnockoutObservable<Dungeon> {
        return this._dungeon;
    }
}

class DungeonTown extends Town {

}

const TownList: { [name: string]: Town } = {};

//TODO Add all towns
let PewterCityShop = new Shop(["Token_collector", "xExp"]);
TownList["Pewter City"] = new Town("Pewter City", [2], PewterCityShop);

let CeruleanCityShop = new Shop(["Water_stone", "xAttack"]);
TownList["Cerulean City"] = new Town("Cerulean City", [4], CeruleanCityShop, dungeonList["Cerulean Cave"]);

let VermillionCityShop = new Shop(["Thunder_stone", "xExp", "Electric_egg"]);
TownList["Vermillion City"] = new Town("Vermillion City", [6], VermillionCityShop);

let CeladonCityShop = new Shop(["Eevee", "Porygon", "Jynx", "Mr. Mime", "Lickitung"]);
TownList["Celadon City"] = new Town("Celadon City", [8], CeladonCityShop);

let SaffronCityShop = new Shop(["Moon_stone", "xClick", "Leaf_stone", "Fight_egg"]);
TownList["Saffron City"] = new Town("Saffron City", [5], SaffronCityShop);

let FuchsiaCityShop = new Shop(["Trade_stone", "xExp", "Dragon_egg"]);
TownList["Fuchsia City"] = new Town("Fuchsia City", [18], FuchsiaCityShop);

let CinnabarIslandShop = new Shop(["Fire_stone", "Fire_egg"]);
TownList["Cinnabar Island"] = new Town("Cinnabar Island", [20], CinnabarIslandShop, dungeonList["Pokemon Mansion"]);

let ViridianCityShop = new Shop(["xAttack", "xClick", "Mystery_egg"]);
TownList["Viridian City"] = new Town("Viridian City", [1], ViridianCityShop);

TownList["Pallet Town"] = new Town("Pallet Town", []);

let LavenderTownShop = new Shop(["Item_magnet", "Lucky_incense", "Grass_egg"]);
TownList["Lavender Town"] = new Town("Lavender Town", [10], LavenderTownShop, dungeonList["Pokemon Tower"]);

//Dungeons
TownList["Viridian Forest"] = new DungeonTown("Viridian Forest", [1], null, dungeonList["Viridian Forest"]);
TownList["Digletts Cave"] = new DungeonTown("Digletts Cave", [1], null, dungeonList["Digletts Cave"]);
TownList["Mt. Moon"] = new DungeonTown("Mt. Moon", [3], null, dungeonList["Mt. Moon"]);
TownList["Rock Tunnel"] = new DungeonTown("Rock Tunnel", [9], null, dungeonList["Rock Tunnel"]);
TownList["Power Plant"] = new DungeonTown("Power Plant", [9], null, dungeonList["Power Plant"]);
TownList["Pokemon Tower"] = new DungeonTown("Pokemon Tower", [7, 10], null, dungeonList["Pokemon Tower"]);
TownList["Seafoam Islands"] = new DungeonTown("Seafoam Islands", [19], null, dungeonList["Seafoam Islands"]);
TownList["Victory Road"] = new DungeonTown("Victory Road", [22], null, dungeonList["Victory Road"]);
TownList["Cerulean Cave"] = new DungeonTown("Cerulean Cave", [4], null, dungeonList["Cerulean Cave"]);
TownList["Pokemon Mansion"] = new DungeonTown("Pokemon Mansion", [20], null, dungeonList["Pokemon Mansion"]);
