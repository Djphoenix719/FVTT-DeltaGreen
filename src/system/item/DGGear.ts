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
import { ItemTypeGear } from '../../types/Item';

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

export class DGGear extends DGItemPhysical {}
export interface DGGear extends DGItemPhysical {
    readonly data: ItemData & GearDataProperties;
}
