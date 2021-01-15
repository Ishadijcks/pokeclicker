/* eslint-disable array-bracket-newline */
///<reference path="Town.ts"/>
class PokemonLeague extends Town {
    public gymList: KnockoutObservableArray<KnockoutObservable<Gym>>;

    constructor(name: string, region: GameConstants.Region, requirements: Array<Requirement | OneFromManyRequirement>, shop: Shop, gyms: string[]) {
        super(name, region, { requirements, shop });
        this.gym(null);
        this.gymList = ko.observableArray<KnockoutObservable<Gym>>();
        for (const gym of gyms) {
            this.gymList.push(ko.observable(gymList[gym]));
        }
    }

    public setupGymTowns() {
        for (const gym of this.gymList()) {
            TownList[gym().town] = TownList[this.name()];
        }
    }
}

// Share a shop across all Elite 4s
const indigoPlateauShop = new Shop([
    new PokeballItem(GameConstants.Pokeball.Masterball, 10000000, GameConstants.Currency.money       , { multiplier: 1.35, multiplierDecrease: false, saveName: `${GameConstants.Pokeball[GameConstants.Pokeball.Masterball]}|${GameConstants.Currency[GameConstants.Currency.money]}` }),
    new PokeballItem(GameConstants.Pokeball.Masterball, 75000   , GameConstants.Currency.dungeonToken, { multiplier: 1.35, multiplierDecrease: false, saveName: `${GameConstants.Pokeball[GameConstants.Pokeball.Masterball]}|${GameConstants.Currency[GameConstants.Currency.dungeonToken]}` }),
    new PokeballItem(GameConstants.Pokeball.Masterball, 3000    , GameConstants.Currency.questPoint  , { multiplier: 1.35, multiplierDecrease: false, saveName: `${GameConstants.Pokeball[GameConstants.Pokeball.Masterball]}|${GameConstants.Currency[GameConstants.Currency.questPoint]}` }),
    new PokeballItem(GameConstants.Pokeball.Masterball, 3000    , GameConstants.Currency.farmPoint   , { multiplier: 1.35, multiplierDecrease: false, saveName: `${GameConstants.Pokeball[GameConstants.Pokeball.Masterball]}|${GameConstants.Currency[GameConstants.Currency.farmPoint]}` }),
    new PokeballItem(GameConstants.Pokeball.Masterball, 50      , GameConstants.Currency.diamond     , { multiplier: 1.35, multiplierDecrease: false, saveName: `${GameConstants.Pokeball[GameConstants.Pokeball.Masterball]}|${GameConstants.Currency[GameConstants.Currency.diamond]}` }),
    ItemList['RareCandy'],
]);

TownList['Indigo Plateau Kanto'] = new PokemonLeague(
    'Indigo Plateau Kanto',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, GameConstants.Region.kanto, 23),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road')),
    ],
    indigoPlateauShop,
    ['Elite Lorelei', 'Elite Bruno', 'Elite Agatha', 'Elite Lance', 'Champion Blue']
);
(<PokemonLeague>TownList['Indigo Plateau Kanto']).setupGymTowns();

TownList['Indigo Plateau Johto'] = new PokemonLeague(
    'Indigo Plateau Johto',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 27)],
    indigoPlateauShop,
    ['Elite Will', 'Elite Koga', 'Elite Bruno2', 'Elite Karen', 'Champion Lance']
);
(<PokemonLeague>TownList['Indigo Plateau Johto']).setupGymTowns();

TownList['Pokemon League Hoenn'] = new PokemonLeague(
    'Pokemon League Hoenn',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, GameConstants.Region.hoenn, 128),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Hoenn')),
    ],
    indigoPlateauShop,
    ['Elite Sidney', 'Elite Phoebe', 'Elite Glacia', 'Elite Drake', 'Champion Wallace']
);
(<PokemonLeague>TownList['Pokemon League Hoenn']).setupGymTowns();

TownList['Pokemon League Sinnoh'] = new PokemonLeague(
    'Pokemon League Sinnoh',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 223),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Sinnoh')),
    ],
    indigoPlateauShop,
    ['Elite Aaron', 'Elite Bertha', 'Elite Flint', 'Elite Lucian', 'Champion Cynthia']
);
(<PokemonLeague>TownList['Pokemon League Sinnoh']).setupGymTowns();

TownList['Pokemon League Unova'] = new PokemonLeague(
    'Pokemon League Unova',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, GameConstants.Region.unova, 23),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Unova')),
    ],
    indigoPlateauShop,
    ['Elite Shauntal', 'Elite Marshal', 'Elite Grimsley', 'Elite Caitlin', 'Champion Iris']
);
(<PokemonLeague>TownList['Pokemon League Unova']).setupGymTowns();

TownList['Pokemon League Kalos'] = new PokemonLeague(
    'Pokemon League Kalos',
    GameConstants.Region.kalos,
    [
        new OneFromManyRequirement([
            new RouteKillRequirement(10, GameConstants.Region.kalos, 21),
            new RouteKillRequirement(10, GameConstants.Region.kalos, 22),
        ]),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Kalos')),
    ],
    indigoPlateauShop,
    ['Elite Malva', 'Elite Siebold', 'Elite Wikstrom', 'Elite Drasna', 'Champion Diantha']
);
(<PokemonLeague>TownList['Pokemon League Kalos']).setupGymTowns();

TownList['Pokemon League Alola'] = new PokemonLeague(
    'Pokemon League Alola',
    GameConstants.Region.alola,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Mount Lanikala'))],
    indigoPlateauShop,
    ['Elite Molayne', 'Elite Olivia', 'Elite Acerola', 'Elite Kahili', 'Champion Hao']
);
(<PokemonLeague>TownList['Pokemon League Alola']).setupGymTowns();
