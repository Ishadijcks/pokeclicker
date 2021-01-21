/**
 * If you are attempting to modify a GameConstant, please update
 * `./src/modules/GameConstants.ts` instead. If you add or remove a constant,
 * please ensure you add a matching type declaration in here.
 *
 * This file is temporary while code is ported to TypeScript modules. Due to
 * differences between how namespaces and modules work, it is easiest if we
 * have the namespace manually defined to ensure we don't need to implement
 * as many changes or hacks during migration.
 *
 * In order to avoid assigning values in this file, we let the constant assume
 * that numeric enums increment, and we define every string-typed enum an
 * empty string '' value so that the types pass.
 */

namespace GameConstants {
    declare const TICK_TIME: number;
    declare const BATTLE_TICK: number;
    declare const BATTLE_FRONTIER_TICK: number;
    declare const UNDERGROUND_TICK: number;
    declare const DUNGEON_TIME: number;
    declare const DUNGEON_TICK: number;
    declare const EFFECT_ENGINE_TICK: number;
    declare const SAVE_TICK: number;
    declare const GYM_TIME: number;
    declare const GYM_COUNTDOWN: number;
    declare const GYM_TICK: number;
    declare const ACHIEVEMENT_TICK: number;
    declare const MIN_LOAD_TIME: number;
    declare const MAX_LOAD_TIME: number;
    declare const MUTATION_TICK: number;
    declare const WANDER_TICK: number;
    declare const MAX_AVAILABLE_REGION: number;
    declare const TotalPokemonsPerRegion: number[];
    declare const ITEM_USE_TIME: number;
    declare const SECOND: number;
    declare const MINUTE: number;
    declare const HOUR: number;
    declare const DAY: number;
    declare const ROAMING_MIN_CHANCE: number;
    declare const ROAMING_MAX_CHANCE: number;
    declare const SHINY_CHANCE_BATTLE: number;
    declare const SHINY_CHANCE_DUNGEON: number;
    declare const SHINY_CHANCE_SHOP: number;
    declare const SHINY_CHANCE_STONE: number;
    declare const SHINY_CHANCE_SAFARI: number;
    declare const SHINY_CHANCE_BREEDING: number;
    declare const SHINY_CHANCE_FARM: number;
    declare const SHINY_CHANCE_FOSSIL: number;
    declare const ITEM_PRICE_MULTIPLIER: number;
    declare const ITEM_PRICE_DEDUCT: number;
    declare const PLATE_VALUE: number;
    declare const BREEDING_ATTACK_BONUS: number;
    declare const BerryDistribution: number[];
    declare const MULCH_USE_TIME: number;
    declare const BOOST_MULCH_MULTIPLIER: number;
    declare const RICH_MULCH_MULTIPLIER: number;
    declare const SURPRISE_MULCH_MULTIPLIER: number;
    declare const AMAZE_MULCH_GROWTH_MULTIPLIER: number;
    declare const AMAZE_MULCH_PRODUCE_MULTIPLIER: number;
    declare const AMAZE_MULCH_MUTATE_MULTIPLIER: number;
    declare const WANDER_RATE: number;
    declare const BerryColor: string[];
    declare const DUNGEON_SIZE: number;
    declare const DUNGEON_CHEST_SHOW: number;
    declare const DUNGEON_MAP_SHOW: number;
    declare enum AchievementOption {
        less,
        equal,
        more,
    }

    declare enum AchievementType {
        'None',
        'Money',
        'Token',
        'Attack',
        'Diamond',
        'Underground Items Found',
        'Underground Layers Mined',
        'Max Level Oak Item',
        'Captured',
        'Defeated',
        'Caught Pokemon',
        'Caught Unique Pokemons By Region',
        'Shiny Pokemon',
        'Hatch',
        'Pokeball',
        'Click',
        'Route Kill',
        'Clear Gym',
        'Clear Dungeon',
    }
    declare enum DungeonTile {
        empty,
        entrance,
        enemy,
        chest,
        boss,
    }
    declare const ROUTE_HELD_ITEM_MODIFIER: number;
    declare const DUNGEON_HELD_ITEM_MODIFIER: number;
    declare const HELD_ITEM_CHANCE: number;
    declare const HELD_UNDERGROUND_ITEM_CHANCE: number;
    declare const DUNGEON_SHARDS: number;
    declare const DUNGEON_BOSS_SHARDS: number;
    declare const GYM_SHARDS: number;
    declare const SAFARI_BATTLE_CHANCE: number;
    declare const SAFARI_BASE_POKEBALL_COUNT: number;
    declare const LEGAL_WALK_BLOCKS: number[];
    declare const SAFARI_OUT_OF_BALLS: string;
    declare const GAIN_MONEY_BASE_REWARD: number;
    declare const HATCH_EGGS_BASE_REWARD: number;
    declare const SHINY_BASE_REWARD: number;
    declare const DEFEAT_POKEMONS_BASE_REWARD: number;
    declare const CAPTURE_POKEMONS_BASE_REWARD: number;
    declare const GAIN_TOKENS_BASE_REWARD: number;
    declare const MINE_LAYERS_BASE_REWARD: number;
    declare const USE_OAK_ITEM_BASE_REWARD: number;
    declare const ACTIVE_QUEST_MULTIPLIER: number;
    declare const QUEST_CLICKS_PER_SECOND: number;
    declare const QuestTypes: string[];
    declare const QUESTS_PER_SET: number;
    declare enum GameState {
        idle,
        paused,
        fighting,
        gym,
        dungeon,
        safari,
        town,
        shop,
        battleFrontier
    }
    declare enum Pokeball {
        'None',
        'Pokeball',
        'Greatball',
        'Ultraball',
        'Masterball',
        'Fastball',
        'Quickball',
        'Timerball',
        'Duskball',
        'Luxuryball',
    }
    declare enum Currency {
        money,
        questPoint,
        dungeonToken,
        diamond,
        farmPoint,
        battlePoint
    }
    declare enum TypeEffectiveness {
        Immune,
        NotVery,
        Normal,
        Very
    }
    declare enum TypeEffectivenessValue {
        Immune,
        NotVery,
        Normal,
        Very
    }
    declare function humanifyString(str: string): string;
    declare function camelCaseToString(str: string): string;
    declare function formatDate(date: Date): string;
    declare function formatTime(input: number | Date): string;
    declare function formatTimeShortWords(input: number): string;
    declare function formatNumber(input: number): string;
    declare enum Region {
        none,
        kanto,
        johto,
        hoenn,
        sinnoh,
        unova,
        kalos,
        alola,
        galar,
        armor,
        crown
    }
    declare function randomIntBetween(min: number, max: number): number;
    declare function randomElement(array: any[]): any;
    declare function clipNumber(num: number, min: number, max: number): number;
    declare function expRandomElement<T>(array: T[], ratio: number): T;
    declare const TypeColor: string[];
    declare const ROUTE_KILLS_NEEDED: number;
    declare type EnvironmentData = Partial<Record<number, Set<string | number>>>
    declare const Environments: {
        Water: EnvironmentData,
        Ice: EnvironmentData,
        Forest: EnvironmentData,
        Cave: EnvironmentData,
        GemCave: EnvironmentData,
        PowerPlant: EnvironmentData,
        Mansion: EnvironmentData,
        Graveyard: EnvironmentData,
    };
    declare type Environment = keyof typeof Environments;
    declare const EnvironmentCssClass:Record<Environment, string>;
    declare enum Starter {
        'None' = '',
        'Bulbasaur',
        'Charmander',
        'Squirtle',
        'Pikachu'
    }
    declare enum StoneType {
        'None',
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
        'Strawberry_sweet',
        'Berry_sweet',
        'Love_sweet',
        'Star_sweet',
        'Clover_sweet',
        'Flower_sweet',
        'Ribbon_sweet',
        'Chipped_pot',
        'Tart_apple',
        'Sweet_apple',
        'Ice_stone',
        'Rusted_sword',
        'Rusted_shield',
        'Galarica_cuff',
        'Galarica_wreath',
        'Lemon_cream',
        'Mint_cream',
        'Matcha_cream',
        'Ruby_cream',
        'Salted_cream',
        'Rainbow_swirl',
        'Caramel_swirl',
        'Ruby_swirl'
    }
    declare enum BattleItemType {
        'xAttack' = '',
        'xClick' = '',
        'Lucky_egg' = '',
        'Token_collector' = '',
        'Item_magnet' = '',
        'Lucky_incense' = ''
    }
    declare enum PokemonItemType {
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
        'Toxel',
        'Eternatus',
        'Slowpoke (Galar)'
    }
    declare enum PokeBlockColor {
        Black,
        Red,
        Gold,
        Purple,
        Gray,
        White
    }
    declare enum VitaminType {
        Protein,
        RareCandy
    }
    declare enum EnergyRestoreSize {
        SmallRestore,
        MediumRestore,
        LargeRestore
    }
    declare enum EggItemType {
        'Fire_egg',
        'Water_egg',
        'Grass_egg',
        'Fighting_egg',
        'Electric_egg',
        'Dragon_egg',
        'Pokemon_egg',
        'Mystery_egg'
    }
    declare const EnergyRestoreEffect: {
        SmallRestore: number;
        MediumRestore: number;
        LargeRestore: number;
    };
    declare const KeyCodeToDirection: {
        ArrowUp: string;
        ArrowLeft: string;
        ArrowDown: string;
        ArrowRight: string;
        KeyW: string;
        KeyA: string;
        KeyS: string;
        KeyD: string;
    };
    declare const FossilToPokemon: {
        'Helix Fossil': string;
        'Dome Fossil': string;
        'Old Amber': string;
        'Root Fossil': string;
        'Claw Fossil': string;
        'Armor Fossil': string;
        'Skull Fossil': string;
        'Cover Fossil': string;
        'Plume Fossil': string;
    };
    declare const PokemonToFossil: {
        Omanyte: string;
        Kabuto: string;
        Aerodactyl: string;
        Lileep: string;
        Anorith: string;
        Shieldon: string;
        Cranidos: string;
        Tirtouga: string;
        Archen: string;
    };
    declare const KantoGyms: string[];
    declare const JohtoGyms: string[];
    declare const HoennGyms: string[];
    declare const SinnohGyms: string[];
    declare const UnovaGyms: string[];
    declare const KalosGyms: string[];
    declare const GalarGyms: string[];
    declare const RegionGyms: string[][];
    declare function getGymIndex(gym: string): number;
    declare const KantoDungeons: string[];
    declare const JohtoDungeons: string[];
    declare const HoennDungeons: string[];
    declare const SinnohDungeons: string[];
    declare const UnovaDungeons: string[];
    declare const KalosDungeons: string[];
    declare const GalarDungeons: string[];
    declare const RegionDungeons: string[][];
    declare function getDungeonIndex(dungeon: string): number;
    declare const StartingTowns: string[];
    declare const DockTowns: string[];
}
