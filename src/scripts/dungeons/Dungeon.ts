/// <reference path="../../declarations/enums/Badges.d.ts"/>
///<reference path="DungeonBossPokemon.ts"/>
///<reference path="../achievements/GymBadgeRequirement.ts"/>
///<reference path="../achievements/MultiRequirement.ts"/>
///<reference path="../achievements/ObtainedPokemonRequirement.ts"/>
///<reference path="./DungeonTrainer.ts"/>
///<reference path="../gym/GymPokemon.ts"/>

interface EnemyOptions {
    weight?: number,
    requirement?: MultiRequirement | OneFromManyRequirement | Requirement,
    reward?: Amount,
}

interface DetailedPokemon {
    pokemon: PokemonNameType,
    options: EnemyOptions
}

type Enemy = PokemonNameType | DetailedPokemon | DungeonTrainer;

type Boss = DungeonBossPokemon | DungeonTrainer;

interface EncounterInfo {
    image: string,
    shiny: boolean,
    hidden: boolean,
    locked: boolean,
    lockMessage: string,
}

/**
 * Gym class.
 */
class Dungeon {

    constructor(
        public name: string,
        public enemyList: Enemy[],
        public itemList: GameConstants.BattleItemType[],
        public baseHealth: number,
        public bossList: Boss[],
        public tokenCost: number,
        public difficultyRoute: number, // Closest route in terms of difficulty, used for egg steps, dungeon tokens etc.
        public level: number
    ) { }

    public isUnlocked(): boolean {
        // Player requires the Dungeon Ticket to access the dungeons
        if (!App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Dungeon_ticket)) {
            Notifier.notify({
                message: 'You need the Dungeon ticket to access dungeons',
                type: NotificationConstants.NotificationOption.danger,
            });
            return false;
        }
        return true;
    }

    /**
     * Finds the possible Bosses in the dungeon
     * @param includeTrainers Whether to include Trainer Bosses. Defaults to true
     * @param ignoreRequirement Whether to check if requirements are met. Defaults to false
     */
    public availableBosses(includeTrainers = true, ignoreRequirement = false): Boss[] {
        // TODO: HLXII - We need this check as this method is called somewhere during initialization when App isn't initialized yet
        // the requirement.isCompleted call can sometimes use the App object, which will cause this to crash
        // Once App is moved to modules, this check might be able to be removed.
        if (!App.game) {
            return [];
        }
        if (includeTrainers) {
            return this.bossList.filter(boss => {
                return (!ignoreRequirement && boss.options?.requirement) ? boss.options.requirement.isCompleted() : true;
            });
        } else {
            return this.bossList.filter(b => {
                if (b instanceof DungeonBossPokemon) {
                    return (!ignoreRequirement && b.options?.requirement) ? b.options.requirement.isCompleted() : true;
                }
                return false;
            }).map(b => <DungeonBossPokemon>b);
        }
    }

    /**
     * Retreives the weights for all the possible bosses
     */
    get bossWeightList(): number[] {
        return this.availableBosses().map((boss) => {
            return boss.options?.weight ?? 1;
        });
    }

    /**
     * Returns the possible enemies in the dungeon.
     * @param ignoreRequirement Whether to check if requirements are met. Defaults to false
     */
    public availableMinions(ignoreRequirement = false): Enemy[] {
        return this.enemyList.filter((enemy) => {
            if (typeof enemy === 'string') {
                return true;
            } else {
                return (!ignoreRequirement && enemy.options?.requirement) ? enemy.options.requirement.isCompleted() : true;
            }
        });
    }

    /**
     * Retreives the weights for all the possible enemies
     */
    get weightList(): number[] {
        return this.availableMinions().map((enemy) => {
            if (typeof enemy === 'string') {
                return 1;
            } else if (enemy.hasOwnProperty('pokemon')) {
                return (<DetailedPokemon>enemy).options.weight ?? 1;
            } else {
                return (<DungeonTrainer>enemy).options?.weight ?? 1;
            }
        });
    }

    /**
     * Returns the possible minion Pokemon in the dungeon.
     * Filters out Trainers and collapses DetailedPokemon
     */
    get pokemonList(): PokemonNameType[] {
        // Filtering out Trainers
        return this.enemyList.filter((enemy) => {
            return !enemy.hasOwnProperty('name');
        }).map((enemy) => {
            // Collapsing DetailedPokemon
            if (typeof enemy === 'string') {
                return enemy;
            } else if (enemy.hasOwnProperty('pokemon')) {
                return (<DetailedPokemon>enemy).pokemon;
            }
        });
    }

    /**
     * Returns the possible boss Pokemon in the dungeon.
     * Filters out Trainers
     */
    get bossPokemonList(): PokemonNameType[] {
        // Filtering out Trainers
        return this.bossList.filter((enemy) => {
            return enemy instanceof DungeonBossPokemon;
        }).map((enemy) => {
            return enemy.name as PokemonNameType;
        });
    }

    /**
     * Gets all possible Pokemon in the dungeon
     */
    get allPokemon(): PokemonNameType[] {
        return this.pokemonList.concat(this.bossPokemonList);
    }

    /**
     * Finds all possible encounters in the Dungeon and their details.
     * Used for generating the Dungeon Encounter view
     */
    get encounterList(): EncounterInfo[] {
        const encounterInfo = [];

        // Handling minions
        this.enemyList.forEach((enemy) => {
            // Handling Pokemon
            if (typeof enemy === 'string' || enemy.hasOwnProperty('pokemon')) {
                let pokemonName: PokemonNameType;
                if (enemy.hasOwnProperty('pokemon')) {
                    pokemonName = (<DetailedPokemon>enemy).pokemon;
                } else {
                    pokemonName = <PokemonNameType>enemy;
                }
                const encounter = {
                    image: `assets/images/${(App.game.party.alreadyCaughtPokemonByName(pokemonName, true) ? 'shiny' : '')}pokemon/${pokemonMap[pokemonName].id}.png`,
                    shiny:  App.game.party.alreadyCaughtPokemonByName(pokemonName, true),
                    hidden: !App.game.party.alreadyCaughtPokemonByName(pokemonName),
                    lock: false,
                    lockMessage: '',
                };
                encounterInfo.push(encounter);
            // Handling Trainers
            } else { /* We don't display minion Trainers */ }
        });

        // Handling Bosses
        this.bossList.forEach((boss) => {
            // Handling Pokemon
            if (boss instanceof DungeonBossPokemon) {
                const pokemonName = boss.name;
                const encounter = {
                    image: `assets/images/${(App.game.party.alreadyCaughtPokemonByName(pokemonName, true) ? 'shiny' : '')}pokemon/${pokemonMap[pokemonName].id}.png`,
                    shiny:  App.game.party.alreadyCaughtPokemonByName(pokemonName, true),
                    hidden: !App.game.party.alreadyCaughtPokemonByName(pokemonName),
                    lock: boss.options?.requirement ? !boss.options?.requirement.isCompleted() : false,
                    lockMessage: boss.options?.requirement ? boss.options?.requirement.hint() : '',
                };
                encounterInfo.push(encounter);
            // Handling Trainer
            } else {
                const encounter = {
                    image: boss.image,
                    shiny:  false,
                    hidden: false,
                    lock: boss.options?.requirement ? !boss.options?.requirement.isCompleted() : false,
                    lockMessage: boss.options?.requirement ? boss.options?.requirement.hint() : '',
                };
                encounterInfo.push(encounter);
            }
        });

        return encounterInfo;
    }
}

/**
 * Data list that contains all dungeons, accessible by name.
 */

const dungeonList: { [dungeonName: string]: Dungeon } = {};

// Kanto Dungeons

dungeonList['Viridian Forest'] = new Dungeon('Viridian Forest',
    [
        {pokemon: 'Caterpie', options: { weight: 2.67 }},
        {pokemon: 'Metapod', options: { weight: 2.67 }},
        {pokemon: 'Weedle', options: { weight: 2.67 }},
        {pokemon: 'Kakuna', options: { weight: 2.67 }},
        {pokemon: 'Pidgey', options: { weight: 2.67 }},
        {pokemon: 'Pidgeotto', options: { weight: 2.67 }},
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Weedle', 50, 6),
                new GymPokemon('Caterpie', 50, 6),
            ], { weight: 1 }, 'Rick'),
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Weedle', 50, 7),
                new GymPokemon('Kakuna', 50, 7),
                new GymPokemon('Weedle', 50, 7),
            ], { weight: 1 }, 'Doug'),
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Caterpie', 50, 7),
                new GymPokemon('Caterpie', 50, 8),
            ], { weight: 1 }, 'Anthony'),
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Metapod', 50, 7),
                new GymPokemon('Caterpie', 50, 7),
                new GymPokemon('Metapod', 50, 7),
            ], { weight: 1 }, 'Charlie'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    102,
    [
        new DungeonBossPokemon('Pikachu', 510, 7),
        new DungeonTrainer('Bug Catcher',
            [new GymPokemon('Weedle', 510, 9)],
            { weight: 1 }, 'Sammy'),
    ],
    50, 1, 5
);

dungeonList['Digletts Cave'] = new Dungeon('Digletts Cave',
    ['Diglett'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_incense],
    1208,
    [new DungeonBossPokemon('Dugtrio', 6040, 31)],
    95, 2, 22
);

dungeonList['Mt. Moon'] = new Dungeon('Mt. Moon',
    [
        {pokemon: 'Sandshrew', options: { weight: 8.8 }},
        {pokemon: 'Clefairy', options: { weight: 8.8 }},
        {pokemon: 'Zubat', options: { weight: 8.8 }},
        {pokemon: 'Paras', options: { weight: 8.8 }},
        {pokemon: 'Geodude', options: { weight: 8.8 }},
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Weedle', 75, 11),
                new GymPokemon('Kakuna', 75, 11),
            ], { weight: 1 }, 'Kent'),
        new DungeonTrainer('Lass',
            [new GymPokemon('Clefairy', 75, 14)],
            { weight: 1 }, 'Iris'),
        new DungeonTrainer('Super Nerd',
            [
                new GymPokemon('Magnemite', 75, 11),
                new GymPokemon('Voltorb', 75, 11),
            ], { weight: 1 }, 'Jovan'),
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Caterpie', 75, 10),
                new GymPokemon('Metapod', 75, 10),
                new GymPokemon('Caterpie', 75, 10),
            ], { weight: 1 }, 'Robby'),
        new DungeonTrainer('Lass',
            [
                new GymPokemon('Oddish', 75, 11),
                new GymPokemon('Bellsprout', 75, 11),
            ], { weight: 1 }, 'Miriam'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Rattata', 75, 10),
                new GymPokemon('Rattata', 75, 10),
                new GymPokemon('Zubat', 75, 10),
            ], { weight: 1 }, 'Josh'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Geodude', 75, 10),
                new GymPokemon('Geodude', 75, 10),
                new GymPokemon('Onix', 75, 10),
            ], { weight: 1 }, 'Marcos'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Sandshrew', 75, 11),
                new GymPokemon('Rattata', 75, 11),
                new GymPokemon('Zubat', 75, 11),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Zubat', 75, 13),
                new GymPokemon('Ekans', 75, 13),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Rattata', 75, 13),
                new GymPokemon('Sandshrew', 75, 13),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Rattata', 75, 13),
                new GymPokemon('Zubat', 75, 13),
            ], { weight: 1 }, undefined, '(male)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Token_collector],
    834,
    [
        new DungeonBossPokemon('Kabuto', 4170, 12, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Mt. Moon'))}),
        new DungeonBossPokemon('Omanyte', 4170, 12, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Mt. Moon'))}),
        new DungeonTrainer('Super Nerd',
            [
                new GymPokemon('Grimer', 2780, 12),
                new GymPokemon('Voltorb', 2780, 12),
                new GymPokemon('Koffing', 2780, 12),
            ], { weight: 1 }, 'Miguel'),
    ],
    75, 4, 10
);

dungeonList['Rock Tunnel'] = new Dungeon('Rock Tunnel',
    [
        {pokemon: 'Zubat', options: { weight: 20 }},
        {pokemon: 'Geodude', options: { weight: 20 }},
        {pokemon: 'Machop', options: { weight: 20 }},
        new DungeonTrainer('PokéManiac',
            [
                new GymPokemon('Cubone', 500, 23),
                new GymPokemon('Slowpoke', 500, 23),
            ], { weight: 1 }, 'Ashton'),
        new DungeonTrainer('PokéManiac',
            [new GymPokemon('Slowpoke', 500, 25)],
            { weight: 1 }, 'Winston'),
        new DungeonTrainer('Picnicker',
            [
                new GymPokemon('Oddish', 500, 22),
                new GymPokemon('Bulbasaur', 500, 22),
            ], { weight: 1 }, 'Martha'),
        new DungeonTrainer('PokéManiac',
            [
                new GymPokemon('Charmander', 500, 22),
                new GymPokemon('Cubone', 500, 22),
            ], { weight: 1 }, 'Steve'),
        new DungeonTrainer('Hiker',
            [new GymPokemon('Geodude', 500, 25)],
            { weight: 1 }, 'Allen'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Machop', 500, 20),
                new GymPokemon('Onix', 500, 20),
            ], { weight: 1 }, 'Eric'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Geodude', 500, 19),
                new GymPokemon('Onix', 500, 19),
                new GymPokemon('Geodude', 500, 19),
                new GymPokemon('Geodude', 500, 19),
            ], { weight: 1 }, 'Lenny'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Onix', 500, 20),
                new GymPokemon('Onix', 500, 20),
                new GymPokemon('Geodude', 500, 20),
            ], { weight: 1 }, 'Oliver'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Geodude', 500, 21),
                new GymPokemon('Graveler', 500, 21),
            ], { weight: 1 }, 'Lucas'),
        new DungeonTrainer('Picnicker',
            [
                new GymPokemon('Jigglypuff', 500, 21),
                new GymPokemon('Pidgey', 500, 21),
                new GymPokemon('Meowth', 500, 21),
            ], { weight: 1 }, 'Sofia'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Geodude', 500, 21),
                new GymPokemon('Geodude', 500, 21),
                new GymPokemon('Graveler', 500, 21),
            ], { weight: 1 }, 'Dudley'),
        new DungeonTrainer('PokéManiac',
            [
                new GymPokemon('Slowpoke', 500, 20),
                new GymPokemon('Slowpoke', 500, 20),
                new GymPokemon('Slowpoke', 500, 20),
            ], { weight: 1 }, 'Cooper'),
        new DungeonTrainer('Picnicker',
            [
                new GymPokemon('Bellsprout', 500, 22),
                new GymPokemon('Clefairy', 500, 22),
            ], { weight: 1 }, 'Leah'),
        new DungeonTrainer('Picnicker',
            [
                new GymPokemon('Meowth', 500, 20),
                new GymPokemon('Oddish', 500, 20),
                new GymPokemon('Pidgey', 500, 20),
            ], { weight: 1 }, 'Dana'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Item_magnet],
    4117,
    [
        new DungeonBossPokemon('Onix', 20585, 17),
        new DungeonTrainer('Picnicker',
            [
                new GymPokemon('Pidgey', 13586, 19),
                new GymPokemon('Rattata', 13586, 19),
                new GymPokemon('Rattata', 13586, 19),
                new GymPokemon('Bellsprout', 13586, 19),
            ], { weight: 1 }, 'Ariana'),
    ],
    500, 5, 15
);

dungeonList['Power Plant'] = new Dungeon('Power Plant',
    ['Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Grimer', 'Muk', 'Voltorb', 'Electrode'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    13507,
    [
        new DungeonBossPokemon('Electabuzz', 67535, 35),
        new DungeonBossPokemon('Zapdos', 101302, 50),
    ],
    1000, 8, 25
);

dungeonList['Pokemon Tower'] = new Dungeon('Pokemon Tower',
    [
        {pokemon: 'Gastly', options: { weight: 21.3 }},
        {pokemon: 'Haunter', options: { weight: 21.3 }},
        {pokemon: 'Cubone', options: { weight: 21.3 }},
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 23)],
            { weight: 1 }, 'Hope'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 22)],
            { weight: 1 }, 'Patricia'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 24)],
            { weight: 1 }, 'Carly'),
        new DungeonTrainer('Channeler',
            [
                new GymPokemon('Gastly', 750, 23),
                new GymPokemon('Gastly', 750, 23),
            ], { weight: 1 }, 'Laurel'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 22)],
            { weight: 1 }, 'Jody'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 24)],
            { weight: 1 }, 'Paula'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 22)],
            { weight: 1 }, 'Ruth'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Haunter', 750, 23)],
            { weight: 1 }, 'Tammy'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Haunter', 750, 24)],
            { weight: 1 }, 'Karina'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 22)],
            { weight: 1 }, 'Janae'),
        new DungeonTrainer('Channeler',
            [
                new GymPokemon('Gastly', 750, 22),
                new GymPokemon('Gastly', 750, 22),
                new GymPokemon('Gastly', 750, 22),
            ], { weight: 1 }, 'Angelica'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 24)],
            { weight: 1 }, 'Jennifer'),
        new DungeonTrainer('Channeler',
            [new GymPokemon('Gastly', 750, 24)],
            { weight: 1 }, 'Emilia'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Zubat', 750, 25),
                new GymPokemon('Zubat', 750, 25),
                new GymPokemon('Golbat', 750, 25),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Koffing', 750, 26),
                new GymPokemon('Drowzee', 750, 26),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Rocket Grunt',
            [
                new GymPokemon('Zubat', 750, 23),
                new GymPokemon('Rattata', 750, 23),
                new GymPokemon('Raticate', 750, 23),
                new GymPokemon('Zubat', 750, 23),
            ], { weight: 1 }, undefined, '(male)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    7523,
    [new DungeonBossPokemon('Marowak', 37615, 30)],
    750, 10, 20
);

dungeonList['Seafoam Islands'] = new Dungeon('Seafoam Islands',
    ['Zubat', 'Golbat', 'Goldeen', 'Poliwag', 'Magikarp', 'Slowpoke', 'Slowbro', 'Tentacool', 'Krabby', 'Kingler', 'Staryu'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_egg],
    17226,
    [
        new DungeonBossPokemon('Seel', 86130, 35),
        new DungeonBossPokemon('Articuno', 129195, 50),
    ],
    1250, 15, 30
);

dungeonList['Pokemon Mansion'] = new Dungeon('Pokemon Mansion',
    [
        {pokemon: 'Rattata', options: { weight: 3.5 }},
        {pokemon: 'Raticate', options: { weight: 3.5 }},
        {pokemon: 'Growlithe', options: { weight: 3.5 }},
        {pokemon: 'Grimer', options: { weight: 3.5 }},
        {pokemon: 'Muk', options: { weight: 3.5 }},
        {pokemon: 'Koffing', options: { weight: 3.5 }},
        {pokemon: 'Weezing', options: { weight: 3.5 }},
        {pokemon: 'Ditto', options: { weight: 3.5 }},
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Ekans', 1500, 33),
                new GymPokemon('Ekans', 1500, 33),
                new GymPokemon('Raticate', 1500, 34),
            ], { weight: 1 }, 'Johnson'),
        new DungeonTrainer('Burglar',
            [
                new GymPokemon('Charmander', 1500, 34),
                new GymPokemon('Charmeleon', 1500, 34),
            ], { weight: 1 }, 'Arnie'),
        new DungeonTrainer('Burglar',
            [new GymPokemon('Ninetales', 1500, 38)],
            { weight: 1 }, 'Simon'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Magnemite', 1500, 33),
                new GymPokemon('Magneton', 1500, 33),
                new GymPokemon('Voltorb', 1500, 33),
            ], { weight: 1 }, 'Braydon', '(male)'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Electrode', 1500, 29),
                new GymPokemon('Weezing', 1500, 29),
            ], { weight: 1 }, 'Ted', '(male)'),
        new DungeonTrainer('Burglar',
            [
                new GymPokemon('Growlithe', 1500, 34),
                new GymPokemon('Ponyta', 1500, 34),
            ], { weight: 1 }, 'Lewis'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Magnemite', 1500, 34),
                new GymPokemon('Electrode', 1500, 34),
            ], { weight: 1 }, 'Ivan', '(male)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Token_collector],
    17760,
    [new DungeonBossPokemon('Magmar', 88800, 40)],
    1500, 16, 35
);

dungeonList['Victory Road'] = new Dungeon('Victory Road',
    [
        {pokemon: 'Zubat', options: { weight: 8.8 }},
        {pokemon: 'Golbat', options: { weight: 8.8 }},
        {pokemon: 'Geodude', options: { weight: 8.8 }},
        {pokemon: 'Graveler', options: { weight: 8.8 }},
        {pokemon: 'Onix', options: { weight: 8.8 }},
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Persian', 2000, 42),
                new GymPokemon('Ponyta', 2000, 42),
                new GymPokemon('Rapidash', 2000, 42),
                new GymPokemon('Vulpix', 2000, 42),
                new GymPokemon('Ninetales', 2000, 42),
            ], { weight: 1 }, 'Naomi', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Raticate', 2000, 42),
                new GymPokemon('Ivysaur', 2000, 42),
                new GymPokemon('Wartortle', 2000, 42),
                new GymPokemon('Charmeleon', 2000, 42),
                new GymPokemon('Charizard', 2000, 42),
            ], { weight: 1 }, 'Rolando', '(male)'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Machoke', 2000, 43),
                new GymPokemon('Machop', 2000, 43),
                new GymPokemon('Machoke', 2000, 43),
            ], { weight: 1 }, 'Daisuke'),
        new DungeonTrainer('Juggler',
            [
                new GymPokemon('Drowzee', 2000, 41),
                new GymPokemon('Hypno', 2000, 41),
                new GymPokemon('Kadabra', 2000, 41),
                new GymPokemon('Kadabra', 2000, 41),
            ], { weight: 1 }, 'Nelson'),
        new DungeonTrainer('Tamer',
            [
                new GymPokemon('Persian', 2000, 44),
                new GymPokemon('Golduck', 2000, 44),
            ], { weight: 1 }, 'Vincent'),
        new DungeonTrainer('Juggler',
            [new GymPokemon('Mr. Mime', 2000, 48)],
            { weight: 1 }, 'Gregory'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Exeggutor', 2000, 42),
                new GymPokemon('Sandslash', 2000, 42),
                new GymPokemon('Cloyster', 2000, 42),
                new GymPokemon('Electrode', 2000, 42),
                new GymPokemon('Arcanine', 2000, 42),
            ], { weight: 1 }, 'George', '(male)'),
        new DungeonTrainer('PokéManiac',
            [
                new GymPokemon('Charmeleon', 2000, 40),
                new GymPokemon('Lapras', 2000, 40),
                new GymPokemon('Lickitung', 2000, 40),
            ], { weight: 1 }, 'Dawson'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Clefairy', 2000, 42),
                new GymPokemon('Jigglypuff', 2000, 42),
                new GymPokemon('Persian', 2000, 42),
                new GymPokemon('Dewgong', 2000, 42),
                new GymPokemon('Chansey', 2000, 42),
            ], { weight: 1 }, 'Alexa', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Kingler', 2000, 41),
                new GymPokemon('Poliwhirl', 2000, 42),
                new GymPokemon('Tentacruel', 2000, 42),
                new GymPokemon('Seadra', 2000, 42),
                new GymPokemon('Blastoise', 2000, 42),
            ], { weight: 1 }, 'Colby', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Bellsprout', 2000, 42),
                new GymPokemon('Weepinbell', 2000, 42),
                new GymPokemon('Victreebel', 2000, 42),
                new GymPokemon('Paras', 2000, 42),
                new GymPokemon('Parasect', 2000, 42),
            ], { weight: 1 }, 'Caroline', '(female)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    24595,
    [
        new DungeonBossPokemon('Machoke', 122975, 42),
        new DungeonBossPokemon('Moltres', 184462, 50),
        new DungeonTrainer('Cool Couple',
            [
                new GymPokemon('Nidoking', 122975, 45),
                new GymPokemon('Nidoqueen', 122975, 45),
            ], { weight: 1 }, 'Ray & Tyra'),
    ],
    2000, 20, 40
);

dungeonList['Cerulean Cave'] = new Dungeon('Cerulean Cave',
    ['Arbok', 'Raichu', 'Sandslash', 'Golbat', 'Gloom', 'Parasect', 'Venomoth', 'Weepinbell', 'Graveler', 'Ditto', 'Chansey', 'Magikarp', 'Poliwag', 'Goldeen', 'Seaking'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    28735,
    [
        new DungeonBossPokemon('Rhydon', 183675, 60),
        new DungeonBossPokemon('Mewtwo', 255512, 100),
    ],
    2500, 20, 55
);

// Johto Dungeons

dungeonList['Sprout Tower'] = new Dungeon('Sprout Tower',
    ['Rattata', 'Gastly', 'Hoothoot'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Item_magnet],
    56735,
    [new DungeonBossPokemon('Bellsprout', 260000, 10)],
    2500, 31, 5
);

dungeonList['Ruins of Alph'] = new Dungeon('Ruins of Alph',
    ['Natu', 'Wooper', 'Quagsire', 'Smeargle', 'Magikarp', 'Poliwag', 'Poliwhirl'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    60600,
    [
        new DungeonBossPokemon('Unown (A)', 280000, 14),
        new DungeonBossPokemon('Unown (F)', 280000, 14),
        new DungeonBossPokemon('Unown (H)', 280000, 14),
        new DungeonBossPokemon('Unown (L)', 280000, 14),
        new DungeonBossPokemon('Unown (N)', 280000, 14),
        new DungeonBossPokemon('Unown (P)', 280000, 14),
        new DungeonBossPokemon('Unown (U)', 280000, 14),
    ],
    3000, 32, 7
);

dungeonList['Union Cave'] = new Dungeon('Union Cave',
    ['Rattata', 'Sandshrew', 'Zubat', 'Geodude', 'Onix', 'Goldeen', 'Magikarp'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    63600,
    [new DungeonBossPokemon('Wooper', 300000, 14)],
    3000, 32, 7
);

dungeonList['Slowpoke Well'] = new Dungeon('Slowpoke Well',
    ['Zubat', 'Slowpoke'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    67900,
    [new DungeonBossPokemon('Slowbro', 320000, 20)],
    3500, 33, 12
);

dungeonList['Ilex Forest'] = new Dungeon('Ilex Forest',
    ['Caterpie', 'Metapod', 'Weedle', 'Kakuna', 'Zubat', 'Oddish', 'Paras', 'Hoothoot'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Token_collector],
    82200,
    [
        new DungeonBossPokemon('Noctowl', 340000, 30),
        new DungeonBossPokemon('Beedrill', 340000, 30),
        new DungeonBossPokemon('Butterfree', 340000, 30),
        new DungeonBossPokemon('Celebi', 800000, 50, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_JohtoChampion)}),
    ],
    4000, 34, 15
);

dungeonList['Burned Tower'] = new Dungeon('Burned Tower',
    ['Rattata', 'Zubat', 'Koffing', 'Raticate'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    88500,
    [new DungeonBossPokemon('Golbat', 360000, 35), new DungeonBossPokemon('Weezing', 320000, 35), new DungeonBossPokemon('Shuckle', 610000, 50)],
    4500, 37, 20
);

dungeonList['Tin Tower'] = new Dungeon('Tin Tower',
    ['Rattata', 'Gastly'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    88500,
    [
        new DungeonBossPokemon('Raticate', 380000, 35),
        new DungeonBossPokemon('Haunter', 380000, 35),
        new DungeonBossPokemon('Ho-Oh', 1410000, 100, {requirement: new MultiRequirement([
            new ObtainedPokemonRequirement(pokemonMap.Raikou),
            new ObtainedPokemonRequirement(pokemonMap.Entei),
            new ObtainedPokemonRequirement(pokemonMap.Suicune),
        ])}),
    ],
    4500, 37, 20
);

dungeonList['Whirl Islands'] = new Dungeon('Whirl Islands',
    ['Zubat', 'Golbat', 'Seel', 'Krabby', 'Horsea'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_egg],
    92800,
    [new DungeonBossPokemon('Dewgong', 400000, 40), new DungeonBossPokemon('Kingler', 400000, 40), new DungeonBossPokemon('Lugia', 1410000, 100)],
    5000, 41, 25
);

dungeonList['Mt Mortar'] = new Dungeon('Mt Mortar',
    ['Rattata', 'Zubat', 'Geodude', 'Marill', 'Raticate', 'Golbat', 'Graveler'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Token_collector],
    104100,
    [new DungeonBossPokemon('Tyrogue', 420000, 45)],
    5500, 42, 30
);

dungeonList['Ice Path'] = new Dungeon('Ice Path',
    ['Zubat', 'Jynx', 'Swinub'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_incense],
    120400,
    [new DungeonBossPokemon('Delibird', 440000, 50)],
    6000, 44, 32
);

dungeonList['Dark Cave'] = new Dungeon('Dark Cave',
    ['Zubat', 'Geodude', 'Golbat', 'Graveler', 'Wobbuffet'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    127000,
    [new DungeonBossPokemon('Dunsparce', 460000, 55)],
    6500, 45, 35
);

dungeonList['Mt Silver'] = new Dungeon('Mt Silver',
    ['Ponyta', 'Doduo', 'Tangela', 'Sneasel', 'Ursaring', 'Donphan', 'Teddiursa', 'Phanpy', 'Quagsire', 'Misdreavus'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    130500,
    [new DungeonBossPokemon('Larvitar', 840000, 60)],
    10000, 28, 50
);

// Hoenn Dungeons

dungeonList['Petalburg Woods'] = new Dungeon('Petalburg Woods',
    ['Poochyena', 'Zigzagoon', 'Wurmple', 'Silcoon', 'Cascoon', 'Taillow', 'Shroomish'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    380000,
    [new DungeonBossPokemon('Slakoth', 860000, 10)],
    12000, 101, 5);

dungeonList['Rusturf Tunnel'] = new Dungeon('Rusturf Tunnel',
    ['Whismur'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    400000,
    [new DungeonBossPokemon('Whismur', 900000, 20)],
    14000, 101, 5);

dungeonList['Granite Cave'] = new Dungeon('Granite Cave',
    ['Zubat', 'Abra', 'Geodude', 'Makuhita', 'Aron', 'Sableye'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    410000,
    [new DungeonBossPokemon('Mawile', 960000, 20), new DungeonBossPokemon('Nosepass', 660000, 20)],
    16000, 101, 5);

dungeonList['Fiery Path'] = new Dungeon('Fiery Path',
    ['Machop', 'Grimer', 'Koffing', 'Slugma', 'Numel'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    424000,
    [new DungeonBossPokemon('Torkoal', 1200000, 20)],
    17000, 101, 5);

dungeonList['Meteor Falls'] = new Dungeon('Meteor Falls',
    ['Zubat', 'Golbat', 'Goldeen', 'Magikarp', 'Barboach'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    443000,
    [
        new DungeonBossPokemon('Solrock', 1240000, 20),
        new DungeonBossPokemon('Lunatone', 1240000, 20),
    ],
    18000, 101, 5);

dungeonList['Mt. Chimney'] = new Dungeon('Mt. Chimney',
    ['Zubat', 'Poochyena'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    460000,
    [new DungeonBossPokemon('Numel', 1370000, 20)],
    20000, 101, 5);

dungeonList['Jagged Pass'] = new Dungeon('Jagged Pass',
    ['Machop', 'Numel', 'Spoink'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    460000,
    [
        new DungeonBossPokemon('Machop', 1400000, 20),
        new DungeonBossPokemon('Numel', 1400000, 20),
        new DungeonBossPokemon('Spoink', 1400000, 20),
    ],
    22000, 101, 5);

dungeonList['New Mauville'] = new Dungeon('New Mauville',
    ['Magnemite', 'Voltorb'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    460000,
    [
        new DungeonBossPokemon('Magneton', 1650000, 20),
        new DungeonBossPokemon('Electrode', 1650000, 20),
    ],
    24000, 101, 5);

dungeonList['Mt. Pyre'] = new Dungeon('Mt. Pyre',
    ['Shuppet', 'Duskull', 'Vulpix', 'Wingull', 'Meditite'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    480000,
    [
        new DungeonBossPokemon('Shuppet', 1880000, 20),
        new DungeonBossPokemon('Duskull', 1890000, 20),
        new DungeonBossPokemon('Chimecho', 1880000, 20),
    ],
    46000, 101, 5);

dungeonList['Shoal Cave'] = new Dungeon('Shoal Cave',
    ['Zubat', 'Golbat', 'Spheal', 'Tentacool', 'Magikarp', 'Wailmer'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    490000,
    [new DungeonBossPokemon('Snorunt', 1900000, 20)],
    28000, 101, 5);

dungeonList['Cave of Origin'] = new Dungeon('Cave of Origin',
    ['Zubat', 'Golbat', 'Sableye', 'Mawile'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    590000,
    [
        new DungeonBossPokemon('Exploud', 2000000, 50),
        new DungeonBossPokemon('Kyogre', 4700000, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_HoennChampion)}),
        new DungeonBossPokemon('Groudon', 4700000, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_HoennChampion)}),
    ],
    34000, 101, 5);

dungeonList['Seafloor Cavern'] = new Dungeon('Seafloor Cavern',
    ['Zubat', 'Golbat', 'Tentacool', 'Magikarp', 'Wailmer'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    530000,
    [new DungeonBossPokemon('Wailmer', 2200000, 20)],
    31000, 101, 5);

dungeonList['Sky Pillar'] = new Dungeon('Sky Pillar',
    ['Golbat', 'Sableye', 'Claydol', 'Banette', 'Mawile', 'Altaria'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    720000,
    [
        new DungeonBossPokemon('Dusclops', 3200000, 20),
        new DungeonBossPokemon('Rayquaza', 5824002, 100),
    ],
    40000, 101, 5);

dungeonList['Sealed Chamber'] = new Dungeon('Sealed Chamber',
    ['Zubat', 'Golbat', 'Tentacool'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    500000,
    [
        new DungeonBossPokemon('Regirock', 4500000, 20),
        new DungeonBossPokemon('Regice', 4500000, 20),
        new DungeonBossPokemon('Registeel', 4500000, 20),
    ],
    32000, 101, 5);

dungeonList['Victory Road Hoenn'] = new Dungeon('Victory Road Hoenn',
    ['Zubat', 'Golbat', 'Whismur', 'Loudred', 'Makuhita', 'Aron', 'Mawile', 'Meditite', 'Geodude', 'Goldeen', 'Magikarp', 'Barboach', 'Whiscash'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    560000,
    [
        new DungeonBossPokemon('Hariyama', 3300000, 20),
        new DungeonBossPokemon('Lairon', 3300000, 20),
        new DungeonBossPokemon('Medicham', 3300000, 20),
        new DungeonBossPokemon('Graveler', 3300000, 20),
    ],
    37000, 101, 5);

// Sinnoh

dungeonList['Oreburgh Gate'] = new Dungeon('Oreburgh Gate',
    ['Zubat', 'Psyduck', 'Geodude', 'Golduck', 'Magikarp', 'Barboach'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    720600,
    [
        new DungeonBossPokemon('Gyarados', 3703000, 14),
        new DungeonBossPokemon('Whiscash', 3703000, 14),
    ],
    39000, 201, 7);

dungeonList['Ravaged Path'] = new Dungeon('Ravaged Path',
    ['Zubat', 'Psyduck',  'Golduck', 'Magikarp', 'Barboach'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    756000,
    [
        new DungeonBossPokemon('Gyarados', 3803000, 14),
        new DungeonBossPokemon('Whiscash', 3803000, 14),
    ],
    43000, 201, 7);

dungeonList['Eterna Forest'] = new Dungeon('Eterna Forest',
    ['Gastly', 'Hoothoot', 'Wurmple', 'Silcoon', 'Cascoon', 'Bidoof', 'Kricketot', 'Budew', 'Buneary'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Token_collector],
    812000,
    [
        new DungeonBossPokemon('Beautifly', 3950000, 30),
        new DungeonBossPokemon('Dustox', 3950000, 30),
    ],
    48000, 201, 15);

dungeonList['Old Chateau'] = new Dungeon('Old Chateau',
    ['Gastly', 'Haunter', 'Gengar'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    853000,
    [
        new DungeonBossPokemon('Rotom', 4200000, 100),
        new DungeonBossPokemon('Rotom (heat)', 4300000, 100, {requirement: new ObtainedPokemonRequirement(pokemonMap.Rotom)}),
        new DungeonBossPokemon('Rotom (wash)', 4300000, 100, {requirement: new ObtainedPokemonRequirement(pokemonMap.Rotom)}),
        new DungeonBossPokemon('Rotom (frost)', 4300000, 100, {requirement: new ObtainedPokemonRequirement(pokemonMap.Rotom)}),
        new DungeonBossPokemon('Rotom (fan)', 4300000, 100, {requirement: new ObtainedPokemonRequirement(pokemonMap.Rotom)}),
        new DungeonBossPokemon('Rotom (mow)', 4300000, 100, {requirement: new ObtainedPokemonRequirement(pokemonMap.Rotom)}),
    ],
    52500, 230, 100);

dungeonList['Wayward Cave'] = new Dungeon('Wayward Cave',
    ['Zubat', 'Geodude', 'Onix'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    903000,
    [new DungeonBossPokemon('Bronzor', 4400000, 100)],
    56500, 230, 100);

dungeonList['Mt. Coronet South'] = new Dungeon('Mt. Coronet South',
    [{pokemon: 'Clefairy', options: { weight: 2 }}, 'Zubat', 'Machop', 'Geodude', 'Nosepass', 'Meditite', 'Chingling', 'Bronzor', 'Magikarp', 'Barboach', 'Noctowl'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    951500,
    [
        new DungeonBossPokemon('Machoke', 4000000, 35),
        new DungeonBossPokemon('Bronzong', 4000000, 50),
        new DungeonBossPokemon('Absol', 4000000, 50),
    ],
    60500, 201, 20);

dungeonList['Solaceon Ruins'] = new Dungeon('Solaceon Ruins',
    ['Zubat', 'Geodude', 'Natu', 'Bronzor', 'Hippopotas'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    960000,
    [
        new DungeonBossPokemon('Unown (A)', 4100000, 30),
        new DungeonBossPokemon('Unown (E)', 4100000, 30),
        new DungeonBossPokemon('Unown (L)', 4100000, 30),
        new DungeonBossPokemon('Unown (N)', 4100000, 30),
        new DungeonBossPokemon('Unown (U)', 4100000, 30),
    ],
    62500, 209, 100);

dungeonList['Iron Island'] = new Dungeon('Iron Island',
    ['Tentacool', 'Wingull', 'Tentacruel', 'Pelipper', 'Finneon', 'Zubat', 'Geodude', 'Onix', 'Golbat', 'Graveler'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    983000,
    [new DungeonBossPokemon('Steelix', 4210000, 100)],
    66500, 230, 100);

dungeonList['Mt. Coronet North'] = new Dungeon('Mt. Coronet North',
    [{pokemon: 'Clefairy', options: { weight: 2 }}, 'Zubat', 'Machop', 'Geodude', 'Meditite', 'Chingling', 'Bronzor', 'Magikarp', 'Barboach', 'Noctowl', 'Snover'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_incense],
    1015000,
    [
        new DungeonBossPokemon('Graveler', 4600000, 35),
        new DungeonBossPokemon('Feebas', 4600000, 50),
        new DungeonBossPokemon('Medicham', 4600000, 50),
    ],
    69500, 201, 20);

dungeonList['Lake Verity'] = new Dungeon('Lake Verity',
    ['Starly', 'Bidoof', 'Psyduck', 'Magikarp', 'Goldeen'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Item_magnet],
    1068735,
    [
        new DungeonBossPokemon('Golduck', 4820000, 10),
        new DungeonBossPokemon('Seaking', 4820000, 10),
    ],
    72500, 201, 5);

dungeonList['Lake Valor'] = new Dungeon('Lake Valor',
    ['Staravia', 'Bibarel', 'Psyduck', 'Golduck', 'Magikarp', 'Goldeen'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    1111500,
    [
        new DungeonBossPokemon('Noctowl', 4960000, 35),
        new DungeonBossPokemon('Azelf', 10060000, 35),
    ],
    74500, 201, 20);

dungeonList['Lake Acuity'] = new Dungeon('Lake Acuity',
    ['Sneasel', 'Bibarel', 'Psyduck', 'Golduck', 'Magikarp', 'Goldeen','Snover', 'Snorunt'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Lucky_egg],
    1261800,
    [
        new DungeonBossPokemon('Gyarados', 5070000, 40),
        new DungeonBossPokemon('Uxie', 10070000, 40),
    ],
    78000, 201, 25);

dungeonList['Distortion World'] = new Dungeon('Distortion World',
    ['Golbat', 'Gastly', 'Haunter', 'Duskull', 'Chingling', 'Bronzor', 'Chimecho'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Token_collector],
    1322100,
    [
        new DungeonBossPokemon('Dusclops', 5280000, 45),
        new DungeonBossPokemon('Bronzong', 5280000, 45),
        new DungeonBossPokemon('Giratina (altered)', 11880000, 45),
    ],
    82500, 201, 30);

dungeonList['Victory Road Sinnoh'] = new Dungeon('Victory Road Sinnoh',
    ['Golbat', 'Graveler', 'Onix', 'Rhyhorn', 'Magneton', 'Azumarill', 'Floatzel'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    1503000,
    [
        new DungeonBossPokemon('Rhydon', 7000000, 100),
        new DungeonBossPokemon('Steelix', 7000000, 100),
        new DungeonBossPokemon('Gabite', 7000000, 100),
    ],
    86500, 230, 100);

dungeonList['Spear Pillar'] = new Dungeon('Spear Pillar',
    ['Croagunk', 'Stunky', 'Glameow', 'Bronzor', 'Golbat'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2353000,
    [
        new DungeonBossPokemon('Palkia', 11880000, 100),
        new DungeonBossPokemon('Dialga', 11880000, 100),
    ],
    96500, 230, 100);

dungeonList['Hall of Origin'] = new Dungeon('Hall of Origin',
    ['Slowpoke', 'Spearow', 'Garchomp', 'Slakoth', 'Eevee', 'Breloom', 'Absol'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2653000,
    [
        new DungeonBossPokemon('Arceus (normal)', 13000000, 100),
        new DungeonBossPokemon('Slaking', 10000000, 100),
        new DungeonBossPokemon('Snorlax', 10000000, 100),
        new DungeonBossPokemon('Shuckle', 10000000, 100),
        new DungeonBossPokemon('Blissey', 10000000, 100),
    ],
    106500, 230, 100);

dungeonList['Fullmoon Island'] = new Dungeon('Fullmoon Island',
    ['Illumise', 'Minun', 'Espeon', 'Luvdisc'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2603000,
    [new DungeonBossPokemon('Clefable', 11000000, 100)],
    96500, 230, 100);

dungeonList['Newmoon Island'] = new Dungeon('Newmoon Island',
    ['Volbeat', 'Plusle', 'Umbreon', 'Luvdisc'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2603000,
    [new DungeonBossPokemon('Darkrai', 11000000, 100)],
    96500, 230, 100);

dungeonList['Flower Paradise'] = new Dungeon('Flower Paradise',
    ['Vileplume', 'Bellsprout', 'Exeggutor', 'Bellossom', 'Skiploom', 'Sunflora', 'Roselia'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_incense],
    2603000,
    [
        new DungeonBossPokemon('Venusaur', 9900000, 50),
        new DungeonBossPokemon('Meganium', 11000000, 50),
        new DungeonBossPokemon('Shaymin (land)', 11000000, 50),
        new DungeonBossPokemon('Shaymin (sky)', 11000000, 50),
    ],
    96500, 201, 32);

dungeonList['Snowpoint Temple'] = new Dungeon('Snowpoint Temple',
    ['Golbat', 'Sneasel', 'Smoochum'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2603000,
    [
        new DungeonBossPokemon('Jynx', 10000000, 100),
        new DungeonBossPokemon('Regigigas', 11000000, 100),
    ],
    96500, 230, 100);

dungeonList['Stark Mountain'] = new Dungeon('Stark Mountain',
    ['Golbat', 'Graveler', 'Fearow', 'Weezing', 'Rhyhorn', 'Rhydon', 'Numel', 'Slugma', 'Magcargo', 'Camerupt'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2603000,
    [
        new DungeonBossPokemon('Skarmory', 10000000, 100),
        new DungeonBossPokemon('Heatran', 11000000, 100),
    ],
    96500, 230, 100);

// Unova
// TODO: Balancing of dungeon Pokemon HP & rewards.
dungeonList['Pledge Grove'] = new Dungeon('Pledge Grove',
    ['Fearow', 'Furret', 'Ledian', 'Sudowoodo', 'Stantler', 'Breloom', 'Unfezant', 'Sawsbuck (Autumn)', 'Sawsbuck (Winter)'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2403000,
    [new DungeonBossPokemon('Keldeo (Resolute)', 12000000, 100)],
    106500, 20, 100);

dungeonList['Floccesy Ranch'] = new Dungeon('Floccesy Ranch',
    ['Psyduck', 'Mareep', 'Azurill', 'Patrat', 'Lillipup', 'Pidove'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2503000,
    [new DungeonBossPokemon('Riolu', 13000000, 100)],
    126500, 20, 100);

dungeonList['Liberty Garden'] = new Dungeon('Liberty Garden',
    ['Vulpix', 'Sunflora', 'Abra', 'Wingull', 'Pidove', 'Sentret'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2703000,
    [
        new DungeonBossPokemon('Victini', 14000000, 100),
        new DungeonBossPokemon('Ninetales', 14000000, 100),
        new DungeonBossPokemon('Alakazam', 14000000, 100),
    ],
    136500, 20, 100);

dungeonList['Castelia Sewers'] = new Dungeon('Castelia Sewers',
    ['Rattata', 'Zubat', 'Grimer', 'Trubbish'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2603000,
    [new DungeonBossPokemon('Muk', 15000000, 100)],
    146500, 4, 100);

dungeonList['Relic Passage'] = new Dungeon('Relic Passage',
    ['Rattata', 'Raticate', 'Roggenrola', 'Woobat', 'Timburr'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2803000,
    [
        new DungeonBossPokemon('Onix', 16000000, 100),
        new DungeonBossPokemon('Drilbur', 16000000, 100),
    ],
    156500, 25, 100);

dungeonList['Relic Castle'] = new Dungeon('Relic Castle',
    ['Sandshrew', 'Sandslash', 'Sandile', 'Krokorok', 'Yamask'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3003000,
    [
        new DungeonBossPokemon('Baltoy', 18000000, 100),
        new DungeonBossPokemon('Volcarona', 18000000, 100),
    ],
    166500, 25, 100);

dungeonList['Lostlorn Forest'] = new Dungeon('Lostlorn Forest',
    ['Roselia', 'Combee', 'Sewaddle', 'Venipede', 'Cottonee', 'Petilil'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3203000,
    [
        new DungeonBossPokemon('Heracross', 21000000, 100),
        new DungeonBossPokemon('Pinsir', 19000000, 100),
        new DungeonBossPokemon('Emolga', 19000000, 100),
    ],
    176500, 16, 100);

dungeonList['Chargestone Cave'] = new Dungeon('Chargestone Cave',
    ['Nosepass', 'Boldore', 'Joltik', 'Ferroseed', 'Klink'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3403000,
    [
        new DungeonBossPokemon('Drilbur', 22000000, 100),
        new DungeonBossPokemon('Tynamo', 22000000, 100),
    ],
    186500, 6, 100);

dungeonList['Mistralton Cave'] = new Dungeon('Mistralton Cave',
    ['Boldore', 'Woobat', 'Aron', 'Lairon'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3603000,
    [
        new DungeonBossPokemon('Drilbur', 23000000, 100),
        new DungeonBossPokemon('Axew', 24000000, 100),
        new DungeonBossPokemon('Cobalion', 25000000, 100),
    ],
    196500, 6, 100);

dungeonList['Celestial Tower'] = new Dungeon('Celestial Tower',
    ['Golbat', 'Elgyem', 'Misdreavus', 'Haunter'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3803000,
    [new DungeonBossPokemon('Litwick', 25000000, 100)],
    206500, 7, 100);

dungeonList['Reversal Mountain'] = new Dungeon('Reversal Mountain',
    ['Skarmory', 'Numel', 'Camerupt', 'Spoink', 'Grumpig', 'Trapinch', 'Drifblim', 'Skorupi', 'Boldore', 'Woobat'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4003000,
    [
        new DungeonBossPokemon('Cacturne', 24000000, 100),
        new DungeonBossPokemon('Excadrill', 26000000, 100),
        new DungeonBossPokemon('Heatran', 30000000, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion)}),
    ],
    226500, 14, 100);
dungeonList['Seaside Cave'] = new Dungeon('Seaside Cave',
    ['Golduck', 'Seel', 'Shellder', 'Luvdisc', 'Boldore', 'Woobat', 'Tynamo', 'Frillish'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4203000,
    [
        new DungeonBossPokemon('Eelektrik', 28000000, 100),
        new DungeonBossPokemon('Crustle', 28000000, 100),
    ],
    246500, 21, 100);

dungeonList['Giant Chasm'] = new Dungeon('Giant Chasm',
    ['Clefairy', 'Poliwag', 'Seel', 'Tangela', 'Delibird', 'Sneasel', 'Piloswine', 'Pelipper', 'Lunatone', 'Solrock', 'Vanillish', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)', 'Ditto', 'Metang'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4403000,
    [
        new DungeonBossPokemon('Tangrowth', 30000000, 100),
        new DungeonBossPokemon('Audino', 32000000, 100),
        new DungeonBossPokemon('Mamoswine', 32000000, 100),
        new DungeonBossPokemon('Kyurem', 35000000, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion)}),
    ],
    266500, 22, 100);

dungeonList['Cave of Being'] = new Dungeon('Cave of Being',
    ['Kadabra', 'Golbat', 'Woobat', 'Gurdurr', 'Graveler', 'Onix'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4603000,
    [
        new DungeonBossPokemon('Uxie', 35000000, 100),
        new DungeonBossPokemon('Mesprit', 35000000, 100),
        new DungeonBossPokemon('Azelf', 35000000, 100),
    ],
    286500, 20, 100);

dungeonList['Abundant Shrine'] = new Dungeon('Abundant Shrine',
    ['Vulpix', 'Golduck', 'Marill', 'Azumarill', 'Swablu', 'Bronzor', 'Cottonee', 'Petilil', 'Goldeen', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4803000,
    [
        new DungeonBossPokemon('Bronzong', 38000000, 100),
        new DungeonBossPokemon('Altaria', 38000000, 100),
        new DungeonBossPokemon('Landorus', 42000000, 100),
    ],
    306500, 14, 100);

dungeonList['Victory Road Unova'] = new Dungeon('Victory Road Unova',
    ['Poliwag', 'Onix', 'Marill', 'Roselia', 'Altaria', 'Banette', 'Buizel', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)', 'Boldore', 'Cottonee', 'Petilil', 'Tranquill', 'Unfezant', 'Gurdurr'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5003000,
    [
        new DungeonBossPokemon('Golurk', 44000000, 100),
        new DungeonBossPokemon('Terrakion', 45000000, 100),
        new DungeonBossPokemon('Audino', 45000000, 100),
        new DungeonBossPokemon('Druddigon', 44000000, 100),
    ],
    326500, 23, 100);

dungeonList['Twist Mountain'] = new Dungeon('Twist Mountain',
    ['Onix', 'Boldore', 'Woobat', 'Gurdurr', 'Beartic'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Durant', 48000000, 100),
        new DungeonBossPokemon('Cryogonal', 48000000, 100),
        new DungeonBossPokemon('Heatmor', 48000000, 100),
        new DungeonBossPokemon('Regigigas', 50000000, 100),
    ],
    356500, 7, 100);

dungeonList['Dragonspiral Tower'] = new Dungeon('Dragonspiral Tower',
    ['Dratini', 'Tranquill', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)', 'Vanillish', 'Sawsbuck (Autumn)', 'Sawsbuck (Winter)', 'Beartic', 'Mienfoo', 'Mienshao', 'Golett', 'Golurk'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Dragonite', 48000000, 100),
        new DungeonBossPokemon('Reshiram', 48000000, 100),
        new DungeonBossPokemon('Druddigon', 48000000, 100),
        new DungeonBossPokemon('Zekrom', 50000000, 100),
    ],
    356500, 7, 100);

dungeonList['Moor of Icirrus'] = new Dungeon('Moor of Icirrus',
    ['Croagunk', 'Palpitoad', 'Karrablast', 'Shelmet', 'Stunfisk', 'Barboach'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Keldeo', 50000000, 100),
        new DungeonBossPokemon('Seismitoad', 48000000, 100),
        new DungeonBossPokemon('Whiscash', 48000000, 100),
    ],
    356500, 8, 100);

dungeonList['Pinwheel Forest'] = new Dungeon('Pinwheel Forest',
    ['Goldeen', 'Marill', 'Yanma', 'Vigoroth', 'Toxicroak', 'Gurdurr', 'Tympole', 'Palpitoad', 'Swadloon', 'Whirlipede', 'Cottonee', 'Petilil', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Scolipede', 48000000, 100),
        new DungeonBossPokemon('Seismitoad', 48000000, 100),
        new DungeonBossPokemon('Virizion', 48000000, 100),
    ],
    356500, 3, 100);
dungeonList['Dreamyard'] = new Dungeon('Dreamyard',
    ['Raticate', 'Jigglypuff', 'Golbat', 'Watchog', 'Liepard', 'Munna'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Audino', 48000000, 100),
        new DungeonBossPokemon('Dunsparce', 48000000, 100),
        new DungeonBossPokemon('Latias', 48000000, 100),
        new DungeonBossPokemon('Latios', 48000000, 100),
    ],
    356500, 3, 100);

dungeonList['P2 Laboratory'] = new Dungeon('P2 Laboratory',
    ['Magneton', 'Rotom', 'Beheeyem', 'Klinklang', 'Porygon2', 'Electrode', 'Metang'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5403000,
    [
        new DungeonBossPokemon('Magnezone', 48000000, 100),
        new DungeonBossPokemon('Porygon-Z', 48000000, 100),
        new DungeonBossPokemon('Metagross', 48000000, 100),
        new DungeonBossPokemon('Genesect', 62000000, 100),
        new DungeonBossPokemon('Porygon', 62000000, 100),
        new DungeonBossPokemon('Audino', 62000000, 100),
        new DungeonBossPokemon('Mawile', 62000000, 100),
        new DungeonBossPokemon('Sableye', 62000000, 100),
    ],
    396500, 18, 100);

// Kalos
// TODO: Balancing of dungeon Pokemon HP & rewards.
dungeonList['Santalune Forest'] = new Dungeon('Santalune Forest',
    [
        {pokemon: 'Caterpie', options: { weight: 0.88 }},
        {pokemon: 'Metapod', options: { weight: 0.88 }},
        {pokemon: 'Weedle', options: { weight: 0.88 }},
        {pokemon: 'Kakuna', options: { weight: 0.88}},
        {pokemon: 'Pansage', options: { weight: 0.88 }},
        {pokemon: 'Pansear', options: { weight: 0.88 }},
        {pokemon: 'Panpour', options: { weight: 0.88 }},
        {pokemon: 'Fletchling', options: { weight: 0.88 }},
        {pokemon: 'Scatterbug', options: { weight: 0.88 }},
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Scatterbug', 5803000, 3),
                new GymPokemon('Fletchling', 5803000, 3),
            ], { weight: 1 }, 'Joey'),
        new DungeonTrainer('Lass',
            [new GymPokemon('Pikachu', 5803000, 5)],
            { weight: 1 }, 'Anna'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5803020,
    [
        new DungeonTrainer('Lass',
            [
                new GymPokemon('Weedle', 24303000, 2),
                new GymPokemon('Bunnelby', 27303000, 4),
            ], { weight: 1 }, 'Lise'),
        new DungeonBossPokemon('Pikachu', 51738600, 4),
    ],
    400000, 2, 4);

dungeonList['Parfum Palace'] = new Dungeon('Parfum Palace',
    ['Goldeen', 'Seaking', 'Magikarp', 'Gyarados', 'Corphish', 'Crawdaunt'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    6303405,
    [new DungeonBossPokemon('Furfrou', 56375930, 50)],
    445000, 6, 25);

dungeonList['Connecting Cave'] = new Dungeon('Connecting Cave',
    [
        {pokemon: 'Zubat', options: { weight: 1.33 }},
        {pokemon: 'Whismur', options: { weight: 1.33 }},
        {pokemon: 'Meditite', options: { weight: 1.33 }},
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    6503370,
    [
        new DungeonTrainer('Pokémon Breeder',
            [
                new GymPokemon('Ducklett', 13374965, 12),
                new GymPokemon('Pikachu', 14465837, 12),
                new GymPokemon('Litleo', 17438602, 12),
                new GymPokemon('Oddish', 19365784, 12),
            ],
            { weight: 1 }, 'Mercy', '(female)'),
        new DungeonBossPokemon('Axew', 59867590, 20),
    ],
    475000, 7, 15);

dungeonList['Glittering Cave'] = new Dungeon('Glittering Cave',
    [
        {pokemon: 'Machop', options: { weight: .88 }},
        {pokemon: 'Cubone', options: { weight: .88 }},
        {pokemon: 'Rhyhorn', options: { weight: .88 }},
        {pokemon: 'Lunatone', options: { weight: .88 }},
        {pokemon: 'Solrock', options: { weight: .88 }},
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Houndour', 7037592, 18),
                new GymPokemon('Zubat', 7037592, 18),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Gulpin', 7037592, 18),
                new GymPokemon('Electrike', 7037592, 18),
            ], { weight: 1 }, undefined, '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    7037500,
    [
        new DungeonTrainer('Team Flare Grunt Duo',
            [
                new GymPokemon('Scraggy', 33084827, 20),
                new GymPokemon('Croagunk', 31937395, 20),
            ], { weight: 1 }, undefined),
        new DungeonBossPokemon('Kangaskhan', 63749659, 20),
        new DungeonBossPokemon('Mawile', 61285398, 20),
    ],
    505000, 9, 16);

dungeonList['Reflection Cave'] = new Dungeon('Reflection Cave',
    [
        {pokemon: 'Mr. Mime', options: { weight: 4 }},
        {pokemon: 'Wobbuffet', options: { weight: 4 }},
        {pokemon: 'Sableye', options: { weight: 4 }},
        {pokemon: 'Chingling', options: { weight: 4 }},
        {pokemon: 'Roggenrola', options: { weight: 4 }},
        {pokemon: 'Solosis', options: { weight: 4 }},
        {pokemon: 'Carbink', options: { weight: 4 }},
        {pokemon: 'Mime Jr.', options: { weight: 4 }},
        new DungeonTrainer('Backpacker',
            [new GymPokemon('Linoone', 7353000, 26)],
            { weight: 1 }, 'Lane', '(male)'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Throh', 7353000, 25),
                new GymPokemon('Hawlucha', 7353000, 26),
            ], { weight: 1 }, 'Hedvig'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Sandile', 7353000, 23),
                new GymPokemon('Dwebble', 7353000, 23),
                new GymPokemon('Diggersby', 7353000, 24),
            ], { weight: 1 }, 'Dunstan'),
        new DungeonTrainer('Tourist',
            [new GymPokemon('Nidorina', 7353000, 26)],
            { weight: 1 }, 'Monami', '(female)'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Sawk', 7353000, 28)],
            { weight: 1 }, 'Igor'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Chimecho', 7353000, 24),
                new GymPokemon('Golett', 7353000, 24),
            ], { weight: 1 }, 'Franz', '(male)'),
        new DungeonTrainer('Tourist',
            [new GymPokemon('Nidorino', 7353000, 26)],
            { weight: 1 }, 'Haruto', '(male)'),
        new DungeonTrainer('Honeymooners',
            [
                new GymPokemon('Combee', 7353000, 26),
                new GymPokemon('Vespiquen', 7353000, 26),
            ], { weight: 1 }, 'Yuu & Ami'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    7353000,
    [
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Absol', 33468400, 26),
                new GymPokemon('Pinsir', 37474200, 25),
            ], { weight: 1 }, 'Emil', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Doduo', 20365400, 24),
                new GymPokemon('Granbull', 23366400, 24),
                new GymPokemon('Helioptile', 25476400, 25),
            ], { weight: 1 }, 'Monique', '(female)'),
        new DungeonBossPokemon('Diancie', 69694200, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_KalosChampion)}),
    ],
    555000, 11, 22);

//Tower of Mastery?

dungeonList['Kalos Power Plant'] = new Dungeon('Kalos Power Plant',//keep going from here down
    [
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Croagunk', 7903570, 32),
                new GymPokemon('Scraggy', 7903570, 32),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Golbat', 7903570, 32),
                new GymPokemon('Scraggy', 7903570, 32),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Mightyena', 7903570, 34)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Golbat', 7903570, 32),
                new GymPokemon('Mightyena', 7903570, 32),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Flare Grunt',
            [
                new GymPokemon('Golbat', 7903570, 33),
                new GymPokemon('Croagunk', 7903570, 31),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Liepard', 7903570, 31),
                new GymPokemon('Scraggy', 7903570, 31),
                new GymPokemon('Croagunk', 7903570, 31),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Swalot', 7903570, 34)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Liepard', 7903570, 31),
                new GymPokemon('Swalot', 7903570, 33),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Houndoom', 7903570, 36)],
            { weight: 8 }, undefined, '(male)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    7903570,
    [
        new DungeonTrainer('Team Flare',
            [new GymPokemon('Mightyena', 75384400, 38)], { weight: 1 }, 'Aliana', '(aliana)'),
        new DungeonBossPokemon('Volcanion', 83945700, 100,
            {
                requirement: new MultiRequirement([
                    new ClearDungeonRequirement(5, GameConstants.getDungeonIndex('Kalos Power Plant')),
                    new GymBadgeRequirement(BadgeEnums.Elite_KalosChampion),
                ])}),
    ],
    575000, 13, 32);

dungeonList['Sea Spirit\'s Den'] = new Dungeon('Sea Spirit\'s Den',
    ['Lapras', 'Dwebble', 'Lanturn', 'Binacle', 'Woobat', 'Onix'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    7543000,
    [new DungeonBossPokemon('Lugia', 92375000, 100)],
    600000, 23, 30);

dungeonList['Pokéball Factory'] = new Dungeon('Pokéball Factory',
    [
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Toxicroak', 8173950, 37)], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Mightyena', 8173950, 36),
                new GymPokemon('Golbat', 8173950, 36),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Scraggy', 8173950, 36),
                new GymPokemon('Mightyena', 8173950, 36),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Swalot', 8173950, 37)], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [
                new GymPokemon('Scraggy', 8173950, 37),
                new GymPokemon('Houndoom', 8173950, 38),
            ],
            { weight: 4 }, undefined, '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    8173950,
    [
        new DungeonTrainer('Team Flare',
            [new GymPokemon('Manectric', 79385030, 41)],
            { weight: 1 }, 'Celosia'),
        new DungeonTrainer('Team Flare',
            [new GymPokemon('Liepard', 79284730, 41)],
            { weight: 1 }, 'Bryony'),
    ],
    615000, 14, 37);

dungeonList['Lost Hotel'] = new Dungeon('Lost Hotel',
    [
        {pokemon: 'Magneton', options: { weight: 2.6 }},
        {pokemon: 'Electrode', options: { weight: 2.6 }},
        {pokemon: 'Litwick', options: { weight: 2.6 }},
        {pokemon: 'Pawniard', options: { weight: 2.6 }},
        {pokemon: 'Klefki', options: { weight: 2.6 }},
        new DungeonTrainer('Punk Guy',
            [
                new GymPokemon('Scrafty', 8375300, 39),
                new GymPokemon('Sharpedo', 8375300, 39),
                new GymPokemon('Pawniard', 8375300, 39),
            ],
            { weight: 1 }, 'Sid'),
        new DungeonTrainer('Punk Guy',
            [
                new GymPokemon('Skuntank', 8375300, 40),
                new GymPokemon('Crawdaunt', 8375300, 40),
            ], { weight: 1 }, 'Jacques'),
        new DungeonTrainer('Punk Guy',
            [new GymPokemon('Dunsparce', 8375300, 42)],
            { weight: 1 }, 'Slater'),
        new DungeonTrainer('Punk Girl',
            [
                new GymPokemon('Seviper', 8375300, 40),
                new GymPokemon('Arbok', 8375300, 40),
            ],
            { weight: 1 }, 'Jeanne'),
        new DungeonTrainer('Punk Girl',
            [
                new GymPokemon('Liepard', 8375300, 40),
                new GymPokemon('Liepard', 8375300, 40),
            ],
            { weight: 1 }, 'Cecile'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    8375300,
    [
        new DungeonTrainer('Punk Couple',
            [
                new GymPokemon('Garbodor', 42664500, 42),
                new GymPokemon('Pangoro', 42765500, 42),
            ], { weight: 2 }, 'Zoya & Asa'),
        new DungeonBossPokemon('Rotom', 82376500, 38),
    ],
    635000, 15, 37);

dungeonList['Frost Cavern'] = new Dungeon('Frost Cavern',
    [
        {pokemon: 'Haunter', options: { weight: 2.6 }},
        {pokemon: 'Jynx', options: { weight: 2.6 }},
        {pokemon: 'Piloswine', options: { weight: 2.6 }},
        {pokemon: 'Beartic', options: { weight: 2.6 }},
        {pokemon: 'Cryogonal', options: { weight: 2.6 }},
        {pokemon: 'Bergmite', options: { weight: 2.6 }},
        {pokemon: 'Smoochum', options: { weight: 0.53 }},
        {pokemon: 'Vanillite', options: { weight: 0.53 }},
        {pokemon: 'Cubchoo', options: { weight: 0.53 }},
        {pokemon: 'Poliwhirl', options: { weight: 0.53 }},
        {pokemon: 'Floatzel', options: { weight: 0.53 }},
        {pokemon: 'Basculin (Red-Striped)', options: { weight: 0.53 }},
        {pokemon: 'Basculin (Blue-Striped)', options: { weight: 0.53 }},
        new DungeonTrainer('Hiker',
            [new GymPokemon('Vibrava', 8537490, 44)],
            { weight: 1 }, 'Ross'),
        new DungeonTrainer('Sky Trainer',
            [
                new GymPokemon('Carnivine', 8537490, 41),
                new GymPokemon('Swanna', 8537490, 44),
            ], { weight: 1 }, 'Celso', '(male)'),
        new DungeonTrainer('Sky Trainer',
            [new GymPokemon('Cryogonal', 8537490, 45)],
            { weight: 1 }, 'Era', '(female)'),
        new DungeonTrainer('Artist',
            [new GymPokemon('Smeargle', 8537490, 44)],
            { weight: 1 }, 'Salvador'),
        new DungeonTrainer('Ace Trainer',
            [new GymPokemon('Doublade', 8537490, 46)],
            { weight: 1 }, 'Cordelia', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Raichu', 8537490, 42),
                new GymPokemon('Golduck', 8537490, 42),
                new GymPokemon('Marowak', 8537490, 43),
            ],
            { weight: 1 }, 'Neil', '(male)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Graveler', 8537490, 40),
                new GymPokemon('Graveler', 8537490, 41),
                new GymPokemon('Carbink', 8537490, 42),
            ], { weight: 1 }, 'Alain'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Relicanth', 8537490, 42),
                new GymPokemon('Rhydon', 8537490, 42),
            ],
            { weight: 1 }, 'Delmon'),
        new DungeonTrainer('Brains & Brawn',
            [
                new GymPokemon('Grumpig', 8537490, 44),
                new GymPokemon('Hariyama', 8537490, 46),
            ],
            { weight: 1 }, 'Eoin & Wolf'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Scrafty', 8537490, 43),
                new GymPokemon('Throh', 8537490, 44),
            ],
            { weight: 1 }, 'Alonzo'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Sawk', 8537490, 43),
                new GymPokemon('Mienshao', 8537490, 44),
            ],
            { weight: 1 }, 'Kinsey'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Gurdurr', 8537490, 46)], { weight: 1 }, 'Kenji'),
        new DungeonTrainer('Hiker',
            [new GymPokemon('Probopass', 8537490, 44)],
            { weight: 1 }, 'Brent'),
        new DungeonTrainer('Battle Girl',
            [new GymPokemon('Medicham', 8537490, 46)],
            { weight: 1 }, 'Gabrielle'),
        new DungeonTrainer('Team Flare Grunt',
            [
                new GymPokemon('Golbat', 8537490, 42),
                new GymPokemon('Manectric', 8537490, 42),
            ],
            { weight: 1 }, undefined, '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    8537490,
    [
        new DungeonTrainer('Team Flare',
            [new GymPokemon('Houndoom', 87365830, 48)],
            { weight: 1 }, 'Mable', '(mable)'),
        new DungeonBossPokemon('Abomasnow', 85376500, 50),
    ],
    665500, 15, 40);

dungeonList['Team Flare Secret HQ'] = new Dungeon('Team Flare Secret HQ',
    [
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Toxicroak', 8739480, 50)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Liepard', 8739480, 48)], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Manectric', 8739480, 50)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Mightyena', 8739480, 48)], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Houndoom', 8739480, 50)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Scrafty', 8739480, 48)], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [
                new GymPokemon('Liepard', 8739480, 47),
                new GymPokemon('Manectric', 8739480, 48),
            ], { weight: 2 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [
                new GymPokemon('Mightyena', 8739480, 47),
                new GymPokemon('Houndoom', 8739480, 48),
            ], { weight: 2 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Swalot', 8739480, 50)],
            { weight: 2 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Golbat', 8739480, 50)],
            { weight: 2 }, undefined, '(male)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    8739480,
    [
        new DungeonTrainer('Team Flare',
            [
                new GymPokemon('Mienshao', 22464940, 49),
                new GymPokemon('Honchkrow', 22564950, 49),
                new GymPokemon('Pyroar', 23375580, 51),
                new GymPokemon('Gyarados', 27385730, 53),
            ],
            { weight: 2 }, 'Lysandre', '(lysandre)'),
        new DungeonBossPokemon('Xerneas', 93659460, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Team Flare Secret HQ'))}),
        new DungeonBossPokemon('Yveltal', 93659450, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Team Flare Secret HQ'))}),
    ],
    675000, 16, 48);

dungeonList['Terminus Cave'] = new Dungeon('Terminus Cave',
    [
        {pokemon: 'Sandslash', options: { weight: 3.27 }},
        {pokemon: 'Graveler', options: { weight: 3.27 }},
        {pokemon: 'Pupitar', options: { weight: 3.27 }},
        {pokemon: 'Lairon', options: { weight: 3.27 }},
        {pokemon: 'Durant', options: { weight: 3.27 }},
        {pokemon: 'Geodude', options: { weight: 3.27 }},
        {pokemon: 'Larvitar', options: { weight: 3.27 }},
        {pokemon: 'Aron', options: { weight: 3.27 }},
        new DungeonTrainer('Worker',
            [
                new GymPokemon('Graveler', 8924330, 46),
                new GymPokemon('Graveler', 8924330, 47),
                new GymPokemon('Golem', 8924330, 48),
            ],
            { weight: 1 }, 'Narek'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Steelix', 8924330, 48),
                new GymPokemon('Boldore', 8924330, 48),
            ], { weight: 1 }, 'Bergin'),
        new DungeonTrainer('Hiker',
            [new GymPokemon('Rhydon', 8924330, 50)],
            { weight: 1 }, 'Aaron'),
        new DungeonTrainer('Worker',
            [new GymPokemon('Octillery', 8924330, 50)],
            { weight: 1 }, 'Dimitri'),
        new DungeonTrainer('Worker',
            [new GymPokemon('Probopass', 8924330, 50)],
            { weight: 1 }, 'Yusif'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Throh', 8924330, 49),
                new GymPokemon('Conkeldurr', 8924330, 50),
            ], { weight: 1 }, 'Andrea'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Toxicroak', 8924330, 49),
                new GymPokemon('Sawk', 8924330, 50),
            ], { weight: 1 }, 'Gunnar'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Medicham', 8924330, 48),
                new GymPokemon('Hawlucha', 8924330, 51),
            ], { weight: 1 }, 'Hailey'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Hariyama', 8924330, 52)],
            { weight: 1 }, 'Ricardo'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    8924330,
    [
        new DungeonTrainer('Pokémon Rangers',
            [
                new GymPokemon('Nidoqueen', 46659450, 51),
                new GymPokemon('Nidoking', 46654990, 51),
            ], { weight: 3 }, 'Fern & Lee'),
        new DungeonBossPokemon('Zygarde', 92485360, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_KalosChampion)}),
    ],
    700000, 18, 45);

dungeonList['Pokémon Village'] = new Dungeon('Pokémon Village',
    ['Jigglypuff', 'Poliwhirl', 'Noctowl', 'Lombre', 'Gothorita', 'Amoonguss'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    9003000,
    [
        new DungeonBossPokemon('Ditto', 94836530, 50),
        new DungeonBossPokemon('Zoroark', 95743340, 50),
    ],
    725000, 20, 48);

dungeonList['Victory Road Kalos'] = new Dungeon('Victory Road Kalos',
    [
        {pokemon: 'Haunter', options: { weight: 3.27 }},
        {pokemon: 'Graveler', options: { weight: 3.27 }},
        {pokemon: 'Lickitung', options: { weight: 3.27 }},
        {pokemon: 'Gurdurr', options: { weight: 3.27 }},
        {pokemon: 'Druddigon', options: { weight: 3.27 }},
        {pokemon: 'Zweilous', options: { weight: 3.27 }},
        {pokemon: 'Geodude', options: { weight: 3.27 }},
        {pokemon: 'Lombre', options: { weight: 3.27 }},
        {pokemon: 'Floatzel', options: { weight: 3.27 }},
        {pokemon: 'Poliwhirl', options: { weight: 3.27 }},
        {pokemon: 'Poliwag', options: { weight: 3.27 }},
        {pokemon: 'Noibat', options: { weight: 3.27 }},
        {pokemon: 'Basculin (Red-Striped)', options: { weight: 3.27 }},
        {pokemon: 'Basculin (Blue-Striped)', options: { weight: 3.27 }},
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Carbink', 3500000, 56),
                new GymPokemon('Raichu', 3500000, 56),
                new GymPokemon('Kingdra', 3500000, 57),
            ],
            { weight: 1 }, 'Robbie', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [new GymPokemon('Weavile', 3500000, 60)], { weight: 1 }, 'Alanza', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Steelix', 3500000, 56),
                new GymPokemon('Electrode', 3500000, 56),
                new GymPokemon('Kangaskhan', 3500000, 57),
            ],
            { weight: 1 }, 'Bence', '(male)'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Machamp', 3500000, 60)],
            { weight: 1 }, 'Markus'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Hawlucha', 3500000, 57),
                new GymPokemon('Mienshao', 3500000, 58),
            ],
            { weight: 1 }, 'Veronique'),
        new DungeonTrainer('Backpacker ',
            [new GymPokemon('Haxorus', 3500000, 58)], { weight: 1 }, 'Farid', '(male)'),
        new DungeonTrainer('Batlle Girl',
            [new GymPokemon('Medicham', 3500000, 60)], { weight: 1 }, 'Sigrid'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Pangoro', 3500000, 57),
                new GymPokemon('Heracross', 3500000, 58),
            ], { weight: 1 }, 'Ander'),
        new DungeonTrainer('Psychic',
            [new GymPokemon('Espeon', 3500000, 58)],
            { weight: 1 }, 'William', '(male)'),
        new DungeonTrainer('Brains & Brawn',
            [
                new GymPokemon('Medicham', 3500000, 58),
                new GymPokemon('Gallade', 3500000, 60),
            ],
            { weight: 1 }, 'Arman & Hugo'),
        new DungeonTrainer('Fairy Tale Girl',
            [
                new GymPokemon('Azumarill', 3500000, 56),
                new GymPokemon('Florges (Red)', 3500000, 56),
            ], { weight: 1 }, 'Corrine'),
        new DungeonTrainer('Hex Maniac',
            [new GymPokemon('Gourgeist', 3500000, 58)],
            { weight: 1 }, 'Raziah'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Slowbro', 3500000, 57),
                new GymPokemon('Altaria', 3500000, 57),
            ],
            { weight: 1 }, 'Petra', '(female)'),
        new DungeonTrainer('Veteran',
            [new GymPokemon('Talonflame', 3500000, 61)],
            { weight: 1 }, 'Inga', '(female)'),
        new DungeonTrainer('Pokémon Ranger',
            [new GymPokemon('Crobat', 3500000, 59)], { weight: 1 }, 'Ralf', '(male)'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Banette', 3500000, 57),
                new GymPokemon('Leafeon', 3500000, 59),
            ], { weight: 1 }, 'Gerard', '(male)'),
        new DungeonTrainer('Artist',
            [new GymPokemon('Smeargle', 3500000, 58)], { weight: 1 }, 'Vincent'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Torkoal', 3500000, 56),
                new GymPokemon('Golem', 3500000, 56),
            ],
            { weight: 1 }, 'Corwin'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    9003000,
    [
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Magcargo', 48593850, 57),
                new GymPokemon('Scizor', 49355840, 58),
            ],
            { weight: 1 }, 'Michele', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Trevenant', 48329640, 57),
                new GymPokemon('Gigalith', 49355820, 59),
            ], { weight: 1 }, 'Timeo', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Glaceon', 48395740, 57),
                new GymPokemon('Snorlax', 49265840, 59),
            ], { weight: 1 }, 'Catrina', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Skarmory', 32395730, 14),
                new GymPokemon('Umbreon', 33254840, 14),
                new GymPokemon('Alakazam', 35385940, 14),
            ], { weight: 1 }, 'Giles', '(male)'),
    ],
    750500, 21, 59);

//Unknown Dungeon? Contains Mewtwo.



// Alola
// TODO: Balancing of dungeon Pokemon HP & rewards.
dungeonList['Trainers\' School'] = new Dungeon('Trainers\' School',
    ['Alolan Meowth', 'Abra', 'Magnemite', 'Wingull', 'Mime Jr.', 'Zorua'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Alolan Grimer', 8000000, 70),
        new DungeonBossPokemon('Furfrou', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Hau\'oli Cemetery'] = new Dungeon('Hau\'oli Cemetery',
    ['Zubat', 'Gastly', 'Misdreavus'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Drifloon', 8000000, 70),
        new DungeonBossPokemon('Litwick', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Verdant Cavern'] = new Dungeon('Verdant Cavern',
    ['Zubat', 'Alolan Diglett', 'Noibat', 'Alolan Rattata', 'Yungoos'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Alolan Raticate', 8000000, 70),
        new DungeonBossPokemon('Gumshoos', 8000000, 70),
        new DungeonBossPokemon('Totem Alolan Raticate', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
        new DungeonBossPokemon('Totem Gumshoos', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Melemele Meadow'] = new Dungeon('Melemele Meadow',
    ['Caterpie', 'Metapod', 'Butterfree', 'Cottonee', 'Petilil', 'Cutiefly'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Flabébé (Red)', 8000000, 70),
        new DungeonBossPokemon('Oricorio (Pom-pom)', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Seaward Cave'] = new Dungeon('Seaward Cave',
    ['Zubat', 'Psyduck', 'Seel', 'Magikarp', 'Smoochum'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Delibird', 8000000, 70),
        new DungeonBossPokemon('Barboach', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Ten Carat Hill'] = new Dungeon('Ten Carat Hill',
    ['Zubat', 'Machop', 'Psyduck', 'Mawile', 'Roggenrola'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Spinda', 8000000, 70),
        new DungeonBossPokemon('Carbink', 8000000, 70),
        new DungeonBossPokemon('Rockruff', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Ruins of Conflict'] = new Dungeon('Ruins of Conflict',
    ['Florges (Red)', 'Comfey', 'Dedenne', 'Ampharos', 'Electivire'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Jolteon', 8000000, 70),
        new DungeonBossPokemon('Sylveon', 8000000, 70),
        new DungeonBossPokemon('Tapu Koko', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Pikachu Valley'] = new Dungeon('Pikachu Valley',
    ['Pikachu', 'Pichu'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Pikachu (Original cap)', 8000000, 70),
        new DungeonBossPokemon('Pikachu (Hoenn cap)', 8000000, 70),
        new DungeonBossPokemon('Pikachu (Sinnoh cap)', 8000000, 70),
        new DungeonBossPokemon('Pikachu (Unova cap)', 8000000, 70),
        new DungeonBossPokemon('Pikachu (Kalos cap)', 8000000, 70),
        new DungeonBossPokemon('Pikachu (Alola cap)', 8000000, 70),
        new DungeonBossPokemon('Pikachu (Partner cap)', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Paniola Ranch'] = new Dungeon('Paniola Ranch',
    ['Mareep', 'Lillipup', 'Mudbray'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Tauros', 8000000, 70),
        new DungeonBossPokemon('Miltank', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Brooklet Hill'] = new Dungeon('Brooklet Hill',
    ['Paras', 'Psyduck', 'Poliwag', 'Tentacool', 'Goldeen', 'Magikarp', 'Wingull', 'Surskit', 'Feebas', 'Finneon', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)', 'Alomomola', 'Dewpider'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Wishiwashi (School)', 8000000, 70),
        new DungeonBossPokemon('Araquanid', 8000000, 70),
        new DungeonBossPokemon('Totem Wishiwashi (School)', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
        new DungeonBossPokemon('Totem Araquanid', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Wela Volcano Park'] = new Dungeon('Wela Volcano Park',
    ['Cubone', 'Kangaskhan', 'Magby', 'Magmar', 'Fletchling', 'Salandit'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Alolan Marowak', 8000000, 70),
        new DungeonBossPokemon('Salazzle', 8000000, 70),
        new DungeonBossPokemon('Totem Alolan Marowak', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
        new DungeonBossPokemon('Totem Salazzle', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Lush Jungle'] = new Dungeon('Lush Jungle',
    ['Metapod', 'Paras', 'Pinsir', 'Hoothoot', 'Bonsly', 'Trumbeak', 'Fomantis', 'Steenee', 'Comfey', 'Oranguru', 'Passimian'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Lurantis', 8000000, 70),
        new DungeonBossPokemon('Totem Lurantis', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Diglett\'s Tunnel'] = new Dungeon('Diglett\'s Tunnel',
    ['Zubat', 'Alolan Diglett'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Larvitar', 8000000, 70)],
    96500, 201, 35);

dungeonList['Memorial Hill'] = new Dungeon('Memorial Hill',
    ['Zubat', 'Gastly'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Phantump', 8000000, 70)],
    96500, 201, 35);

dungeonList['Ruins of Life'] = new Dungeon('Ruins of Life',
    ['Florges (Red)', 'Comfey', 'Gardevoir', 'Chimecho', 'Musharna'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Espeon', 8000000, 70),
        new DungeonBossPokemon('Sylveon', 8000000, 70),
        new DungeonBossPokemon('Tapu Lele', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Malie Garden'] = new Dungeon('Malie Garden',
    ['Alolan Meowth', 'Psyduck', 'Poliwhirl', 'Goldeen', 'Magikarp', 'Gyarados', 'Ledian', 'Ariados', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)', 'Cottonee', 'Petilil'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Masquerain', 8000000, 70),
        new DungeonBossPokemon('Araquanid', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Hokulani Observatory'] = new Dungeon('Hokulani Observatory',
    ['Grubbin', 'Charjabug', 'Elekid', 'Electabuzz', 'Skarmory', 'Dedenne'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Vikavolt', 8000000, 70),
        new DungeonBossPokemon('Togedemaru', 8000000, 70),
        new DungeonBossPokemon('Totem Vikavolt', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
        new DungeonBossPokemon('Totem Togedemaru', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Thrifty Megamart'] = new Dungeon('Thrifty Megamart',
    ['Golbat', 'Gastly', 'Haunter', 'Gengar', 'Shuppet', 'Banette', 'Jellicent', 'Klefki'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Mimikyu', 8000000, 70),
        new DungeonBossPokemon('Totem Mimikyu', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Ula\'ula Meadow'] = new Dungeon('Ula\'ula Meadow',
    ['Ledian', 'Ariados', 'Cottonee', 'Petilil', 'Ribombee'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Floette (Red)', 8000000, 70),
        new DungeonBossPokemon('Oricorio (Baile)', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Po Town'] = new Dungeon('Po Town',
    ['Alolan Rattata', 'Alolan Raticate', 'Ekans', 'Drowzee', 'Golbat', 'Alolan Grimer', 'Spinarak', 'Houndour', 'Trubbish', 'Scraggy', 'Fomantis', 'Mareanie'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Pawniard', 8000000, 70),
        new DungeonBossPokemon('Masquerain', 8000000, 70),
        new DungeonBossPokemon('Pinsir', 8000000, 70),
        new DungeonBossPokemon('Haunter', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Mount Lanikala'] = new Dungeon('Mount Lanikala',
    ['Alolan Raticate', 'Alolan Sandshrew', 'Alolan Vulpix', 'Sneasel', 'Snorunt', 'Gumshoos'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Absol', 8000000, 70),
        new DungeonBossPokemon('Glalie', 8000000, 70),
        new DungeonBossPokemon('Vanilluxe', 8000000, 70),
        new DungeonBossPokemon('Necrozma', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Ruins of Abundance'] = new Dungeon('Ruins of Abundance',
    ['Florges (Red)', 'Comfey', 'Whimsicott', 'Bellossom', 'Lilligant'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Leafeon', 8000000, 70),
        new DungeonBossPokemon('Sylveon', 8000000, 70),
        new DungeonBossPokemon('Tapu Bulu', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Exeggutor Island Hill'] = new Dungeon('Exeggutor Island Hill',
    ['Exeggcute', 'Pelipper', 'Gastrodon (east)'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Pinsir', 8000000, 70),
        new DungeonBossPokemon('Tropius', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Vast Poni Canyon'] = new Dungeon('Vast Poni Canyon',
    [{pokemon: 'Golbat', options: { weight: 2 }}, 'Alolan Dugtrio', 'Machoke', 'Magikarp', 'Skarmory', 'Barboach', 'Corphish', 'Basculin (Red-Striped)', 'Basculin (Blue-Striped)', 'Boldore', 'Mienfoo', 'Carbink', 'Lycanroc (Midday)', 'Lycanroc (Midnight)', 'Jangmo-o', 'Hakamo-o'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Kommo-o', 8000000, 70),
        new DungeonBossPokemon('Totem Kommo-o', 8000000, 70, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_AlolaChampion)}),
    ],
    96500, 201, 35);

dungeonList['Nebby'] = new Dungeon('Nebby',
    ['Clefable', 'Delcatty', 'Sunflora', 'Heliolisk', 'Lunatone', 'Solrock'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Lunala', 8000000, 70),
        new DungeonBossPokemon('Solgaleo', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Ruins of Hope'] = new Dungeon('Ruins of Hope',
    ['Florges (Red)', 'Comfey', 'Azumarill', 'Politoed', 'Gorebyss'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Vaporeon', 8000000, 70),
        new DungeonBossPokemon('Sylveon', 8000000, 70),
        new DungeonBossPokemon('Tapu Fini', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Poni Meadow'] = new Dungeon('Poni Meadow',
    ['Magikarp', 'Dratini', 'Cottonee', 'Petilil', 'Ribombee', 'Misdreavus', 'Barboach'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Oricorio (Sensu)', 8000000, 70),
        new DungeonBossPokemon('Floette (Red)', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Resolution Cave'] = new Dungeon('Resolution Cave',
    ['Golbat', 'Alolan Dugtrio', 'Druddigon'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Crobat', 8000000, 70),
        new DungeonBossPokemon('Noivern', 8000000, 70),
        new DungeonBossPokemon('Guzzlord', 8000000, 70),
    ],
    96500, 201, 35);




//Galar Dungeons

dungeonList['Slumbering Weald'] = new Dungeon('Slumbering Weald',
    ['Hoothoot', 'Grubbin', 'Skwovet', 'Rookidee'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Blipbug', 8000000, 70)],
    96500, 201, 35);

dungeonList['Inner Slumbering Weald'] = new Dungeon('Inner Slumbering Weald',
    ['Galarian Weezing', 'Corviknight', 'Galarian Stunfisk', 'Munna', 'Butterfree', 'Orbeetle'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Zamazenta (Battle Hero)', 8000000, 70),
        new DungeonBossPokemon('Zacian (Battle Hero)', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Galar Mine'] = new Dungeon('Galar Mine',
    ['Diglett', 'Roggenrola', 'Woobat', 'Drilbur', 'Timburr', 'Rolycoly'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Carkol', 8000000, 70),
        new DungeonBossPokemon('Woobat', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Galar Mine No. 2'] = new Dungeon('Galar Mine No. 2',
    ['Shuckle', 'Shellos (east)', 'Croagunk', 'Scraggy', 'Binacle', 'Noibat', 'Chewtle'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Galarian Stunfisk', 8000000, 70),
        new DungeonBossPokemon('Gastrodon (east)', 8000000, 70),
        new DungeonBossPokemon('Drednaw', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Rose Tower'] = new Dungeon('Rose Tower',
    ['Cufant', 'Bronzong', 'Klang', 'Mawile', 'Steelix', 'Galarian Stunfisk'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Froslass', 8000000, 70),
        new DungeonBossPokemon('Tsareena', 8000000, 70),
        new DungeonBossPokemon('Salazzle', 8000000, 70),
        new DungeonBossPokemon('Milotic', 8000000, 70),
        new DungeonBossPokemon('Garbodor', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Glimwood Tangle'] = new Dungeon('Glimwood Tangle',
    ['Galarian Ponyta', 'Spritzee', 'Swirlix', 'Phantump', 'Oranguru', 'Passimian', 'Sinistea'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Hattrem', 8000000, 70),
        new DungeonBossPokemon('Morgrem', 8000000, 70),
        new DungeonBossPokemon('Indeedee', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Watchtower Ruins'] = new Dungeon('Watchtower Ruins',
    ['Gastly', 'Noibat', 'Purrloin', 'Duskull', 'Woobat', 'Haunter', 'Shuckle', 'Ralts', 'Golett', 'Electrike', 'Snorunt'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Corviknight', 8000000, 70),
        new DungeonBossPokemon('Golurk', 8000000, 70),
        new DungeonBossPokemon('Drifblim', 8000000, 70),
        new DungeonBossPokemon('Glalie', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Lake of Outrage'] = new Dungeon('Lake of Outrage',
    ['Stonjourner', 'Cramorant', 'Galarian Mr. Mime', 'Morpeko', 'Coalossal', 'Sandaconda', 'Galarian Stunfisk', 'Copperajah', 'Indeedee', 'Obstagoon', 'Grimmsnarl'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Hatterene', 8000000, 70),
        new DungeonBossPokemon('Perrserker', 8000000, 70),
        new DungeonBossPokemon('Barraskewda', 8000000, 70),
        new DungeonBossPokemon('Drakloak', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Dusty Bowl'] = new Dungeon('Dusty Bowl',
    ['Gurdurr', 'Ferrothorn', 'Klang', 'Meowstic', 'Barbaracle', 'Applin', 'Hattrem', 'Qwilfish', 'Hitmonlee', 'Hitmonchan', 'Koffing'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Gigalith', 8000000, 70),
        new DungeonBossPokemon('Flygon', 8000000, 70),
        new DungeonBossPokemon('Sigilyph', 8000000, 70),
        new DungeonBossPokemon('Tyranitar', 8000000, 70),
    ],
    96500, 201, 35);



//Isle of Armor
dungeonList['Master Dojo Trial'] = new Dungeon('Master Dojo Trial',
    ['Mienfoo', 'Shinx', 'Kadabra', 'Whirlipede'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Kubfu', 8000000, 70)],
    96500, 201, 35);

dungeonList['Tower of Darkness'] = new Dungeon('Tower of Darkness',
    ['Zorua', 'Scraggy', 'Inkay', 'Krokorok'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Kubfu', 8000000, 70)],
    96500, 201, 35);

dungeonList['Tower of Water'] = new Dungeon('Tower of Water',
    ['Psyduck', 'Krabby', 'Marill', 'Poliwhirl'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Kubfu', 8000000, 70)],
    96500, 201, 35);


//Crown Tundra
dungeonList['Split-Decision Ruins'] = new Dungeon('Split-Decision Ruins',
    ['Golurk', 'Electivire', 'Dragapult', 'Araquanid', 'Cryogonal', 'Bronzong', 'Claydol', 'Absol', 'Galvantula', 'Audino'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Regidrago', 8000000, 70),
        new DungeonBossPokemon('Regieleki', 8000000, 70),
    ],
    96500, 201, 35);

dungeonList['Dyna Tree Hill'] = new Dungeon('Dyna Tree Hill',
    ['Magmar', 'Absol', 'Beartic', 'Cryogonal', 'Dubwool', 'Glalie', 'Clefable'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [new DungeonBossPokemon('Greedent', 8000000, 70)],
    96500, 201, 35);

dungeonList['Crown Shrine'] = new Dungeon('Crown Shrine',
    ['Snom', 'Hatenna', 'Solosis', 'Jynx', 'Piloswine', 'Dubwool'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2203000,
    [
        new DungeonBossPokemon('Sneasel', 8000000, 70),
        new DungeonBossPokemon('Calyrex', 8000000, 70, {
            requirement: new MultiRequirement([
                new ObtainedPokemonRequirement(pokemonMap.Spectrier),
                new ObtainedPokemonRequirement(pokemonMap.Glastrier),
            ])}),
    ],
    96500, 201, 35);
