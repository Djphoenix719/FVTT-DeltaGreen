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
import { Bounded, Max, Value } from '../../types/Helpers';
import { ItemTypeWeapon } from '../../types/Item';
import { DGSkill } from './DGSkill';

export interface WeaponDataSourceData extends PhysicalDataSourceData {
    skill: Value<string>;
    range: Value<number>;
    damage: Value<string>;
    armorPiercing: Value<number>;
    lethality: Value<number>;
    killRadius: Value<number>;
    ammo: Bounded<number>;
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

export class DGWeapon extends DGItemPhysical {
    /**
     * Get associated skill item for the skill the weapon uses.
     */
    public get skillItem(): DGSkill | undefined {
        if (!this.actor) {
            return undefined;
        }
        if (this.data.data.skill.value === '') {
            return undefined;
        }

        return this.actor.items.get(this.data.data.skill.value) as DGSkill;
    }

    public prepareData() {
        super.prepareData();

        if (!this.actor && this.data.data.skill.value !== '') {
            this.data.data.skill.value = '';
        }
    }
}
export interface DGWeapon extends DGItemPhysical {
    readonly data: ItemData & WeaponDataProperties;
}
