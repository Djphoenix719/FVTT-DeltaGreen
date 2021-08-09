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

import { ActorSkillType, Skill } from '../../../types/Actor';
import { InputDialog } from '../../dialog/InputDialog';
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { ItemTypeSkill, NEW_SKILL_DEFAULTS } from '../../../types/Constants';
import { DGItem } from '../../item/DGItem';

export class DGActorSheet extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/templates/actor/Agent.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, CSS_CLASSES.BASE, CSS_CLASSES.AGENT];
        options.tabs = [
            {
                navSelector: 'nav.sheet-navigation',
                contentSelector: 'section.sheet-body',
                initial: 'tab-inventory',
            },
        ];
        options.width = 800;
        options.height = 900;
        return options;
    }

    public async getData(options?: Application.RenderOptions): Promise<ActorSheet.Data> {
        const renderData = await super.getData(options);

        // TODO: Figure out how to type this in FVTT-Types
        // @ts-ignore
        renderData.skills = this.actor.skills;
        // @ts-ignore
        renderData.skills.sort((a: DGItem, b: DGItem) => {
            return a.data.name.localeCompare(b.data.name);
        });

        // @ts-ignore
        renderData.inventory = {
            weapons: this.actor.items.filter((item) => item.type === 'weapon'),
            armor: this.actor.items.filter((item) => item.type === 'armor'),
            gear: this.actor.items.filter((item) => item.type === 'gear'),
        };

        console.warn(renderData);

        return renderData;
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        const preprocessEvent = (event: JQuery.ClickEvent) => {
            event.preventDefault();
            event.stopPropagation();
            return $(event.currentTarget);
        };

        html.find('label.clickable.roll').on('click', async (event) => {
            const domTarget = preprocessEvent(event);
            const valuePath = domTarget.data('roll') as string;
            const valueMultiple = parseInt(domTarget.data('multiple') ?? '1');

            // TODO: THIS AND ROLL CARD + FINISH REFACTORING THE ROLL HTML
            // const value = this.actor.data.data.statistics[].value * 5;
            // const result = await rollPercentile(value);

            // TODO: Nicely formatted chat card
            // await result.roll.toMessage();
            // console.warn(result);
        });

        html.find('label.clickable.add-skill').on('click', async (event) => {
            preprocessEvent(event);
            await this.actor.createEmbeddedDocuments('Item', [
                {
                    id: foundry.utils.randomID(16),
                    type: ItemTypeSkill,
                    name: NEW_SKILL_DEFAULTS.name,
                    data: {
                        ...NEW_SKILL_DEFAULTS.data,
                    },
                },
            ]);
        });

        html.find('div.skill-field label.clickable.delete').on('click', async (event) => {
            const target = preprocessEvent(event);
            const dataTarget = target.closest('div.skill-field');
            const confirm = await Dialog.confirm();
            const skillId = dataTarget.data('skill-id') as ActorSkillType;
            if (confirm) {
                await this.actor.update({
                    [`data.skills.custom.-=${skillId}`]: null,
                });
            }
        });

        html.find('div.breaking-point label.reset').on('click', async (event) => {
            preprocessEvent(event);
            const newBreakingPoint = this.actor.data.data.sanity.value - this.actor.data.data.statistics.power.value;
            await this.actor.update({
                [`data.sanity.breakingPoint.value`]: newBreakingPoint,
            });
        });
    }
}
