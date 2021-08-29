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

import { ItemTypeAbility } from '../../types/Item';
import { DGItem } from './DGItem';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

export interface AbilityDataSourceData {
    attack: {
        value: number;
    };
    damage: {
        value: string;
    };
    lethality: {
        value: number;
    };
}
export interface AbilityDataPropertyData extends AbilityDataSourceData {}
export interface AbilityDataSource {
    type: ItemTypeAbility;
    data: AbilityDataSourceData;
}
export interface AbilityDataProperties {
    type: ItemTypeAbility;
    data: AbilityDataPropertyData;
}

export class DGAbility extends DGItem {}
export interface DGAbility extends DGItem {
    readonly data: ItemData & AbilityDataProperties;
}
