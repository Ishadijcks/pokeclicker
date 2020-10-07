/* eslint-disable array-bracket-newline */
///<reference path="../achievements/GymBadgeRequirement.ts"/>
///<reference path="../achievements/OneFromManyRequirement.ts"/>
///<reference path="../badgeCase/BadgeTypes.ts"/>
///<reference path="NPC.ts"/>

type TownOptionalArgument = {
    requirements?: (Requirement | OneFromManyRequirement)[],
    shop?: Shop,
    dungeon?: Dungeon,
    npcs?: NPC[],
};

class Town {
    public name: KnockoutObservable<string>;
    public region: KnockoutObservable<GameConstants.Region>;
    public gym?: KnockoutObservable<Gym>;
    public requirements: (Requirement | OneFromManyRequirement)[];
    public shop?: KnockoutObservable<Shop>;
    public dungeon?: KnockoutObservable<Dungeon>;
    public npcs?: KnockoutObservableArray<NPC>;
    public startingTown: boolean;

    constructor(
        name: string,
        region: GameConstants.Region,
        // Optional arguments are in a named object, so that we don't need
        // to pass undefined to get to the one we want
        optional: TownOptionalArgument = {}
    ) {
        this.name = ko.observable(name);
        this.region = ko.observable(region);
        this.gym = ko.observable(gymList[name]);
        this.requirements = optional.requirements || [];
        this.shop = ko.observable(optional.shop);
        this.dungeon = ko.observable(optional.dungeon);
        this.npcs = ko.observableArray(optional.npcs);
        this.startingTown = GameConstants.StartingTowns.includes(this.name());
    }

    public isUnlocked() {
        return this.requirements.every(requirement => requirement.isCompleted());
    }
}

class DungeonTown extends Town {
    constructor(name: string, region: GameConstants.Region, requirements: (Requirement | OneFromManyRequirement)[] = []) {
        super(name, region, { requirements, dungeon: dungeonList[name] });
    }
}

const TownList: { [name: string]: Town | PokemonLeague } = {};

const pokeMartShop = new Shop([
    ItemList['Pokeball'],
    ItemList['Greatball'],
    ItemList['Ultraball'],
    ItemList['xAttack'],
    ItemList['xClick'],
    ItemList['Lucky_egg'],
    ItemList['Item_magnet'],
    ItemList['Token_collector'],
    ItemList['Lucky_incense'],
    ItemList['SmallRestore'],
    ItemList['MediumRestore'],
    ItemList['LargeRestore'],
]);

//Kanto Shops
const PewterCityShop = new Shop([
    ItemList['Pokeball'],
    ItemList['Token_collector'],
    ItemList['Lucky_egg'],
    ItemList['Mystery_egg'],
]);
const CeruleanCityShop = new Shop([
    ItemList['Water_stone'],
    ItemList['xAttack'],
    ItemList['Water_egg'],
]);
const VermillionCityShop = new Shop([
    ItemList['Thunder_stone'],
    ItemList['Lucky_egg'],
    ItemList['Electric_egg'],
]);
const CeladonCityShop = new Shop([
    ItemList['Eevee'],
    ItemList['Porygon'],
    ItemList['Jynx'],
    ItemList['Mr. Mime'],
    ItemList['Lickitung'],
]);
const SaffronCityShop = new Shop([
    ItemList['Moon_stone'],
    ItemList['xClick'],
    ItemList['Leaf_stone'],
    ItemList['Fighting_egg'],
]);
const FuchsiaCityShop = new Shop([
    ItemList['Ultraball'],
    ItemList['Trade_stone'],
    ItemList['Lucky_egg'],
    ItemList['Dragon_egg'],
]);
const CinnabarIslandShop = new Shop([
    ItemList['Fire_stone'],
    ItemList['Fire_egg'],
    ItemList['SmallRestore'],
    ItemList['Explorer_kit'],
]);
const ViridianCityShop = new Shop([
    ItemList['Pokeball'],
    ItemList['xAttack'],
    ItemList['xClick'],
    ItemList['Dungeon_ticket'],
]);
const LavenderTownShop = new Shop([
    ItemList['Greatball'],
    ItemList['Item_magnet'],
    ItemList['Lucky_incense'],
    ItemList['Grass_egg'],
]);

// Kanto NPCs

const ViridianCityOldMan = new NPC('Old Man', [
    'Ahh, I\'ve had my coffee now and I feel great!',
    'You can use the Pokeball Selector to select which type of Pokeball to use on specific Pokemon based on caught status.',
]);
const CinnabarIslandResearcher = new NPC('Researcher', [
    'They were trying to clone an ancient Pokémon in the mansion, I wonder if they succeeded.',
    'Apparently the ancient Pokémon escaped, And can be found roaming around Kanto!',
]);
const BigSpender = new NPC('Big Spender', [
    'I love shopping! When I come in, the cashiers know I want tons of items.',
    'You can use the Shop Amount Button settings to make it easy for big purchases, too!',
]);

  

//Kanto Towns
TownList['Pewter City'] = new Town(
    'Pewter City',
    GameConstants.Region.kanto,
    {
        requirements: [
            new RouteKillRequirement(10, 2),
            new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Viridian Forest')),
        ],
        shop: PewterCityShop,
    }
);
TownList['Cerulean City'] = new Town(
    'Cerulean City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, 4)],
        shop: CeruleanCityShop,
        dungeon: dungeonList['Cerulean Cave'],
    }
);
TownList['Vermillion City'] = new Town(
    'Vermillion City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, 6)],
        shop: VermillionCityShop,
    }
);
TownList['Celadon City'] = new Town(
    'Celadon City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, 8)],
        shop: CeladonCityShop,
        npcs: [BigSpender],
    }
);
TownList['Saffron City'] = new Town(
    'Saffron City',
    GameConstants.Region.kanto,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Rainbow)],
        shop: SaffronCityShop,
    }
);
TownList['Fuchsia City'] = new Town(
    'Fuchsia City',
    GameConstants.Region.kanto,
    {
        requirements: [new OneFromManyRequirement([
            new RouteKillRequirement(10, 18),
            new RouteKillRequirement(10, 15),
        ])],
        shop: FuchsiaCityShop,
    }
);
TownList['Cinnabar Island'] = new Town(
    'Cinnabar Island',
    GameConstants.Region.kanto,
    {
        requirements: [new OneFromManyRequirement([
            new RouteKillRequirement(10, 20),
            new RouteKillRequirement(10, 21),
        ])],
        shop: CinnabarIslandShop,
        dungeon: dungeonList['Pokemon Mansion'],
        npcs: [CinnabarIslandResearcher],
    }
);
TownList['Viridian City'] = new Town(
    'Viridian City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, 1)],
        shop: ViridianCityShop,
        npcs: [ViridianCityOldMan],
    }
);
TownList['Pallet Town'] = new Town('Pallet Town', GameConstants.Region.kanto);
TownList['Lavender Town'] = new Town(
    'Lavender Town',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, 10)],
        shop: LavenderTownShop,
        dungeon: dungeonList['Pokemon Tower'],
    }
);

//Kanto Dungeons
TownList['Viridian Forest'] = new DungeonTown(
    'Viridian Forest',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, 2)]
);
TownList['Mt. Moon'] = new DungeonTown(
    'Mt. Moon',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10,3)]
);
TownList['Digletts Cave'] = new DungeonTown(
    'Digletts Cave',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, 6)]
);
TownList['Rock Tunnel'] = new DungeonTown(
    'Rock Tunnel',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, 9),
        new GymBadgeRequirement(BadgeTypes.Cascade),
    ]
);
TownList['Power Plant'] = new DungeonTown(
    'Power Plant',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, 9),
        new GymBadgeRequirement(BadgeTypes.Soul),
    ]
);
TownList['Pokemon Tower'] = new DungeonTown(
    'Pokemon Tower',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, 10),
        new GymBadgeRequirement(BadgeTypes.Rainbow),
    ]
);
TownList['Seafoam Islands'] = new DungeonTown(
    'Seafoam Islands',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, 19)]
);
TownList['Pokemon Mansion'] = new DungeonTown(
    'Pokemon Mansion',
    GameConstants.Region.kanto,
    [new OneFromManyRequirement([
        new RouteKillRequirement(10, 20),
        new RouteKillRequirement(10, 21),
    ])]
);
TownList['Victory Road'] = new DungeonTown(
    'Victory Road',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, 23)]
);
TownList['Cerulean Cave'] = new DungeonTown(
    'Cerulean Cave',
    GameConstants.Region.kanto,
    [new GymBadgeRequirement(BadgeTypes.Elite_KantoChampion)]
);

//Johto Shops
const NewBarkTownShop = new Shop([
    ItemList['Pokeball'],
]);
const CherrygroveCityShop = new Shop([
    ItemList['Greatball'],
]);
const VioletCityShop = new Shop([
    ItemList['MediumRestore'],
    ItemList['Togepi'],
    ItemList['Mystery_egg'],
]);
const AzaleaTownShop = new Shop([
    ItemList['Kings_rock'],
    ItemList['Grass_egg'],
]);
const GoldenrodCityShop = new Shop([
    ItemList['Sun_stone'],
    ItemList['Upgrade'],
    ItemList['Soothe_bell'],
]);
const EcruteakCityShop = new Shop([
    ItemList['Greatball'],
    ItemList['Fire_egg'],
]);
const OlivineCityShop = new Shop([
    ItemList['Metal_coat'],
    ItemList['Water_egg'],
    ItemList['Electric_egg'],
]);
const CianwoodCityShop = new Shop([
    ItemList['Ultraball'],
    ItemList['Fighting_egg'],
]);
const MahoganyTownShop = new Shop([
    ItemList['Fighting_egg'],
]);
const BlackthornCityShop = new Shop([
    ItemList['LargeRestore'],
    ItemList['Dragon_scale'],
]);

//Johto Towns
TownList['New Bark Town'] = new Town(
    'New Bark Town',
    GameConstants.Region.johto,
    {
        shop: NewBarkTownShop,
    }
);
TownList['Cherrygrove City'] = new Town(
    'Cherrygrove City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 29)],
        shop: CherrygroveCityShop,
    }
);
TownList['Violet City'] = new Town(
    'Violet City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 31)],
        shop: VioletCityShop,
        dungeon: dungeonList['Sprout Tower'],
    }
);
TownList['Azalea Town'] = new Town(
    'Azalea Town',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 33)],
        shop: AzaleaTownShop,
        dungeon: dungeonList['Slowpoke Well'],
    }
);
TownList['Goldenrod City'] = new Town(
    'Goldenrod City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 34)],
        shop: GoldenrodCityShop,
        npcs: [BigSpender],
    }
);
TownList['Ecruteak City'] = new Town(
    'Ecruteak City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 37)],
        shop: EcruteakCityShop,
    }
);
TownList['Olivine City'] = new Town(
    'Olivine City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 39)],
        shop: OlivineCityShop,
    }
);
TownList['Cianwood City'] = new Town(
    'Cianwood City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 41)],
        shop: CianwoodCityShop,
    }
);
TownList['Mahogany Town'] = new Town(
    'Mahogany Town',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, 42)],
        shop: MahoganyTownShop,
    }
);
TownList['Blackthorn City'] = new Town(
    'Blackthorn City',
    GameConstants.Region.johto,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Ice Path'))],
        shop: BlackthornCityShop,
    }
);

//Johto Dungeons
TownList['Sprout Tower'] = new DungeonTown(
    'Sprout Tower',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 31)]
);
TownList['Ruins of Alph'] = new DungeonTown(
    'Ruins of Alph',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 32)]
);
TownList['Union Cave'] = new DungeonTown(
    'Union Cave',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 32)]
);
TownList['Slowpoke Well'] = new DungeonTown(
    'Slowpoke Well',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 33)]
);
TownList['Ilex Forest'] = new DungeonTown(
    'Ilex Forest',
    GameConstants.Region.johto,
    [new GymBadgeRequirement(BadgeTypes.Hive)]
);
TownList['Burned Tower'] = new DungeonTown(
    'Burned Tower',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 37)]
);
TownList['Tin Tower'] = new DungeonTown(
    'Tin Tower',
    GameConstants.Region.johto,
    [
        new GymBadgeRequirement(BadgeTypes.Mineral),
        new GymBadgeRequirement(BadgeTypes.Glacier),
    ]
);
TownList['Whirl Islands'] = new DungeonTown(
    'Whirl Islands',
    GameConstants.Region.johto,
    [
        new GymBadgeRequirement(BadgeTypes.Mineral),
        new GymBadgeRequirement(BadgeTypes.Glacier),
    ]
);
TownList['Mt Mortar'] = new DungeonTown(
    'Mt Mortar',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 42)]
);
TownList['Ice Path'] = new DungeonTown(
    'Ice Path',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 44)]
);
TownList['Dark Cave'] = new DungeonTown(
    'Dark Cave',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 45)]
);
TownList['Mt Silver'] = new DungeonTown(
    'Mt Silver',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, 28)]
);

//Hoenn Shops
const LittleRootTownShop = new Shop([
    ItemList['Pokeball'],
]);
const RustboroCityShop = new Shop([
    ItemList['Mystery_egg'],
]);
const DewfordTownShop = new Shop([
    ItemList['Fighting_egg'],
]);
const SlateportCityShop = new Shop([
    ItemList['Greatball'],
    ItemList['Water_egg'],
]);
const MauvilleCityShop = new Shop([
    ItemList['Electric_egg'],
]);
const VerdanturfTownShop = new Shop([
    ItemList['Grass_egg'],
    ItemList['Soothe_bell'],
]);
const LavaridgeTownShop = new Shop([
    ItemList['Fire_egg'],
]);
const FallarborTownShop = new Shop([
    ItemList['Moon_stone'],
]);
const FortreeCityShop = new Shop([
    ItemList['Ultraball'],
    ItemList['Leaf_stone'],
]);
const LilyCoveCityShop = new Shop([
    ItemList['Pokeball'],
    ItemList['Greatball'],
    ItemList['Ultraball'],
    ItemList['SmallRestore'],
    ItemList['MediumRestore'],
    ItemList['LargeRestore'],
    ItemList['xAttack'],
    ItemList['xClick'],
    ItemList['Lucky_egg'],
    ItemList['Token_collector'],
    ItemList['Item_magnet'],
    ItemList['Lucky_incense'],
]);
const MossdeepCityShop = new Shop([
    ItemList['Beldum'],
    ItemList['Prism_scale'],
]);
const SootopolisCityShop = new Shop([
    ItemList['Water_stone'],
]);
const PacifidlogTownShop = new Shop([
    ItemList['Deepsea_tooth'],
    ItemList['Deepsea_scale'],
]);
const EverGrandeCityShop = new Shop([
    ItemList['Dragon_egg'],
]);
// TODO: finalize items and prices
const BattleFrontierShop = new Shop([
    new PokeballItem(GameConstants.Pokeball.Ultraball, 1, GameConstants.Currency.battlePoint),
    new PokeballItem(GameConstants.Pokeball.Masterball, 500, GameConstants.Currency.battlePoint , { multiplier: 1.35, multiplierDecrease: false, saveName: `${GameConstants.Pokeball[GameConstants.Pokeball.Masterball]}|${GameConstants.Currency[GameConstants.Currency.battlePoint]}` }),
    new EnergyRestore(GameConstants.EnergyRestoreSize.SmallRestore, 10, GameConstants.Currency.battlePoint),
    new EnergyRestore(GameConstants.EnergyRestoreSize.MediumRestore, 20, GameConstants.Currency.battlePoint),
    new EnergyRestore(GameConstants.EnergyRestoreSize.LargeRestore, 40, GameConstants.Currency.battlePoint),
]);

//Hoenn Towns
TownList['Littleroot Town'] = new Town(
    'Littleroot Town',
    GameConstants.Region.hoenn,
    {
        shop: LittleRootTownShop,
    }
);
TownList['Oldale Town'] = new Town(
    'Oldale Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 101)],
    }
);
TownList['Petalburg City'] = new Town(
    'Petalburg City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 102)],
    }
);
TownList['Rustboro City'] = new Town(
    'Rustboro City',
    GameConstants.Region.hoenn,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Petalburg Woods'))],
        shop: RustboroCityShop,
    }
);
TownList['Dewford Town'] = new Town(
    'Dewford Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Rusturf Tunnel'))],
        shop: DewfordTownShop,
    }
);
TownList['Slateport City'] = new Town(
    'Slateport City',
    GameConstants.Region.hoenn,
    {
        requirements: [
            new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Granite Cave')),
            new GymBadgeRequirement(BadgeTypes.Knuckle),
        ],
        shop: SlateportCityShop,
    }
);
TownList['Mauville City'] = new Town(
    'Mauville City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 110)],
        shop: MauvilleCityShop,
    }
);
TownList['Verdanturf Town'] = new Town(
    'Verdanturf Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 117)],
        shop: VerdanturfTownShop,
    }
);
TownList['Lavaridge Town'] = new Town(
    'Lavaridge Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Jagged Pass'))],
        shop: LavaridgeTownShop,
    }
);
TownList['Fallarbor Town'] = new Town(
    'Fallarbor Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 113)],
        shop: FallarborTownShop,
    }
);
TownList['Fortree City'] = new Town(
    'Fortree City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 119)],
        shop: FortreeCityShop,
    }
);
TownList['LilyCove City'] = new Town(
    'LilyCove City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 121)],
        shop: LilyCoveCityShop,
        npcs: [BigSpender],
    }
);
TownList['Mossdeep City'] = new Town(
    'Mossdeep City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 125)],
        shop: MossdeepCityShop,
    }
);
TownList['Sootopolis City'] = new Town(
    'Sootopolis City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 126), new GymBadgeRequirement(BadgeTypes.Mind)],
        shop: SootopolisCityShop,
    }
);
TownList['Ever Grande City'] = new Town(
    'Ever Grande City',
    GameConstants.Region.hoenn,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Rain)],
        shop: EverGrandeCityShop,
    }
);
TownList['Pokemon League Hoenn'] = new Town(
    'Pokemon League',
    GameConstants.Region.hoenn,
    {
        requirements: [
            new RouteKillRequirement(10, 128),
            new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Victory Road Hoenn')),
        ],
    }
);
TownList['Pacifidlog Town'] = new Town(
    'Pacifidlog Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, 131)],
        shop: PacifidlogTownShop,
    }
);
TownList['Battle Frontier'] = new Town(
    'Battle Frontier',
    GameConstants.Region.hoenn,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Elite_HoennChampion)],
        shop: BattleFrontierShop,
    }
);

//Hoenn Dungeons
TownList['Petalburg Woods'] = new DungeonTown(
    'Petalburg Woods',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, 104)]
);
TownList['Rusturf Tunnel'] = new DungeonTown(
    'Rusturf Tunnel',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, 116),
        new GymBadgeRequirement(BadgeTypes.Stone),
    ]
);
TownList['Granite Cave'] = new DungeonTown(
    'Granite Cave',
    GameConstants.Region.hoenn,
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Rusturf Tunnel'))]
);
TownList['Fiery Path'] = new DungeonTown(
    'Fiery Path',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, 112)]
);
TownList['Meteor Falls'] = new DungeonTown(
    'Meteor Falls',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, 114)]
);
TownList['Mt. Chimney'] = new DungeonTown(
    'Mt. Chimney',
    GameConstants.Region.hoenn,
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Meteor Falls'))]
);
TownList['Jagged Pass'] = new DungeonTown(
    'Jagged Pass',
    GameConstants.Region.hoenn,
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Mt. Chimney'))]
);
TownList['New Mauville'] = new DungeonTown(
    'New Mauville',
    GameConstants.Region.hoenn,
    [new GymBadgeRequirement(BadgeTypes.Balance)]
);
TownList['Mt. Pyre'] = new DungeonTown(
    'Mt. Pyre',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, 122)]
);
TownList['Shoal Cave'] = new DungeonTown(
    'Shoal Cave',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, 125)]
);
TownList['Cave of Origin'] = new DungeonTown(
    'Cave of Origin',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, 126),
        new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Seafloor Cavern')),
    ]
);
TownList['Seafloor Cavern'] = new DungeonTown(
    'Seafloor Cavern',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, 128),
        new GymBadgeRequirement(BadgeTypes.Mind),
    ]
);
TownList['Sky Pillar'] = new DungeonTown(
    'Sky Pillar',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, 131),
        new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Cave of Origin')),
    ]
);
TownList['Victory Road Hoenn'] = new DungeonTown(
    'Victory Road Hoenn',
    GameConstants.Region.hoenn,
    [new GymBadgeRequirement(BadgeTypes.Rain)]
);
TownList['Sealed Chamber'] = new DungeonTown(
    'Sealed Chamber',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, 134),
        new GymBadgeRequirement(BadgeTypes.Mind),
    ]
);

//Sinnoh Shops
const TwinleafTownShop = new Shop([
    ItemList['Pokeball'],
]);
const OreburghCityShop = new Shop([
    ItemList['Mystery_egg'],
]);
const EternaCityShop = new Shop([
    ItemList['Grass_egg'],
]);
const HearthomeCityShop = new Shop([
    ItemList['Soothe_bell'],
    ItemList['Fire_egg'],
]);
const SolaceonTownShop = new Shop([
    ItemList['Dawn_stone'],
    ItemList['Dusk_stone'],
    ItemList['Shiny_stone'],
    ItemList['Spiritomb'],
]);
const VeilstoneCityShop = new Shop([
    ItemList['Pokeball'],
    ItemList['Greatball'],
    ItemList['Ultraball'],
    ItemList['SmallRestore'],
    ItemList['MediumRestore'],
    ItemList['LargeRestore'],
    ItemList['xAttack'],
    ItemList['xClick'],
    ItemList['Lucky_egg'],
    ItemList['Token_collector'],
    ItemList['Item_magnet'],
    ItemList['Lucky_incense'],
]);
const CelesticTownShop = new Shop([
    ItemList['Dragon_egg'],
]);
const CanalaveCityShop = new Shop ([
    ItemList['Fighting_egg'],
]);
const PalParkShop = new Shop([
    ItemList['Razor_claw'],
    ItemList['Razor_fang'],
    ItemList['Combee'],
    ItemList['Burmy (plant)'],
    ItemList['Cherubi'],
]);
const SunyshoreCityShop = new Shop([
    ItemList['Electric_egg'],
]);
const SurvivalAreaShop = new Shop([
    ItemList['Electirizer'],
    ItemList['Magmarizer'],
]);
const ResortAreaShop = new Shop([
    ItemList['Reaper_cloth'],
    ItemList['Dubious_disc'],
    ItemList['Protector'],
]);
const PastoriaShop = new Shop([
    ItemList['Ultraball'],
    ItemList['Skorupi'],
    ItemList['Water_egg'],
]);

//Sinnoh Towns
TownList['Twinleaf Town'] = new Town(
    'Twinleaf Town',
    GameConstants.Region.sinnoh,
    {
        shop: TwinleafTownShop,
    }
);
TownList['Sandgem Town'] = new Town(
    'Sandgem Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 201)],
    }
);
TownList['Jubilife City'] = new Town(
    'Jubilife City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 202)],
    }
);
TownList['Oreburgh City'] = new Town(
    'Oreburgh City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Oreburgh Gate'))],
        shop: OreburghCityShop,
    }
);
TownList['Floaroma Town'] = new Town(
    'Floaroma Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Ravaged Path'))],
    }
);
TownList['Eterna City'] = new Town(
    'Eterna City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Eterna Forest'))],
        shop: EternaCityShop,
    }
);
TownList['Hearthome City'] = new Town(
    'Hearthome City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 208)],
        shop: HearthomeCityShop,
    }
);
TownList['Solaceon Town'] = new Town(
    'Solaceon Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 209)],
        shop: SolaceonTownShop,
    }
);
TownList['Veilstone City'] = new Town(
    'Veilstone City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 215)],
        shop: VeilstoneCityShop,
        npcs: [BigSpender],
    }
);
TownList['Pastoria City'] = new Town(
    'Pastoria City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 213)],
        shop: PastoriaShop,
    }
);
TownList['Celestic Town'] = new Town(
    'Celestic Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [
            new RouteKillRequirement(10, 210),
            new GymBadgeRequirement(BadgeTypes.Fen),
        ],
        shop: CelesticTownShop,
    }
);
TownList['Pal Park'] = new Town(
    'Pal Park',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 221)],
        shop: PalParkShop,
    }
);
TownList['Canalave City'] = new Town(
    'Canalave City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 218)],
        shop: CanalaveCityShop,
    }
);
TownList['Snowpoint City'] = new Town(
    'Snowpoint City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 217)],
    }
);
TownList['Sunyshore City'] = new Town(
    'Sunyshore City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 222)],
        shop: SunyshoreCityShop,
    }
);
TownList['Pokemon League Sinnoh'] = new Town(
    'Pokemon League Sinnoh',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Victory Road Sinnoh'))],
    }
);
TownList['Fight Area'] = new Town(
    'Fight Area',
    GameConstants.Region.sinnoh,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion)],
    }
);
TownList['Survival Area'] = new Town(
    'Survival Area',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 225)],
        shop: SurvivalAreaShop,
    }
);
TownList['Resort Area'] = new Town(
    'Resort Area',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, 229)],
        shop: ResortAreaShop,
    }
);

//Sinnoh Dungeons
TownList['Oreburgh Gate'] = new DungeonTown(
    'Oreburgh Gate',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, 203)]
);
TownList['Ravaged Path'] = new DungeonTown(
    'Ravaged Path',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 204),
        new GymBadgeRequirement(BadgeTypes.Coal),
    ]
);
TownList['Eterna Forest'] = new DungeonTown(
    'Eterna Forest',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 205),
        new GymBadgeRequirement(BadgeTypes.Coal),
    ]
);
TownList['Old Chateau'] = new DungeonTown(
    'Old Chateau',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 205),
        new GymBadgeRequirement(BadgeTypes.Forest),
    ]
);
TownList['Wayward Cave'] = new DungeonTown(
    'Wayward Cave',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, 206)]
);
TownList['Mt. Coronet South'] = new DungeonTown(
    'Mt. Coronet South',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, 207)]
);
TownList['Iron Island'] = new DungeonTown(
    'Iron Island',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, 218)]
);
TownList['Mt. Coronet North'] = new DungeonTown(
    'Mt. Coronet North',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 211),
        new GymBadgeRequirement(BadgeTypes.Mine),
    ]
);
TownList['Distortion World'] = new DungeonTown(
    'Distortion World',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 214),
        new GymBadgeRequirement(BadgeTypes.Icicle),
    ]
);
TownList['Lake Valor'] = new DungeonTown(
    'Lake Valor',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 213),
        new GymBadgeRequirement(BadgeTypes.Icicle),
    ]
);
TownList['Lake Verity'] = new DungeonTown(
    'Lake Verity',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 201),
        new GymBadgeRequirement(BadgeTypes.Icicle),
    ]
);
TownList['Lake Acuity'] = new DungeonTown(
    'Lake Acuity',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 217),
        new GymBadgeRequirement(BadgeTypes.Icicle),
    ]
);
TownList['Victory Road Sinnoh'] = new DungeonTown(
    'Victory Road Sinnoh',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 223),
        new GymBadgeRequirement(BadgeTypes.Beacon),
    ]
);
TownList['Spear Pillar'] = new DungeonTown(
    'Spear Pillar',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 211),
        new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion),
    ]
);
TownList['Hall of Origin'] = new DungeonTown(
    'Hall of Origin',
    GameConstants.Region.sinnoh,
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Spear Pillar'))]
);
TownList['Fullmoon Island'] = new DungeonTown(
    'Fullmoon Island',
    GameConstants.Region.sinnoh,
    [new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion)]
);
TownList['Newmoon Island'] = new DungeonTown(
    'Newmoon Island',
    GameConstants.Region.sinnoh,
    [new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion)]
);
TownList['Flower Paradise'] = new DungeonTown(
    'Flower Paradise',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 224),
        new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion),
    ]
);
TownList['Stark Mountain'] = new DungeonTown(
    'Stark Mountain',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 227),
        new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion),
    ]
);
TownList['Snowpoint Temple'] = new DungeonTown(
    'Snowpoint Temple',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, 217),
        new GymBadgeRequirement(BadgeTypes.Elite_SinnohChampion),
    ]
);

//Unova Shops
const AspertiaCityShop = new Shop([
    ItemList['Pokeball'],
]);
const VirbankCityShop = new Shop([
    ItemList['Greatball'],
]);
const CasteliaCityShop = new Shop([
    ItemList['Trade_stone'],
    ItemList['Water_egg'],
]);
const NimbasaCityShop = new Shop([
    ItemList['Grass_egg'],
    ItemList['Electric_egg'],
]);
const MistraltonCityShop = new Shop([
    ItemList['Ultraball'],
    ItemList['Thunder_stone'],
]);
const LentimasTownShop = new Shop([
    ItemList['Fire_egg'],
]);
const LacunosaTownShop = new Shop([
    ItemList['Fighting_egg'],
]);
const OpelucidCityShop = new Shop([
    ItemList['Pokeball'],
    ItemList['Greatball'],
    ItemList['Ultraball'],
    ItemList['SmallRestore'],
    ItemList['MediumRestore'],
    ItemList['LargeRestore'],
    ItemList['xAttack'],
    ItemList['xClick'],
    ItemList['Lucky_egg'],
    ItemList['Token_collector'],
    ItemList['Item_magnet'],
    ItemList['Lucky_incense'],
]);
const IcirrusCityShop = new Shop([
    ItemList['Dragon_egg'],
]);
const BlackAndWhiteParkShop = new Shop([
    ItemList['Moon_stone'],
    ItemList['Sun_stone'],
]);
const NacreneCityShop = new Shop([
    ItemList['Soothe_bell'],
]);
const StriatornCityShop = new Shop([
    ItemList['Leaf_stone'],
    ItemList['Water_stone'],
    ItemList['Fire_stone'],
]);
const AccumulaTownShop = new Shop([
    ItemList['Dusk_stone'],
    ItemList['Shiny_stone'],
]);

//Unova Towns
TownList['Aspertia City'] = new Town(
    'Aspertia City',
    GameConstants.Region.unova,
    {
        shop: AspertiaCityShop,
    }
);
TownList['Floccesy Town'] = new Town(
    'Floccesy Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 19)],
    }
);
TownList['Virbank City'] = new Town(
    'Virbank City',
    GameConstants.Region.unova,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Basic)],
        shop: VirbankCityShop,
    }
);
TownList['Castelia City'] = new Town(
    'Castelia City',
    GameConstants.Region.unova,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Toxic)],
        shop: CasteliaCityShop,
        dungeon: dungeonList['Castelia Sewers'],
    }
);
TownList['Nimbasa City'] = new Town(
    'Nimbasa City',
    GameConstants.Region.unova,
    {
        requirements: [
            new RouteKillRequirement(10, 4),
            new GymBadgeRequirement(BadgeTypes.Insect),
        ],
        shop: NimbasaCityShop,
    }
);
TownList['Driftveil City'] = new Town(
    'Driftveil City',
    GameConstants.Region.unova,
    {
        requirements: [
            new RouteKillRequirement(10,5),
            new GymBadgeRequirement(BadgeTypes.Bolt),
        ],
    }
);
TownList['Mistralton City'] = new Town(
    'Mistralton City',
    GameConstants.Region.unova,
    {
        requirements: [
            new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Chargestone Cave')),
            new GymBadgeRequirement(BadgeTypes.Quake),
        ],
        shop: MistraltonCityShop,
    }
);
TownList['Lentimas Town'] = new Town(
    'Lentimas Town',
    GameConstants.Region.unova,
    {
        requirements: [new GymBadgeRequirement(BadgeTypes.Jet)],
        shop: LentimasTownShop,
    }
);
TownList['Undella Town'] = new Town(
    'Undella Town',
    GameConstants.Region.unova,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Reversal Mountain'))],
    }
);
TownList['Lacunosa Town'] = new Town(
    'Lacunosa Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 13)],
        shop: LacunosaTownShop,
    }
);
TownList['Opelucid City'] = new Town(
    'Opelucid City',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 11)],
        shop: OpelucidCityShop,
    }
);
TownList['Humilau City'] = new Town(
    'Humilau City',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 21)],
    }
);
TownList['Pokemon League Unova'] = new Town(
    'Pokemon League Unova',
    GameConstants.Region.unova,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Victory Road Unova'))],
    }
);
TownList['Icirrus City'] = new Town(
    'Icirrus City',
    GameConstants.Region.unova,
    {
        requirements: [new OneFromManyRequirement([
            new RouteKillRequirement(10, 8),
            new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Twist Mountain')),
        ])],
        shop: IcirrusCityShop,
    }
);
TownList['Black and White Park'] = new Town(
    'Black and White Park',
    GameConstants.Region.unova,
    {
        requirements: [new OneFromManyRequirement([
            new MultiRequirement([
                new GymBadgeRequirement(BadgeTypes.Elite_UnovaChampion),
                new RouteKillRequirement(10, 14),
            ]),
            new RouteKillRequirement(10, 15),
        ])],
        shop: BlackAndWhiteParkShop,
    }
);
TownList['Nacrene City'] = new Town(
    'Nacrene City',
    GameConstants.Region.unova,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Pinwheel Forest'))],
        shop: NacreneCityShop,
    }
);
TownList['Striatorn City'] = new Town(
    'Striatorn City',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 3)],
        shop: StriatornCityShop,
    }
);
TownList['Accumula Town'] = new Town(
    'Accumula Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 2)],
        shop: AccumulaTownShop,
    }
);
TownList['Nuvema Town'] = new Town(
    'Nuvema Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, 1)],
    }
);

//Unova Dungeons
TownList['Pledge Grove'] = new DungeonTown(
    'Pledge Grove',
    GameConstants.Region.unova,
    [new ObtainedPokemonRequirement(pokemonMap.Keldeo)]
);
TownList['Floccesy Ranch'] = new DungeonTown(
    'Floccesy Ranch',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 20)]
);
TownList['Virbank Complex'] = new DungeonTown(
    'Virbank Complex',
    GameConstants.Region.unova,
    //Optional dungeon, no unique mons, safe to scrap
    [new GymBadgeRequirement(BadgeTypes.Basic)]
);
TownList['Liberty Garden'] = new DungeonTown(
    'Liberty Garden',
    GameConstants.Region.unova,
    //Victini dungeon, maybe unlock later
    [new GymBadgeRequirement(BadgeTypes.Toxic)]
);
TownList['Castelia Sewers'] = new DungeonTown(
    'Castelia Sewers',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeTypes.Toxic)]
);
TownList['Relic Passage'] = new DungeonTown(
    'Relic Passage',
    GameConstants.Region.unova,
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Castelia Sewers'))]
);
TownList['Desert Resort'] = new DungeonTown(
    'Desert Resort',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, 4),
        new GymBadgeRequirement(BadgeTypes.Insect), // Should really be a route
    ]
);
TownList['Relic Castle'] = new DungeonTown(
    'Relic Castle',
    GameConstants.Region.unova,
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Desert Resort'))]
);
TownList['Lostlorn Forest'] = new DungeonTown(
    'Lostlorn Forest',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 16)]
);
TownList['Chargestone Cave'] = new DungeonTown(
    'Chargestone Cave',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 6)]
);
TownList['Mistralton Cave'] = new DungeonTown(
    'Mistralton Cave',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeTypes.Quake)]
);
TownList['Celestial Tower'] = new DungeonTown(
    'Celestial Tower',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 7)]
);
TownList['Reversal Mountain'] = new DungeonTown(
    'Reversal Mountain',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeTypes.Jet)]
);
TownList['Strange House'] = new DungeonTown(
    'Strange House',
    GameConstants.Region.unova,
    // Optional dungeon, no unique mons, safe to scrap
    [new GymBadgeRequirement(BadgeTypes.Jet)]
);
TownList['Undella Bay'] = new DungeonTown(
    'Undella Bay',
    GameConstants.Region.unova,
    // Should really be a route
    [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Reversal Mountain'))]
);
TownList['Seaside Cave'] = new DungeonTown(
    'Seaside Cave',
    GameConstants.Region.unova,
    [
        new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Undella Bay')),
        new GymBadgeRequirement(BadgeTypes.Legend),
    ]
);
TownList['Giant Chasm'] = new DungeonTown(
    'Giant Chasm',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, 22),
        new GymBadgeRequirement(BadgeTypes.Wave),
    ]
);
TownList['Cave of Being'] = new DungeonTown(
    'Cave of Being',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 23)]
);
TownList['Abundant Shrine'] = new DungeonTown(
    'Abundant Shrine',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, 23),
        new ObtainedPokemonRequirement(pokemonMap.Tornadus),
        new ObtainedPokemonRequirement(pokemonMap.Thundurus),
    ]
);
TownList['Victory Road'] = new DungeonTown(
    'Victory Road',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 23)]
);
TownList['Twist Mountain'] = new DungeonTown(
    'Twist Mountain',
    GameConstants.Region.unova,
    [new OneFromManyRequirement([
        new MultiRequirement([
            new GymBadgeRequirement(BadgeTypes.Elite_UnovaChampion),
            new RouteKillRequirement(10, 7),
        ]),
        new RouteKillRequirement(10, 8),
    ])]
);
TownList['Dragonspiral Tower'] = new DungeonTown(
    'Dragonspiral Tower',
    GameConstants.Region.unova,
    [new OneFromManyRequirement([
        new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Twist Mountain')),
        new RouteKillRequirement(10, 8),
    ])]
);
TownList['Moor of Icirrus'] = new DungeonTown(
    'Moor of Icirrus',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, 8),
        new ObtainedPokemonRequirement(pokemonMap.Cobalion),
        new ObtainedPokemonRequirement(pokemonMap.Terrakion),
        new ObtainedPokemonRequirement(pokemonMap.Virizion),
    ]
);
TownList['Pinwheel Forest'] = new DungeonTown(
    'Pinwheel Forest',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeTypes.Elite_UnovaChampion)]
);
TownList['Wellspring Cave'] = new DungeonTown(
    'Wellspring Cave',
    GameConstants.Region.unova,
    // Optional dungeon, no unique mons, safe to scrap
    [new RouteKillRequirement(10, 3)]
);
TownList['Dreamyard'] = new DungeonTown(
    'Dreamyard',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 3)]
);
TownList['P2 Laboratory'] = new DungeonTown(
    'P2 Laboratory',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, 17)]
);

//Kalos Shops
const VanivilleTownShop = new Shop([
    ItemList['Pokeball'],
]);
const SantaluneCityShop = new Shop([
    ItemList['Mystery_egg'],
]);
const LumioseCityShop = new Shop([
    ItemList['Greatball'],
    ItemList['Electric_egg'],
]);
const AmbretteTownShop = new Shop([
    ItemList['Water_egg'],
]);
const GeosengeTownShop = new Shop([
    ItemList['Fire_egg'],
]);
const ShalourCityShop = new Shop([
    ItemList['Fighting_egg'],
]);
const CoumarineCityShop = new Shop([
    ItemList['Ultraball'],
    ItemList['Grass_egg'],
]);
const LaverreCityShop = new Shop([
    ItemList['Sachet'],
    ItemList['Whipped Dream'],
]);
const DendemilleTownShop = new Shop([
    ItemList['Dusk_stone'],
    ItemList['Shiny_stone'],
]);
const AnistarCityShop = new Shop([
    ItemList['Sun_stone'],
]);
const CouriwayTownShop = new Shop([
    ItemList['Dragon_egg'],
]);

//Kalos Towns
TownList['Vaniville Town'] = new Town(
    'Vaniville Town',
    GameConstants.Region.kalos,
    {
        shop: VanivilleTownShop,
    }
);
TownList['Aquacorde Town'] = new Town('Aquacorde Town', GameConstants.Region.kalos);
TownList['Santalune City'] = new Town(
    'Santalune City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 3)],
        shop: SantaluneCityShop,
    }
);
TownList['Lumiose City'] = new Town(
    'Lumiose City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 3)],
        shop: LumioseCityShop,
    }
);
TownList['Camphrier Town'] = new Town(
    'Camphrier Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 4)],
    }
);
TownList['Ambrette Town'] = new Town(
    'Ambrette Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 8)],
        shop: AmbretteTownShop,
    }
);
TownList['Cyllage City'] = new Town(
    'Cyllage City',
    GameConstants.Region.kalos,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Glittering Cave'))],
    }
);
TownList['Geosenge Town'] = new Town(
    'Geosenge Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 10)],
        shop: GeosengeTownShop,
    }
);
TownList['Shalour City'] = new Town(
    'Shalour City',
    GameConstants.Region.kalos,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Reflection Cave'))],
        shop: ShalourCityShop,
    }
);
TownList['Coumarine City'] = new Town(
    'Coumarine City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 12)],
        shop: CoumarineCityShop,
    }
);
TownList['Laverre City'] = new Town(
    'Laverre City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 14)],
        shop: LaverreCityShop,
    }
);
TownList['Dendemille Town'] = new Town(
    'Dendemille Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 15)],
        shop: DendemilleTownShop,
    }
);
TownList['Anistar City'] = new Town(
    'Anistar City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 17)],
        shop: AnistarCityShop,
    }
);
TownList['Couriway Town'] = new Town(
    'Couriway Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 18)],
        shop: CouriwayTownShop,
    }
);
TownList['Snowbelle City'] = new Town(
    'Snowbelle City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, 19)],
    }
);
TownList['Pokémon League Kalos'] = new Town(
    'Pokémon League Kalos',
    GameConstants.Region.kalos,
    {
        requirements: [new ClearDungeonRequirement(1, Statistics.getDungeonIndex('Victory Road Kalos'))],
    }
);

//Kalos Dungeons
TownList['Santalune Forest'] = new DungeonTown(
    'Santalune Forest',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 2)]
);
TownList['Parfum Palace'] = new DungeonTown(
    'Parfum Palace',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 6)]
);
TownList['Connecting Cave'] = new DungeonTown(
    'Connecting Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 7)]
);
TownList['Glittering Cave'] = new DungeonTown(
    'Glittering Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 9)]
);
TownList['Reflection Cave'] = new DungeonTown(
    'Reflection Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 11)]
);
//Tower of Mastery?
TownList['Azure bay'] = new DungeonTown(
    'Azure bay',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 12)]
);
//Sea Spirit's Den?
//Kalos Power Plant?
TownList['Lost Hotel'] = new DungeonTown(
    'Lost Hotel',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 15)]
);
TownList['Frost Cavern'] = new DungeonTown(
    'Frost Cavern',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 15)]
);
TownList['Team Flare Secret HQ'] = new DungeonTown(
    'Team Flare Secret HQ',
    GameConstants.Region.kalos,
    [new GymBadgeRequirement(BadgeTypes.Psychic)]
);
TownList['Terminus Cave'] = new DungeonTown(
    'Terminus Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 18)]
);
TownList['Pokémon Village'] = new DungeonTown(
    'Pokémon Village',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, 20)]
);
TownList['Victory Road Kalos'] = new DungeonTown(
    'Victory Road Kalos',
    GameConstants.Region.kalos,
    [
        new GymBadgeRequirement(BadgeTypes.Iceberg),
        new OneFromManyRequirement([
            new RouteKillRequirement(10, 21),
            new RouteKillRequirement(10, 22),
        ]),
    ]
);
//Unknown Cave?
