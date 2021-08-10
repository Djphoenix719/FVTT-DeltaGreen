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

import { SelectOption } from '../../../types/Sheet';
import { SYSTEM_NAME } from '../../Constants';
import { DGGearSheet } from './DGGearSheet';
import { ItemTypeSkill } from '../../../types/Constants';

export class DGWeaponSheet extends DGGearSheet {
    public static get defaultOptions() {
        const options = super.defaultOptions;
        options.height = 500;
        options.tabs = [
            {
                navSelector: 'nav.sheet-navigation',
                contentSelector: 'section.sheet-body',
                initial: 'tab-data',
            },
        ];
        return options;
    }

    public async getData(options?: Application.RenderOptions): Promise<ItemSheet.Data> {
        const data = await super.getData(options);

        // TODO: Figure out how to type this in FVTT-Types
        // @ts-ignore
        data.subtemplate = `systems/${SYSTEM_NAME}/templates/item/WeaponSheet.html`;

        const skills: SelectOption[] = [
            {
                value: ' ',
                label: 'None',
            },
        ];
        if (this.item.actor) {
            const items = this.item.actor.items.filter((item) => item.type === ItemTypeSkill);
            skills.push(
                ...items.map((item) => {
                    return {
                        value: item.id as string,
                        label: item.name as string,
                    };
                }),
            );
        }

        skills.sort((a, b) => a.label.localeCompare(b.label));

        // @ts-ignore
        data.skills = skills;

        return data;
    }
}
