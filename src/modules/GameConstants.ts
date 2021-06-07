// Ticks
export const TICK_TIME = 100;
export const BATTLE_TICK = 1000;
export const BATTLE_FRONTIER_TICK = 500;
export const UNDERGROUND_TICK = 1000;
export const DUNGEON_TIME = 6000;
export const DUNGEON_TICK = 10;
export const EFFECT_ENGINE_TICK = 1000;
export const SAVE_TICK = 10000;
export const GYM_TIME = 3000;
export const GYM_COUNTDOWN = 1000;
export const GYM_TICK = 10;
export const ACHIEVEMENT_TICK = 1000;
export const MIN_LOAD_TIME = 500; // 0.5 Seconds
export const MAX_LOAD_TIME = 20000; // 20 Seconds
export const MUTATION_TICK = 1000;
export const WANDER_TICK = 1500;

export const MAX_AVAILABLE_REGION = 5; // Kalos

export const TotalPokemonsPerRegion = [
    151, // 151 - Kanto
    251, // 100 - Johto
    386, // 135 - Hoenn
    493, // 107 - Sinnoh
    649, // 156 - Unova
    721, // 72 - Kalos
    809, // 88 - Alola
    890, // 81 - Galar
    // TODO: figure out a better way to handle DLC/non main regions
    893, // 3 - Armor
    898, // 5 - Crown

];

export const ITEM_USE_TIME = 30;

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;

export const ROAMING_MIN_CHANCE = 8192;
export const ROAMING_MAX_CHANCE = 4096;

// Shinies
export const SHINY_CHANCE_BATTLE = 8192;
export const SHINY_CHANCE_DUNGEON = 4096;
export const SHINY_CHANCE_SHOP = 2048;
export const SHINY_CHANCE_STONE = 2048;
export const SHINY_CHANCE_SAFARI = 2048;
export const SHINY_CHANCE_BREEDING = 1024;
export const SHINY_CHANCE_FARM = 1024;

export const ITEM_PRICE_MULTIPLIER = 1.00045;
export const ITEM_PRICE_DEDUCT = 1.0005;

export const PLATE_VALUE = 100;

// Breeding
export const BREEDING_ATTACK_BONUS = 25;

// Farming
export const BerryDistribution = [0.39, 0.63, 0.78, 0.87, 0.93, 0.96, 0.98, 1];

export const MULCH_USE_TIME = 300;
export const BOOST_MULCH_MULTIPLIER = 1.5;
export const RICH_MULCH_MULTIPLIER = 2;
export const SURPRISE_MULCH_MULTIPLIER = 1.5;
export const AMAZE_MULCH_GROWTH_MULTIPLIER = 1.25;
export const AMAZE_MULCH_PRODUCE_MULTIPLIER = 1.5;
export const AMAZE_MULCH_MUTATE_MULTIPLIER = 1.25;

export const WANDER_RATE = 0.0005;

export const BerryColor = [
    '#EE8130', // Red
    '#A33EA1', // Purple
    '#D685AD', // Pink
    '#7AC74C', // Green
    '#F7D02C', // Yellow
    '#6390F0', // Blue
    '#B7B7CE', // Hinted
    '#1C1C1C', // Locked
];

// Dungeons
export const DUNGEON_SIZE = 5;
export const DUNGEON_CHEST_SHOW = 2;
export const DUNGEON_MAP_SHOW = 4;

// Achievements
export enum AchievementOption {
    less,
    equal,
    more,
}

export enum AchievementType {
    'None' = -1,
    'Money' = 0,
    'Token' = 1,
    'Attack' = 2,
    'Diamond' = 3,
    'Underground Items Found' = 4,
    'Underground Layers Mined' = 5,
    'Max Level Oak Item' = 6,
    'Captured' = 7,
    'Defeated' = 8,
    'Caught Pokemon' = 9,
    'Caught Unique Pokemons By Region' = 10,
    'Shiny Pokemon' = 11,
    'Hatch' = 12,
    'Pokeball' = 13,
    'Click' = 14,
    'Route Kill' = 15,
    'Clear Gym' = 16,
    'Clear Dungeon' = 17,
}

export enum DungeonTile {
    empty,
    entrance,
    enemy,
    chest,
    boss,
}

// Held item chance
export const ROUTE_HELD_ITEM_MODIFIER = 1;
export const DUNGEON_HELD_ITEM_MODIFIER = ROUTE_HELD_ITEM_MODIFIER * 4;
export const DUNGEON_BOSS_HELD_ITEM_MODIFIER = DUNGEON_HELD_ITEM_MODIFIER * 1.5;
export const HELD_ITEM_CHANCE = 512;
export const HELD_UNDERGROUND_ITEM_CHANCE = 2048;

// Shards from battle
export const DUNGEON_SHARDS = 3;
export const DUNGEON_BOSS_SHARDS = 20;
export const GYM_SHARDS = 5;

export const SAFARI_BATTLE_CHANCE = 5;

export const SAFARI_BASE_POKEBALL_COUNT = 30;

export const LEGAL_WALK_BLOCKS = [
    0,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
];

export const SAFARI_OUT_OF_BALLS = 'Game Over!<br>You have run out of safari balls to use.';

// Quests

// Numbers calculated by Dimava assumes ability to 1 shot on high routes and some use oak items,
//   which are now nerfed slightly until upgraded, so those numbers may need further adjusting
const questBase = 1; // change this to scale all quest points
export const GAIN_MONEY_BASE_REWARD = questBase * 0.0017;
export const HATCH_EGGS_BASE_REWARD = questBase * 33;
export const SHINY_BASE_REWARD = questBase * 3000;

export const DEFEAT_POKEMONS_BASE_REWARD = questBase * 1;

// Defeat reward divided by chance to catch (guessed)
export const CAPTURE_POKEMONS_BASE_REWARD = DEFEAT_POKEMONS_BASE_REWARD / 0.8;

// <route number> tokens gained for every capture
export const GAIN_TOKENS_BASE_REWARD = CAPTURE_POKEMONS_BASE_REWARD / 13;

// Average of 1/4 squares revealed = 75 energy ~ 12 minutes ~ 720 pokemons
export const MINE_LAYERS_BASE_REWARD = questBase * 720;
export const MINE_ITEMS_BASE_REWARD = questBase * 210;

// not balanced at all for some oak items
export const USE_OAK_ITEM_BASE_REWARD = DEFEAT_POKEMONS_BASE_REWARD;

export const ACTIVE_QUEST_MULTIPLIER = 4;

// Some active quests may be quicker if passive pokemon attack is used instead of active clicking
// This number is used to estimate time taken in terms of clicks, for reward calculation
export const QUEST_CLICKS_PER_SECOND = 5;

export const QUESTS_PER_SET = 10;

/**
 * idle: The game is not doing anything, the battle view isn't shown
 * paused: The battle view is shown, but there are no game ticks
 * fighting: On a route and battling a pokemon
 * gym: Battling a gym
 * dungeon: Exploring a dungeon
 * safari: Exploring the safari zone
 * town: In a town/pre-dungeon, town view is not shown
 */
export enum GameState {
    idle = 0,
    paused = 1,
    fighting = 2,
    gym = 3,
    dungeon = 4,
    safari = 5,
    town = 6,
    shop = 7,
    battleFrontier = 8,
}

export enum Pokeball {
    'None' = -1,
    'Pokeball' = 0,
    'Greatball',
    'Ultraball',
    'Masterball',
    'Fastball',
    'Quickball',
    'Timerball',
    'Duskball',
    'Luxuryball',
}

export enum Currency {
    money,
    questPoint,
    dungeonToken,
    diamond,
    farmPoint,
    battlePoint,
}

export enum TypeEffectiveness {
    Immune,
    NotVery,
    Normal,
    Very,
}

export enum TypeEffectivenessValue {
    Immune = 0,
    NotVery = 0.5,
    Normal = 1,
    Very = 2,
}

export function cleanHTMLString(str: string): string {
    return str.replace(/([|&;$%@"<>()+,])/g, (c: string) => `&#${c.charCodeAt(0)};`);
}

export function humanifyString(str: string): string {
    return str.replace(/[_-]+/g, ' ');
}

export function camelCaseToString(str: string): string {
    return str.replace(/[\s_-]?([A-Z])/g, ' $1').replace(/\b\w/g, (w) => (w.replace(/\w/, (c) => c.toUpperCase()))).trim();
}

export function formatDate(date: Date): string {
    return date.toISOString().replace(/T/, ' ').replace(/.\d+Z/, '');
}

export function formatTime(input: number | Date): string {
    if (input === 0) { return 'Ready'; }

    const time = parseInt(`${input}`, 10); // don't forget the second param
    const hours: any = `${Math.floor(time / 3600)}`.padStart(2, '0');
    const minutes: any = `${Math.floor((time - (hours * 3600)) / 60)}`.padStart(2, '0');
    const seconds: any = `${time - (hours * 3600) - (minutes * 60)}`.padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

export function formatTimeFullLetters(input: number): string {
    // Temporarily recast to number until everything is in modules
    if (Number.isNaN(Number(input)) || input === 0) { return '-'; }
    let time = Math.abs(input * 1000);
    const times = [];

    if (time >= WEEK) {
        const weeks = Math.floor(time / WEEK);
        times.push(`${weeks}w`.padStart(3, '0'));
        time %= WEEK;
    }
    if (time >= DAY || times.length) {
        const days = Math.floor(time / DAY);
        times.push(`${days}d`.padStart(3, '0'));
        time %= DAY;
    }
    if (time >= HOUR || times.length) {
        const hours = Math.floor(time / HOUR);
        times.push(`${hours}h`.padStart(3, '0'));
        time %= HOUR;
    }
    if (time >= MINUTE || times.length) {
        const minutes = Math.floor(time / MINUTE);
        times.push(`${minutes}m`.padStart(3, '0'));
        time %= MINUTE;
    }
    if (time >= SECOND || times.length) {
        const seconds = Math.floor(time / SECOND);
        times.push(`${seconds}s`.padStart(3, '0'));
    }
    return times.slice(0, 3).join(' ');
}

export function formatTimeShortWords(input: number): string {
    // Temporarily recast to number until everything is in modules
    if (Number.isNaN(Number(input)) || input === 0) { return 'now'; }
    const time = Math.abs(input);

    if (time > DAY) {
        const days = Math.ceil(time / DAY);
        return `${time % DAY ? '< ' : ''}${days} day${days === 1 ? '' : 's'}`;
    }
    if (time > HOUR) {
        const hours = Math.ceil(time / HOUR);
        return `${time % HOUR ? '< ' : ''}${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const minutes = Math.ceil(time / MINUTE);
    return `${time % MINUTE ? '< ' : ''}${minutes} min${minutes === 1 ? '' : 's'}`;
}

export function formatSecondsToTime(input: number): string {
    // Temporarily recast to number until everything is in modules
    if (Number.isNaN(Number(input)) || input === 0) { return '-'; }
    let time = Math.abs(input * 1000);
    const times = [];

    if (time >= WEEK) {
        const weeks = Math.floor(time / WEEK);
        times.push(`${weeks} week${weeks === 1 ? '' : 's'}`);
        time %= WEEK;
    }
    if (time >= DAY) {
        const days = Math.floor(time / DAY);
        times.push(`${days} day${days === 1 ? '' : 's'}`);
        time %= DAY;
    }
    if (time >= HOUR) {
        const hours = Math.floor(time / HOUR);
        times.push(`${hours} hour${hours === 1 ? '' : 's'}`);
        time %= HOUR;
    }
    if (time >= MINUTE) {
        const minutes = Math.floor(time / MINUTE);
        times.push(`${minutes} min${minutes === 1 ? '' : 's'}`);
        time %= MINUTE;
    }
    if (time >= SECOND) {
        const seconds = Math.floor(time / SECOND);
        times.push(`${seconds} sec${seconds === 1 ? '' : 's'}`);
    }
    return times.join('</br>');
}

export function formatNumber(input: number): string {
    let num = Number(input); // Temporary cast until everything is in modules
    if (Number.isNaN(+num)) { return '0'; }

    if (num >= 1e9) {
        num = Math.floor(num / 1e8);
        num = num < 100 ? num / 10 : Math.floor(num / 10);
        return `${num}B`;
    }

    if (num >= 1e6) {
        num = Math.floor(num / 1e5);
        num = num < 100 ? num / 10 : Math.floor(num / 10);
        return `${num}M`;
    }

    if (num >= 1e3) {
        num = Math.floor(num / 1e2);
        num = num < 100 ? num / 10 : Math.floor(num / 10);
        return `${num}K`;
    }

    return num.toString();
}

export enum Region {
    none = -1,
    kanto = 0,
    johto = 1,
    hoenn = 2,
    sinnoh = 3,
    unova = 4,
    kalos = 5,
    alola = 6,
    galar = 7,
    // TODO: figure out a better way to handle DLC/non main regions
    armor = 8,
    crown = 9,
}

export function randomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomElement(array: any[]): any {
    return array[randomIntBetween(0, array.length - 1)];
}

export function clipNumber(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

// Return a random element from the array, with an exponential distribution
// The last element has a 1/ratio chance of being chosen, one before last is 1/(ratio^2), etc
// The logarithm is clipped up to 0, so the first two elements will have equal chance
export function expRandomElement<T>(array: T[], ratio: number): T {
    const r = Math.random();
    const logr = Math.log(r) / Math.log(ratio);
    const n = Math.floor(logr + array.length);
    const x = clipNumber(n, 0, array.length - 1);
    return array[x];
}

export const TypeColor = [
    '#A8A77A', // Normal
    '#EE8130', // Fire
    '#6390F0', // Water
    '#F7D02C', // Electric
    '#7AC74C', // Grass
    '#96D9D6', // Ice
    '#C22E28', // Fighting
    '#A33EA1', // Poison
    '#E2BF65', // Ground
    '#A98FF3', // Flying
    '#F95587', // Psychic
    '#A6B91A', // Bug
    '#B6A136', // Rock
    '#735797', // Ghost
    '#6F35FC', // Dragon
    '#705746', // Dark
    '#B7B7CE', // Steel
    '#D685AD', // Fairy
];

export const ROUTE_KILLS_NEEDED = 10;

export type EnvironmentData = Partial<Record<Region, Set<string | number>>>;
export const Environments: Record<string, EnvironmentData> = {
    Water: {
        [Region.kanto]: new Set(['Cerulean City', 19, 20, 21, 24]),
        [Region.johto]: new Set([40, 41, 'Slowpoke Well']),
        [Region.hoenn]: new Set([105, 106, 107, 108, 109, 118, 122, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134]),
        [Region.sinnoh]: new Set([218, 219, 220, 223, 230, 'Lake Verity', 'Lake Valor', 'Pastoria City']),
        [Region.unova]: new Set([17, 18, 21, 24, 'Undella Town', 'Humilau City', 'Plasma Frigate']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Hulbury', 5, 6, 8, 9, 19, 21]),
    },

    Ice: {
        [Region.kanto]: new Set(['Seafoam Islands']),
        [Region.johto]: new Set(['Mahogany Town', 'Ice Path']),
        [Region.hoenn]: new Set(['Shoal Cave', 'Sootopolis City']),
        [Region.sinnoh]: new Set([216, 217, 'Lake Acuity', 'Snowpoint City']),
        [Region.unova]: new Set(['Giant Chasm', 'Plasma Assault']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Circhester', 20, 23, 24]),
    },

    Forest: {
        [Region.kanto]: new Set([25, 'Fuchsia City', 'Viridian Forest']),
        [Region.johto]: new Set([36, 38, 43, 'Azalea Town', 'Ilex Forest']),
        [Region.hoenn]: new Set([119, 'Petalburg Woods']),
        [Region.sinnoh]: new Set([201, 204, 'Eterna Forest', 'Eterna City', 'Fullmoon Island', 'Newmoon Island']),
        [Region.unova]: new Set([6, 'Lostlorn Forest', 'Pinwheel Forest', 'Pledge Grove', 'Floccesy Town']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Slumbering Weald', 'Inner Slumbering Weald', 'Glimwood Tangle', 'Ballonlea', 4]),
    },

    Cave: {
        [Region.kanto]: new Set(['Pewter City', 'Digletts Cave', 'Mt. Moon', 'Rock Tunnel', 'Victory Road']),
        [Region.johto]: new Set(['Cianwood City', 'Ruins of Alph', 'Union Cave', 'Mt Mortar', 'Dark Cave']),
        [Region.hoenn]: new Set(['Rustboro City', 'Dewford Town', 'Rusturf Tunnel', 'Granite Cave', 'New Mauville', 'Meteor Falls', 'Victory Road Hoenn', 'Seafloor Cavern']),
        [Region.sinnoh]: new Set(['Oreburgh Gate', 'Oreburgh City', 'Ravaged Path', 'Wayward Cave', 'Mt. Coronet South', 'Iron Island', 'Mt. Coronet North', 'Victory Road Sinnoh']),
        [Region.unova]: new Set(['Seaside Cave', 'Twist Mountain', 'Reversal Mountain', 'Relic Passage', 'Relic Castle', 'Victory Road Unova']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Watchtower Ruins']),
    },

    GemCave: {
        [Region.kanto]: new Set(['Viridian City', 'Cerulean Cave']),
        [Region.johto]: new Set(['Blackthorn City', 'Mt Silver', 'Whirl Islands']),
        [Region.hoenn]: new Set(['Cave of Origin', 'Sky Pillar', 'Sealed Chamber']),
        [Region.sinnoh]: new Set(['Spear Pillar', 'Hall of Origin', 'Stark Mountain']),
        [Region.unova]: new Set(['Chargestone Cave', 'Mistralton Cave', 'Cave of Being']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Galar Mine', 'Galar Mine No. 2']),
    },

    PowerPlant: {
        [Region.kanto]: new Set(['Vermilion City', 'Power Plant']),
        [Region.johto]: new Set(['Tin Tower']),
        [Region.hoenn]: new Set(['Mauville City']),
        [Region.sinnoh]: new Set(['Sunyshore City']),
        [Region.unova]: new Set(['Castelia Sewers', 'Virbank City', 'Nimbasa City']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Motostoke', 'Spikemuth']),
    },

    Mansion: {
        [Region.kanto]: new Set(['Cinnabar Island', 'Pokemon Mansion']),
        [Region.johto]: new Set(['Olivine City', 'Burned Tower']),
        [Region.hoenn]: new Set(['Lavaridge Town', 'Petalburg City', 'Jagged Pass', 'Fiery Path', 'Mt. Chimney']),
        [Region.sinnoh]: new Set(['Old Chateau', 'Veilstone City', 'Canalave City', 'Snowpoint Temple']),
        [Region.unova]: new Set(['Castelia City', 'Liberty Garden', 'Dreamyard', 'Mistralton City', 'Opelucid City']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(['Rose Tower', 'Hammerlocke', 'Stow-on-Side']),
    },

    Graveyard: {
        [Region.kanto]: new Set(['Saffron City', 'Pokemon Tower']),
        [Region.johto]: new Set(['Ecruteak City']),
        [Region.hoenn]: new Set(['Mossdeep City', 'Mt. Pyre']),
        [Region.sinnoh]: new Set(['Hearthome City', 'Solaceon Ruins', 'Distortion World']),
        [Region.unova]: new Set(['Celestial Tower']),
        [Region.kalos]: new Set(),
        [Region.alola]: new Set(),
        [Region.galar]: new Set(),
    },
};

export type Environment = keyof typeof Environments;

export const EnvironmentCssClass: Record<Environment, string> = {
    Water: 'water',
    Ice: 'ice',
    Forest: 'forest',
    Cave: 'cave',
    GemCave: 'cave-gem',
    PowerPlant: 'power-plant',
    Mansion: 'mansion',
    Graveyard: 'graveyard',
};

export enum Starter {
    'None' = -1,
    'Bulbasaur' = 0,
    'Charmander' = 1,
    'Squirtle' = 2,
    'Pikachu' = 3,
}

export enum StoneType {
    'None' = -1,
    'Fire_stone',
    'Water_stone',
    'Thunder_stone',
    'Leaf_stone',
    'Moon_stone',
    'Sun_stone',
    'Trade_stone',
    'Dragon_scale',
    'Metal_coat',
    'Kings_rock',
    'Upgrade',
    'Soothe_bell',
    'Deepsea_tooth',
    'Deepsea_scale',
    'Dawn_stone',
    'Dusk_stone',
    'Shiny_stone',
    'Dubious_disc',
    'Electirizer',
    'Magmarizer',
    'Protector',
    'Reaper_cloth',
    'Razor_claw',
    'Razor_fang',
    'Prism_scale',
    'Sachet',
    'Whipped_dream',
    'Ice_stone',
}

export enum BattleItemType {
    'xAttack' = 'xAttack',
    'xClick' = 'xClick',
    'Lucky_egg' = 'Lucky_egg',
    'Token_collector' = 'Token_collector',
    'Item_magnet' = 'Item_magnet',
    'Lucky_incense' = 'Lucky_incense',
}

export enum PokemonItemType {
    'Eevee',
    'Porygon',
    'Jynx',
    'Mr. Mime',
    'Lickitung',
    'Togepi',
    'Beldum',
    'Skorupi',
    'Combee',
    'Burmy (plant)',
    'Spiritomb',
    'Cherubi',
    'Zorua',
    'Meloetta (pirouette)',
    'Type: Null',
    'Poipole',
    'Toxel',
    'Eternatus',
    'Slowpoke (Galar)',
}

export enum PokeBlockColor {
    Black,
    Red,
    Gold,
    Purple,
    Gray,
    White,
}

export enum VitaminType {
    Protein,
    RareCandy,
}

export enum EnergyRestoreSize {
    SmallRestore,
    MediumRestore,
    LargeRestore,
}

export enum EggItemType {
    'Fire_egg',
    'Water_egg',
    'Grass_egg',
    'Fighting_egg',
    'Electric_egg',
    'Dragon_egg',
    'Pokemon_egg',
    'Mystery_egg',
}

export const EnergyRestoreEffect = {
    SmallRestore: 0.1,
    MediumRestore: 0.2,
    LargeRestore: 0.5,
};

export const KeyCodeToDirection = {
    ArrowUp: 'up',
    ArrowLeft: 'left',
    ArrowDown: 'down',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyA: 'left',
    KeyS: 'down',
    KeyD: 'right',
};

export const FossilToPokemon = {
    'Helix Fossil': 'Omanyte',
    'Dome Fossil': 'Kabuto',
    'Old Amber': 'Aerodactyl',
    'Root Fossil': 'Lileep',
    'Claw Fossil': 'Anorith',
    'Armor Fossil': 'Shieldon',
    'Skull Fossil': 'Cranidos',
    'Cover Fossil': 'Tirtouga',
    'Plume Fossil': 'Archen',
    'Jaw Fossil': 'Tyrunt',
    'Sail Fossil': 'Amaura',
};

// Used for image name
export const PokemonToFossil = {
    Omanyte: 'Helix Fossil',
    Kabuto: 'Dome Fossil',
    Aerodactyl: 'Old Amber',
    Lileep: 'Root Fossil',
    Anorith: 'Claw Fossil',
    Shieldon: 'Armor Fossil',
    Cranidos: 'Skull Fossil',
    Tirtouga: 'Cover Fossil',
    Archen: 'Plume Fossil',
    Tyrunt: 'Jaw Fossil',
    Amaura: 'Sail Fossil',
};

// For random quest, name matches entry in gymList (created in Gym.ts)
export const KantoGyms = [
    'Pewter City',
    'Cerulean City',
    'Vermilion City',
    'Celadon City',
    'Saffron City',
    'Fuchsia City',
    'Cinnabar Island',
    'Viridian City',
    'Elite Lorelei',
    'Elite Bruno',
    'Elite Agatha',
    'Elite Lance',
    'Champion Blue',
    'Pallet Town',
];

export const JohtoGyms = [
    'Violet City',
    'Azalea Town',
    'Goldenrod City',
    'Ecruteak City',
    'Cianwood City',
    'Olivine City',
    'Mahogany Town',
    'Blackthorn City',
    'Elite Will',
    'Elite Koga',
    'Elite Bruno2',
    'Elite Karen',
    'Champion Lance',
    'Cherrygrove City',
];

export const HoennGyms = [
    'Rustboro City',
    'Dewford Town',
    'Mauville City',
    'Lavaridge Town',
    'Petalburg City',
    'Fortree City',
    'Mossdeep City',
    'Sootopolis City',
    'Elite Sidney',
    'Elite Phoebe',
    'Elite Glacia',
    'Elite Drake',
    'Champion Wallace',
    'Lilycove City',
];

export const SinnohGyms = [
    'Oreburgh City',
    'Eterna City',
    'Hearthome City',
    'Veilstone City',
    'Pastoria City',
    'Canalave City',
    'Snowpoint City',
    'Sunyshore City',
    'Elite Aaron',
    'Elite Bertha',
    'Elite Flint',
    'Elite Lucian',
    'Champion Cynthia',
    'Survival Area',
];

export const UnovaGyms = [
    'Aspertia City',
    'Virbank City',
    'Castelia City',
    'Nimbasa City',
    'Driftveil City',
    'Mistralton City',
    'Opelucid City',
    'Humilau City',
    'Elite Shauntal',
    'Elite Marshal',
    'Elite Grimsley',
    'Elite Caitlin',
    'Champion Iris',
    'Icirrus City',
];

export const KalosGyms = [
    'Santalune City',
    'Cyllage City',
    'Shalour City',
    'Coumarine City',
    'Lumiose City',
    'Laverre City',
    'Anistar City',
    'Snowbelle City',
    'Elite Malva',
    'Elite Siebold',
    'Elite Wikstrom',
    'Elite Drasna',
    'Champion Diantha',
    'Kiloude City',
];

export const AlolaGyms = [
    'Iki Town',
    'Konikoni City',
    'Aether Paradise',
    'Malie City',
    'Altar of the Sunne and Moone',
    'Seafolk Village',
    'Exeggutor Island',
    'Elite Molayne',
    'Elite Olivia',
    'Elite Acerola',
    'Elite Kahili',
    'Champion Hao',
];

export const GalarGyms = [
    'Turffield',
    'Hulbury',
    'Motostoke',
    'Stow-On-Side',
    'Ballonlea',
    'Circhester',
    'Spikemuth',
    'Hammerlocke',
    'Trainer Marnie',
    'Trainer Hop',
    'Trainer Bede',
    'Champion Leon',
];

export const RegionGyms = [
    KantoGyms,
    JohtoGyms,
    HoennGyms,
    SinnohGyms,
    UnovaGyms,
    KalosGyms,
    AlolaGyms,
    GalarGyms,
];

export function getGymIndex(gym: string): number {
    return RegionGyms.flat().findIndex((g) => g === gym);
}

export function getGymRegion(gym: string): Region {
    return RegionGyms.findIndex((gyms) => gyms.find((g) => g === gym));
}

export const KantoDungeons = [
    'Viridian Forest',
    'Digletts Cave',
    'Mt. Moon',
    'Rock Tunnel',
    'Power Plant',
    'Pokemon Tower',
    'Seafoam Islands',
    'Pokemon Mansion',
    'Victory Road',
    'Cerulean Cave',
];

export const JohtoDungeons = [
    'Sprout Tower',
    'Ruins of Alph',
    'Union Cave',
    'Slowpoke Well',
    'Ilex Forest',
    'Burned Tower',
    'Tin Tower',
    'Whirl Islands',
    'Mt Mortar',
    'Ice Path',
    'Dark Cave',
    'Mt Silver',
];

export const HoennDungeons = [
    'Petalburg Woods',
    'Rusturf Tunnel',
    'Granite Cave',
    'Jagged Pass',
    'Fiery Path',
    'Mt. Chimney',
    'Meteor Falls',
    'Weather Institute',
    'Mt. Pyre',
    'New Mauville',
    'Magma Hideout',
    'Aqua Hideout',
    'Shoal Cave',
    'Seafloor Cavern',
    'Sealed Chamber',
    'Cave of Origin',
    'Sky Pillar',
    'Victory Road Hoenn',
    // These aren't implemented anywhere yet
    /*
    "Island Cave",
    "Desert Ruins",
    "Scorched Slab",
    "Ancient Tomb",
    "Artisan Cave",
    "Desert Underpass",
    "Marine Cave",
    "Terra Cave",
    "Southern Island",
    "Faraway Island",
    "Birth Island",
    "Devon Corporation",
    "Oceanic Museum",
    "Mirage Tower",
    "Safari Zone",
    "Mirage Island",
    "Battle Tower",
    "Trainer Hill",
    "Abandoned Ship",
    "Battle Maison",
    "Battle Resort",
    "Mirage Spots",
    */
];

export const SinnohDungeons = [
    'Oreburgh Gate',
    'Ravaged Path',
    'Eterna Forest',
    'Old Chateau',
    'Wayward Cave',
    'Mt. Coronet South',
    'Solaceon Ruins',
    'Iron Island',
    'Mt. Coronet North',
    'Lake Verity',
    'Lake Valor',
    'Lake Acuity',
    'Distortion World',
    'Victory Road Sinnoh',
    'Spear Pillar',
    'Fullmoon Island',
    'Newmoon Island',
    'Flower Paradise',
    'Snowpoint Temple',
    'Stark Mountain',
    'Hall of Origin',
];

export const UnovaDungeons = [
    'Pledge Grove',
    'Floccesy Ranch',
    'Liberty Garden',
    'Castelia Sewers',
    'Relic Passage',
    'Relic Castle',
    'Lostlorn Forest',
    'Chargestone Cave',
    'Mistralton Cave',
    'Celestial Tower',
    'Reversal Mountain',
    'Team Plasma Assault',
    'Seaside Cave',
    'Plasma Frigate',
    'Giant Chasm',
    'Abundant Shrine',
    'Cave of Being', // Contains gen 4 trio only
    'Victory Road Unova',
    'Twist Mountain',
    'Dragonspiral Tower',
    'Moor of Icirrus',
    'Pinwheel Forest',
    'Dreamyard',
    'P2 Laboratory',
];

export const KalosDungeons = [
    'Santalune Forest',
    'Parfum Palace',
    'Connecting Cave',
    'Glittering Cave',
    'Reflection Cave',
    // 'Tower of Mastery',
    'Sea Spirit\'s Den',
    'Kalos Power Plant',
    'Pokéball Factory',
    'Lost Hotel',
    'Frost Cavern',
    'Team Flare Secret HQ',
    'Terminus Cave',
    'Pokémon Village',
    'Victory Road Kalos',
    // 'Unknown Dungeon',
];

export const AlolaDungeons = [
    'Exeggutor Island Hill',
    'Trainers\' School',
    'Hau\'oli Cemetery',
    'Verdant Cavern',
    'Melemele Meadow',
    'Seaward Cave',
    'Ten Carat Hill',
    'Ruins of Conflict',
    'Pikachu Valley',
    'Paniola Ranch',
    'Brooklet Hill',
    'Wela Volcano Park',
    'Lush Jungle',
    'Diglett\'s Tunnel',
    'Memorial Hill',
    'Ruins of Life',
    'Malie Garden',
    'Hokulani Observatory',
    'Thrifty Megamart',
    'Ula\'ula Meadow',
    'Po Town',
    'Mount Lanikala',
    'Ruins of Abundance',
    'Vast Poni Canyon',
    'Nebby',
    'Ruins of Hope',
    'Poni Meadow',
    'Resolution Cave',
];

export const GalarDungeons = [
    'Slumbering Weald',
    'Inner Slumbering Weald',
    'Galar Mine',
    'Galar Mine No. 2',
    'Glimwood Tangle',
    'Rose Tower',
    'Watchtower Ruins',
    'Dusty Bowl',
    'Lake of Outrage',
];

export const RegionDungeons = [
    KantoDungeons,
    JohtoDungeons,
    HoennDungeons,
    SinnohDungeons,
    UnovaDungeons,
    KalosDungeons,
    AlolaDungeons,
    GalarDungeons,
];

export function getDungeonIndex(dungeon: string): number {
    return RegionDungeons.flat().findIndex((d) => d === dungeon);
}

export function getDungeonRegion(dungeon: string): Region {
    return RegionDungeons.findIndex((dungeons) => dungeons.find((d) => d === dungeon));
}

export const StartingTowns = [
    'Pallet Town', // Kanto
    'New Bark Town', // Johto
    'Littleroot Town', // Hoenn
    'Twinleaf Town', // Sinnoh
    'Aspertia City', // Unova
    'Vaniville Town', // Kalos
    'Iki Town', // Alola
    'Postwick', // Galar
];

export const DockTowns = [
    'Vermilion City', // Kanto
    'Olivine City', // Johto
    'Slateport City', // Hoenn
    'Canalave City', // Sinnoh
    'Castelia City', // Unova
    'Coumarine City', // Kalos
    'Hau\'oli City', // Alola
    'Hulbury', // Galar
];
