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

import { ItemTypeGear, ItemTypeArmor, ItemTypeWeapon, ItemTypeSkill, ItemTypeBond, ItemTypeMotivation, ItemTypeDisorder, ExpenseType } from './Constants';
import { Max, Value } from './Helpers';
import { ActorSkillType } from './Actor';
import { DGItem } from '../system/item/DGItem';
import { DGSkill } from '../system/item/DGSkill';
import { DGBond } from '../system/item/DGBond';
import { DGMotivation } from '../system/item/DGMotivation';
import { DGDisorder } from '../system/item/DGDisorder';
import { DGGear } from '../system/item/DGGear';
import { DGArmor } from '../system/item/DGArmor';
import { DGWeapon } from '../system/item/DGWeapon';

export type ItemTypeSkill = typeof ItemTypeSkill;
export type ItemTypeBond = typeof ItemTypeBond;
export type ItemTypeMotivation = typeof ItemTypeMotivation;
export type ItemTypeDisorder = typeof ItemTypeDisorder;

export type ItemTypeGear = typeof ItemTypeGear;
export type ItemTypeArmor = typeof ItemTypeArmor;
export type ItemTypeWeapon = typeof ItemTypeWeapon;
export type ItemTypePhysical = ItemTypeGear | ItemTypeArmor | ItemTypeWeapon;

export type ItemType = ItemTypePhysical | ItemTypeSkill | ItemTypeBond | ItemTypeMotivation | ItemTypeDisorder;

/*********************
 SKILL DATA & PROPERTIES
 *********************/

export interface SkillDataSourceData {
    value?: number;
    group: string;
    failureImproves: boolean;
    sessionFailure: boolean;
    canDelete: boolean;
}
export interface SkillDataPropertyData extends SkillDataSourceData {}

export interface SkillDataSource {
    type: ItemTypeSkill;
    data: SkillDataSourceData;
}
export interface SkillDataProperties {
    type: ItemTypeSkill;
    data: SkillDataPropertyData;
}

/*********************
 BOND DATA & PROPERTIES
 *********************/

export interface BondDataSourceData {
    description: Value<string>;
    score: Value<number>;
    crossed: Value<boolean>;
    damaged: Value<boolean>;
}
export interface BondDataPropertyData extends BondDataSourceData {}

export interface BondDataSource {
    type: ItemTypeBond;
    data: BondDataSourceData;
}
export interface BondDataProperties {
    type: ItemTypeBond;
    data: BondDataPropertyData;
}

/*********************
 MOTIVATION DATA & PROPERTIES
 *********************/

export interface MotivationDataSourceData {
    description: Value<string>;
    crossed: Value<boolean>;
}
export interface MotivationDataPropertyData extends MotivationDataSourceData {}

export interface MotivationDataSource {
    type: ItemTypeMotivation;
    data: MotivationDataSourceData;
}
export interface MotivationDataProperties {
    type: ItemTypeMotivation;
    data: MotivationDataPropertyData;
}

/*********************
 BOND DATA & PROPERTIES
 *********************/

export interface DisorderDataSourceData {
    description: Value<string>;
    crossed: Value<boolean>;
}
export interface DisorderDataPropertyData extends DisorderDataSourceData {}

export interface DisorderDataSource {
    type: ItemTypeDisorder;
    data: DisorderDataSourceData;
}
export interface DisorderDataProperties {
    type: ItemTypeDisorder;
    data: DisorderDataPropertyData;
}

/*********************
 GEAR DATA & PROPERTIES
 *********************/

export interface PhysicalDataSourceData {
    expense: Value<ExpenseType>;
    equipped: Value<boolean>;
    carried: Value<boolean>;
    description: Value<string>;
}
export interface PhysicalDataPropertyData extends PhysicalDataSourceData {}

// GEAR
export interface GearDataSourceData extends PhysicalDataSourceData {}
export interface GearDataPropertyData extends GearDataSourceData {}

export interface GearDataSource {
    type: ItemTypeGear;
    data: GearDataSourceData;
}
export interface GearDataProperties {
    type: ItemTypeGear;
    data: GearDataPropertyData;
}

// ARMOR
export interface ArmorDataSourceData extends PhysicalDataSourceData {
    armorRating: Value<number>;
}
export interface ArmorDataPropertyData extends ArmorDataSourceData {}

export interface ArmorDataSource {
    type: ItemTypeArmor;
    data: ArmorDataSourceData;
}
export interface ArmorDataProperties {
    type: ItemTypeArmor;
    data: ArmorDataPropertyData;
}

// WEAPON
export interface WeaponDataSourceData extends PhysicalDataSourceData {
    skill: Value<ActorSkillType>;
    range: Value<number>;
    damage: Value<string>;
    armorPiercing: Value<number>;
    lethality: Value<number>;
    killRadius: Value<number>;
    ammo: Value<number> & Max<number>;
}
export interface WeaponDataPropertyData extends WeaponDataSourceData {}

export interface WeaponDataSource {
    type: ItemTypeWeapon;
    data: WeaponDataSourceData;
}
export interface WeaponDataProperties {
    type: ItemTypeWeapon;
    data: WeaponDataPropertyData;
}

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
    properties: ItemDataProperties;
    source: ItemDataSource;
    type: ItemType;
    cls: typeof DGItem;
}

export interface ItemTypeMap extends Record<ItemType, ItemTypeMapEntry> {
    skill: {
        properties: SkillDataProperties;
        source: SkillDataSource;
        type: ItemTypeSkill;
        cls: typeof DGSkill;
    };
    bond: {
        properties: BondDataProperties;
        source: BondDataSource;
        type: ItemTypeBond;
        cls: typeof DGBond;
    };
    motivation: {
        properties: MotivationDataProperties;
        source: MotivationDataSource;
        type: ItemTypeMotivation;
        cls: typeof DGMotivation;
    };
    disorder: {
        properties: DisorderDataProperties;
        source: DisorderDataSource;
        type: ItemTypeDisorder;
        cls: typeof DGDisorder;
    };
    gear: {
        properties: GearDataProperties;
        source: GearDataSource;
        type: ItemTypeGear;
        cls: typeof DGGear;
    };
    armor: {
        properties: ArmorDataProperties;
        source: ArmorDataSource;
        type: ItemTypeArmor;
        cls: typeof DGArmor;
    };
    weapon: {
        properties: WeaponDataProperties;
        source: WeaponDataSource;
        type: ItemTypeWeapon;
        cls: typeof DGWeapon;
    };
}

declare global {
    interface CONFIG {
        DG: {
            Item: {
                documentClasses: {
                    [T in ItemType]: ItemTypeMap[T]['cls'];
                };
            };
        };
    }
    interface SourceConfig {
        Item: ItemDataSource;
    }
    interface DataConfig {
        Item: ItemDataProperties;
    }
}
