export enum EQUIP_SLOTS {
    CHEST = 'CHEST'
}

export enum ITEMS_TYPES {
    LEATHER = 'LEATHER',
    LEATHER_ARMOR = 'LEATHER_ARMOR'
}

export interface Item {
    type: ITEMS_TYPES;
    name: string;
    equippable?: EQUIP_SLOTS;
    stats?: {
        armor?: number;
    }
}

export const items: { [name: string]: Item } = {
    [ITEMS_TYPES.LEATHER]: {type: ITEMS_TYPES.LEATHER, name: 'leather'},
    [ITEMS_TYPES.LEATHER_ARMOR]: {
        type: ITEMS_TYPES.LEATHER_ARMOR, name: 'leather armor', equippable: EQUIP_SLOTS.CHEST,
        stats: {armor: 2}
    }
};