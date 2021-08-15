/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ItemTypeArmor, ItemTypeBond, ItemTypeDisorder, ItemTypeGear, ItemTypeMotivation, ItemTypeSkill, ItemTypeWeapon } from './Constants';
import { DGItem } from '../system/item/DGItem';
import { DGSkill, SkillDataProperties, SkillDataSource } from '../system/item/DGSkill';
import { BondDataProperties, BondDataSource, DGBond } from '../system/item/DGBond';
import { DGMotivation, MotivationDataProperties, MotivationDataSource } from '../system/item/DGMotivation';
import { DGDisorder, DisorderDataProperties, DisorderDataSource } from '../system/item/DGDisorder';
import { DGGear, GearDataProperties, GearDataSource } from '../system/item/DGGear';
import { ArmorDataProperties, ArmorDataSource, DGArmor } from '../system/item/DGArmor';
import { DGWeapon, WeaponDataProperties, WeaponDataSource } from '../system/item/DGWeapon';

export type ItemTypeSkill = typeof ItemTypeSkill;
export type ItemTypeBond = typeof ItemTypeBond;
export type ItemTypeMotivation = typeof ItemTypeMotivation;
export type ItemTypeDisorder = typeof ItemTypeDisorder;

export type ItemTypeGear = typeof ItemTypeGear;
export type ItemTypeArmor = typeof ItemTypeArmor;
export type ItemTypeWeapon = typeof ItemTypeWeapon;
export type ItemTypePhysical = ItemTypeGear | ItemTypeArmor | ItemTypeWeapon;

export type ItemType = ItemTypePhysical | ItemTypeSkill | ItemTypeBond | ItemTypeMotivation | ItemTypeDisorder;

export type ItemDataSource = GearDataSource | ArmorDataSource | WeaponDataSource | SkillDataSource | BondDataSource | MotivationDataSource | DisorderDataSource;
export type ItemDataProperties =
    | GearDataProperties
    | ArmorDataProperties
    | WeaponDataProperties
    | SkillDataProperties
    | BondDataProperties
    | MotivationDataProperties
    | DisorderDataProperties;

interface ItemTypeMapEntry {
    type: ItemType;
    cls: typeof DGItem;
}

export interface ItemTypeMap extends Record<ItemType, ItemTypeMapEntry> {
    skill: {
        type: ItemTypeSkill;
        cls: typeof DGSkill;
    };
    bond: {
        type: ItemTypeBond;
        cls: typeof DGBond;
    };
    motivation: {
        type: ItemTypeMotivation;
        cls: typeof DGMotivation;
    };
    disorder: {
        type: ItemTypeDisorder;
        cls: typeof DGDisorder;
    };
    gear: {
        type: ItemTypeGear;
        cls: typeof DGGear;
    };
    armor: {
        type: ItemTypeArmor;
        cls: typeof DGArmor;
    };
    weapon: {
        type: ItemTypeWeapon;
        cls: typeof DGWeapon;
    };
}

declare global {
    interface SourceConfig {
        Item: ItemDataSource;
    }
    interface DataConfig {
        Item: ItemDataProperties;
    }
}
