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

import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { DGItemPhysical, PhysicalDataSourceData } from './DGItemPhysical';
import { Max, Value } from '../../types/Helpers';
import { ActorSkillType } from '../../types/Actor';
import { ItemTypeWeapon } from '../../types/Item';

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

export class DGWeapon extends DGItemPhysical {}
export interface DGWeapon extends DGItemPhysical {
    readonly data: ItemData & WeaponDataProperties;
}
