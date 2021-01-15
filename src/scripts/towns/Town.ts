/* eslint-disable array-bracket-newline */
///<reference path="../achievements/GymBadgeRequirement.ts"/>
///<reference path="../achievements/OneFromManyRequirement.ts"/>
///<reference path="../../declarations/enums/Badges.d.ts"/>
///<reference path="NPC.ts"/>
///<reference path="KantoBerryMasterNPC.ts"/>
///<reference path="ProfOakNPC.ts"/>

type TownOptionalArgument = {
    requirements?: (Requirement | OneFromManyRequirement)[],
    shop?: Shop,
    berryMaster?: Shop,
    dungeon?: Dungeon,
    npcs?: NPC[],
};

class Town {
    public name: KnockoutObservable<string>;
    public region: KnockoutObservable<GameConstants.Region>;
    public gym?: KnockoutObservable<Gym>;
    public requirements: (Requirement | OneFromManyRequirement)[];
    public shop?: KnockoutObservable<Shop>;
    public berryMaster?: KnockoutObservable<Shop>;
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
        this.berryMaster = ko.observable(optional.berryMaster);
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
const VermilionCityShop = new Shop([
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
    ItemList['HpUp'],
    ItemList['Protein'],
    ItemList['Iron'],
    ItemList['Calcium'],
    ItemList['Zinc'],
    ItemList['Carbos'],
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
    'You can use the Pokéball Selector to select which type of Pokéball to use on specific Pokémon based on caught status.',
]);
const CinnabarIslandResearcher = new NPC('Researcher', [
    'They were trying to clone an ancient Pokémon in the mansion, I wonder if they succeeded.',
    'Apparently the ancient Pokémon escaped, And can be found roaming around Kanto!',
]);
const BigSpender = new NPC('Big Spender', [
    'I love shopping! When I come in, the cashiers know I want tons of items.',
    'You can use the Shop Amount Button settings to make it easy for big purchases, too!',
]);
const KantoBerryMaster = new KantoBerryMasterNPC('Berry Master', [
    'Bah! You younglings have no appreciation of the art of Berry farming!',
    'Come back when you are ready to learn!',
]);
const ProfOak = new ProfOakNPC('Prof. Oak', [
    'Good luck on your journey!',
    'Come visit me when you complete your Pokédex!',
]);
const BattleItemRival = new NPC('Battle Item Master', [
    'Hey kid, you look new! Let me offer some advice, Battle Items like xAttack can be acquired along Routes, inside Dungeons and in Shops!',
    'Use them to help you out whenever you feel like time is against you!',
]);
const BattleItemRival2 = new NPC('Battle Item Master', [
    'Do I know you? Wait... Have you met my worthless rival? Ha! Let me guess, he gave you some unwanted advice?',
    'I bet he forget to tell you that although all Battle Items only last for 30 seconds they can stack and last for days! Now scram!',
]);



//Kanto Towns
TownList['Pewter City'] = new Town(
    'Pewter City',
    GameConstants.Region.kanto,
    {
        requirements: [
            new RouteKillRequirement(10, GameConstants.Region.kanto, 2),
            new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Viridian Forest')),
        ],
        shop: PewterCityShop,
        npcs: [BattleItemRival],
    }
);
TownList['Cerulean City'] = new Town(
    'Cerulean City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kanto, 4)],
        shop: CeruleanCityShop,
        dungeon: dungeonList['Cerulean Cave'],
        npcs: [KantoBerryMaster],
    }
);
TownList['Vermilion City'] = new Town(
    'Vermilion City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kanto, 6)],
        shop: VermilionCityShop,
    }
);
TownList['Celadon City'] = new Town(
    'Celadon City',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kanto, 7)],
        shop: CeladonCityShop,
        npcs: [BigSpender],
    }
);
TownList['Saffron City'] = new Town(
    'Saffron City',
    GameConstants.Region.kanto,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Rainbow)],
        shop: SaffronCityShop,
        npcs: [BattleItemRival2],
    }
);
TownList['Fuchsia City'] = new Town(
    'Fuchsia City',
    GameConstants.Region.kanto,
    {
        requirements: [new OneFromManyRequirement([
            new RouteKillRequirement(10, GameConstants.Region.kanto, 18),
            new RouteKillRequirement(10, GameConstants.Region.kanto, 15),
        ])],
        shop: FuchsiaCityShop,
    }
);
TownList['Cinnabar Island'] = new Town(
    'Cinnabar Island',
    GameConstants.Region.kanto,
    {
        requirements: [new OneFromManyRequirement([
            new RouteKillRequirement(10, GameConstants.Region.kanto, 20),
            new RouteKillRequirement(10, GameConstants.Region.kanto, 21),
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
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kanto, 1)],
        shop: ViridianCityShop,
        npcs: [ViridianCityOldMan],
    }
);
TownList['Pallet Town'] = new Town(
    'Pallet Town',
    GameConstants.Region.kanto,
    {
        npcs: [ProfOak],
    }
);
TownList['Lavender Town'] = new Town(
    'Lavender Town',
    GameConstants.Region.kanto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kanto, 10)],
        shop: LavenderTownShop,
        dungeon: dungeonList['Pokemon Tower'],
    }
);

//Kanto Dungeons
TownList['Viridian Forest'] = new DungeonTown(
    'Viridian Forest',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, GameConstants.Region.kanto, 2)]
);
TownList['Mt. Moon'] = new DungeonTown(
    'Mt. Moon',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, GameConstants.Region.kanto,3)]
);
TownList['Digletts Cave'] = new DungeonTown(
    'Digletts Cave',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, GameConstants.Region.kanto, 6)]
);
TownList['Rock Tunnel'] = new DungeonTown(
    'Rock Tunnel',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, GameConstants.Region.kanto, 9),
        new GymBadgeRequirement(BadgeEnums.Cascade),
    ]
);
TownList['Power Plant'] = new DungeonTown(
    'Power Plant',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, GameConstants.Region.kanto, 9),
        new GymBadgeRequirement(BadgeEnums.Soul),
    ]
);
TownList['Pokemon Tower'] = new DungeonTown(
    'Pokemon Tower',
    GameConstants.Region.kanto,
    [
        new RouteKillRequirement(10, GameConstants.Region.kanto, 10),
        new GymBadgeRequirement(BadgeEnums.Rainbow),
    ]
);
TownList['Seafoam Islands'] = new DungeonTown(
    'Seafoam Islands',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, GameConstants.Region.kanto, 19)]
);
TownList['Pokemon Mansion'] = new DungeonTown(
    'Pokemon Mansion',
    GameConstants.Region.kanto,
    [new OneFromManyRequirement([
        new RouteKillRequirement(10, GameConstants.Region.kanto, 20),
        new RouteKillRequirement(10, GameConstants.Region.kanto, 21),
    ])]
);
TownList['Victory Road'] = new DungeonTown(
    'Victory Road',
    GameConstants.Region.kanto,
    [new RouteKillRequirement(10, GameConstants.Region.kanto, 23)]
);
TownList['Cerulean Cave'] = new DungeonTown(
    'Cerulean Cave',
    GameConstants.Region.kanto,
    [new GymBadgeRequirement(BadgeEnums.Elite_KantoChampion)]
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

//Johto Berry Master
const JohtoBerryMaster = new Shop([
    ItemList['Boost_Mulch'],
    ItemList['Rich_Mulch'],
    ItemList['Surprise_Mulch'],
    ItemList['Amaze_Mulch'],
    ItemList['Berry_Shovel'],
    ItemList['Squirtbottle'],
]);

// Johto NPCs

const CherrygroveMrPokemon = new NPC('Mr Pokémon', [
    'Welcome to Johto! This is where the first ever Pokémon egg was found long ago.',
    'Astounding breakthroughs have been made since then. We can now store Pokémon eggs for longer and queue them up for breeding.',
    'This new technology only allows up to four stored eggs, for now.',
]);

const AzaleaOldMan = new NPC('Wise Old Man', [
    'There is an old tale about the Guardian of Ilex Forest.',
    'It says that the mythical Pokémon Celebi will appear before anyone who has proven they are a Champion Pokémon Trainer.',
]);

const EcruteakKimonoGirl = new NPC('Kimono Girl', [
    'Legends say that Ho-Oh is searching for a trainer of pure heart.',
    'To prove yourself, you must tame the three legendary beasts of Johto, and bring them to the nearby Tin Tower.',
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
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 29)],
        shop: CherrygroveCityShop,
        npcs: [CherrygroveMrPokemon],
    }
);
TownList['Violet City'] = new Town(
    'Violet City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 31)],
        shop: VioletCityShop,
        dungeon: dungeonList['Sprout Tower'],
    }
);
TownList['Azalea Town'] = new Town(
    'Azalea Town',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 33)],
        shop: AzaleaTownShop,
        dungeon: dungeonList['Slowpoke Well'],
        npcs: [AzaleaOldMan],
    }
);
TownList['Goldenrod City'] = new Town(
    'Goldenrod City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 34)],
        shop: GoldenrodCityShop,
        berryMaster: JohtoBerryMaster,
        npcs: [BigSpender],
    }
);
TownList['Ecruteak City'] = new Town(
    'Ecruteak City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 37)],
        shop: EcruteakCityShop,
        npcs: [EcruteakKimonoGirl],
    }
);
TownList['Olivine City'] = new Town(
    'Olivine City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 39)],
        shop: OlivineCityShop,
    }
);
TownList['Cianwood City'] = new Town(
    'Cianwood City',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 41)],
        shop: CianwoodCityShop,
    }
);
TownList['Mahogany Town'] = new Town(
    'Mahogany Town',
    GameConstants.Region.johto,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.johto, 42)],
        shop: MahoganyTownShop,
    }
);
TownList['Blackthorn City'] = new Town(
    'Blackthorn City',
    GameConstants.Region.johto,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Ice Path'))],
        shop: BlackthornCityShop,
    }
);

//Johto Dungeons
TownList['Sprout Tower'] = new DungeonTown(
    'Sprout Tower',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 31)]
);
TownList['Ruins of Alph'] = new DungeonTown(
    'Ruins of Alph',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 32)]
);
TownList['Union Cave'] = new DungeonTown(
    'Union Cave',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 32)]
);
TownList['Slowpoke Well'] = new DungeonTown(
    'Slowpoke Well',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 33)]
);
TownList['Ilex Forest'] = new DungeonTown(
    'Ilex Forest',
    GameConstants.Region.johto,
    [new GymBadgeRequirement(BadgeEnums.Hive)]
);
TownList['Burned Tower'] = new DungeonTown(
    'Burned Tower',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 37)]
);
TownList['Tin Tower'] = new DungeonTown(
    'Tin Tower',
    GameConstants.Region.johto,
    [
        new GymBadgeRequirement(BadgeEnums.Mineral),
        new GymBadgeRequirement(BadgeEnums.Glacier),
    ]
);
TownList['Whirl Islands'] = new DungeonTown(
    'Whirl Islands',
    GameConstants.Region.johto,
    [
        new GymBadgeRequirement(BadgeEnums.Mineral),
        new GymBadgeRequirement(BadgeEnums.Glacier),
    ]
);
TownList['Mt Mortar'] = new DungeonTown(
    'Mt Mortar',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 42)]
);
TownList['Ice Path'] = new DungeonTown(
    'Ice Path',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 44)]
);
TownList['Dark Cave'] = new DungeonTown(
    'Dark Cave',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 45)]
);
TownList['Mt Silver'] = new DungeonTown(
    'Mt Silver',
    GameConstants.Region.johto,
    [new RouteKillRequirement(10, GameConstants.Region.johto, 28)]
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

//Hoenn Berry Master
const HoennBerryMaster = new Shop([
    ItemList['Boost_Mulch'],
    ItemList['Rich_Mulch'],
    ItemList['Surprise_Mulch'],
    ItemList['Amaze_Mulch'],
    ItemList['Berry_Shovel'],
    ItemList['Sprinklotad'],
]);

//Hoenn NPCs
const LittlerootAide = new NPC('Professor Birch\'s Aide', [
    'We have received word from Mr. Pokémon in Johto! He has made another breakthrough.',
    'You can now store an additional four eggs in the queue! His research has really gained speed.',
    'He wants you to know that he will have an additional eight slots ready by the time you reach Sinnoh.',
]);

const SootopolisWallace = new NPC('Gym Leader Wallace', [
    'The creators of the lands and ocean slumber within the Cave of Origin.',
    'However, they will only awaken when in the presence of a truly great trainer.',
    'You will have to overcome the Pokémon League before you have any chance to encounter them.',
]);
const Weatherman = new NPC('Weatherman', [
    'Castform is a very finnicky pokemon.',
    'It changes forms when the weather is drastically different.',
    'If you want to collect them all, wait for the weather to change.',
]);

//Hoenn Towns
TownList['Littleroot Town'] = new Town(
    'Littleroot Town',
    GameConstants.Region.hoenn,
    {
        shop: LittleRootTownShop,
        npcs: [LittlerootAide],
    }
);
TownList['Oldale Town'] = new Town(
    'Oldale Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 101)],
    }
);
TownList['Petalburg City'] = new Town(
    'Petalburg City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 102)],
    }
);
TownList['Rustboro City'] = new Town(
    'Rustboro City',
    GameConstants.Region.hoenn,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Petalburg Woods'))],
        shop: RustboroCityShop,
    }
);
TownList['Dewford Town'] = new Town(
    'Dewford Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Rusturf Tunnel'))],
        shop: DewfordTownShop,
    }
);
TownList['Slateport City'] = new Town(
    'Slateport City',
    GameConstants.Region.hoenn,
    {
        requirements: [
            new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Granite Cave')),
            new GymBadgeRequirement(BadgeEnums.Knuckle),
        ],
        shop: SlateportCityShop,
    }
);
TownList['Mauville City'] = new Town(
    'Mauville City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 110)],
        shop: MauvilleCityShop,
        berryMaster: HoennBerryMaster,
    }
);
TownList['Verdanturf Town'] = new Town(
    'Verdanturf Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 117)],
        shop: VerdanturfTownShop,
    }
);
TownList['Lavaridge Town'] = new Town(
    'Lavaridge Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Jagged Pass'))],
        shop: LavaridgeTownShop,
    }
);
TownList['Fallarbor Town'] = new Town(
    'Fallarbor Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 113)],
        shop: FallarborTownShop,
    }
);
TownList['Fortree City'] = new Town(
    'Fortree City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 119)],
        shop: FortreeCityShop,
        npcs: [Weatherman],
    }
);
TownList['LilyCove City'] = new Town(
    'LilyCove City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 121)],
        shop: LilyCoveCityShop,
        npcs: [BigSpender],
    }
);
TownList['Mossdeep City'] = new Town(
    'Mossdeep City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 125)],
        shop: MossdeepCityShop,
    }
);
TownList['Sootopolis City'] = new Town(
    'Sootopolis City',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 126), new GymBadgeRequirement(BadgeEnums.Mind)],
        shop: SootopolisCityShop,
        npcs: [SootopolisWallace],
    }
);
TownList['Ever Grande City'] = new Town(
    'Ever Grande City',
    GameConstants.Region.hoenn,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Rain)],
        shop: EverGrandeCityShop,
    }
);
TownList['Pokemon League Hoenn'] = new Town(
    'Pokemon League',
    GameConstants.Region.hoenn,
    {
        requirements: [
            new RouteKillRequirement(10, GameConstants.Region.hoenn, 128),
            new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Hoenn')),
        ],
    }
);
TownList['Pacifidlog Town'] = new Town(
    'Pacifidlog Town',
    GameConstants.Region.hoenn,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.hoenn, 131)],
        shop: PacifidlogTownShop,
    }
);
TownList['Battle Frontier'] = new Town(
    'Battle Frontier',
    GameConstants.Region.hoenn,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Elite_HoennChampion)],
        shop: BattleFrontierShop,
    }
);

//Hoenn Dungeons
TownList['Petalburg Woods'] = new DungeonTown(
    'Petalburg Woods',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, GameConstants.Region.hoenn, 104)]
);
TownList['Rusturf Tunnel'] = new DungeonTown(
    'Rusturf Tunnel',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, GameConstants.Region.hoenn, 116),
        new GymBadgeRequirement(BadgeEnums.Stone),
    ]
);
TownList['Granite Cave'] = new DungeonTown(
    'Granite Cave',
    GameConstants.Region.hoenn,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Rusturf Tunnel'))]
);
TownList['Fiery Path'] = new DungeonTown(
    'Fiery Path',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, GameConstants.Region.hoenn, 112)]
);
TownList['Meteor Falls'] = new DungeonTown(
    'Meteor Falls',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, GameConstants.Region.hoenn, 114)]
);
TownList['Mt. Chimney'] = new DungeonTown(
    'Mt. Chimney',
    GameConstants.Region.hoenn,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Meteor Falls'))]
);
TownList['Jagged Pass'] = new DungeonTown(
    'Jagged Pass',
    GameConstants.Region.hoenn,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Mt. Chimney'))]
);
TownList['New Mauville'] = new DungeonTown(
    'New Mauville',
    GameConstants.Region.hoenn,
    [new GymBadgeRequirement(BadgeEnums.Balance)]
);
TownList['Mt. Pyre'] = new DungeonTown(
    'Mt. Pyre',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, GameConstants.Region.hoenn, 122)]
);
TownList['Shoal Cave'] = new DungeonTown(
    'Shoal Cave',
    GameConstants.Region.hoenn,
    [new RouteKillRequirement(10, GameConstants.Region.hoenn, 125)]
);
TownList['Cave of Origin'] = new DungeonTown(
    'Cave of Origin',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, GameConstants.Region.hoenn, 126),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Seafloor Cavern')),
    ]
);
TownList['Seafloor Cavern'] = new DungeonTown(
    'Seafloor Cavern',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, GameConstants.Region.hoenn, 128),
        new GymBadgeRequirement(BadgeEnums.Mind),
    ]
);
TownList['Sky Pillar'] = new DungeonTown(
    'Sky Pillar',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, GameConstants.Region.hoenn, 131),
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Cave of Origin')),
    ]
);
TownList['Victory Road Hoenn'] = new DungeonTown(
    'Victory Road Hoenn',
    GameConstants.Region.hoenn,
    [new GymBadgeRequirement(BadgeEnums.Rain)]
);
TownList['Sealed Chamber'] = new DungeonTown(
    'Sealed Chamber',
    GameConstants.Region.hoenn,
    [
        new RouteKillRequirement(10, GameConstants.Region.hoenn, 134),
        new GymBadgeRequirement(BadgeEnums.Mind),
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

//Sinnoh Berry Master
const SinnohBerryMaster = new Shop([
    ItemList['Boost_Mulch'],
    ItemList['Rich_Mulch'],
    ItemList['Surprise_Mulch'],
    ItemList['Amaze_Mulch'],
    ItemList['Berry_Shovel'],
]);

//Sinnoh NPCs
const FloaramaLeafeonTip = new NPC('Flower Girl', [
    'Something amazing just happened!',
    'My friend was taking their Eevee on a walk through Eterna Forest, and it suddenly evolved into a Leafeon!',
    'Can you believe that?',
]);

const SnowpointGlaceonTip = new NPC('Young Girl', [
    'Someone told me that training an Eevee in Lake Acuity will make it evolve something new.',
    'They must be lying, how can that be true?!',
]);

const OreburghConstructionWorker = new NPC('Construction Worker', [
    'I was doing some exploring in Mt. Coronet last week, and my Nosepass gained a lot of levels.',
    'I had a big suprise when he reached level 20 though!',
]);

const HearthomeContestFan = new NPC('Contest Fan', [
    'My favourite contestant had a big reveal for us this week!',
    'Their prized Magneton had evolved into a Magnezone!',
    'I\'m so happy for them, all of that training in Mt. Coronet must have paid off!',
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
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 201)],
    }
);
TownList['Jubilife City'] = new Town(
    'Jubilife City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 202)],
    }
);
TownList['Oreburgh City'] = new Town(
    'Oreburgh City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Oreburgh Gate'))],
        shop: OreburghCityShop,
        npcs: [OreburghConstructionWorker],
    }
);
TownList['Floaroma Town'] = new Town(
    'Floaroma Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Ravaged Path'))],
        npcs: [FloaramaLeafeonTip],
    }
);
TownList['Eterna City'] = new Town(
    'Eterna City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Eterna Forest'))],
        shop: EternaCityShop,
    }
);
TownList['Hearthome City'] = new Town(
    'Hearthome City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 208)],
        shop: HearthomeCityShop,
        berryMaster: SinnohBerryMaster,
        npcs: [HearthomeContestFan],
    }
);
TownList['Solaceon Town'] = new Town(
    'Solaceon Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 209)],
        shop: SolaceonTownShop,
    }
);
TownList['Veilstone City'] = new Town(
    'Veilstone City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 215)],
        shop: VeilstoneCityShop,
        npcs: [BigSpender],
    }
);
TownList['Pastoria City'] = new Town(
    'Pastoria City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 213)],
        shop: PastoriaShop,
    }
);
TownList['Celestic Town'] = new Town(
    'Celestic Town',
    GameConstants.Region.sinnoh,
    {
        requirements: [
            new RouteKillRequirement(10, GameConstants.Region.sinnoh, 210),
            new GymBadgeRequirement(BadgeEnums.Fen),
        ],
        shop: CelesticTownShop,
    }
);
TownList['Pal Park'] = new Town(
    'Pal Park',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 221)],
        shop: PalParkShop,
    }
);
TownList['Canalave City'] = new Town(
    'Canalave City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 218)],
        shop: CanalaveCityShop,
    }
);
TownList['Snowpoint City'] = new Town(
    'Snowpoint City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 217)],
        npcs: [SnowpointGlaceonTip],
    }
);
TownList['Sunyshore City'] = new Town(
    'Sunyshore City',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 222)],
        shop: SunyshoreCityShop,
    }
);
TownList['Pokemon League Sinnoh'] = new Town(
    'Pokemon League Sinnoh',
    GameConstants.Region.sinnoh,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Sinnoh'))],
    }
);
TownList['Fight Area'] = new Town(
    'Fight Area',
    GameConstants.Region.sinnoh,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion)],
    }
);
TownList['Survival Area'] = new Town(
    'Survival Area',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 225)],
        shop: SurvivalAreaShop,
    }
);
TownList['Resort Area'] = new Town(
    'Resort Area',
    GameConstants.Region.sinnoh,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 229)],
        shop: ResortAreaShop,
    }
);

//Sinnoh Dungeons
TownList['Oreburgh Gate'] = new DungeonTown(
    'Oreburgh Gate',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 203)]
);
TownList['Ravaged Path'] = new DungeonTown(
    'Ravaged Path',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 204),
        new GymBadgeRequirement(BadgeEnums.Coal),
    ]
);
TownList['Eterna Forest'] = new DungeonTown(
    'Eterna Forest',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 205),
        new GymBadgeRequirement(BadgeEnums.Coal),
    ]
);
TownList['Old Chateau'] = new DungeonTown(
    'Old Chateau',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 205),
        new GymBadgeRequirement(BadgeEnums.Forest),
    ]
);
TownList['Wayward Cave'] = new DungeonTown(
    'Wayward Cave',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 206)]
);
TownList['Mt. Coronet South'] = new DungeonTown(
    'Mt. Coronet South',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 207)]
);
TownList['Iron Island'] = new DungeonTown(
    'Iron Island',
    GameConstants.Region.sinnoh,
    [new RouteKillRequirement(10, GameConstants.Region.sinnoh, 218)]
);
TownList['Mt. Coronet North'] = new DungeonTown(
    'Mt. Coronet North',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 211),
        new GymBadgeRequirement(BadgeEnums.Mine),
    ]
);
TownList['Distortion World'] = new DungeonTown(
    'Distortion World',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 214),
        new GymBadgeRequirement(BadgeEnums.Icicle),
    ]
);
TownList['Lake Valor'] = new DungeonTown(
    'Lake Valor',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 213),
        new GymBadgeRequirement(BadgeEnums.Icicle),
    ]
);
TownList['Lake Verity'] = new DungeonTown(
    'Lake Verity',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 201),
        new GymBadgeRequirement(BadgeEnums.Icicle),
    ]
);
TownList['Lake Acuity'] = new DungeonTown(
    'Lake Acuity',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 217),
        new GymBadgeRequirement(BadgeEnums.Icicle),
    ]
);
TownList['Victory Road Sinnoh'] = new DungeonTown(
    'Victory Road Sinnoh',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 223),
        new GymBadgeRequirement(BadgeEnums.Beacon),
    ]
);
TownList['Spear Pillar'] = new DungeonTown(
    'Spear Pillar',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 211),
        new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion),
    ]
);
TownList['Hall of Origin'] = new DungeonTown(
    'Hall of Origin',
    GameConstants.Region.sinnoh,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Spear Pillar'))]
);
TownList['Fullmoon Island'] = new DungeonTown(
    'Fullmoon Island',
    GameConstants.Region.sinnoh,
    [new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion)]
);
TownList['Newmoon Island'] = new DungeonTown(
    'Newmoon Island',
    GameConstants.Region.sinnoh,
    [new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion)]
);
TownList['Flower Paradise'] = new DungeonTown(
    'Flower Paradise',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 224),
        new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion),
    ]
);
TownList['Stark Mountain'] = new DungeonTown(
    'Stark Mountain',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 227),
        new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion),
    ]
);
TownList['Snowpoint Temple'] = new DungeonTown(
    'Snowpoint Temple',
    GameConstants.Region.sinnoh,
    [
        new RouteKillRequirement(10, GameConstants.Region.sinnoh, 217),
        new GymBadgeRequirement(BadgeEnums.Elite_SinnohChampion),
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
const DriftveilCityShop = new Shop([
    ItemList['Zorua'],
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
const StriatonCityShop = new Shop([
    ItemList['Leaf_stone'],
    ItemList['Water_stone'],
    ItemList['Fire_stone'],
]);
const AccumulaTownShop = new Shop([
    ItemList['Dusk_stone'],
    ItemList['Shiny_stone'],
]);
const AnvilleTownShop = new Shop([
    ItemList['Meloetta (pirouette)'],
]);

//Unova NPCs
const ExcitedChild = new NPC('Professor Birch\'s Aide', [
    'Did you hear? Did you see? It was on TV!',
    'I was just watching my favorite show, The National Gymquirer. It was a live segment! Some hot shot trainer from Kanto defeated Drayden! It was amazing! That trainer is so cool! Drayden is like unbeatable.',
    'Then my programme got interrupted by an emergency broadcast. A report on the first confirmed sightings of Tornadus and Thundurus in over twenty-five years! I\'ve read so much about them, they are my favorites.',
    'Last time they were spotted they just roamed around, causing all kinds of mischief. According to my books anyway. I\'m sure that amazing trainer from the TV will want to catch these mighty forces of nature.',
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
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 19)],
    }
);
TownList['Virbank City'] = new Town(
    'Virbank City',
    GameConstants.Region.unova,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Basic)],
        shop: VirbankCityShop,
    }
);
TownList['Castelia City'] = new Town(
    'Castelia City',
    GameConstants.Region.unova,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Toxic)],
        shop: CasteliaCityShop,
        dungeon: dungeonList['Castelia Sewers'],
    }
);
TownList['Nimbasa City'] = new Town(
    'Nimbasa City',
    GameConstants.Region.unova,
    {
        requirements: [
            new RouteKillRequirement(10, GameConstants.Region.unova, 4),
            new GymBadgeRequirement(BadgeEnums.Insect),
        ],
        shop: NimbasaCityShop,
    }
);
TownList['Driftveil City'] = new Town(
    'Driftveil City',
    GameConstants.Region.unova,
    {
        requirements: [
            new RouteKillRequirement(10, GameConstants.Region.unova,5),
            new GymBadgeRequirement(BadgeEnums.Bolt),
        ],
        shop: DriftveilCityShop,
    }
);
TownList['Mistralton City'] = new Town(
    'Mistralton City',
    GameConstants.Region.unova,
    {
        requirements: [
            new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Chargestone Cave')),
            new GymBadgeRequirement(BadgeEnums.Quake),
        ],
        shop: MistraltonCityShop,
    }
);
TownList['Lentimas Town'] = new Town(
    'Lentimas Town',
    GameConstants.Region.unova,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.Jet)],
        shop: LentimasTownShop,
    }
);
TownList['Undella Town'] = new Town(
    'Undella Town',
    GameConstants.Region.unova,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Reversal Mountain'))],
    }
);
TownList['Lacunosa Town'] = new Town(
    'Lacunosa Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 13)],
        shop: LacunosaTownShop,
    }
);
TownList['Opelucid City'] = new Town(
    'Opelucid City',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 11)],
        shop: OpelucidCityShop,
    }
);
TownList['Humilau City'] = new Town(
    'Humilau City',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 21)],
        npcs: [ExcitedChild],
    }
);
TownList['Pokemon League Unova'] = new Town(
    'Pokemon League Unova',
    GameConstants.Region.unova,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Unova'))],
    }
);
TownList['Icirrus City'] = new Town(
    'Icirrus City',
    GameConstants.Region.unova,
    {
        requirements: [new OneFromManyRequirement([
            new RouteKillRequirement(10, GameConstants.Region.unova, 8),
            new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Twist Mountain')),
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
                new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion),
                new RouteKillRequirement(10, GameConstants.Region.unova, 14),
            ]),
            new RouteKillRequirement(10, GameConstants.Region.unova, 15),
        ])],
        shop: BlackAndWhiteParkShop,
    }
);
TownList['Nacrene City'] = new Town(
    'Nacrene City',
    GameConstants.Region.unova,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Pinwheel Forest'))],
        shop: NacreneCityShop,
    }
);
TownList['Striaton City'] = new Town(
    'Striaton City',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 3)],
        shop: StriatonCityShop,
    }
);
TownList['Accumula Town'] = new Town(
    'Accumula Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 2)],
        shop: AccumulaTownShop,
    }
);
TownList['Nuvema Town'] = new Town(
    'Nuvema Town',
    GameConstants.Region.unova,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.unova, 1)],
    }
);
TownList['Anville Town'] = new Town(
    'Anville Town',
    GameConstants.Region.unova,
    {
        requirements: [new ObtainedPokemonRequirement(pokemonMap['Meloetta (aria)'])],
        shop: AnvilleTownShop,
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
    [new RouteKillRequirement(10, GameConstants.Region.unova, 20)]
);
TownList['Liberty Garden'] = new DungeonTown(
    'Liberty Garden',
    GameConstants.Region.unova,
    //Victini dungeon, maybe unlock later
    [new GymBadgeRequirement(BadgeEnums.Toxic)]
);
TownList['Castelia Sewers'] = new DungeonTown(
    'Castelia Sewers',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeEnums.Toxic)]
);
TownList['Relic Passage'] = new DungeonTown(
    'Relic Passage',
    GameConstants.Region.unova,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Castelia Sewers'))]
);
TownList['Relic Castle'] = new DungeonTown(
    'Relic Castle',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 25)]
);
TownList['Lostlorn Forest'] = new DungeonTown(
    'Lostlorn Forest',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 16)]
);
TownList['Chargestone Cave'] = new DungeonTown(
    'Chargestone Cave',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 6)]
);
TownList['Mistralton Cave'] = new DungeonTown(
    'Mistralton Cave',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeEnums.Quake)]
);
TownList['Celestial Tower'] = new DungeonTown(
    'Celestial Tower',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 7)]
);
TownList['Reversal Mountain'] = new DungeonTown(
    'Reversal Mountain',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeEnums.Jet)]
);
TownList['Seaside Cave'] = new DungeonTown(
    'Seaside Cave',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, GameConstants.Region.unova, 24),
        new GymBadgeRequirement(BadgeEnums.Legend),
    ]
);
TownList['Giant Chasm'] = new DungeonTown(
    'Giant Chasm',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, GameConstants.Region.unova, 22),
        new GymBadgeRequirement(BadgeEnums.Wave),
    ]
);
TownList['Cave of Being'] = new DungeonTown(
    'Cave of Being',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 23)]
);
TownList['Abundant Shrine'] = new DungeonTown(
    'Abundant Shrine',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, GameConstants.Region.unova, 23),
        new RouteKillRequirement(10, GameConstants.Region.unova, 14),
        new ObtainedPokemonRequirement(pokemonMap.Tornadus),
        new ObtainedPokemonRequirement(pokemonMap.Thundurus),
    ]
);
TownList['Victory Road Unova'] = new DungeonTown(
    'Victory Road Unova',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 23)]
);
TownList['Twist Mountain'] = new DungeonTown(
    'Twist Mountain',
    GameConstants.Region.unova,
    [new OneFromManyRequirement([
        new MultiRequirement([
            new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion),
            new RouteKillRequirement(10, GameConstants.Region.unova, 7),
        ]),
        new RouteKillRequirement(10, GameConstants.Region.unova, 8),
    ])]
);
TownList['Dragonspiral Tower'] = new DungeonTown(
    'Dragonspiral Tower',
    GameConstants.Region.unova,
    [new OneFromManyRequirement([
        new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Twist Mountain')),
        new RouteKillRequirement(10, GameConstants.Region.unova, 8),
    ])]
);
TownList['Moor of Icirrus'] = new DungeonTown(
    'Moor of Icirrus',
    GameConstants.Region.unova,
    [
        new RouteKillRequirement(10, GameConstants.Region.unova, 8),
        new ObtainedPokemonRequirement(pokemonMap.Cobalion),
        new ObtainedPokemonRequirement(pokemonMap.Terrakion),
        new ObtainedPokemonRequirement(pokemonMap.Virizion),
    ]
);
TownList['Pinwheel Forest'] = new DungeonTown(
    'Pinwheel Forest',
    GameConstants.Region.unova,
    [new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion)]
);
TownList['Dreamyard'] = new DungeonTown(
    'Dreamyard',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 3)]
);
TownList['P2 Laboratory'] = new DungeonTown(
    'P2 Laboratory',
    GameConstants.Region.unova,
    [new RouteKillRequirement(10, GameConstants.Region.unova, 17)]
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
    ItemList['Whipped_dream'],
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
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 3)],
        shop: SantaluneCityShop,
    }
);
TownList['Lumiose City'] = new Town(
    'Lumiose City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 3)],
        shop: LumioseCityShop,
    }
);
TownList['Camphrier Town'] = new Town(
    'Camphrier Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 4)],
    }
);
TownList['Ambrette Town'] = new Town(
    'Ambrette Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 8)],
        shop: AmbretteTownShop,
    }
);
TownList['Cyllage City'] = new Town(
    'Cyllage City',
    GameConstants.Region.kalos,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Glittering Cave'))],
    }
);
TownList['Geosenge Town'] = new Town(
    'Geosenge Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 10)],
        shop: GeosengeTownShop,
    }
);
TownList['Shalour City'] = new Town(
    'Shalour City',
    GameConstants.Region.kalos,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Reflection Cave'))],
        shop: ShalourCityShop,
    }
);
TownList['Coumarine City'] = new Town(
    'Coumarine City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 12)],
        shop: CoumarineCityShop,
    }
);
TownList['Laverre City'] = new Town(
    'Laverre City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 14)],
        shop: LaverreCityShop,
    }
);
TownList['Dendemille Town'] = new Town(
    'Dendemille Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 15)],
        shop: DendemilleTownShop,
    }
);
TownList['Anistar City'] = new Town(
    'Anistar City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 17)],
        shop: AnistarCityShop,
    }
);
TownList['Couriway Town'] = new Town(
    'Couriway Town',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 18)],
        shop: CouriwayTownShop,
    }
);
TownList['Snowbelle City'] = new Town(
    'Snowbelle City',
    GameConstants.Region.kalos,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.kalos, 19)],
    }
);
TownList['Pokémon League Kalos'] = new Town(
    'Pokémon League Kalos',
    GameConstants.Region.kalos,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Victory Road Kalos'))],
    }
);

//Kalos Dungeons
TownList['Santalune Forest'] = new DungeonTown(
    'Santalune Forest',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 2)]
);
TownList['Parfum Palace'] = new DungeonTown(
    'Parfum Palace',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 6)]
);
TownList['Connecting Cave'] = new DungeonTown(
    'Connecting Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 7)]
);
TownList['Glittering Cave'] = new DungeonTown(
    'Glittering Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 9)]
);
TownList['Reflection Cave'] = new DungeonTown(
    'Reflection Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 11)]
);
//Tower of Mastery?
//Sea Spirit's Den?
//Kalos Power Plant?
TownList['Lost Hotel'] = new DungeonTown(
    'Lost Hotel',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 15)]
);
TownList['Frost Cavern'] = new DungeonTown(
    'Frost Cavern',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 15)]
);
TownList['Team Flare Secret HQ'] = new DungeonTown(
    'Team Flare Secret HQ',
    GameConstants.Region.kalos,
    [new GymBadgeRequirement(BadgeEnums.Psychic)]
);
TownList['Terminus Cave'] = new DungeonTown(
    'Terminus Cave',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 18)]
);
TownList['Pokémon Village'] = new DungeonTown(
    'Pokémon Village',
    GameConstants.Region.kalos,
    [new RouteKillRequirement(10, GameConstants.Region.kalos, 20)]
);
TownList['Victory Road Kalos'] = new DungeonTown(
    'Victory Road Kalos',
    GameConstants.Region.kalos,
    [
        new GymBadgeRequirement(BadgeEnums.Iceberg),
        new OneFromManyRequirement([
            new RouteKillRequirement(10, GameConstants.Region.kalos, 21),
            new RouteKillRequirement(10, GameConstants.Region.kalos, 22),
        ]),
    ]
);
//Unknown Cave?

//Alola Towns
TownList['Iki Town'] = new Town(
    'Iki Town',
    GameConstants.Region.alola,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.alola, 1)],
    }
);
TownList['Hau\'oli City'] = new Town(
    'Hau\'oli City',
    GameConstants.Region.alola,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Trainers\' School'))],
    }
);
TownList['Heahea City'] = new Town(
    'Heahea City',
    GameConstants.Region.alola,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.MelemeleKahuna)],
    }
);
TownList['Paniola Town'] = new Town(
    'Paniola Town',
    GameConstants.Region.alola,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.alola, 4)],
    }
);
TownList['Royal Avenue'] = new Town(
    'Royal Avenue',
    GameConstants.Region.alola,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.alola, 6)],
    }
);
TownList['Konikoni City'] = new Town(
    'Konikoni City',
    GameConstants.Region.alola,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.alola, 9)],
    }
);
TownList['Malie City'] = new Town(
    'Malie City',
    GameConstants.Region.alola,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.AkalaKahuna)], //Replace with Ather Paradise 1 if implemented
    }
);
TownList['Aether Paradise'] = new Town(
    'Aether Paradise',
    GameConstants.Region.alola,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.AkalaKahuna)],
    }
);
TownList['Tapu Village'] = new Town(
    'Tapu Village',
    GameConstants.Region.alola,
    {
        requirements: [new RouteKillRequirement(10, GameConstants.Region.alola, 13)],
    }
);
TownList['Seafolk Village'] = new Town(
    'Seafolk Village',
    GameConstants.Region.alola,
    {
        requirements: [new GymBadgeRequirement(BadgeEnums.UlaulaKahuna)], //Replace with Ather Paradise 2 if implemented
    }
);
TownList['Exeggutor Island'] = new Town(
    'Exeggutor Island',
    GameConstants.Region.alola,
    {
        dungeon: dungeonList['Exeggutor Island Hill'],
        requirements: [new RouteKillRequirement(10, GameConstants.Region.alola, 25)],
    }
);
TownList['Altar of the Sunne and Moone'] = new Town(
    'Altar of the Sunne and Moone',
    GameConstants.Region.alola,
    {
        requirements: [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Vast Poni Canyon'))],
    }
);

//Alola Dungeons
TownList['Trainers\' School'] = new DungeonTown(
    'Trainers\' School',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 18)]
);
TownList['Hau\'oli Cemetery'] = new DungeonTown(
    'Hau\'oli Cemetery',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 2)]
);
TownList['Verdant Cavern'] = new DungeonTown(
    'Verdant Cavern',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 2)]
);
TownList['Melemele Meadow'] = new DungeonTown(
    'Melemele Meadow',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 3)]
);
TownList['Seaward Cave'] = new DungeonTown(
    'Seaward Cave',
    GameConstants.Region.alola,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Melemele Meadow'))]
);
TownList['Ten Carat Hill'] = new DungeonTown(
    'Ten Carat Hill',
    GameConstants.Region.alola,
    [new GymBadgeRequirement(BadgeEnums.MelemeleKahuna)]
);
TownList['Ruins of Conflict'] = new DungeonTown(
    'Ruins of Conflict',
    GameConstants.Region.alola,
    [new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)]
);
TownList['Pikachu Valley'] = new DungeonTown(
    'Pikachu Valley',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 4)]
);
TownList['Paniola Ranch'] = new DungeonTown(
    'Paniola Ranch',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 4)]
);
TownList['Brooklet Hill'] = new DungeonTown(
    'Brooklet Hill',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 5)]
);
TownList['Wela Volcano Park'] = new DungeonTown(
    'Wela Volcano Park',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 7)]
);
TownList['Lush Jungle'] = new DungeonTown(
    'Lush Jungle',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 8)]
);
TownList['Diglett\'s Tunnel'] = new DungeonTown(
    'Diglett\'s Tunnel',
    GameConstants.Region.alola,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Lush Jungle'))]
);
TownList['Memorial Hill'] = new DungeonTown(
    'Memorial Hill',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 9)]
);
TownList['Ruins of Life'] = new DungeonTown(
    'Ruins of Life',
    GameConstants.Region.alola,
    [
        new RouteKillRequirement(10, GameConstants.Region.alola, 21),
        new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion),
    ]
);
TownList['Malie Garden'] = new DungeonTown(
    'Malie Garden',
    GameConstants.Region.alola,
    [new GymBadgeRequirement(BadgeEnums.AkalaKahuna)] //Replace with Ather Paradise 1 if implemented
);
TownList['Hokulani Observatory'] = new DungeonTown(
    'Hokulani Observatory',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 22)]
);
TownList['Thrifty Megamart'] = new DungeonTown(
    'Thrifty Megamart',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 14)]
);
TownList['Ula\'ula Meadow'] = new DungeonTown(
    'Ula\'ula Meadow',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 16)]
);
TownList['Po Town'] = new DungeonTown(
    'Po Town',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 17)]
);
TownList['Mount Lanikala'] = new DungeonTown(
    'Mount Lanikala',
    GameConstants.Region.alola,
    [new GymBadgeRequirement(BadgeEnums.PoniKahuna)]
);
TownList['Ruins of Abundance'] = new DungeonTown(
    'Ruins of Abundance',
    GameConstants.Region.alola,
    [
        new RouteKillRequirement(10, GameConstants.Region.alola, 23),
        new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion),
    ]
);
TownList['Exeggutor Island Hill'] = new DungeonTown(
    'Exeggutor Island Hill',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 25)]
);
TownList['Vast Poni Canyon'] = new DungeonTown(
    'Vast Poni Canyon',
    GameConstants.Region.alola,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Exeggutor Island Hill'))]
);
TownList['Nebby'] = new DungeonTown(
    'Nebby',
    GameConstants.Region.alola,
    [new GymBadgeRequirement(BadgeEnums.Elite_UltraNecrozma)]
);
TownList['Ruins of Hope'] = new DungeonTown(
    'Ruins of Hope',
    GameConstants.Region.alola,
    [
        new RouteKillRequirement(10, GameConstants.Region.alola, 26),
        new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion),
    ]
);
TownList['Poni Meadow'] = new DungeonTown(
    'Poni Meadow',
    GameConstants.Region.alola,
    [new RouteKillRequirement(10, GameConstants.Region.alola, 28)]
);
TownList['Resolution Cave'] = new DungeonTown(
    'Resolution Cave',
    GameConstants.Region.alola,
    [new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Poni Meadow'))]
);
