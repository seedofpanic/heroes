export enum EQUIP_SLOTS {
    RIGHT_HAND = 'RIGHT_HAND',
    CHEST = 'CHEST'
}

export enum ITEMS_TYPES {
    LEATHER = 'LEATHER',
    LEATHER_ARMOR = 'LEATHER_ARMOR',
    OLD_SWARD = 'OLD_SWARD'
}

export interface Item {
    type: ITEMS_TYPES;
    name: string;
    equippable?: EQUIP_SLOTS;
    stats?: {
        armor?: number;
        damage?: [number, number];
    }
}

export const items: { [name: string]: Item } = {
    [ITEMS_TYPES.LEATHER]: {type: ITEMS_TYPES.LEATHER, name: 'leather'},
    [ITEMS_TYPES.LEATHER_ARMOR]: {
        type: ITEMS_TYPES.LEATHER_ARMOR, name: 'leather armor', equippable: EQUIP_SLOTS.CHEST,
        stats: {armor: 2}
    },
    [ITEMS_TYPES.OLD_SWARD]: {
        type: ITEMS_TYPES.OLD_SWARD, name: 'Old sward', equippable: EQUIP_SLOTS.RIGHT_HAND,
        stats: {damage: [20, 40]}
    }
};
