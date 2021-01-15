export enum SortOptions {
    id = 0,
    name = 1,
    attack = 2,
    level = 3,
    shiny = 4,
    baseAttack = 5,
    breedingEfficiency = 6,
    eggCycles = 7,
    timesHatched = 8,
    category = 9,
    proteinsUsed = 10,
}

export type SortOptionConfig = {
    // Display text in sort dropdown
    text: string;

    // How to get the comparison value from a PartyPokemon
    // TODO: type this p as a PartyPokemon when it is available as a module
    getValue: (p) => any;

    // true if the default sort direction should be descending
    invert?: boolean;
};

export const SortOptionConfigs: Record<SortOptions, SortOptionConfig> = {
    [SortOptions.id]: {
        text: 'Pokémon #',
        getValue: (p) => p.id,
    },

    [SortOptions.name]: {
        text: 'Name',
        getValue: (p) => p.name,
    },

    [SortOptions.attack]: {
        text: 'Attack',
        getValue: (p) => p.calculateAttack(),
        invert: true,
    },

    [SortOptions.level]: {
        text: 'Level',
        getValue: (p) => p.level,
        invert: true,
    },

    [SortOptions.shiny]: {
        text: 'Shiny',
        getValue: (p) => p.shiny,
        invert: true,
    },

    [SortOptions.baseAttack]: {
        text: 'Base Attack',
        getValue: (p) => p.baseAttack,
        invert: true,
    },

    [SortOptions.breedingEfficiency]: {
        text: 'Breeding Efficiency',
        getValue: (p) => p.calculateBreedingEfficiency(),
        invert: true,
    },

    [SortOptions.eggCycles]: {
        text: 'Egg Steps',
        getValue: (p) => p.eggCycles,
    },

    [SortOptions.timesHatched]: {
        text: 'Times Hatched',
        getValue: (p) => p.timesHatched() || 0,
    },

    [SortOptions.category]: {
        text: 'Category',
        getValue: (p) => p.category,
    },

    [SortOptions.proteinsUsed]: {
        text: 'Proteins Used',
        getValue: (p) => p.proteinsUsed() || 0,
    },
};
