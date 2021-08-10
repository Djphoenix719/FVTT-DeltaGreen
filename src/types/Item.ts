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
import { Label, Maximum, Value } from './Helpers';
import { ActorSkillType } from './Actor';

export type ItemTypeSkill = typeof ItemTypeSkill;
export type ItemTypeGear = typeof ItemTypeGear;
export type ItemTypeArmor = typeof ItemTypeArmor;
export type ItemTypeWeapon = typeof ItemTypeWeapon;
export type ItemTypeBond = typeof ItemTypeBond;
export type ItemTypeMotivation = typeof ItemTypeMotivation;
export type ItemTypeDisorder = typeof ItemTypeDisorder;

export type ItemType = ItemTypeGear | ItemTypeArmor | ItemTypeWeapon | ItemTypeSkill | ItemTypeBond | ItemTypeMotivation | ItemTypeDisorder;

/*********************
 SKILL DATA & PROPERTIES
 *********************/

interface SkillDataSourceData {
    value?: number;
    group: string;
    failureImproves: boolean;
    sessionFailure: boolean;
    canDelete: boolean;
}
interface SkillDataPropertyData extends SkillDataSourceData {}

interface SkillDataSource {
    type: ItemTypeSkill;
    data: SkillDataSourceData;
}
interface SkillDataProperties {
    type: ItemTypeSkill;
    data: SkillDataPropertyData;
}

/*********************
 BOND DATA & PROPERTIES
 *********************/

interface BondDataSourceData {
    description: Value<string>;
    score: Value<number>;
    crossed: Value<boolean>;
    damaged: Value<boolean>;
}
interface BondDataPropertyData extends BondDataSourceData {}

interface BondDataSource {
    type: ItemTypeBond;
    data: BondDataSourceData;
}
interface BondDataProperties {
    type: ItemTypeBond;
    data: BondDataPropertyData;
}

/*********************
 MOTIVATION DATA & PROPERTIES
 *********************/

interface MotivationDataSourceData {
    description: Value<string>;
    crossed: Value<boolean>;
}
interface MotivationDataPropertyData extends MotivationDataSourceData {}

interface MotivationDataSource {
    type: ItemTypeMotivation;
    data: MotivationDataSourceData;
}
interface MotivationDataProperties {
    type: ItemTypeMotivation;
    data: MotivationDataPropertyData;
}

/*********************
 BOND DATA & PROPERTIES
 *********************/

interface DisorderDataSourceData {
    description: Value<string>;
    crossed: Value<boolean>;
}
interface DisorderDataPropertyData extends DisorderDataSourceData {}

interface DisorderDataSource {
    type: ItemTypeDisorder;
    data: DisorderDataSourceData;
}
interface DisorderDataProperties {
    type: ItemTypeDisorder;
    data: DisorderDataPropertyData;
}

/*********************
 GEAR DATA & PROPERTIES
 *********************/

interface GearDataSourceData {
    expense: Value<ExpenseType>;
    equipped: Value<boolean>;
    carried: Value<boolean>;
    description: Value<string>;
}
interface GearDataPropertyData extends GearDataSourceData {}

interface ArmorDataSourceData extends GearDataSourceData {
    armorRating: Value<number>;
}
interface ArmorDataPropertyData extends ArmorDataSourceData {}

interface WeaponDataSourceData extends GearDataSourceData {
    skill: Value<ActorSkillType>;
    range: Value<number>;
    damage: Value<string>;
    armorPiercing: Value<number>;
    lethality: Value<number>;
    killRadius: Value<number>;
    ammo: Value<number> & Maximum<number>;
}
interface WeaponDataPropertyData extends WeaponDataSourceData {
    skill: Value<ActorSkillType> & Partial<Label<string>>;
}

interface GearDataSource {
    type: ItemTypeGear;
    data: GearDataSourceData;
}
interface GearDataProperties {
    type: ItemTypeGear;
    data: GearDataPropertyData;
}

interface ArmorDataSource {
    type: ItemTypeArmor;
    data: ArmorDataSourceData;
}
interface ArmorDataProperties {
    type: ItemTypeArmor;
    data: ArmorDataPropertyData;
}

interface WeaponDataSource {
    type: ItemTypeWeapon;
    data: WeaponDataSourceData;
}
interface WeaponDataProperties {
    type: ItemTypeWeapon;
    data: WeaponDataPropertyData;
}

type ItemDataSource = GearDataSource | ArmorDataSource | WeaponDataSource | SkillDataSource | BondDataSource | MotivationDataSource | DisorderDataSource;
type ItemDataProperties =
    | GearDataProperties
    | ArmorDataProperties
    | WeaponDataProperties
    | SkillDataProperties
    | BondDataProperties
    | MotivationDataProperties
    | DisorderDataProperties;

declare global {
    interface SourceConfig {
        Item: ItemDataSource;
    }
    interface DataConfig {
        Item: ItemDataProperties;
    }
}
