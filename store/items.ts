export enum EQUIP_SLOTS {
  CHEST = 'CHEST'
}

export enum ITEMS_IDS {
  LEATHER = 'LEATHER',
  LEATHER_ARMOR = 'LEATHER_ARMOR'
}

export const items = {
  [ITEMS_IDS.LEATHER]: {type: ITEMS_IDS.LEATHER, name: 'leather'},
  [ITEMS_IDS.LEATHER_ARMOR]: {type: ITEMS_IDS.LEATHER_ARMOR, name: 'leather armor', equippable: true, slot: EQUIP_SLOTS.CHEST}
};