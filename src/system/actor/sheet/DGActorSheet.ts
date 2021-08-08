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
import { CoreSkillType, StatisticType } from '../../../types/Constants';
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { rollPercentile } from '../../Dice';

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
        renderData.skills.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });

        const weapons = this.actor.items.filter((item) => item.type === 'weapon');
        const armor = this.actor.items.filter((item) => item.type === 'armor');
        const gear = this.actor.items.filter((item) => item.type === 'gear');

        // @ts-ignore
        renderData.weapons = weapons;
        // @ts-ignore
        renderData.armor = armor;
        // @ts-ignore
        renderData.gear = gear;

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

        html.find('label.clickable.statistic-roll').on('click', async (event) => {
            const target = preprocessEvent(event);
            const statisticId = target.data('statistic') as StatisticType;

            const value = this.actor.data.data.statistics[statisticId].value * 5;
            const result = await rollPercentile(value);

            // TODO: Nicely formatted chat card
            await result.roll.toMessage();
            console.warn(result);
        });

        html.find('label.clickable.skill-roll').on('click', async (event) => {
            const target = preprocessEvent(event);
            const skillType = target.data('type') as 'core' | 'custom';

            let value: number;
            let skillId: ActorSkillType = target.data('skill');
            switch (skillType) {
                case 'core':
                    value = this.actor.data.data.skills.core[skillId as CoreSkillType].value;
                    break;
                case 'custom':
                    value = this.actor.data.data.skills.custom[skillId].value;
                    break;
            }

            const result = await rollPercentile(value);

            // TODO: Nicely formatted chat card
            await result.roll.toMessage();
            console.warn(result);
        });

        html.find('label.clickable.add-skill').on('click', async (event) => {
            preprocessEvent(event);
            const id2Number = (key: string): number => {
                return parseInt(key.split('_')[1]);
            };
            const nextFreeId = (skillIds: string[]): string => {
                const skillIdNumbers = skillIds.map(id2Number);
                skillIdNumbers.sort((a, b) => a - b);

                for (let i = 0; i < skillIdNumbers.length; i++) {
                    if (skillIdNumbers[i] !== i) {
                        return `custom_${i}`;
                    }
                }
                return `custom_${skillIdNumbers.length}`;
            };

            const dialog = new InputDialog<string>({
                value: 'New Skill',
                title: 'New Skill',
                label: 'Skill Name',
                callback: async (label: string) => {
                    const skillIds = Object.keys(this.actor.data.data.skills.custom);
                    const nextId = nextFreeId(skillIds);
                    const nextSkill: Skill<string> = {
                        id: nextId,
                        value: 0,
                        failure: false,
                        delete: true,
                        type: 'custom',
                        label,
                    };

                    await this.actor.update({
                        [`data.skills.custom.${nextId}`]: nextSkill,
                    });
                },
            });
            dialog.render(true);
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
