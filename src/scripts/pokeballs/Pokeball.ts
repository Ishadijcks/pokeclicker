///<reference path="../items/Item.ts"/>
///<reference path="../shop/Shops.ts"/>
///<reference path="../shop/ShopItem.ts"/>

class Pokeball extends Item {

    constructor(
        public type: GameConstants.Pokeball,
        public catchBonus: () => number,
        public catchTime: number,
        description: string,
        initialValue?: number,
        initialUnlocked?: boolean
    ) {
        super(GameConstants.Pokeball[type], { description: description, imageDirectory: 'pokeball', initialValue: initialValue, initialUnlocked: initialUnlocked });
    }

    public static isPokeball(args: any): args is Pokeball {
        return args instanceof Pokeball;
    }

    gain(amt: number) {
        super.gain(amt);
    }

}

ItemList['Pokeball'] = new Pokeball(GameConstants.Pokeball.Pokeball, () => 0, 1250, 'A standard Pokéball', 25, true),
ItemList['Greatball'] = new Pokeball(GameConstants.Pokeball.Greatball, () => 5, 1000, '+5% chance to catch'),
ItemList['Ultraball'] = new Pokeball(GameConstants.Pokeball.Ultraball, () => 10, 750, '+10% chance to catch'),
ItemList['Masterball'] = new Pokeball(GameConstants.Pokeball.Masterball, () => 100, 500, '100% chance to catch'),
ItemList['Fastball'] = new Pokeball(GameConstants.Pokeball.Fastball, () => 0, 500, 'Reduced catch time'),

ItemList['Quickball'] = new Pokeball(GameConstants.Pokeball.Quickball, () => {
    if (App.game.gameState == GameConstants.GameState.fighting && player.route()) {
        const kills = App.game.statistics.routeKills[GameConstants.Region[player.region]]?.[player.route()]?.() || 0;
        // between 15 (0 kills) → 0 (4012 kills)
        return Math.min(15, Math.max(0, Math.pow(16, 1 - Math.pow(Math.max(0, kills - 10), 0.6) / 145) - 1));
    }
    return 0;
}, 1000, 'Increased catch rate on routes with less Pokémon defeated');

ItemList['Timerball'] = new Pokeball(GameConstants.Pokeball.Timerball, () => {
    if (App.game.gameState == GameConstants.GameState.fighting && player.route()) {
        const kills = App.game.statistics.routeKills[GameConstants.Region[player.region]]?.[player.route()]?.() || 0;
        // between 0 (0 kills) → 15 (9920 kills)
        return Math.min(15, Math.max(0, Math.pow(16, Math.pow(kills, 0.6) / 250) - 1));
    }
    return 0;
}, 1000, 'Increased catch rate on routes with more Pokémon defeated');

ItemList['Duskball'] = new Pokeball(GameConstants.Pokeball.Duskball, () => {
    const now = new Date();
    // If player in a dungeon or it's night time
    if (App.game.gameState == GameConstants.GameState.dungeon || now.getHours() >= 18 || now.getHours() < 6) {
        return 15;
    }
    return 0;
}, 1000, 'Increased catch rate at night time or in dungeons');

// TODO: this needs some sort of bonus, possibly extra dungeon tokens
ItemList['Luxuryball'] = new Pokeball(GameConstants.Pokeball.Luxuryball, () => 0, 1250, 'A Luxury Pokéball');
