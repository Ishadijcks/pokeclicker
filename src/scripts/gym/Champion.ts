/// <reference path="../../declarations/enums/Badges.d.ts"/>
///<reference path="Gym.ts"/>

class Champion extends Gym {
    constructor(
        leaderName: string,
        town: string,
        public basePokemon: GymPokemon[],
        badgeReward: BadgeEnums,
        moneyReward: number,
        rewardMessage: string,
        requirements: Requirement[] = [],
        public alternativePokemon1: GymPokemon[],
        public alternativePokemon2: GymPokemon[],
        public alternativePokemon3: GymPokemon[]
    ) {
        super(leaderName, town, basePokemon, badgeReward, moneyReward, rewardMessage, requirements);
    }

    public setPokemon(starter: GameConstants.Starter) {
        this.pokemons = [...this.basePokemon];
        switch (starter) {
            case GameConstants.Starter.Bulbasaur: {
                this.pokemons.push(...this.alternativePokemon1);
                break;
            }
            case GameConstants.Starter.Charmander: {
                this.pokemons.push(...this.alternativePokemon2);
                break;
            }
            case GameConstants.Starter.Squirtle:
            default: {
                this.pokemons.push(...this.alternativePokemon3);
                break;
            }
        }
    }

}

gymList['Champion Blue'] = new Champion(
    'Blue',
    'Champion Blue',
    [
        new GymPokemon('Pidgeot', 104340, 59),
        new GymPokemon('Alakazam', 112320, 57),
        new GymPokemon('Rhydon', 116340, 59),
    ],
    BadgeEnums.Elite_KantoChampion,
    10000,
    'Why? Why did I lose? I never made any mistakes raising my Pokémon… Darn it! You\'re the new Pokémon League Champion! Although I don\'t like to admit it…',
    [new GymBadgeRequirement(BadgeEnums.Elite_Lance)],
    // Bulbasaur
    [
        new GymPokemon('Exeggutor', 114520, 59),
        new GymPokemon('Gyarados', 126040, 61),
        new GymPokemon('Charizard', 140000, 63),
    ],
    // Charmander
    [
        new GymPokemon('Arcanine', 115340, 59),
        new GymPokemon('Exeggutor', 127520, 61),
        new GymPokemon('Blastoise', 140000, 63),
    ],
    // Squirtle/Pikachu
    [
        new GymPokemon('Gyarados', 113040, 59),
        new GymPokemon('Arcanine', 125340, 61),
        new GymPokemon('Venusaur', 140000, 63),
    ]
);

// TODO: Balancing - Set HP - Set win message
gymList['Champion Hao'] = new Champion(
    'Hao',
    'Champion Hao',
    [
        new GymPokemon('Alolan Raichu', 2015330, 59),
        new GymPokemon('Tauros', 2015330, 58),
        new GymPokemon('Noivern', 2015330, 58),
        new GymPokemon('Crabominable', 2015330, 59),
    ],
    BadgeEnums.Elite_AlolaChampion,
    100000,
    'We\'re gonna keep moving forward, by staying at full power all the time!',
    [new GymBadgeRequirement(BadgeEnums.Elite_Kahili)],
    // Bulbasaur
    [
        new GymPokemon('Flareon', 2015330, 58),
        new GymPokemon('Primarina', 2015330, 60),
    ],
    // Charmander
    [
        new GymPokemon('Vaporeon', 2015330, 58),
        new GymPokemon('Decidueye', 2015330, 60),
    ],
    // Squirtle/Pikachu
    [
        new GymPokemon('Leafeon', 2015330, 58),
        new GymPokemon('Incineroar', 2015330, 60),
    ]
);

//TODO: rewards/hp rebalance
gymList['Champion Leon'] = new Champion(
    'Leon',
    'Champion Leon',
    [
        new GymPokemon('Aegislash', 2015330, 59),
        new GymPokemon('Dragapult', 2015330, 58),
        new GymPokemon('Haxorus', 2015330, 58),
        new GymPokemon('Seismitoad', 2015330, 59),
        new GymPokemon('Charizard', 2015330, 59),
    ],
    BadgeEnums.Elite_GalarChampion,
    100000,
    'My time as Champion is over... But what a champion time it\'s been! Thank you for the greatest battle I\'ve ever had!',
    [new GymBadgeRequirement(BadgeEnums.Elite_Bede)],
    // Bulbasaur
    [new GymPokemon('Cinderace', 2015330, 60)],
    // Charmander
    [new GymPokemon('Inteleon', 2015330, 60)],
    // Squirtle/Pikachu
    [new GymPokemon('Rillaboom', 2015330, 60)]
);

//TODO: rewards/hp rebalance
gymList['Trainer Hop'] = new Champion(
    'Hop',
    'Trainer Hop',
    [
        new GymPokemon('Dubwool', 1945330, 49),
        new GymPokemon('Cramorant', 1948300, 49),
        new GymPokemon('Pincurchin', 1952000, 50),
        new GymPokemon('Snorlax', 1957000, 51),
        new GymPokemon('Corviknight', 1945330, 50),
    ],
    BadgeEnums.Elite_Hop,
    100000,
    'Thanks, mate. I\'m really glad you were the one here with me.',
    [new GymBadgeRequirement(BadgeEnums.Elite_Marnie)],
    // Bulbasaur
    [new GymPokemon('Inteleon', 2015330, 60)],
    // Charmander
    [new GymPokemon('Rillaboom', 2015330, 60)],
    // Squirtle/Pikachu
    [new GymPokemon('Cinderace', 2015330, 60)]
);
