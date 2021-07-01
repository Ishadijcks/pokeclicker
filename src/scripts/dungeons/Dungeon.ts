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
     * Gets all non-boss Pokemon encounters in the dungeon
     * Used for generating the dungeon encounter list view
     */
    get normalEncounterList(): EncounterInfo[] {
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

        return encounterInfo;
    }


    /**
     * Gets all boss encounters in the dungeon
     * Used for generating the dungeon encounter list view
     */
    get bossEncounterList(): EncounterInfo[] {
        const encounterInfo = [];

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
            [new GymPokemon('Gastly', 750, 24)],
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
    [
        {pokemon: 'Poochyena', options: { weight: 1.33 }},
        {pokemon: 'Wurmple', options: { weight: 1.33 }},
        {pokemon: 'Silcoon', options: { weight: 1.33 }},
        {pokemon: 'Cascoon', options: { weight: 1.33 }},
        {pokemon: 'Taillow', options: { weight: 1.33 }},
        {pokemon: 'Shroomish', options: { weight: 1.33 }},
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Wurmple', 12000, 3),
                new GymPokemon('Wurmple', 12000, 3),
                new GymPokemon('Wurmple', 12000, 3),
                new GymPokemon('Wurmple', 12000, 3),
            ], { weight: 1 }, 'Lyle'),
        new DungeonTrainer('Bug Catcher',
            [
                new GymPokemon('Nincada', 12000, 6),
                new GymPokemon('Nincada', 12000, 6),
            ], { weight: 1 }, 'James'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    380000,
    [
        new DungeonBossPokemon('Slakoth', 860000, 10, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Petalburg Woods'))}),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Poochyena', 860000, 9)],
            { weight: 1 }, undefined, '(male)'),
    ],
    12000, 101, 5);

dungeonList['Rusturf Tunnel'] = new Dungeon('Rusturf Tunnel',
    [
        {pokemon: 'Whismur', options: { weight: 4 }},
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Geodude', 14000, 16),
                new GymPokemon('Geodude', 14000, 16),
                new GymPokemon('Machop', 14000, 16),
            ], { weight: 1 }, 'Mike'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    400000,
    [
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Poochyena', 900000, 11)],
            { weight: 1 }, undefined, '(male)'),
    ],
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
    [
        {pokemon: 'Zubat', options: { weight: 0.8 }},
        {pokemon: 'Golbat', options: { weight: 0.8 }},
        {pokemon: 'Goldeen', options: { weight: 0.8 }},
        {pokemon: 'Magikarp', options: { weight: 0.8 }},
        {pokemon: 'Barboach', options: { weight: 0.8 }},
        new DungeonTrainer('Old Couple',
            [
                new GymPokemon('Medicham', 18000, 39),
                new GymPokemon('Hariyama', 18000, 39),
            ], { weight: 1 }, 'John and Jay'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    443000,
    [
        new DungeonBossPokemon('Solrock', 1240000, 20),
        new DungeonBossPokemon('Lunatone', 1240000, 20),
        new DungeonTrainer('Dragon Tamer',
            [
                new GymPokemon('Altaria', 640000, 37),
                new GymPokemon('Altaria', 640000, 37),
            ], { weight: 1 }, 'Nicolas'),
    ],
    18000, 101, 5);

dungeonList['Mt. Chimney'] = new Dungeon('Mt. Chimney',
    [
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Numel', 20000, 20)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Zubat', 20000, 20)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Magma Admin',
            [
                new GymPokemon('Numel', 18000, 18),
                new GymPokemon('Poochyena', 20000, 20),
                new GymPokemon('Numel', 22000, 22),
                new GymPokemon('Zubat', 22000, 22),
            ], { weight: 1 }, 'Tabitha'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    460000,
    [
        new DungeonTrainer('Magma Leader',
            [
                new GymPokemon('Mightyena', 450000, 24),
                new GymPokemon('Zubat', 450000, 24),
                new GymPokemon('Camerupt', 470000, 25),
            ], { weight: 1 }, 'Maxie'),
    ],
    20000, 101, 5);

dungeonList['Jagged Pass'] = new Dungeon('Jagged Pass',
    [
        {pokemon: 'Machop', options: { weight: 0.8 }},
        {pokemon: 'Numel', options: { weight: 0.8 }},
        {pokemon: 'Spoink', options: { weight: 0.8 }},
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Geodude', 22000, 20),
                new GymPokemon('Baltoy', 22000, 20),
            ], { weight: 1 }, 'Eric'),
        new DungeonTrainer('Picnicker',
            [
                new GymPokemon('Shroomish', 22000, 19),
                new GymPokemon('Oddish', 22000, 19),
                new GymPokemon('Swablu', 22000, 19),
            ], { weight: 1 }, 'Diana'),
        new DungeonTrainer('Picnicker',
            [new GymPokemon('Shroomish', 22000, 21)],
            { weight: 1 }, 'Autumn'),
        new DungeonTrainer('Triathlete',
            [new GymPokemon('Magnemite', 22000, 21)],
            { weight: 1 }, 'Julio', '(malecycling)'),
        new DungeonTrainer('Camper',
            [
                new GymPokemon('Zigzagoon', 22000, 20),
                new GymPokemon('Taillow', 22000, 20),
            ], { weight: 1 }, 'Ethan'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    460000,
    [
        new DungeonTrainer('Team Magma Grunt',
            [
                new GymPokemon('Mightyena', 700000, 22),
                new GymPokemon('Zubat', 700000, 22),
            ], { weight: 1 }, undefined, '(male)'),
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

dungeonList['Weather Institute'] = new Dungeon('Weather Institute',
    [
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Carvanha', 39000, 28)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Zubat', 39000, 27),
                new GymPokemon('Poochyena', 39000, 27),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Poochyena', 39000, 27),
                new GymPokemon('Carvanha', 39000, 27),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Zubat', 39000, 27),
                new GymPokemon('Poochyena', 39000, 27),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Poochyena', 39000, 26),
                new GymPokemon('Zubat', 39000, 26),
                new GymPokemon('Carvanha', 39000, 26),
            ], { weight: 1 }, undefined, '(male)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    470000,
    [
        new DungeonTrainer('Aqua Admin',
            [
                new GymPokemon('Carvanha', 910000, 28),
                new GymPokemon('Mightyena', 910000, 28),
            ], { weight: 1 }, 'Shelly', '(shelly)'),
    ],
    26000, 101, 5);

dungeonList['Mt. Pyre'] = new Dungeon('Mt. Pyre',
    [
        {pokemon: 'Shuppet', options: { weight: 12 }},
        {pokemon: 'Duskull', options: { weight: 12 }},
        {pokemon: 'Vulpix', options: { weight: 12 }},
        {pokemon: 'Wingull', options: { weight: 12 }},
        {pokemon: 'Meditite', options: { weight: 12 }},
        new DungeonTrainer('PokéManiac',
            [new GymPokemon('Rhyhorn', 28000, 31)],
            { weight: 1 }, 'Mark'),
        new DungeonTrainer('Hex Maniac',
            [new GymPokemon('Spoink', 28000, 31)],
            { weight: 1 }, 'Leah', '(hoenn)'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Hariyama', 28000, 31)],
            { weight: 1 }, 'Zander'),
        new DungeonTrainer('Young Couple',
            [
                new GymPokemon('Delcatty', 28000, 31),
                new GymPokemon('Manectric', 28000, 31),
            ],
            { weight: 1 }, 'Dez & Luke'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Wobbuffet', 28000, 26),
                new GymPokemon('Natu', 28000, 26),
                new GymPokemon('Kadabra', 28000, 26),
            ],
            { weight: 1 }, 'Kayla', '(female)'),
        new DungeonTrainer('Pokémon Breeder',
            [
                new GymPokemon('Skitty', 15000, 26),
                new GymPokemon('Poochyena', 15000, 26),
                new GymPokemon('Zigzagoon', 15000, 26),
                new GymPokemon('Lotad', 15000, 26),
                new GymPokemon('Seedot', 15000, 26),
                new GymPokemon('Taillow', 15000, 26),
            ],
            { weight: 1 }, 'Gabrielle', '(female)'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Ralts', 28000, 26),
                new GymPokemon('Ralts', 28000, 26),
                new GymPokemon('Kirlia', 28000, 26),
            ],
            { weight: 1 }, 'William', '(male)'),
        new DungeonTrainer('Hex Maniac',
            [new GymPokemon('Shuppet', 28000, 32)],
            { weight: 1 }, 'Tasha', '(hoenn)'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Hariyama', 28000, 32)],
            { weight: 1 }, 'Atsushi'),
        new DungeonTrainer('Hex Maniac',
            [new GymPokemon('Sableye', 28000, 32)],
            { weight: 1 }, 'Valerie', '(hoenn)'),
        new DungeonTrainer('Psychic',
            [new GymPokemon('Wobbuffet', 28000, 32)],
            { weight: 1 }, 'Cedric', '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Carvanha', 28000, 32)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Zubat', 28000, 32)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Poochyena', 28000, 30),
                new GymPokemon('Carvanha', 28000, 30),
            ],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Wailmer', 28000, 30),
                new GymPokemon('Zubat', 28000, 30),
            ],
            { weight: 1 }, undefined, '(female)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    480000,
    [
        new DungeonBossPokemon('Shuppet', 1880000, 20),
        new DungeonBossPokemon('Duskull', 1890000, 20),
        new DungeonBossPokemon('Chimecho', 1880000, 20),
    ],
    28000, 101, 5);

dungeonList['Magma Hideout'] = new Dungeon('Magma Hideout',
    [
        {pokemon: 'Geodude', options: { weight: 12 }},
        {pokemon: 'Graveler', options: { weight: 12 }},
        {pokemon: 'Torkoal', options: { weight: 12 }},
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Poochyena', 29000, 29)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Numel', 29000, 29)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Mightyena', 29000, 29)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Magma Grunt',
            [
                new GymPokemon('Baltoy', 29000, 28),
                new GymPokemon('Numel', 29000, 28),
            ],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Zubat', 29000, 29)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Numel', 29000, 29)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Mightyena', 29000, 29)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Baltoy', 29000, 29)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Magma Grunt',
            [new GymPokemon('Baltoy', 29000, 29)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Magma Admin',
            [
                new GymPokemon('Numel', 6000, 26),
                new GymPokemon('Mightyena', 8000, 28),
                new GymPokemon('Zubat', 10000, 30),
                new GymPokemon('Camerupt', 13000, 33),
            ],
            { weight: 1 }, 'Tabitha'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    490000,
    [
        new DungeonTrainer('Magma Leader',
            [
                new GymPokemon('Mightyena', 630000, 37),
                new GymPokemon('Crobat', 640000, 38),
                new GymPokemon('Camerupt', 650000, 39),
            ],
            { weight: 1 }, 'Maxie'),
    ],
    29000, 101, 5);

dungeonList['Aqua Hideout'] = new Dungeon('Aqua Hideout',
    [
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Poochyena', 30000, 32)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Carvanha', 30000, 32)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Zubat', 30000, 31),
                new GymPokemon('Carvanha', 30000, 31),
            ],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Poochyena', 30000, 31),
                new GymPokemon('Zubat', 30000, 31),
            ],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Carvanha', 30000, 32)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Zubat', 30000, 32)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Zubat', 30000, 32)],
            { weight: 1 }, undefined, '(female)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    490000,
    [
        new DungeonTrainer('Aqua Admin',
            [
                new GymPokemon('Mightyena', 900000, 34),
                new GymPokemon('Golbat', 900000, 34),
            ],
            { weight: 1 }, 'Matt', '(matt)'),
    ],
    30000, 101, 5);

dungeonList['Shoal Cave'] = new Dungeon('Shoal Cave',
    ['Zubat', 'Golbat', 'Spheal', 'Tentacool', 'Magikarp', 'Wailmer'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    490000,
    [new DungeonBossPokemon('Snorunt', 1900000, 20)],
    30000, 101, 5);

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
    [
        {pokemon: 'Zubat', options: { weight: 4.8 }},
        {pokemon: 'Golbat', options: { weight: 4.8 }},
        {pokemon: 'Tentacool', options: { weight: 4.8 }},
        {pokemon: 'Magikarp', options: { weight: 4.8 }},
        {pokemon: 'Wailmer', options: { weight: 4.8 }},
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Poochyena', 32000, 36)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Carvanha', 32000, 36)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Zubat', 32000, 36)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Aqua Grunt',
            [new GymPokemon('Carvanha', 32000, 36)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Aqua Grunt',
            [
                new GymPokemon('Mightyena', 32000, 35),
                new GymPokemon('Golbat', 32000, 35),
            ],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Aqua Admin',
            [
                new GymPokemon('Sharpedo', 32000, 37),
                new GymPokemon('Mightyena', 32000, 37),
            ], { weight: 1 }, 'Shelly', '(shelly)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    530000,
    [
        new DungeonTrainer('Aqua Leader',
            [
                new GymPokemon('Mightyena', 700000, 41),
                new GymPokemon('Crobat', 700000, 41),
                new GymPokemon('Sharpedo', 900000, 43),
            ],
            { weight: 1 }, 'Archie'),
    ],
    32000, 101, 5);

dungeonList['Sky Pillar'] = new Dungeon('Sky Pillar',
    ['Golbat', 'Sableye', 'Claydol', 'Banette', 'Mawile', 'Altaria'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    720000,
    [
        new DungeonBossPokemon('Dusclops', 3200000, 20),
        new DungeonBossPokemon('Rayquaza', 5824002, 100),
    ],
    34000, 101, 5);

dungeonList['Sealed Chamber'] = new Dungeon('Sealed Chamber',
    ['Zubat', 'Golbat', 'Tentacool'],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    500000,
    [
        new DungeonBossPokemon('Regirock', 4500000, 20),
        new DungeonBossPokemon('Regice', 4500000, 20),
        new DungeonBossPokemon('Registeel', 4500000, 20),
    ],
    36000, 101, 5);

dungeonList['Victory Road Hoenn'] = new Dungeon('Victory Road Hoenn',
    [
        {pokemon: 'Zubat', options: { weight: 4 }},
        {pokemon: 'Golbat', options: { weight: 4 }},
        {pokemon: 'Goldeen', options: { weight: 4 }},
        {pokemon: 'Magikarp', options: { weight: 4 }},
        {pokemon: 'Whismur', options: { weight: 4 }},
        {pokemon: 'Loudred', options: { weight: 4 }},
        {pokemon: 'Makuhita', options: { weight: 4 }},
        {pokemon: 'Hariyama', options: { weight: 4 }},
        {pokemon: 'Aron', options: { weight: 4 }},
        {pokemon: 'Lairon', options: { weight: 4 }},
        {pokemon: 'Mawile', options: { weight: 4 }},
        {pokemon: 'Meditite', options: { weight: 4 }},
        {pokemon: 'Medicham', options: { weight: 4 }},
        {pokemon: 'Barboach', options: { weight: 4 }},
        {pokemon: 'Whiscash', options: { weight: 4 }},
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Magneton', 37000, 43),
                new GymPokemon('Muk', 37000, 43),
            ], { weight: 1 }, 'Albert', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [new GymPokemon('Roselia', 37000, 45)],
            { weight: 1 }, 'Hope', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [new GymPokemon('Claydol', 37000, 45)],
            { weight: 1 }, 'Shannon', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Swellow', 37000, 42),
                new GymPokemon('Mawile', 37000, 42),
                new GymPokemon('Kadabra', 37000, 42),
            ], { weight: 1 }, 'Samuel', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Sandslash', 37000, 42),
                new GymPokemon('Ninetales', 37000, 42),
                new GymPokemon('Tropius', 37000, 42),
            ], { weight: 1 }, 'Julie', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Claydol', 37000, 43),
                new GymPokemon('Lanturn', 37000, 43),
            ], { weight: 1 }, 'Dianne', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Medicham', 37000, 43),
                new GymPokemon('Claydol', 37000, 43),
            ], { weight: 1 }, 'Felix', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Skarmory', 37000, 43),
                new GymPokemon('Sableye', 37000, 43),
            ], { weight: 1 }, 'Caroline', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Dodrio', 30000, 42),
                new GymPokemon('Kadabra', 30000, 42),
                new GymPokemon('Electrode', 30000, 42),
                new GymPokemon('Shiftry', 30000, 42),
            ], { weight: 1 }, 'Vito', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Torkoal', 37000, 42),
                new GymPokemon('Medicham', 37000, 42),
                new GymPokemon('Ludicolo', 37000, 42),
            ], { weight: 1 }, 'Michelle', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Lunatone', 37000, 43),
                new GymPokemon('Solrock', 37000, 43),
            ], { weight: 1 }, 'Mitchell', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Sableye', 37000, 43),
                new GymPokemon('Absol', 37000, 43),
            ], { weight: 1 }, 'Halle', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Cacturne', 37000, 43),
                new GymPokemon('Pelipper', 37000, 43),
            ], { weight: 1 }, 'Edgar', '(male)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Gardevoir', 37000, 43),
                new GymPokemon('Slaking', 37000, 43),
            ], { weight: 1 }, 'Katelynn', '(female)'),
        new DungeonTrainer('Cooltrainer',
            [
                new GymPokemon('Slaking', 37000, 43),
                new GymPokemon('Dusclops', 37000, 43),
            ], { weight: 1 }, 'Quincy', '(male)'),
    ],
    [GameConstants.BattleItemType.xAttack, GameConstants.BattleItemType.Lucky_egg],
    560000,
    [
        new DungeonTrainer('PKMN Trainer',
            [
                new GymPokemon('Altaria', 680000, 44),
                new GymPokemon('Delcatty', 670000, 43),
                new GymPokemon('Roselia', 680000, 44),
                new GymPokemon('Magneton', 650000, 41),
                new GymPokemon('Gardevoir', 690000, 45),
            ], { weight: 1 }, 'Wally', '(wally)'),
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
    [
        {pokemon: 'Psyduck', options: { weight: 2 }},
        {pokemon: 'Mareep', options: { weight: 2 }},
        {pokemon: 'Azurill', options: { weight: 2 }},
        {pokemon: 'Patrat', options: { weight: 2 }},
        {pokemon: 'Lillipup', options: { weight: 2 }},
        {pokemon: 'Pidove', options: { weight: 2 }},
        new DungeonTrainer('Lass',
            [
                new GymPokemon('Purrloin', 126500, 6),
                new GymPokemon('Sewaddle', 126500, 6),
            ], { weight: 1 }, 'Molly'),
        new DungeonTrainer('Janitor',
            [
                new GymPokemon('Lillipup', 126500, 6),
                new GymPokemon('Mareep', 126500, 6),
            ], { weight: 1 }, 'Orville'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Patrat', 126500, 6),
                new GymPokemon('Psyduck', 126500, 6),
            ], { weight: 1 }, 'Kenny'),
    ],
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
    [
        {pokemon: 'Rattata', options: { weight: 5.6 }},
        {pokemon: 'Zubat', options: { weight: 5.6 }},
        {pokemon: 'Grimer', options: { weight: 5.6 }},
        {pokemon: 'Muk', options: { weight: 5.6 }},
        {pokemon: 'Trubbish', options: { weight: 5.6 }},
        new DungeonTrainer('Janitor',
            [
                new GymPokemon('Lillipup', 146500, 16),
                new GymPokemon('Trubbish', 146500, 16),
            ], { weight: 1 }, 'Felix'),
        new DungeonTrainer('Doctor',
            [new GymPokemon('Sewaddle', 146500, 17)],
            { weight: 1 }, 'Heath'),
        new DungeonTrainer('Worker',
            [new GymPokemon('Drilbur', 146500, 17)],
            { weight: 1 }, 'Zack'),
        new DungeonTrainer('Worker',
            [new GymPokemon('Timburr', 146500, 17)],
            { weight: 1 }, 'Scott'),
        new DungeonTrainer('Scientist',
            [new GymPokemon('Grimer', 146500, 17)],
            { weight: 1 }, 'Caroline', '(female)'),
        new DungeonTrainer('Scientist',
            [new GymPokemon('Magnemite', 146500, 17)],
            { weight: 1 }, 'Clarke', '(male)'),
        new DungeonTrainer('Janitor',
            [
                new GymPokemon('Marill', 146500, 31),
                new GymPokemon('Cinccino', 146500, 31),
            ], { weight: 1 }, 'Brady'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2603000,
    [
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Sandile', 15000000, 16)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Scraggy', 15000000, 16)],
            { weight: 1 }, undefined, '(male)'),
    ],
    146500, 4, 100);

dungeonList['Relic Passage'] = new Dungeon('Relic Passage',
    [
        {pokemon: 'Rattata', options: { weight: 8 }},
        {pokemon: 'Raticate', options: { weight: 8 }},
        {pokemon: 'Roggenrola', options: { weight: 8 }},
        {pokemon: 'Woobat', options: { weight: 8 }},
        {pokemon: 'Timburr', options: { weight: 8 }},
        new DungeonTrainer('Scientist',
            [new GymPokemon('Grimer', 156500, 18)],
            { weight: 1 }, 'Terrance', '(male)'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Venipede', 156500, 17),
                new GymPokemon('Koffing', 156500, 17),
            ], { weight: 1 }, 'Lumina', '(female)'),
        new DungeonTrainer('Backpacker',
            [new GymPokemon('Herdier', 156500, 18)],
            { weight: 1 }, 'Kendall', '(male)'),
        new DungeonTrainer('Backpacker',
            [new GymPokemon('Sandslash', 156500, 32)],
            { weight: 1 }, 'Eileen', '(female)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Drilbur', 156500, 31),
                new GymPokemon('Roggenrola', 156500, 31),
            ], { weight: 1 }, 'Keith'),
        new DungeonTrainer('Backpacker',
            [new GymPokemon('Raticate', 156500, 32)],
            { weight: 1 }, 'Randall', '(male)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Roggenrola', 156500, 31),
                new GymPokemon('Timburr', 156500, 31),
            ], { weight: 1 }, 'Tobias'),
        new DungeonTrainer('Psychic',
            [new GymPokemon('Swoobat', 156500, 33)],
            { weight: 1 }, 'Tully', '(male)'),
        new DungeonTrainer('Backpacker',
            [new GymPokemon('Watchog', 156500, 32)],
            { weight: 1 }, 'Annie', '(female)'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Baltoy', 156500, 32),
                new GymPokemon('Yamask', 156500, 32),
            ], { weight: 1 }, 'Ena', '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    2803000,
    [
        new DungeonBossPokemon('Onix', 16000000, 100),
        new DungeonBossPokemon('Drilbur', 16000000, 100),
    ],
    156500, 25, 100);

dungeonList['Relic Castle'] = new Dungeon('Relic Castle',
    [
        {pokemon: 'Sandshrew', options: { weight: 1.33 }},
        {pokemon: 'Sandslash', options: { weight: 1.33 }},
        {pokemon: 'Sandile', options: { weight: 1.33 }},
        {pokemon: 'Baltoy', options: { weight: 1.33 }},
        {pokemon: 'Krokorok', options: { weight: 1.33 }},
        {pokemon: 'Yamask', options: { weight: 1.33 }},
        new DungeonTrainer('Psychic',
            [new GymPokemon('Gothita', 166500, 23)],
            { weight: 1 }, 'Dua', '(female)'),
        new DungeonTrainer('Psychic',
            [new GymPokemon('Solosis', 166500, 23)],
            { weight: 1 }, 'Low', '(male)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3003000,
    [
        new DungeonTrainer('Psychic',
            [new GymPokemon('Sigilyph', 18000000, 23)],
            { weight: 1 }, 'Perry', '(male)'),
        new DungeonBossPokemon('Volcarona', 18000000, 100),
    ],
    166500, 25, 100);

dungeonList['Lostlorn Forest'] = new Dungeon('Lostlorn Forest',
    [
        {pokemon: 'Roselia', options: { weight: 2.67 }},
        {pokemon: 'Combee', options: { weight: 2.67 }},
        {pokemon: 'Sewaddle', options: { weight: 2.67 }},
        {pokemon: 'Venipede', options: { weight: 2.67 }},
        {pokemon: 'Cottonee', options: { weight: 2.67 }},
        {pokemon: 'Petilil', options: { weight: 2.67 }},
        new DungeonTrainer('Pokémon Breeder',
            [
                new GymPokemon('Tranquill', 176500, 24),
                new GymPokemon('Liepard', 176500, 24),
            ], { weight: 1 }, 'Galen', '(male)'),
        new DungeonTrainer('Pokémon Ranger',
            [new GymPokemon('Trubbish', 176500, 26)],
            { weight: 1 }, 'Serenity', '(female)'),
        new DungeonTrainer('Pokémon Ranger',
            [new GymPokemon('Emolga', 176500, 26)],
            { weight: 1 }, 'Forrest', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Larvesta', 176500, 51),
                new GymPokemon('Pinsir', 176500, 51),
                new GymPokemon('Heracross', 176500, 51),
                new GymPokemon('Leavanny', 176500, 51),
                new GymPokemon('Scolipede', 176500, 51),
            ], { weight: 1 }, 'Murphy', '(male)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3203000,
    [
        new DungeonBossPokemon('Heracross', 19000000, 100),
        new DungeonBossPokemon('Pinsir', 19000000, 100),
        new DungeonBossPokemon('Emolga', 21000000, 100),
    ],
    176500, 16, 100);

dungeonList['Chargestone Cave'] = new Dungeon('Chargestone Cave',
    [
        {pokemon: 'Nosepass', options: { weight: 8.8 }},
        {pokemon: 'Boldore', options: { weight: 8.8 }},
        {pokemon: 'Joltik', options: { weight: 8.8 }},
        {pokemon: 'Ferroseed', options: { weight: 8.8 }},
        {pokemon: 'Klink', options: { weight: 8.8 }},
        new DungeonTrainer('Guitarist',
            [new GymPokemon('Emolga', 186500, 30)],
            { weight: 1 }, 'Anna'),
        new DungeonTrainer('Scientist',
            [new GymPokemon('Magneton', 186500, 30)],
            { weight: 1 }, 'Ronald', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Klink', 186500, 33),
                new GymPokemon('Unfezant', 186500, 33),
                new GymPokemon('Sandslash', 186500, 33),
            ], { weight: 1 }, 'Corky', '(male)'),
        new DungeonTrainer('Pokémon Ranger',
            [new GymPokemon('Ampharos', 186500, 34)],
            { weight: 1 }, 'Louis', '(male)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Aron', 186500, 32),
                new GymPokemon('Nosepass', 186500, 32),
            ], { weight: 1 }, 'Otto'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Minccino', 186500, 33),
                new GymPokemon('Excadrill', 186500, 33),
            ], { weight: 1 }, 'Briana', '(female)'),
        new DungeonTrainer('Doctor',
            [
                new GymPokemon('Solosis', 186500, 32),
                new GymPokemon('Gothita', 186500, 32),
            ], { weight: 1 }, 'Kit'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Joltik', 186500, 32),
                new GymPokemon('Golbat', 186500, 32),
            ], { weight: 1 }, 'Lumi', '(female)'),
        new DungeonTrainer('Guitarist',
            [new GymPokemon('Zebstrika', 186500, 33)],
            { weight: 1 }, 'Beverly'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Onix', 186500, 32),
                new GymPokemon('Boldore', 186500, 32),
            ], { weight: 1 }, 'Jeremy'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Stoutland', 186500, 33),
                new GymPokemon('Krokorok', 186500, 33),
                new GymPokemon('Ferroseed', 186500, 33),
            ], { weight: 1 }, 'Vicki', '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3403000,
    [
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Tirtouga', 12000000, 34),
                new GymPokemon('Magmar', 12000000, 34),
            ], { weight: 1 }, 'Mary', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Archen', 12000000, 34),
                new GymPokemon('Electabuzz', 12000000, 34),
            ], { weight: 1 }, 'Shaye', '(male)'),
        new DungeonBossPokemon('Drilbur', 22000000, 100),
        new DungeonBossPokemon('Tynamo', 22000000, 100),
    ],
    186500, 6, 100);

dungeonList['Mistralton Cave'] = new Dungeon('Mistralton Cave',
    [
        {pokemon: 'Boldore', options: { weight: 4 }},
        {pokemon: 'Woobat', options: { weight: 4 }},
        {pokemon: 'Aron', options: { weight: 4 }},
        {pokemon: 'Lairon', options: { weight: 4 }},
        new DungeonTrainer('Hiker',
            [new GymPokemon('Boldore', 196500, 32)],
            { weight: 1 }, 'Shelby'),
        new DungeonTrainer('Hiker',
            [new GymPokemon('Onix', 196500, 32)],
            { weight: 1 }, 'Jebediah'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Tirtouga', 196500, 33),
                new GymPokemon('Axew', 196500, 33),
            ], { weight: 1 }, 'Geoff', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Archen', 196500, 33),
                new GymPokemon('Axew', 196500, 33),
            ], { weight: 1 }, 'Belle', '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3603000,
    [
        new DungeonBossPokemon('Drilbur', 23000000, 100),
        new DungeonBossPokemon('Axew', 24000000, 100),
        new DungeonBossPokemon('Cobalion', 25000000, 100),
    ],
    196500, 6, 100);

dungeonList['Celestial Tower'] = new Dungeon('Celestial Tower',
    [
        {pokemon: 'Golbat', options: { weight: 8 }},
        {pokemon: 'Haunter', options: { weight: 8 }},
        {pokemon: 'Elgyem', options: { weight: 8 }},
        {pokemon: 'Misdreavus', options: { weight: 8 }},
        new DungeonTrainer('Psychic',
            [new GymPokemon('Musharna', 206500, 36)],
            { weight: 1 }, 'Joyce', '(female)'),
        new DungeonTrainer('School Kid',
            [new GymPokemon('Litwick', 206500, 35)],
            { weight: 1 }, 'Alberta', '(female)'),
        new DungeonTrainer('Pokéfan',
            [new GymPokemon('Clefairy', 206500, 35)],
            { weight: 1 }, 'Jude', '(male)'),
        new DungeonTrainer('Pokéfan',
            [new GymPokemon('Cubchoo', 206500, 35)],
            { weight: 1 }, 'Georgia', '(female)'),
        new DungeonTrainer('Psychic',
            [new GymPokemon('Espeon', 206500, 36)],
            { weight: 1 }, 'Micki', '(male)'),
        new DungeonTrainer('Nurse',
            [new GymPokemon('Leavanny', 206500, 35)],
            { weight: 1 }, 'Dixie'),
        new DungeonTrainer('Socialite',
            [new GymPokemon('Roselia', 206500, 35)],
            { weight: 1 }, 'Grace'),
        new DungeonTrainer('Gentleman',
            [new GymPokemon('Umbreon', 206500, 35)],
            { weight: 1 }, 'Daniel'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    3803000,
    [
        new DungeonBossPokemon('Litwick', 25000000, 100),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Elgyem', 14000000, 35),
                new GymPokemon('Duosion', 14000000, 35),
            ], { weight: 1 }, 'Bryce', '(male)'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Yamask', 14000000, 35),
                new GymPokemon('Gothorita', 14000000, 35),
            ], { weight: 1 }, 'Sarah', '(female)'),
    ],
    206500, 7, 100);

dungeonList['Reversal Mountain'] = new Dungeon('Reversal Mountain',
    [
        {pokemon: 'Skarmory', options: { weight: 5.2 }},
        {pokemon: 'Numel', options: { weight: 5.2 }},
        {pokemon: 'Camerupt', options: { weight: 5.2 }},
        {pokemon: 'Spoink', options: { weight: 5.2 }},
        {pokemon: 'Grumpig', options: { weight: 5.2 }},
        {pokemon: 'Trapinch', options: { weight: 5.2 }},
        {pokemon: 'Drifblim', options: { weight: 5.2 }},
        {pokemon: 'Skorupi', options: { weight: 5.2 }},
        {pokemon: 'Boldore', options: { weight: 5.2 }},
        {pokemon: 'Woobat', options: { weight: 5.2 }},
        new DungeonTrainer('Cyclist',
            [new GymPokemon('Zebstrika', 226500, 37)],
            { weight: 1 }, 'Jeremiah', '(male)'),
        new DungeonTrainer('Cyclist',
            [new GymPokemon('Unfezant', 226500, 37)],
            { weight: 1 }, 'Adalaide', '(female)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Gurdurr', 226500, 37),
                new GymPokemon('Crustle', 226500, 37),
            ], { weight: 1 }, 'Markus'),
        new DungeonTrainer('Backpacker',
            [
                new GymPokemon('Golbat', 226500, 37),
                new GymPokemon('Swanna', 226500, 37),
            ], { weight: 1 }, 'Kiyo', '(male)'),
        new DungeonTrainer('Doctor',
            [new GymPokemon('Swoobat', 226500, 38)],
            { weight: 1 }, 'Derek'),
        new DungeonTrainer('Backpacker',
            [
                new GymPokemon('Golbat', 226500, 37),
                new GymPokemon('Darmanitan', 226500, 37),
            ], { weight: 1 }, 'Kumiko', '(female)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Boldore', 226500, 37),
                new GymPokemon('Excadrill', 226500, 37),
            ], { weight: 1 }, 'Jared'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Vibrava', 226500, 39),
                new GymPokemon('Camerupt', 226500, 39),
            ], { weight: 1 }, 'Ray', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Grumpig', 226500, 39),
                new GymPokemon('Drifblim', 226500, 39),
            ], { weight: 1 }, 'Cora', '(female)'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Gurdurr', 226500, 37),
                new GymPokemon('Scraggy', 226500, 37),
                new GymPokemon('Scraggy', 226500, 37),
            ], { weight: 1 }, 'Corey'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Riolu', 226500, 37),
                new GymPokemon('Gurdurr', 226500, 37),
                new GymPokemon('Riolu', 226500, 37),
            ], { weight: 1 }, 'Chan'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Banette', 226500, 38),
                new GymPokemon('Golduck', 226500, 38),
            ], { weight: 1 }, 'Eliza', '(female)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Watchog', 226500, 38),
                new GymPokemon('Camerupt', 226500, 38),
            ], { weight: 1 }, 'Lewis', '(male)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4003000,
    [
        new DungeonBossPokemon('Cacturne', 24000000, 100),
        new DungeonBossPokemon('Excadrill', 26000000, 100),
        new DungeonBossPokemon('Heatran', 30000000, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion)}),
    ],
    226500, 14, 100);

dungeonList['Team Plasma Assault'] = new Dungeon('Team Plasma Assault',
    [
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Watchog', 241500, 44),
                new GymPokemon('Muk', 241500, 44),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Golbat', 241500, 44),
                new GymPokemon('Garbodor', 241500, 44),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Seviper', 241500, 44),
                new GymPokemon('Weezing', 241500, 44),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Pawniard', 241500, 46),
                new GymPokemon('Pawniard', 241500, 46),
                new GymPokemon('Absol', 241500, 46),
            ], { weight: 1 }, 'Shadow', '(shadow)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4603000,
    [
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Cryogonal', 11000000, 46),
                new GymPokemon('Cryogonal', 11000000, 46),
                new GymPokemon('Weavile', 12000000, 48),
            ], { weight: 1 }, 'Zinzolin', '(zinzolin)'),
    ],
    241500, 20, 100);

dungeonList['Seaside Cave'] = new Dungeon('Seaside Cave',
    [
        {pokemon: 'Golduck', options: { weight: 3.5 }},
        {pokemon: 'Seel', options: { weight: 3.5 }},
        {pokemon: 'Shellder', options: { weight: 3.5 }},
        {pokemon: 'Luvdisc', options: { weight: 3.5 }},
        {pokemon: 'Boldore', options: { weight: 3.5 }},
        {pokemon: 'Woobat', options: { weight: 3.5 }},
        {pokemon: 'Tynamo', options: { weight: 3.5 }},
        {pokemon: 'Frillish', options: { weight: 3.5 }},
        new DungeonTrainer('Battle Girl',
            [new GymPokemon('Heracross', 246500, 47)],
            { weight: 1 }, 'Tia'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Vibrava', 246500, 46),
                new GymPokemon('Gligar', 246500, 46),
            ], { weight: 1 }, 'Johan', '(male)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Onix', 246500, 46),
                new GymPokemon('Lairon', 246500, 46),
            ], { weight: 1 }, 'Mikiko', '(female)'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Scrafty', 246500, 47)],
            { weight: 1 }, 'Drago'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Roggenrola', 246500, 44),
                new GymPokemon('Roggenrola', 246500, 44),
                new GymPokemon('Roggenrola', 246500, 44),
                new GymPokemon('Roggenrola', 246500, 44),
            ], { weight: 1 }, 'Rocky'),
        new DungeonTrainer('Battle Girl',
            [new GymPokemon('Mienfoo', 246500, 47)],
            { weight: 1 }, 'Maki'),
        new DungeonTrainer('Black Belt',
            [new GymPokemon('Gurdurr', 246500, 47)],
            { weight: 1 }, 'Rich'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4203000,
    [
        new DungeonBossPokemon('Eelektrik', 28000000, 100),
        new DungeonBossPokemon('Crustle', 28000000, 100),
    ],
    246500, 21, 100);

dungeonList['Plasma Frigate'] = new Dungeon('Plasma Frigate',
    [
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Watchog', 257500, 46),
                new GymPokemon('Garbodor', 257500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Golbat', 257500, 46),
                new GymPokemon('Drapion', 257500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Seviper', 257500, 46),
                new GymPokemon('Garbodor', 257500, 46),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Krookodile', 257500, 47)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Drapion', 257500, 47)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Garbodor', 257500, 47)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Whirlipede', 257500, 46),
                new GymPokemon('Watchog', 257500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Pawniard', 257500, 45),
                new GymPokemon('Pawniard', 257500, 45),
                new GymPokemon('Pawniard', 257500, 45),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Scraggy', 257500, 46),
                new GymPokemon('Liepard', 257500, 46),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Weezing', 257500, 47)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Krokorok', 257500, 46),
                new GymPokemon('Raticate', 257500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Deino', 257500, 45),
                new GymPokemon('Deino', 257500, 45),
                new GymPokemon('Sneasel', 257500, 45),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Scraggy', 257500, 45),
                new GymPokemon('Krokorok', 257500, 45),
                new GymPokemon('Golbat', 257500, 45),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Scrafty', 257500, 47)],
            { weight: 1 }, undefined, '(female)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4603000,
    [
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Cryogonal', 12000000, 48),
                new GymPokemon('Cryogonal', 12000000, 48),
                new GymPokemon('Weavile', 13000000, 50),
            ], { weight: 1 }, 'Zinzolin', '(zinzolin)'),
    ],
    257500, 20, 100);

dungeonList['Giant Chasm'] = new Dungeon('Giant Chasm',
    [
        {pokemon: 'Clefairy', options: { weight: 5.33 }},
        {pokemon: 'Poliwag', options: { weight: 5.33 }},
        {pokemon: 'Seel', options: { weight: 5.33 }},
        {pokemon: 'Tangela', options: { weight: 5.33 }},
        {pokemon: 'Delibird', options: { weight: 5.33 }},
        {pokemon: 'Sneasel', options: { weight: 5.33 }},
        {pokemon: 'Piloswine', options: { weight: 5.33 }},
        {pokemon: 'Pelipper', options: { weight: 5.33 }},
        {pokemon: 'Lunatone', options: { weight: 5.33 }},
        {pokemon: 'Solrock', options: { weight: 5.33 }},
        {pokemon: 'Vanillish', options: { weight: 5.33 }},
        {pokemon: 'Basculin (Red-Striped)', options: { weight: 5.33 }},
        {pokemon: 'Basculin (Blue-Striped)', options: { weight: 5.33 }},
        {pokemon: 'Ditto', options: { weight: 5.33 }},
        {pokemon: 'Metang', options: { weight: 5.33 }},
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Weezing', 266500, 46),
                new GymPokemon('Muk', 266500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Scraggy', 266500, 46),
                new GymPokemon('Scrafty', 266500, 46),
                new GymPokemon('Whirlipede', 266500, 46),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Trubbish', 266500, 46),
                new GymPokemon('Golbat', 266500, 46),
                new GymPokemon('Garbodor', 266500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Skorupi', 266500, 45),
                new GymPokemon('Foongus', 266500, 45),
                new GymPokemon('Golbat', 266500, 45),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Krookodile', 266500, 47)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Doctor',
            [new GymPokemon('Leavanny', 266500, 49)],
            { weight: 1 }, 'Julius'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Scrafty', 266500, 47)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Scolipede', 266500, 47)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Trubbish', 266500, 46),
                new GymPokemon('Zangoose', 266500, 46),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Grimer', 266500, 46),
                new GymPokemon('Seviper', 266500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Raticate', 266500, 47),
                new GymPokemon('Watchog', 266500, 47),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Krokorok', 266500, 47),
                new GymPokemon('Krookodile', 266500, 47),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [new GymPokemon('Drapion', 266500, 47)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Deino', 266500, 45),
                new GymPokemon('Deino', 266500, 45),
                new GymPokemon('Sneasel', 266500, 45),
            ], { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Plasma Grunt',
            [
                new GymPokemon('Koffing', 266500, 46),
                new GymPokemon('Amoonguss', 266500, 46),
            ], { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Cryogonal', 266500, 49),
                new GymPokemon('Cryogonal', 266500, 49),
                new GymPokemon('Weavile', 266500, 51),
            ], { weight: 1 }, 'Zinzolin', '(zinzolin)'),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Magneton', 266500, 50),
                new GymPokemon('Beheeyem', 266500, 50),
                new GymPokemon('Metang', 266500, 50),
                new GymPokemon('Magnezone', 266500, 50),
                new GymPokemon('Klinklang', 266500, 52),
            ], { weight: 1 }, 'Colress', '(colress)'),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Pawniard', 266500, 49),
                new GymPokemon('Pawniard', 266500, 49),
                new GymPokemon('Absol', 266500, 51),
            ], { weight: 1 }, 'Shadow', '(shadow)'),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Pawniard', 266500, 49),
                new GymPokemon('Pawniard', 266500, 49),
                new GymPokemon('Banette', 266500, 51),
            ], { weight: 1 }, 'Shadow', '(shadow)'),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Pawniard', 266500, 49),
                new GymPokemon('Pawniard', 266500, 49),
                new GymPokemon('Accelgor', 266500, 51),
            ], { weight: 1 }, 'Shadow', '(shadow)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4403000,
    [
        new DungeonBossPokemon('Tangrowth', 30000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Giant Chasm'))}),
        new DungeonBossPokemon('Audino', 32000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Giant Chasm'))}),
        new DungeonBossPokemon('Mamoswine', 32000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('Giant Chasm'))}),
        new DungeonBossPokemon('Kyurem', 35000000, 100, {requirement: new GymBadgeRequirement(BadgeEnums.Elite_UnovaChampion)}),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Cofagrigus', 6000000, 50),
                new GymPokemon('Seismitoad', 6000000, 50),
                new GymPokemon('Eelektross', 6000000, 50),
                new GymPokemon('Drapion', 6000000, 50),
                new GymPokemon('Toxicroak', 6000000, 50),
                new GymPokemon('Hydreigon', 6500000, 52),
            ], { weight: 1 }, 'Ghetsis', '(ghetsis)'),
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
    [
        {pokemon: 'Vulpix', options: { weight: 1.45 }},
        {pokemon: 'Golduck', options: { weight: 1.45 }},
        {pokemon: 'Marill', options: { weight: 1.45 }},
        {pokemon: 'Azumarill', options: { weight: 1.45 }},
        {pokemon: 'Swablu', options: { weight: 1.45 }},
        {pokemon: 'Bronzor', options: { weight: 1.45 }},
        {pokemon: 'Cottonee', options: { weight: 1.45 }},
        {pokemon: 'Petilil', options: { weight: 1.45 }},
        {pokemon: 'Goldeen', options: { weight: 1.45 }},
        {pokemon: 'Basculin (Red-Striped)', options: { weight: 1.45 }},
        {pokemon: 'Basculin (Blue-Striped)', options: { weight: 1.45 }},
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Skorupi', 306500, 39),
                new GymPokemon('Seviper', 306500, 39),
            ], { weight: 1 }, 'Wes'),
        new DungeonTrainer('Twins',
            [
                new GymPokemon('Swablu', 306500, 38),
                new GymPokemon('Swablu', 306500, 38),
            ], { weight: 1 }, 'Rae & Ula'),
        new DungeonTrainer('Lass',
            [
                new GymPokemon('Deerling (Spring)', 306500, 39),
                new GymPokemon('Zangoose', 306500, 39),
            ], { weight: 1 }, 'Lurleen'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Karrablast', 306500, 37),
                new GymPokemon('Shelmet', 306500, 37),
                new GymPokemon('Joltik', 306500, 37),
                new GymPokemon('Scolipede', 306500, 37),
            ], { weight: 1 }, 'Jaye'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    4803000,
    [
        new DungeonBossPokemon('Bronzong', 38000000, 100),
        new DungeonBossPokemon('Altaria', 38000000, 100),
        new DungeonBossPokemon('Landorus', 42000000, 100),
    ],
    306500, 14, 100);

dungeonList['Victory Road Unova'] = new Dungeon('Victory Road Unova',
    [
        {pokemon: 'Poliwag', options: { weight: 6.67 }},
        {pokemon: 'Onix', options: { weight: 6.67 }},
        {pokemon: 'Marill', options: { weight: 6.67 }},
        {pokemon: 'Roselia', options: { weight: 6.67 }},
        {pokemon: 'Altaria', options: { weight: 6.67 }},
        {pokemon: 'Banette', options: { weight: 6.67 }},
        {pokemon: 'Buizel', options: { weight: 6.67 }},
        {pokemon: 'Basculin (Red-Striped)', options: { weight: 6.67 }},
        {pokemon: 'Basculin (Blue-Striped)', options: { weight: 6.67 }},
        {pokemon: 'Boldore', options: { weight: 6.67 }},
        {pokemon: 'Cottonee', options: { weight: 6.67 }},
        {pokemon: 'Petilil', options: { weight: 6.67 }},
        {pokemon: 'Tranquill', options: { weight: 6.67 }},
        {pokemon: 'Unfezant', options: { weight: 6.67 }},
        {pokemon: 'Gurdurr', options: { weight: 6.67 }},
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Golurk', 326500, 55),
                new GymPokemon('Sigilyph', 326500, 55),
            ], { weight: 1 }, 'Billy', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Drifblim', 326500, 55),
                new GymPokemon('Claydol', 326500, 55),
            ], { weight: 1 }, 'Jamie', '(female)'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Lampent', 326500, 54),
                new GymPokemon('Musharna', 326500, 54),
            ], { weight: 1 }, 'Alia', '(female)'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Metang', 326500, 54),
                new GymPokemon('Cofagrigus', 326500, 54),
            ], { weight: 1 }, 'Al', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Braviary', 326500, 55),
                new GymPokemon('Carracosta', 326500, 55),
            ], { weight: 1 }, 'Claude', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Mandibuzz', 326500, 55),
                new GymPokemon('Archeops', 326500, 55),
            ], { weight: 1 }, 'Cecile', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Darmanitan', 326500, 55),
                new GymPokemon('Tangrowth', 326500, 55),
            ], { weight: 1 }, 'Chandra', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Whimsicott', 326500, 55),
                new GymPokemon('Unfezant', 326500, 55),
            ], { weight: 1 }, 'Beckett', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Swoobat', 326500, 55),
                new GymPokemon('Lilligant', 326500, 55),
            ], { weight: 1 }, 'Shelly', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Sigilyph', 326500, 55),
                new GymPokemon('Crobat', 326500, 55),
            ], { weight: 1 }, 'Cathy', '(female)'),
        new DungeonTrainer('Doctor',
            [new GymPokemon('Clefable', 326500, 54)],
            { weight: 1 }, 'Logan'),
        new DungeonTrainer('Backpacker',
            [new GymPokemon('Sawsbuck (Spring)', 326500, 54)],
            { weight: 1 }, 'Mae', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Swanna', 326500, 55),
                new GymPokemon('Ampharos', 326500, 55),
            ], { weight: 1 }, 'Pierce', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Gigalith', 326500, 55),
                new GymPokemon('Skarmory', 326500, 55),
            ], { weight: 1 }, 'Abraham', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Heatmor', 326500, 55),
                new GymPokemon('Galvantula', 326500, 55),
            ], { weight: 1 }, 'Shanta', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Durant', 326500, 55),
                new GymPokemon('Ferrothorn', 326500, 55),
            ], { weight: 1 }, 'Webster', '(male)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Electabuzz', 326500, 54),
                new GymPokemon('Probopass', 326500, 54),
            ], { weight: 1 }, 'Eddie', '(male)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Magmar', 326500, 54),
                new GymPokemon('Camerupt', 326500, 54),
            ], { weight: 1 }, 'Elle', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Fraxure', 326500, 54),
                new GymPokemon('Zweilous', 326500, 54),
                new GymPokemon('Flygon', 326500, 54),
            ], { weight: 1 }, 'Hugo', '(male)'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Pinsir', 326500, 54),
                new GymPokemon('Heracross', 326500, 54),
            ], { weight: 1 }, 'Martell'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Throh', 326500, 54),
                new GymPokemon('Sawk', 326500, 54),
            ], { weight: 1 }, 'Chalina'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Zweilous', 326500, 55),
                new GymPokemon('Eelektross', 326500, 55),
            ], { weight: 1 }, 'Elmer', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Fraxure', 326500, 55),
                new GymPokemon('Vanilluxe', 326500, 55),
            ], { weight: 1 }, 'Caroll', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Zebstrika', 326500, 54),
                new GymPokemon('Sawk', 326500, 54),
                new GymPokemon('Starmie', 326500, 54),
            ], { weight: 1 }, 'Portia', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Beartic', 326500, 54),
                new GymPokemon('Throh', 326500, 54),
                new GymPokemon('Golurk', 326500, 54),
            ], { weight: 1 }, 'Sterling', '(male)'),
    ],
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
    [
        {pokemon: 'Onix', options: { weight: 10.4 }},
        {pokemon: 'Boldore', options: { weight: 10.4 }},
        {pokemon: 'Woobat', options: { weight: 10.4 }},
        {pokemon: 'Gurdurr', options: { weight: 10.4 }},
        {pokemon: 'Beartic', options: { weight: 10.4 }},
        new DungeonTrainer('Worker',
            [
                new GymPokemon('Roggenrola', 356500, 60),
                new GymPokemon('Graveler', 356500, 60),
                new GymPokemon('Excadrill', 356500, 60),
            ], { weight: 1 }, 'Cairn'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Tauros', 356500, 64),
                new GymPokemon('Crobat', 356500, 64),
                new GymPokemon('Carracosta', 356500, 64),
            ], { weight: 1 }, 'Carter', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Glaceon', 356500, 63),
                new GymPokemon('Bastiodon', 356500, 63),
                new GymPokemon('Rhyperior', 356500, 63),
                new GymPokemon('Drapion', 356500, 63),
            ], { weight: 1 }, 'Julia', '(female)'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Golett', 356500, 61),
                new GymPokemon('Mamoswine', 356500, 61),
            ], { weight: 1 }, 'Wade'),
        new DungeonTrainer('Worker',
            [
                new GymPokemon('Geodude', 356500, 60),
                new GymPokemon('Steelix', 356500, 60),
                new GymPokemon('Boldore', 356500, 60),
            ], { weight: 1 }, 'Gus'),
        new DungeonTrainer('Worker',
            [
                new GymPokemon('Machoke', 356500, 61),
                new GymPokemon('Abomasnow', 356500, 61),
            ], { weight: 1 }, 'Patton', '(ice)'),
        new DungeonTrainer('Nurse',
            [new GymPokemon('Blissey', 356500, 62)],
            { weight: 1 }, 'Carol'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Gyarados', 356500, 64),
                new GymPokemon('Kangaskhan', 356500, 64),
                new GymPokemon('Archeops', 356500, 64),
            ], { weight: 1 }, 'Chloris', '(female)'),
        new DungeonTrainer('Worker',
            [new GymPokemon('Sigilyph', 356500, 62)],
            { weight: 1 }, 'Cliff'),
        new DungeonTrainer('Hiker',
            [
                new GymPokemon('Larvitar', 356500, 61),
                new GymPokemon('Probopass', 356500, 61),
            ], { weight: 1 }, 'Hunter'),
        new DungeonTrainer('Worker',
            [
                new GymPokemon('Glalie', 356500, 61),
                new GymPokemon('Beartic', 356500, 61),
            ], { weight: 1 }, 'Victor', '(ice)'),
        new DungeonTrainer('Worker',
            [
                new GymPokemon('Smoochum', 356500, 60),
                new GymPokemon('Claydol', 356500, 60),
                new GymPokemon('Kadabra', 356500, 60),
            ], { weight: 1 }, 'Ryan', '(ice)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Weavile', 356500, 63),
                new GymPokemon('Rampardos', 356500, 63),
                new GymPokemon('Toxicroak', 356500, 63),
                new GymPokemon('Aggron', 356500, 63),
            ], { weight: 1 }, 'Zach', '(male)'),
    ],
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
    [
        {pokemon: 'Croagunk', options: { weight: 2.67 }},
        {pokemon: 'Palpitoad', options: { weight: 2.67 }},
        {pokemon: 'Karrablast', options: { weight: 2.67 }},
        {pokemon: 'Shelmet', options: { weight: 2.67 }},
        {pokemon: 'Stunfisk', options: { weight: 2.67 }},
        {pokemon: 'Barboach', options: { weight: 2.67 }},
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Accelgor', 356500, 62),
                new GymPokemon('Swalot', 356500, 62),
                new GymPokemon('Kecleon', 356500, 62),
            ], { weight: 1 }, 'Elaine', '(female)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Escavalier', 356500, 62),
                new GymPokemon('Skuntank', 356500, 62),
                new GymPokemon('Carnivine', 356500, 62),
            ], { weight: 1 }, 'Parker', '(male)'),
        new DungeonTrainer('Fisherman',
            [
                new GymPokemon('Corphish', 356500, 60),
                new GymPokemon('Poliwag', 356500, 60),
                new GymPokemon('Stunfisk', 356500, 60),
            ], { weight: 1 }, 'Eustace'),
        new DungeonTrainer('Fisherman',
            [
                new GymPokemon('Poliwhirl', 356500, 60),
                new GymPokemon('Whiscash', 356500, 60),
                new GymPokemon('Politoed', 356500, 60),
            ], { weight: 1 }, 'Arnold'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Keldeo', 50000000, 100),
        new DungeonBossPokemon('Seismitoad', 48000000, 100),
        new DungeonBossPokemon('Whiscash', 48000000, 100),
    ],
    356500, 8, 100);

dungeonList['Pinwheel Forest'] = new Dungeon('Pinwheel Forest',
    [
        {pokemon: 'Goldeen', options: { weight: 6.57 }},
        {pokemon: 'Marill', options: { weight: 6.57 }},
        {pokemon: 'Yanma', options: { weight: 6.57 }},
        {pokemon: 'Vigoroth', options: { weight: 6.57 }},
        {pokemon: 'Toxicroak', options: { weight: 6.57 }},
        {pokemon: 'Gurdurr', options: { weight: 6.57 }},
        {pokemon: 'Tympole', options: { weight: 6.57 }},
        {pokemon: 'Palpitoad', options: { weight: 6.57 }},
        {pokemon: 'Swadloon', options: { weight: 6.57 }},
        {pokemon: 'Whirlipede', options: { weight: 6.57 }},
        {pokemon: 'Cottonee', options: { weight: 6.57 }},
        {pokemon: 'Petilil', options: { weight: 6.57 }},
        {pokemon: 'Basculin (Red-Striped)', options: { weight: 6.57 }},
        {pokemon: 'Basculin (Blue-Striped)', options: { weight: 6.57 }},
        new DungeonTrainer('Preschooler',
            [
                new GymPokemon('Wooper', 356500, 60),
                new GymPokemon('Tympole', 356500, 60),
            ], { weight: 1 }, 'Jojo', '(male)'),
        new DungeonTrainer('Nursery Aide',
            [
                new GymPokemon('Exeggcute', 356500, 61),
                new GymPokemon('Miltank', 356500, 61),
            ], { weight: 1 }, 'Ethel'),
        new DungeonTrainer('Preschooler',
            [
                new GymPokemon('Dratini', 356500, 59),
                new GymPokemon('Gible', 356500, 59),
                new GymPokemon('Bagon', 356500, 59),
            ], { weight: 1 }, 'Samantha', '(female)'),
        new DungeonTrainer('Preschooler',
            [
                new GymPokemon('Burmy (plant)', 356500, 59),
                new GymPokemon('Scyther', 356500, 59),
                new GymPokemon('Paras', 356500, 59),
            ], { weight: 1 }, 'José', '(male)'),
        new DungeonTrainer('Twins',
            [
                new GymPokemon('Plusle', 356500, 60),
                new GymPokemon('Minun', 356500, 60),
            ], { weight: 1 }, 'Ally & Amy'),
        new DungeonTrainer('Nursery Aide',
            [
                new GymPokemon('Chansey', 356500, 61),
                new GymPokemon('Leavanny', 356500, 61),
            ], { weight: 1 }, 'Rosalyn'),
        new DungeonTrainer('Preschooler',
            [
                new GymPokemon('Pineco', 356500, 60),
                new GymPokemon('Ferrothorn', 356500, 60),
            ], { weight: 1 }, 'Ike', '(male)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Sudowoodo', 356500, 62),
                new GymPokemon('Gloom', 356500, 62),
                new GymPokemon('Beartic', 356500, 62),
            ], { weight: 1 }, 'Hillary', '(female)'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Weepinbell', 356500, 62),
                new GymPokemon('Luxray', 356500, 62),
                new GymPokemon('Ursaring', 356500, 62),
            ], { weight: 1 }, 'Dwayne', '(male)'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Mankey', 356500, 60),
                new GymPokemon('Snubbull', 356500, 60),
                new GymPokemon('Crawdaunt', 356500, 60),
            ], { weight: 1 }, 'Keita'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Electrike', 356500, 62),
                new GymPokemon('Rapidash', 356500, 62),
                new GymPokemon('Farfetch\'d', 356500, 62),
            ], { weight: 1 }, 'Ralph', '(male)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Crobat', 356500, 64),
                new GymPokemon('Magmortar', 356500, 64),
                new GymPokemon('Leafeon', 356500, 64),
            ], { weight: 1 }, 'Rosaline', '(female)'),
        new DungeonTrainer('Veteran',
            [
                new GymPokemon('Ludicolo', 356500, 64),
                new GymPokemon('Electivire', 356500, 64),
                new GymPokemon('Forretress', 356500, 64),
            ], { weight: 1 }, 'Sinan', '(male)'),
        new DungeonTrainer('Lass',
            [
                new GymPokemon('Nidoran(F)', 356500, 60),
                new GymPokemon('Nidoran(M)', 356500, 60),
                new GymPokemon('Nidoqueen', 356500, 60),
            ], { weight: 1 }, 'Helia'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Cascoon', 356500, 60),
                new GymPokemon('Silcoon', 356500, 60),
                new GymPokemon('Scolipede', 356500, 60),
            ], { weight: 1 }, 'Henley'),
        new DungeonTrainer('Pokémon Ranger',
            [
                new GymPokemon('Munchlax', 356500, 62),
                new GymPokemon('Zebstrika', 356500, 62),
                new GymPokemon('Kricketune', 356500, 62),
            ], { weight: 1 }, 'Melita', '(female)'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Phanpy', 356500, 60),
                new GymPokemon('Doduo', 356500, 60),
                new GymPokemon('Fearow', 356500, 60),
            ], { weight: 1 }, 'Nicholas'),
        new DungeonTrainer('School Kid',
            [
                new GymPokemon('Oddish', 356500, 60),
                new GymPokemon('Tangela', 356500, 60),
                new GymPokemon('Bellossom', 356500, 60),
            ], { weight: 1 }, 'Millie', '(female)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Furret', 356500, 63),
                new GymPokemon('Braviary', 356500, 63),
                new GymPokemon('Seismitoad', 356500, 63),
            ], { weight: 1 }, 'Kelsey', '(male)'),
        new DungeonTrainer('Ace Trainer',
            [
                new GymPokemon('Linoone', 356500, 63),
                new GymPokemon('Mandibuzz', 356500, 63),
                new GymPokemon('Toxicroak', 356500, 63),
            ], { weight: 1 }, 'Kathrine', '(female)'),
        new DungeonTrainer('Black Belt',
            [
                new GymPokemon('Tyrogue', 356500, 61),
                new GymPokemon('Scrafty', 356500, 61),
                new GymPokemon('Makuhita', 356500, 61),
            ], { weight: 1 }, 'Kentaro'),
        new DungeonTrainer('Battle Girl',
            [
                new GymPokemon('Tyrogue', 356500, 61),
                new GymPokemon('Machop', 356500, 61),
                new GymPokemon('Poliwrath', 356500, 61),
            ], { weight: 1 }, 'Lee'),
        new DungeonTrainer('School Kid',
            [
                new GymPokemon('Venonat', 356500, 60),
                new GymPokemon('Yanma', 356500, 60),
                new GymPokemon('Venomoth', 356500, 60),
            ], { weight: 1 }, 'Keston', '(male)'),
    ],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5203000,
    [
        new DungeonBossPokemon('Scolipede', 48000000, 100),
        new DungeonBossPokemon('Seismitoad', 48000000, 100),
        new DungeonBossPokemon('Virizion', 48000000, 100),
    ],
    356500, 3, 100);
dungeonList['Dreamyard'] = new Dungeon('Dreamyard',
    [
        {pokemon: 'Raticate', options: { weight: 4.67 }},
        {pokemon: 'Jigglypuff', options: { weight: 4.67 }},
        {pokemon: 'Golbat', options: { weight: 4.67 }},
        {pokemon: 'Watchog', options: { weight: 4.67 }},
        {pokemon: 'Liepard', options: { weight: 4.67 }},
        {pokemon: 'Munna', options: { weight: 4.67 }},
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Hypno', 356500, 62),
                new GymPokemon('Dusclops', 356500, 62),
            ], { weight: 1 }, 'Nandor', '(male)'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Gastly', 356500, 63),
                new GymPokemon('Skuntank', 356500, 63),
            ], { weight: 1 }, 'Athena', '(female)'),
        new DungeonTrainer('Psychic',
            [
                new GymPokemon('Chingling', 356500, 62),
                new GymPokemon('Mr. Mime', 356500, 62),
            ], { weight: 1 }, 'Olesia', '(female)'),
        new DungeonTrainer('Scientist',
            [
                new GymPokemon('Klang', 356500, 63),
                new GymPokemon('Porygon', 356500, 63),
            ], { weight: 1 }, 'Franklin', '(male)'),
        new DungeonTrainer('School Kid',
            [
                new GymPokemon('Shroomish', 356500, 63),
                new GymPokemon('Tangrowth', 356500, 63),
            ], { weight: 1 }, 'William', '(male)'),
        new DungeonTrainer('Youngster',
            [
                new GymPokemon('Slakoth', 356500, 63),
                new GymPokemon('Slaking', 356500, 63),
            ], { weight: 1 }, 'Keita'),
        new DungeonTrainer('School Kid',
            [
                new GymPokemon('Igglybuff', 356500, 63),
                new GymPokemon('Lickilicky', 356500, 63),
            ], { weight: 1 }, 'Rita', '(female)'),
    ],
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
    ['Scyther', 'Scizor', 'Pineco', 'Forretress', 'Porygon2', 'Electrode', 'Metang'],
    [GameConstants.BattleItemType.xClick, GameConstants.BattleItemType.Item_magnet],
    5403000,
    [
        new DungeonBossPokemon('Escavalier', 48000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonBossPokemon('Porygon-Z', 48000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonBossPokemon('Genesect', 62000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonBossPokemon('Porygon', 62000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonBossPokemon('Audino', 62000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonBossPokemon('Mawile', 62000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonBossPokemon('Sableye', 62000000, 100, {requirement: new ClearDungeonRequirement(1, GameConstants.getDungeonIndex('P2 Laboratory'))}),
        new DungeonTrainer('Team Plasma',
            [
                new GymPokemon('Magneton', 10000000, 72),
                new GymPokemon('Rotom (wash)', 10000000, 72),
                new GymPokemon('Metagross', 10000000, 72),
                new GymPokemon('Beheeyem', 10000000, 72),
                new GymPokemon('Magnezone', 10000000, 72),
                new GymPokemon('Klinklang', 11000000, 74),
            ], { weight: 1 }, 'Colress', '(colress)'),
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
        new DungeonTrainer('Team Flare Grunt',
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
            { weight: 1 }, 'Mable'),
        new DungeonBossPokemon('Abomasnow', 85376500, 50),
    ],
    665500, 15, 40);

dungeonList['Team Flare Secret HQ'] = new Dungeon('Team Flare Secret HQ',
    [
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Toxicroak', 8739480, 50)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Liepard', 8739480, 48)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Manectric', 8739480, 50)],
            { weight: 1 }, undefined, '(female)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Mightyena', 8739480, 48)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Admin',
            [new GymPokemon('Houndoom', 8739480, 50)],
            { weight: 1 }, undefined, '(male)'),
        new DungeonTrainer('Team Flare Grunt',
            [new GymPokemon('Scrafty', 8739480, 48)],
            { weight: 1 }, undefined, '(female)'),
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
        new DungeonTrainer('Backpacker',
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
            ], { weight: 1 }, 'Corinne'),
        new DungeonTrainer('Hex Maniac',
            [new GymPokemon('Gourgeist', 3500000, 58)],
            { weight: 1 }, 'Raziah', '(kalos)'),
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
                new GymPokemon('Skarmory', 32395730, 55),
                new GymPokemon('Umbreon', 33254840, 55),
                new GymPokemon('Alakazam', 35385940, 57),
            ], { weight: 1 }, 'Gilles', '(male)'),
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
