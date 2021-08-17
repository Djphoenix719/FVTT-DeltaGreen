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
import { ItemTypeSkill } from '../../types/Item';
import { Value } from '../../types/Helpers';

export interface SkillDataSourceData {
    rating: Value<number>;
    group: Value<string>;
    failureImproves: Value<boolean>;
    sessionFailure: Value<boolean>;
    canDelete: Value<boolean>;
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

export class DGSkill extends DGItem {
    prepareData() {
        super.prepareData();
        this.data.data.group.value = game.i18n.localize(this.data.data.group.value);
    }
}
export interface DGSkill extends DGItem {
    readonly data: ItemData & SkillDataProperties;
}
