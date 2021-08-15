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

import { DGItem } from './DGItem';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { ItemTypeDisorder } from '../../types/Item';
import { Value } from '../../types/Helpers';

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

export class DGDisorder extends DGItem {}
export interface DGDisorder extends DGItem {
    readonly data: ItemData & DisorderDataProperties;
}
