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
import { ItemTypeArmor } from '../../types/Item';
import { Value } from '../../types/Helpers';

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

export class DGArmor extends DGItemPhysical {}
export interface DGArmor extends DGItemPhysical {
    readonly data: ItemData & ArmorDataProperties;
}
