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

import { SYSTEM_NAME } from '../../Constants';
import { DGItemSheet, DGItemSheetData, DGItemSheetOptions } from './DGItemSheet';
import { SelectOption } from '../../../types/Sheet';
import { unique } from '../../util/ArrayHelper';

export interface DGSkillSheetOptions extends DGItemSheetOptions {}
export interface DGSkillSheetData extends DGItemSheetData {
    groups: string[];
}
export class DGSkillSheet extends DGItemSheet<DGSkillSheetOptions, DGSkillSheetData> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/static/templates/item/SkillSheet.html`;
        return options;
    }

    async getData(options?: Application.RenderOptions): Promise<DGSkillSheetData> {
        const data = await super.getData(options);

        if (this.item.actor) {
            const groupsIds = ['art', 'craft', 'foreignLanguage', 'militaryScience', 'pilot', 'science'];
            data.groups = Object.keys(this.item.actor.skillGroups);
            data.groups = [...data.groups, ...groupsIds.map((group) => game.i18n.localize(`DG.SKILLS.GROUP.${group}`))];
            data.groups = data.groups.filter(unique);
        }

        return data;
    }
}
