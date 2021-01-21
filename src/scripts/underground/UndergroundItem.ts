class UndergroundItem {
    public name: string;
    public id: number;
    public space: Array<Array<number>>;
    public value: number;
    public valueType: string;

    public static list: Array<UndergroundItem> = [];

    constructor(name: string, id: number, space: Array<Array<number>>, value = 1, valueType = 'Diamond') {
        this.name = name;
        this.id = id;
        this.space = space;
        this.value = value;
        this.valueType = valueType;
    }

    public static addItem(name, id, space, ...rest) {
        UndergroundItem.list.push(new UndergroundItem(name, id, space, ...rest));
    }

    public static getRandomItem(): UndergroundItem {
        const i = Math.floor(Math.random() * (UndergroundItem.list.length));
        return UndergroundItem.list[i] || UndergroundItem.list[0];
    }

    /**
     * Gets the Plate Underground Item ID for the Pokemon type. If no plate associated, returns the Splash Plate.
     * @param type The Pokemon type
     */
    public static getPlateIDByType(type: PokemonType): number {
        const mapping: {[key in PokemonType]: number} = {
            [PokemonType.Dragon]:   100,
            [PokemonType.Dark]:     101,
            [PokemonType.Ground]:   102,
            [PokemonType.Fighting]: 103,
            [PokemonType.Fire]:     104,
            [PokemonType.Ice]:      105,
            [PokemonType.Bug]:      106,
            [PokemonType.Steel]:    107,
            [PokemonType.Grass]:    108,
            [PokemonType.Psychic]:  109,
            [PokemonType.Flying]:   110,
            [PokemonType.Water]:    111,
            [PokemonType.Ghost]:    112,
            [PokemonType.Rock]:     113,
            [PokemonType.Poison]:   114,
            [PokemonType.Electric]: 115,
            [PokemonType.Fairy]:    116,
            [PokemonType.Normal]:   100,
            [PokemonType.None]:     100,
        };
        return mapping[type];
    }

    public static getPlateTypes(): PokemonType[] {
        return GameHelper.enumNumbers(PokemonType).filter(val => val != PokemonType.None && val != PokemonType.Normal);
    }

    public isStone(): boolean {
        return ItemList[this.valueType] instanceof EvolutionStone;
    }

    public static getFullResourceName(valuetype: string, amt: number): string {
        if (valuetype != 'Diamond' && amt >= 50) {
            valuetype += ' shard';
        }
        if (amt > 1) {
            valuetype += 's';
        }
        return GameConstants.humanifyString(valuetype);
    }

    get displayName() {
        return this.name;
    }

    get imagePath() {
        // Have to add extra logic here since images are all over the place in location and naming standards
        // Maybe one day we refactor the item system to be cleaner
        if (this.isStone()) {
            const evostone: EvolutionStone = (ItemList[this.valueType] as EvolutionStone);
            return evostone.imagePath;
        } else if (this.valueType == 'Mine Egg') {
            return `assets/images/breeding/${this.name}.png`;
        } else {
            return `assets/images/items/${this.name}.png`;
        }
    }

    get undergroundImage() {
        return `assets/images/underground/${this.name}.png`;
    }

}

// Diamond Items
UndergroundItem.addItem('Rare Bone',    1, [[1,0,0,0,0,1], [1,1,1,1,1,1], [1,0,0,0,0,1]], 3);
UndergroundItem.addItem('Star Piece',   2, [[0,1,0], [1,1,1], [0,1,0]], 5);
UndergroundItem.addItem('Revive',       3, [[0,1,0], [1,1,1], [0,1,0]], 2);
UndergroundItem.addItem('Max Revive',   4, [[1,1,1], [1,1,1], [1,1,1]], 4);
UndergroundItem.addItem('Iron Ball',    5, [[1,1,1], [1,1,1], [1,1,1]], 2);
UndergroundItem.addItem('Heart Scale',  6, [[1,0], [1,1]], 10);
UndergroundItem.addItem('Light Clay',   7, [[1,0,1,0], [1,1,1,0], [1,1,1,1], [0,1,0,1]], 2);
UndergroundItem.addItem('Odd Keystone', 8, [[1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1]], 6);
UndergroundItem.addItem('Hard Stone',   9, [[1,1],[1,1]], 4);
UndergroundItem.addItem('Oval Stone',   10, [[1,1,1], [1,1,1], [1,1,1]], 3);
UndergroundItem.addItem('Everstone',    11, [[1,1,1,1], [1,1,1,1]], 3);
UndergroundItem.addItem('Smooth Rock',  12, [[0,0,1,0], [1,1,1,0], [0,1,1,1], [0,1,0,0]], 2);
UndergroundItem.addItem('Heat Rock',    13, [[1,0,1,0], [1,1,1,1], [1,1,1,1]], 2);
UndergroundItem.addItem('Icy Rock',     14, [[0,1,1,0], [1,1,1,1], [1,1,1,1], [1,0,0,1]], 2);
UndergroundItem.addItem('Damp Rock',    15, [[1,1,1], [1,1,1], [1,0,1]], 2);

// Shard Plates
UndergroundItem.addItem('Draco Plate',  100, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'dragon');
UndergroundItem.addItem('Dread Plate',  101, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'dark');
UndergroundItem.addItem('Earth Plate',  102, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'ground');
UndergroundItem.addItem('Fist Plate',   103, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'fighting');
UndergroundItem.addItem('Flame Plate',  104, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'fire');
UndergroundItem.addItem('Icicle Plate', 105, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'ice');
UndergroundItem.addItem('Insect Plate', 106, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'bug');
UndergroundItem.addItem('Iron Plate',   107, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'steel');
UndergroundItem.addItem('Meadow Plate', 108, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'grass');
UndergroundItem.addItem('Mind Plate',   109, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'psychic');
UndergroundItem.addItem('Sky Plate',    110, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'flying');
UndergroundItem.addItem('Splash Plate', 111, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'water');
UndergroundItem.addItem('Spooky Plate', 112, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'ghost');
UndergroundItem.addItem('Stone Plate',  113, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'rock');
UndergroundItem.addItem('Toxic Plate',  114, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'poison');
UndergroundItem.addItem('Zap Plate',    115, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'electric');
UndergroundItem.addItem('Pixie Plate',  116, [[1,1,1,1], [1,1,1,1], [1,1,1,1]], 100, 'fairy');

// Fossils
UndergroundItem.addItem('Helix Fossil', 200, [[0,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,0]], 0, 'Mine Egg');
UndergroundItem.addItem('Dome Fossil',  201, [[1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [0,1,1,1,0]], 0, 'Mine Egg');
UndergroundItem.addItem('Old Amber',    202, [[0,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,0]], 0, 'Mine Egg');
UndergroundItem.addItem('Root Fossil',  203, [[0,0,1,1,1], [0,0,1,1,1], [1,0,0,1,1], [1,1,1,1,1], [0,1,1,1,0]], 0, 'Mine Egg');
UndergroundItem.addItem('Claw Fossil',  204, [[1,1,1,0,0], [1,1,1,1,0], [0,1,1,1,1], [0,0,0,1,1]], 0, 'Mine Egg');
UndergroundItem.addItem('Armor Fossil', 205, [[0,1,1,1,0], [0,1,1,1,0], [1,1,1,1,1], [0,1,1,1,0]], 0, 'Mine Egg');
UndergroundItem.addItem('Skull Fossil', 206, [[1,1,1,1], [1,1,1,1], [1,1,1,1], [0,1,1,0]], 0, 'Mine Egg');
UndergroundItem.addItem('Cover Fossil', 207, [[1,1,1,1,0], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [0,1,1,1,1]], 0, 'Mine Egg');
UndergroundItem.addItem('Plume Fossil', 208, [[0,0,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,0], [1,1,0,0,0]], 0, 'Mine Egg');
// UndergroundItem.addItem('Jaw Fossil',   209, [[1,1,1], [1,1,1], [1,1,1]], 0, 'Mine Egg');
// UndergroundItem.addItem('Sail Fossil',  210, [[1,1,1], [1,1,1], [1,1,1]], 0, 'Mine Egg');

// Evolution Stones
UndergroundItem.addItem('Fire Stone',    300, [[1,1,1], [1,1,1], [1,1,1]], 1, 'Fire_stone');
UndergroundItem.addItem('Water Stone',   301, [[1,1,1], [1,1,1], [1,1,0]], 1, 'Water_stone');
UndergroundItem.addItem('Thunder Stone', 302, [[0,1,1], [1,1,1], [1,1,0]], 1, 'Thunder_stone');
UndergroundItem.addItem('Leaf Stone',    303, [[0,1,0], [1,1,1], [1,1,1], [0,1,0]], 1, 'Leaf_stone');
UndergroundItem.addItem('Moon Stone',    304, [[0,1,1,1], [1,1,1,0]], 1, 'Moon_stone');
UndergroundItem.addItem('Sun Stone',     305, [[0,1,0], [1,1,1], [1,1,1]], 1, 'Sun_stone');
