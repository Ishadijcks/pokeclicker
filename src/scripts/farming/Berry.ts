///<reference path="./BerryType.ts"/>
///<reference path="./BerryColor.ts"/>
///<reference path="./aura/Aura.ts"/>
///<reference path="./aura/AuraType.ts"/>
///<reference path="../items/Item.ts"/>

interface BerryFlavor {
    type: FlavorType,
    value: number,
}

class Berry extends Item {
    public flavors: BerryFlavor[];
    public wander: PokemonNameType[];

    public static baseWander: PokemonNameType[] = [
        'Tangela', 'Scyther',
        'Pineco', 'Heracross',
        'Volbeat', 'Illumise',
        'Burmy (plant)', 'Combee', 'Cherubi', 'Munchlax',
        'Sewaddle', 'Karrablast',
    ];

    public static isBerry(args: any): args is Berry {
        return args instanceof Berry;
    }

    constructor(
        public type: BerryType,
        public growthTime: number[],
        public harvestAmount: number,
        public replantRate: number,
        public farmValue: number,
        public exp: number,
        flavors: number[],
        public color: BerryColor,
        public descriptionLines: string[],
        public aura?: Aura,
        wander?: PokemonNameType[]
    ) {
        super(BerryType[type], { imageDirectory: 'berry' });
        this.flavors = [];
        for (let i = 0; i < 5; i++) {
            this.flavors.push({type: i, value: flavors[i]});
        }
        this.wander = wander ? Berry.baseWander.concat(wander) : Berry.baseWander;
    }

    get displayName(): string {
        return `${BerryType[this.type]} Berry`;
    }

    get description(): string {
        return this.descriptionLines.join('<br/>');
    }
}

//#region Berry Data

//#region First Generation
ItemList['Cheri']     = new Berry(BerryType.Cheri,    [5,10,20,30,60],
    2, 0.5, 5, 1,
    [10, 0, 0, 0, 0], BerryColor.Red,
    ['This bright red Berry is very spicy and has a provocative flavor. It blooms with delicate, pretty flowers.']);
ItemList['Chesto']    = new Berry(BerryType.Chesto,   [5, 15, 25, 40, 80],
    3, 0.5, 6, 2,
    [0, 10, 0, 0, 0], BerryColor.Purple,
    ['This Berry\'s thick skin and fruit are very tough and dry tasting. However, every bit of it can be eaten.']);
ItemList['Pecha']     = new Berry(BerryType.Pecha,    [10, 35, 50, 60, 120],
    4, 0.5, 7, 3,
    [0, 0, 10, 0, 0], BerryColor.Pink,
    ['Because of its hollow inside pocket, there isn\'t a lot to eat. What can be eaten is very sweet and delicious']);
ItemList['Rawst']     = new Berry(BerryType.Rawst,    [15, 30, 45, 80, 160],
    5, 0.5, 8, 4,
    [0, 0, 0, 10, 0], BerryColor.Green,
    ['If the leaves grow longer and curlier than average, this Berry will have a somewhat-bitter taste.']);
ItemList['Aspear']    = new Berry(BerryType.Aspear,   [10, 40, 60, 120, 240],
    6, 0.5, 9, 5,
    [0, 0, 0, 0, 10], BerryColor.Yellow,
    ['This Berry\'s peel is hard, but the flesh inside is very juicy. It is distinguished by its bracing sourness.']);
ItemList['Leppa']     = new Berry(BerryType.Leppa,    [100, 120, 140, 240, 480],
    7, 0.5, 10, 6,
    [10, 0, 10, 10, 10], BerryColor.Red,
    ['It takes longer to grow than Berries such as Cheri. The smaller Berries taste better.']);
ItemList['Oran']      = new Berry(BerryType.Oran,     [120, 180, 240, 300, 600],
    8, 0.5, 20, 7,
    [10, 10, 0, 10, 10], BerryColor.Blue,
    ['Nature\'s gifts came together as one in this Berry. It has a wondrous mix of flavors that spread in the mouth.']);
ItemList['Sitrus']    = new Berry(BerryType.Sitrus,   [150, 300, 450, 600, 1200],
    9, 0.5, 30, 8,
    [0, 10, 10, 10, 10], BerryColor.Yellow,
    ['Sitrus came from the same family as Oran. It is larger and smoother tasting than Oran.']);
//#endregion

//#region Second Generation
ItemList['Persim']    = new Berry(BerryType.Persim,   [20, 40, 50, 90, 180],
    5, 0.4, 10, 2,
    [10, 10, 10, 0, 10], BerryColor.Pink,
    ['The more this Berry absorbs energy from sunlight, the more vividly colorful it grows.']);
ItemList['Razz']      = new Berry(BerryType.Razz,     [100, 150, 200, 250, 500],
    7, 0.4, 15, 2,
    [10, 10, 0, 0, 0], BerryColor.Red,
    ['A small hint of spiciness lingers in the red granules surrounding this Berry. Their centers have a dry taste.']);
ItemList['Bluk']      = new Berry(BerryType.Bluk,     [200, 250, 300, 330, 660],
    9, 0.4, 20, 2,
    [0, 10, 10, 0, 0], BerryColor.Purple,
    ['Though this small, delicately skinned Berry is blue in color, it dyes the mouth black when eaten.']);
ItemList['Nanab']     = new Berry(BerryType.Nanab,    [25, 30, 35, 250, 500],
    11, 0.4, 25, 2,
    [0, 0, 10, 10, 0], BerryColor.Pink,
    ['Bitter, but with a trace of sweetness, the Nanab Berry was the seventh to be discovered in the world.']);
ItemList['Wepear']    = new Berry(BerryType.Wepear,   [150, 350, 375, 400, 800],
    12, 0.4, 30, 2,
    [0, 0, 0, 10, 10], BerryColor.Green,
    ['The potent mix of bitter and sour in this Berry seems to promote digestion. The flower is white and beautiful.']);
ItemList['Pinap']     = new Berry(BerryType.Pinap,    [30, 60, 180, 240, 480],
    13, 0.4, 35, 2,
    [10, 0, 0, 0, 10], BerryColor.Yellow,
    ['It is said that when the sour skin is peeled, this spicy Berry can be crushed to make medicine.']);

ItemList['Figy']      = new Berry(BerryType.Figy,     [40, 160, 230, 350, 700],
    14, 0.3, 40, 3,
    [15, 0, 0, 0, 0], BerryColor.Red,
    ['This Berry is oddly shaped, appearing as if someone took a bite out of it. It is packed full of spicy substances.']);
ItemList['Wiki']      = new Berry(BerryType.Wiki,     [40, 190, 210, 360, 720],
    15, 0.3, 45, 3,
    [0, 15, 0, 0, 0], BerryColor.Purple,
    ['It is said that this Berry grew lumps to help Pokémon grip it, allowing propagation farther afield.']);
ItemList['Mago']      = new Berry(BerryType.Mago,     [40, 180, 240, 370, 740],
    16, 0.3, 50, 3,
    [0, 0, 15, 0, 0], BerryColor.Pink,
    ['This Berry progressively curves as it grows. The curvier the Berry, the sweeter and tastier.']);
ItemList['Aguav']     = new Berry(BerryType.Aguav,    [40, 170, 220, 350, 700],
    17, 0.3, 55, 3,
    [0, 0, 0, 15, 0], BerryColor.Green,
    ['This Berry turns bitter toward the stem. The dainty flower it grows from doesn\'t absorb much sunlight.']);
ItemList['Iapapa']    = new Berry(BerryType.Iapapa,   [40, 200, 230, 380, 760],
    18, 0.3, 60, 3,
    [0, 0, 0, 0, 15], BerryColor.Yellow,
    ['This Berry is very big and sour. The juiciness of the pulp accentuates the sourness.']);

ItemList['Lum']       = new Berry(BerryType.Lum,      [3000, 3200, 3400, 3600, 43200],
    1, 0, 1000, 3,
    [10, 10, 10, 10, 0], BerryColor.Green,
    [
        'This Berry\'s gradual process of storing nutrients beneficial to Pokémon health causes it to mature slowly.',
        'This Berry multiplies the effect of Berry plants around it.',
    ], new Aura(AuraType.Boost, [1.01, 1.02, 1.03]));
//#endregion

//#region Third Generation
ItemList['Pomeg']     = new Berry(BerryType.Pomeg,    [200, 1200, 4000, 5400, 10800],
    20, 0.2, 500, 10,
    [10, 0, 10, 10, 0], BerryColor.Red,
    ['When this sweetly spicy Berry\'s thick skin is peeled, many pieces of the fruit spill out.']);
ItemList['Kelpsy']    = new Berry(BerryType.Kelpsy,   [240, 2000, 3400, 6000, 12000],
    21, 0.2, 525, 10,
    [0, 10, 0, 10, 10], BerryColor.Blue,
    ['This Berry can be eaten as is or boiled to obtain an extract that adds a dash of flavor to food.']);
ItemList['Qualot']    = new Berry(BerryType.Qualot,   [230, 1000, 2500, 4800, 9600],
    22, 0.2, 550, 10,
    [10, 0, 10, 0, 10], BerryColor.Yellow,
    ['Even in places of constant rain and high humidity, this Berry\'s plant grows healthy and strong.']);
ItemList['Hondew']    = new Berry(BerryType.Hondew,   [1000, 2000, 5000, 10800, 21600],
    23, 0.2, 2000, 10,
    [10, 10, 0, 10, 0], BerryColor.Green,
    ['This somewhat-rare Berry projects an image of luxury, so it is favored as a gift item.']);
ItemList['Grepa']     = new Berry(BerryType.Grepa,    [300, 3400, 5600, 7200, 14400],
    24, 0.2, 600, 10,
    [0, 10, 10, 0, 10], BerryColor.Yellow,
    ['One bite of this very tender Berry fills the mouth with its sweet and tangy flavor.']);
ItemList['Tamato']    = new Berry(BerryType.Tamato,   [430, 1400, 4000, 8640, 17280],
    25, 0.2, 625, 10,
    [20, 10, 0, 0, 0], BerryColor.Red,
    ['This Berry is large and spicy. When eaten during the cold season, it warms the body from inside.']);

ItemList['Cornn']     = new Berry(BerryType.Cornn,    [1100, 4000, 8000, 9000, 18000],
    26, 0.1, 700, 10,
    [0, 20, 10, 0, 0], BerryColor.Purple,
    ['Its dryness is quite strong. As a result, its true deliciousness can\'t be appreciated by just eating one or two.']);
ItemList['Magost']    = new Berry(BerryType.Magost,   [2400, 6500, 10000, 14400, 28800],
    27, 0.1, 750, 10,
    [0, 0, 20, 10, 0], BerryColor.Pink,
    ['The grown-up flavor and dreamy sweetness of this Berry make it a favorite of Pokémon everywhere.']);
ItemList['Rabuta']    = new Berry(BerryType.Rabuta,   [2310, 5400, 9500, 12240, 24480],
    28, 0.1, 800, 10,
    [0, 0, 0, 20, 10], BerryColor.Green,
    ['Even though it is bitter, it should be eaten peel and all. The hair on the peel cleans the stomach from the inside.']);
ItemList['Nomel']     = new Berry(BerryType.Nomel,    [1240, 5200, 10500, 15120, 30240],
    29, 0.1, 850, 10,
    [10, 0, 0, 0, 20], BerryColor.Yellow,
    ['This Berry is quite sour overall, with the sourness especially concentrated at the pointed end.']);
ItemList['Spelon']    = new Berry(BerryType.Spelon,   [2000, 7000, 12000, 15480, 30960],
    30, 0.1, 900, 10,
    [30, 10, 0, 0, 0], BerryColor.Red,
    ['So spicy is the Spelon Berry that, Fire type or not, Pokémon will try to breathe fire after eating a single one.']);
ItemList['Pamtre']    = new Berry(BerryType.Pamtre,   [3000, 10000, 16400, 18000, 36000],
    31, 0.1, 950, 10,
    [0, 30, 10, 0, 0], BerryColor.Purple,
    ['This Berry drifted from a faraway sea. It is now cultivated in the Sinnoh region.']);
ItemList['Watmel']    = new Berry(BerryType.Watmel,   [2300, 3400, 9800, 16560, 33120],
    32, 0.1, 1000, 10,
    [0, 0, 30, 10, 0], BerryColor.Pink,
    ['A bounty of nature that is exceedingly sweet. The Berry is huge, with some discovered that exceed 20 inches.']);
ItemList['Durin']     = new Berry(BerryType.Durin,    [10000, 14000, 18000, 21600, 43200],
    33, 0.1, 1050, 10,
    [0, 0, 0, 30, 10], BerryColor.Green,
    ['This Berry is tremendously bitter. Just one bite is enough to instantly stop hiccups.']);
ItemList['Belue']     = new Berry(BerryType.Belue,    [5000, 9800, 14500, 19800, 39600],
    20, 0.1, 1100, 10,
    [10, 0, 0, 0, 30], BerryColor.Purple,
    ['This glossy and colorful Berry has a mouthwateringly delicious appearance. However, it is awfully sour.']);
//#endregion

//#region Fourth Generation (Typed)
ItemList['Occa']      = new Berry(BerryType.Occa,     [8090, 13200, 16000, 21960, 43920],
    21, 0.05, 1200, 15,
    [15, 0, 10, 0, 0], BerryColor.Red,
    [
        'This Berry is said to have grown plentiful in the tropics of the past. It boasts an intensely hot spiciness.',
        'It has a tendency to overtake nearby plants.',
    ], undefined, ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig']);
ItemList['Passho']    = new Berry(BerryType.Passho,   [490, 3600, 10800, 21600, 43200],
    22, 0.05, 1300, 15,
    [0, 15, 0, 10, 0], BerryColor.Blue,
    [
        'This Berry\'s flesh is dotted with countless tiny bubbles of air that keep it afloat in water.',
        'This Berry promotes the fruiting of nearby Berry plants.',
    ], new Aura(AuraType.Harvest, [1.1, 1.2, 1.3]), ['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott']);
ItemList['Wacan']     = new Berry(BerryType.Wacan,    [10, 180, 900, 1800, 3600],
    2, 0.05, 250, 1,
    [0, 0, 15, 0, 10], BerryColor.Yellow,
    [
        'Energy from lightning strikes is drawn into the plant, making the Berries grow big and rich.',
        'The same energy promotes the growth of nearby Berries.',
    ], new Aura(AuraType.Growth, [1.1, 1.2, 1.3]), ['Pikachu']);
ItemList['Rindo']     = new Berry(BerryType.Rindo,    [3600, 7200, 16200, 28800, 57600],
    24, 0.05, 1400, 15,
    [10, 0, 0, 15, 0], BerryColor.Green,
    [
        'This Berry has a disagreeable "green" flavor and scent typical of vegetables. It is rich in health-promoting fiber.',
        'It has a tendency to expand into nearby plots.',
    ], undefined, ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy']);
ItemList['Yache']     = new Berry(BerryType.Yache,    [3600, 14400, 28800, 43200, 86400],
    25, 0.05, 1500, 15,
    [0, 10, 0, 0, 15], BerryColor.Blue,
    [
        'This Berry has a refreshing flavor that strikes a good balance of dryness and sourness. It tastes better chilled.',
        'This Berry slows the growth of nearby Berries.',
    ], new Aura(AuraType.Growth, [0.9, 0.8, 0.7]), ['Snover']);
ItemList['Chople']    = new Berry(BerryType.Chople,   [5400, 10800, 25200, 36000, 72000],
    26, 0.05, 1600, 15,
    [15, 0, 0, 10, 0], BerryColor.Red,
    [
        'This Berry contains a substance that generates heat. It can even heat up a chilly heart.',
        'Growing these Berries will promote Egg growth.',
    ], new Aura(AuraType.Egg, [1.01, 1.02, 1.03]), ['Riolu']);
ItemList['Kebia']     = new Berry(BerryType.Kebia,    [100, 200, 400, 600, 86400],
    1, 1, 50, 1,
    [0, 15, 0, 0, 10], BerryColor.Green,
    [
        'This Berry is a brilliant green on the outside. Inside, it is packed with a dry-flavored, black-colored flesh.',
        'It has a tendency to overtake nearby plants.',
        'Due to its poisonous nature, it increases the chances of mutations near it.',
    ], new Aura(AuraType.Mutation, [1.2, 1.4, 1.6]), ['Gulpin']);
ItemList['Shuca']     = new Berry(BerryType.Shuca,    [7200, 16200, 32400, 39600, 79200],
    28, 1, 1700, 15,
    [10, 0, 15, 0, 0], BerryColor.Yellow,
    [
        'The sweetness-laden pulp has just the hint of a hard-edged and fragrant bite to it.',
        'Growing these Berries will soften the ground around it, increasing the chances of replanting.',
    ], new Aura(AuraType.Replant, [1.01, 1.02, 1.03]), ['Larvitar']);
ItemList['Coba']      = new Berry(BerryType.Coba,     [9000, 12600, 16200, 19800, 39600],
    29, 0.05, 1800, 15,
    [0, 10, 0, 15, 0], BerryColor.Blue,
    ['This Berry is said to be a new kind that is a cross of two Berries brought together by winds from far away.'],
    undefined, ['Tropius']);
ItemList['Payapa']    = new Berry(BerryType.Payapa,   [4680, 11880, 23400, 34200, 68400],
    30, 0.05, 1900, 15,
    [0, 0, 10, 0, 15], BerryColor.Purple,
    [
        'This Berry is said to sense human emotions for the way it swells roundly when a person approaches.',
        'The same behavior affects nearby plants, causing additional mutations.',
    ], new Aura(AuraType.Mutation, [1.1, 1.2, 1.3]), ['Natu']);
ItemList['Tanga']     = new Berry(BerryType.Tanga,    [450, 900, 1800, 3600, 7200],
    3, 0.5, 500, 15,
    [20, 0, 0, 0, 10], BerryColor.Green,
    [
        'The flower grows at the tip of this Berry. It attracts Bug Pokémon by letting its stringy petals stream out.',
        'The attracted Bug Pokémon decreases the amount of harvestable Berries in nearby plants',
    ], new Aura(AuraType.Harvest, [0.9, 0.8, 0.7]), ['Nincada']);
ItemList['Charti']    = new Berry(BerryType.Charti,   [8600, 12960, 23040, 37800, 75600],
    32, 0.05, 2000, 15,
    [10, 20, 0, 0, 0], BerryColor.Yellow,
    [
        'It is often used for pickles because of its very dry flavor. It can also be eaten raw for its provocative taste.',
        'This Berry plant hardens the surrounding soil, decreasing the chances of replanting.',
    ], new Aura(AuraType.Replant, [0.99, 0.98, 0.97]), ['Sudowoodo']);
ItemList['Kasib']     = new Berry(BerryType.Kasib,    [30, 60, 120, 300, 86400],
    1, 1, 25, 1,
    [0, 10, 20, 0, 0], BerryColor.Purple,
    [
        'Considered to have a special power from the olden days, this Berry is sometimes dried and used as a good-luck charm.',
        'This Berry causes other nearby Berries to wither away faster.',
    ], new Aura(AuraType.Death, [1.25, 1.5, 2.0]), ['Shedinja']);
ItemList['Haban']     = new Berry(BerryType.Haban,    [10800, 21600, 43200, 86400, 172800],
    34, 0, 4000, 15,
    [0, 0, 10, 20, 0], BerryColor.Red,
    [
        'If a large enough volume of this Berry is boiled down, its bitterness fades away. It makes a good jam.',
        'This Berry requires a lot of energy to grow, stealing away nutrients from nearby plots.',
    ], new Aura(AuraType.Growth, [0.8, 0.6, 0.5]), ['Bagon']);
ItemList['Colbur']    = new Berry(BerryType.Colbur,   [2880, 10080, 19440, 27000, 54000],
    35, 0.05, 2300, 15,
    [0, 0, 0, 10, 20], BerryColor.Purple,
    [
        'Tiny hooks grow on the surface of this Berry. It latches on to Pokémon so it can be carried to far-off places.',
        'It has a tendency to overtake nearby plants.',
    ], undefined, ['Absol']);
ItemList['Babiri']    = new Berry(BerryType.Babiri,   [7200, 16200, 32400, 64800, 129600],
    36, 0.05, 2400, 15,
    [25, 10, 0, 0, 0], BerryColor.Green,
    [
        'This Berry is very tough with a strong flavor. It was used to make medicine by people in the past.',
        'This Berry plant is very hardy and resistant, making it resistant to mutations, and also decreasing the chance of mutations around it.',
    ], new Aura(AuraType.Mutation, [0.5, 0.25, 0.0]), ['Skarmory']);
ItemList['Chilan']    = new Berry(BerryType.Chilan,   [240, 1430, 2970, 7200, 14400],
    10, 0.05, 500, 15,
    [0, 25, 10, 0, 0], BerryColor.Yellow,
    ['This Berry can be cored out and dried to make a whistle. Blowing through its hole makes an indescribable sound.']);
ItemList['Roseli']    = new Berry(BerryType.Roseli,   [2410, 5040, 12600, 25200, 50400],
    38, 0.05, 2500, 15,
    [0, 0, 25, 10, 0], BerryColor.Pink,
    [
        'This Berry is sweet with a hint of bitterness and has a lingering sweet scent. It is often dried and used to make tea.',
        'The scent of this Berry plant attracts wild Pokémon.',
    ], new Aura(AuraType.Attract, [1.01, 1.02, 1.03]), ['Togepi']);
//#endregion

//#region Fifth Generation
ItemList['Micle']     = new Berry(BerryType.Micle,    [3960, 7920, 15840, 31680, 63360],
    1, 0.05, 2600, 20,
    [0, 40, 10, 0, 0], BerryColor.Green,
    ['This Berry has a very dry flavor. It has the effect of making other food eaten at the same time taste sweet.']);
ItemList['Custap']    = new Berry(BerryType.Custap,   [3240, 8280, 13320, 27360, 54720],
    1, 0.05, 2700, 20,
    [0, 0, 40, 10, 0], BerryColor.Red,
    ['The flesh underneath the Custap Berry\'s tough skin is sweet and creamy soft.']);
ItemList['Jaboca']    = new Berry(BerryType.Jaboca,   [4320, 8640, 16560, 33480, 66960],
    1, 0.05, 2800, 20,
    [0, 0, 0, 40, 10], BerryColor.Yellow,
    [
        'The cluster of drupelets that make up this Berry pop rhythmically if the Berry is handled roughly.',
        'The sound of these Berries attracts wild Pokémon.',
    ]);
ItemList['Rowap']     = new Berry(BerryType.Rowap,    [5760, 9000, 14040, 21240, 42480],
    1, 0.05, 2900, 20,
    [10, 0, 0, 0, 40], BerryColor.Blue,
    ['In days of old, people worked the top-shaped pieces of this Berry free and used them as toys.']);
ItemList['Kee']       = new Berry(BerryType.Kee,      [4680, 9360, 18360, 36360, 72720],
    1, 0.05, 3000, 20,
    [30, 30, 10, 10, 10], BerryColor.Yellow,
    ['This Berry remains poisonous until fully ripened. Once ripe it has a spicy and sweet complex flavor.']);
ItemList['Maranga']   = new Berry(BerryType.Maranga,  [5040, 10080, 20160, 40320, 80640],
    1, 0.05, 3100, 20,
    [10, 10, 30, 30, 10], BerryColor.Blue,
    ['This Berry resembles the Durin Berry, however its spikes are less pronounced. It is quite delicious when roasted.']);

ItemList['Liechi']    = new Berry(BerryType.Liechi,   [21600, 43200, 86400, 172800, 345600],
    0.5, 0, 10000, 20,
    [30, 10, 30, 0, 0], BerryColor.Red,
    ['This Berry is surrounded by mystery. It is rumored to be imbued with the power of the sea.'],
    undefined, ['Manaphy']);
ItemList['Ganlon']    = new Berry(BerryType.Ganlon,   [21600, 43200, 86400, 172800, 345600],
    0.5, 0, 10000, 20,
    [0, 30, 10, 30, 0], BerryColor.Purple,
    ['This Berry is surrounded by mystery. It is rumored to be imbued with the power of the land.']);
ItemList['Salac']     = new Berry(BerryType.Salac,    [21600, 43200, 86400, 172800, 345600],
    0.5, 0, 10000, 20,
    [0, 0, 30, 10, 30], BerryColor.Green,
    ['This Berry is surrounded by mystery. It is rumored to be imbued with the power of the sky.']);
ItemList['Petaya']    = new Berry(BerryType.Petaya,   [10800, 21600, 43200, 86400, 432000],
    0.5, 0, 15000, 20,
    [30, 0, 0, 30, 10], BerryColor.Pink,
    [
        'This Berry is surrounded by mystery. It is rumored to be imbued with the power of all living things.',
        'This power keeps other Berries alive for longer.',
    ],
    undefined, ['Mew']);
ItemList['Apicot']    = new Berry(BerryType.Apicot,   [10800, 21600, 43200, 86400, 432000],
    0.5, 0, 15000, 20,
    [10, 30, 0, 0, 30], BerryColor.Blue,
    ['This is a very, very mystifying Berry. There is no telling how it can be used, or what may happen if it is used.']);
ItemList['Lansat']    = new Berry(BerryType.Lansat,   [10800, 21600, 43200, 86400, 432000],
    0.5, 0, 15000, 20,
    [30, 10, 30, 10, 30], BerryColor.Red,
    ['This is said to be a legendary Berry. Holding it supposedly brings great joy.']);
ItemList['Starf']     = new Berry(BerryType.Starf,    [10800, 21600, 43200, 86400, 432000],
    0.5, 0, 15000, 20,
    [30, 10, 30, 10, 30], BerryColor.Green,
    ['This Berry is considered a mirage. It was said to be so strong that it had to be abandoned at the world\'s edge.'],
    new Aura(AuraType.Shiny, [1.005, 1.01, 1.015]), ['Jirachi']);

ItemList['Enigma']    = new Berry(BerryType.Enigma,   [10800, 21600, 43200, 86400, 604800],
    0.5, 0, 15000, 20,
    [40, 10, 0, 0, 0], BerryColor.Purple,
    ['A completely enigmatic Berry. It apparently has the power of the stars that fill the night sky.']);
//#endregion

//#endregion
