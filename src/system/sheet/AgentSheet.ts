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

import { CSS_CLASSES, SYSTEM_NAME } from '../Constants';
import { ActorSkillType, CoreSkillType, BaseStatisticType, CustomSkillType, Skill } from '../../types/Actor';
import { rollPercentile } from '../Dice';
import InputDialog from '../dialog/InputDialog';

export class AgentSheet extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/templates/actor/Agent.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, CSS_CLASSES.BASE, CSS_CLASSES.AGENT];
        options.tabs = [
            {
                navSelector: 'nav.sheet-navigation',
                contentSelector: 'section.sheet-body',
                initial: 'tab-skills',
            },
        ];
        options.width = 800;
        options.height = 900;
        return options;
    }

    protected _collapsibles: Record<string, boolean> = {};

    public async getData(options?: Application.RenderOptions): Promise<ActorSheet.Data> {
        const renderData = await super.getData(options);

        // TODO: Figure out how to type this in FVTT-Types
        // @ts-ignore
        renderData.collapsibles = this._collapsibles;
        // @ts-ignore
        renderData.skills = Object.values(mergeObject(duplicate(this.actor.data.data.skills.core), duplicate(this.actor.data.data.skills.custom)));
        // @ts-ignore
        renderData.skills.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });

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
            const statisticId = target.data('statistic') as BaseStatisticType;

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
            let skillId: ActorSkillType;
            switch (skillType) {
                case 'core':
                    skillId = target.data('skill') as CoreSkillType;
                    value = this.actor.data.data.skills['core'][skillId].value;
                    break;
                case 'custom':
                    skillId = target.data('skill') as CustomSkillType;
                    value = this.actor.data.data.skills['custom'][skillId].value;
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
            const nextFreeId = (skillIds: string[]): CustomSkillType => {
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
                    const nextSkill: Skill<CustomSkillType> = {
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

        // collapsibles
        html.find('div.collapsible').on('click', async (event) => {
            const target = preprocessEvent(event);
            const wrapper = target.next('.collapse-content');
            const id = wrapper.data('collapse-id') as string;
            wrapper.toggle('fast', 'swing', () => {
                this._collapsibles[id] = wrapper.css('display') === 'none';
            });
        });
    }
}
