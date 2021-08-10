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

import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import {
    AdaptationType,
    DEFAULT_ITEM_NAME,
    ItemTypeArmor,
    ItemTypeGear,
    ItemTypeSkill,
    ItemTypeWeapon,
    NEW_SKILL_DEFAULTS,
    StatisticType,
} from '../../../types/Constants';
import { DGItem } from '../../item/DGItem';
import { rollPercentile, TargetPart } from '../../Dice';
import { ItemType } from '../../../types/Item';

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
                initial: 'tab-skills',
            },
        ];
        options.width = 800;
        options.height = 900;
        return options;
    }

    private _collapsibles: Record<string, boolean> = {};

    public async getData(options?: Application.RenderOptions): Promise<ActorSheet.Data> {
        const renderData = await super.getData(options);

        // TODO: Figure out how to type this in FVTT-Types
        // @ts-ignore
        renderData.skills = this.actor.groupedSkills;
        // @ts-ignore
        for (const groupId in renderData.skills) {
            // @ts-ignore
            renderData.skills[groupId].sort((a: DGItem, b: DGItem) => {
                return a.data.name.localeCompare(b.data.name);
            });
        }

        // @ts-ignore
        renderData.collapsibles = this._collapsibles;

        // @ts-ignore
        renderData.inventory = {
            weapons: this.actor.items.filter((item) => item.type === 'weapon'),
            armor: this.actor.items.filter((item) => item.type === 'armor'),
            gear: this.actor.items.filter((item) => item.type === 'gear'),
        };

        // @ts-ignore
        renderData.bonds = this.actor.getItemsOfType('bond');
        // @ts-ignore
        renderData.motivations = this.actor.getItemsOfType('motivation');
        // @ts-ignore
        renderData.disorders = this.actor.getItemsOfType('disorder');

        console.warn(renderData);

        return renderData;
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        const preprocessEvent = (event: JQuery.ClickEvent | JQuery.ChangeEvent) => {
            event.preventDefault();
            event.stopPropagation();
            return $(event.currentTarget);
        };

        /**
         * Roll a basic roll w/ a target and label
         * @param label
         * @param modifiers
         */
        const basicRoll = async (label: string, modifiers: TargetPart[]) => {
            const rollResult = await rollPercentile(modifiers);
            const templateData: Record<string, any> = { ...rollResult };
            templateData['actor'] = this.actor;
            console.warn(templateData);
            const renderedTemplate = await renderTemplate(`systems/${SYSTEM_NAME}/templates/roll/PercentileRoll.html`, templateData);
            await ChatMessage.create({
                content: renderedTemplate,
            });
        };

        /**
         * Roll a skill based on the skill's id.
         * @param id
         */
        const rollSkill = async (id: string) => {
            const skill: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (skill.data.type === ItemTypeSkill) {
                await basicRoll(skill.name ?? '', [
                    {
                        value: skill.data.data.value ?? 0,
                        label: skill.name ?? 'Base',
                    },
                ]);
            }
        };

        // Skill: Update failures
        html.find('div.skills-item input.failure').on('change', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.skills-item').data('id') as string;
            const value = target.prop('checked') as boolean;
            await this.actor.updateEmbeddedDocuments('Item', [
                {
                    _id: id,
                    data: {
                        sessionFailure: value,
                    },
                },
            ]);
        });
        // Skill: Update values
        html.find('div.skills-item input.value').on('change', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.skills-item').data('id') as string;
            const value = target.val();
            await this.actor.updateEmbeddedDocuments('Item', [
                {
                    _id: id,
                    data: {
                        value: value,
                    },
                },
            ]);
        });
        // Skill: Roll skill
        html.find('div.skills-item label.name').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.skills-item').data('id') as string;
            await rollSkill(id);
        });

        // Inventory: Decrement ammo
        html.find('div.inventory-group.weapon div.ammo label.decrement').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                await item.update({
                    ['data.ammo.value']: item.data.data.ammo.value - 1,
                });
            }
        });
        // Inventory: Reload ammo
        html.find('div.inventory-group.weapon div.ammo label.reload').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                await item.update({
                    ['data.ammo.value']: item.data.data.ammo.maximum,
                });
            }
        });
        // Inventory: Roll attack
        html.find('div.inventory-group.weapon label.attack').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                await rollSkill(item.data.data.skill.value);
            }
        });
        // Inventory: Roll damage
        html.find('div.inventory-group.weapon label.damage').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            console.warn('roll damage');
            console.warn(item);
        });
        // Inventory: Toggle equipped state
        html.find('div.inventory-item input.equipped').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const value = target.prop('checked') as boolean;

            if (value) {
                target.prop('checked', true);
            } else {
                target.removeProp('checked');
            }

            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeArmor) {
                await item.update({
                    ['data.equipped.value']: value,
                });
            }
        });

        // Sanity: Reset breaking point
        html.find('div.breaking-point label.reset').on('click', async (event) => {
            preprocessEvent(event);
            const newBreakingPoint = this.actor.data.data.sanity.value - this.actor.data.data.statistics.power.value;
            await this.actor.update({
                [`data.sanity.breakingPoint.value`]: newBreakingPoint,
            });
        });
        // Sanity: Roll sanity
        html.find('section.attributes label.clickable.sanity').on('click', async (event) => {
            preprocessEvent(event);
            await basicRoll('Sanity', [
                {
                    value: this.actor.data.data.sanity.value,
                    label: 'Sanity',
                },
            ]);
        });
        // Sanity: Adaptations
        html.find('div.adaptations input[type="checkbox"]').on('change', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const index = parseInt(target.data('index') as string);
            const value = target.prop('checked') as boolean;
            const type = target.data('type') as AdaptationType;

            const values = this.actor.data.data.sanity.adaptations[type].value;
            values[index] = value;

            await this.actor.update({
                [`data.sanity.adaptations.${type}.value`]: values,
            });

            if (value) {
                target.prop('checked', true);
            } else {
                target.removeProp('checked');
            }
        });

        // Luck: Roll luck
        html.find('section.attributes label.clickable.luck').on('click', async (event) => {
            preprocessEvent(event);
            await basicRoll('Luck', [
                {
                    value: this.actor.data.data.luck.value,
                    label: 'Luck',
                },
            ]);
        });

        // Bonds: Cross bond
        html.find('div.bond-item label.cross').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.bond-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === 'bond') {
                await item.update({
                    ['data.crossed.value']: !item.data.data.crossed.value,
                });
            }
        });
        // Bonds: Damage bond
        html.find('div.bond-item input.damaged').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.bond-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === 'bond') {
                await item.update({
                    ['data.damaged.value']: !item.data.data.damaged.value,
                });
            }
        });

        // Items: Add a new item
        html.find('label.add-item').on('click', async (event) => {
            const target = preprocessEvent(event);
            const type = target.data('type') as ItemType;
            await this.actor.createEmbeddedDocuments('Item', [
                {
                    type: type,
                    name: DEFAULT_ITEM_NAME[type],
                },
            ]);
        });
        // Items: Edit an item
        html.find('label.edit-item').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;

            if (item && item.sheet) {
                item.sheet.render(true);
            }
        });
        // Items: Delete an item
        html.find('label.delete-item').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;
            await this.actor.deleteEmbeddedDocuments('Item', [id]);
        });

        // Stats: Roll stats*5
        html.find('div.stats-field label.clickable.stats').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.stats-field').data('id') as StatisticType;
            const statistic = this.actor.data.data.statistics[id];
            await basicRoll(statistic.label, [
                {
                    value: statistic.percentile ?? statistic.value * 5,
                    label: statistic.label,
                },
            ]);
        });

        // Collapsibles: Toggle & update cache
        html.find('.collapsible').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.data('collapse-id') as string;
            const collapseTarget = target.parent().next('.collapse-target');

            this._collapsibles[id] = !this._collapsibles[id];
            if (this._collapsibles[id]) {
                collapseTarget.show();
            } else {
                collapseTarget.hide();
            }
        });
    }
}
