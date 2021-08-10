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
    ItemTypeBond,
    ItemTypeDisorder,
    ItemTypeGear,
    ItemTypeMotivation,
    ItemTypeSkill,
    ItemTypeWeapon,
    NEW_SKILL_DEFAULTS,
    StatisticType,
} from '../../../types/Constants';
import { DGItem } from '../../item/DGItem';
import { rollPercentile, DicePart, rollDamage } from '../../Dice';
import { ItemType } from '../../../types/Item';
import { ModifierDialog } from '../../dialog/ModifierDialog';

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

        /**
         * Preprocess an event; call stopPropagation and preventDefault, wrap the target in JQuery.
         * @param event
         */
        const preprocessEvent = (event: JQuery.ClickEvent | JQuery.ChangeEvent | JQuery.ContextMenuEvent) => {
            event.preventDefault();
            event.stopPropagation();
            return $(event.currentTarget);
        };

        /**
         * Roll a basic roll w/ a target and label
         * @param label
         * @param modifiers
         */
        const basicRoll = async (label: string, modifiers: DicePart[]) => {
            const rollResult = await rollPercentile(modifiers);
            const templateData: Record<string, any> = { ...rollResult };
            templateData['actor'] = this.actor;
            const renderedTemplate = await renderTemplate(`systems/${SYSTEM_NAME}/templates/roll/PercentileRoll.html`, templateData);
            await ChatMessage.create({
                content: renderedTemplate,
            });
        };

        /**
         * Roll a skill based on the skill's id.
         * @param id
         * @param modifier Display the modifier prompt?
         */
        const rollSkill = async (id: string, modifier: boolean) => {
            const skill: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (skill.data.type === ItemTypeSkill) {
                if (modifier) {
                    await rollWithModifierPrompt(
                        skill.name ?? '',
                        [
                            {
                                value: skill.data.data.value ?? 0,
                                label: skill.name ?? 'Base',
                            },
                        ],
                        basicRoll,
                    );
                } else {
                    await basicRoll(skill.name ?? '', [
                        {
                            value: skill.data.data.value ?? 0,
                            label: skill.name ?? 'Base',
                        },
                    ]);
                }
            }
        };

        type ModifierPromptCallback = (label: string, modifiers: DicePart[]) => Promise<void>;
        const rollWithModifierPrompt = async (label: string, modifiers: DicePart[], callback: ModifierPromptCallback) => {
            const dialog = new ModifierDialog({
                title: `${label} Roll`,
                label: `Modifier`,
                value: 20,
                callback: async (value: any) => {
                    await callback(label, [
                        ...modifiers,
                        {
                            value: parseInt(value),
                            label: 'Modifier',
                        },
                    ]);
                },
            });
            dialog.render(true);
        };

        // Skill: Roll skill
        html.find('div.skills-item label.name').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.skills-item').data('id') as string;
            await rollSkill(id, false);
        });
        html.find('div.skills-item label.name').on('contextmenu', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div.skills-item').data('id') as string;
            await rollSkill(id, true);
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
                await rollSkill(item.data.data.skill.value, false);
            }
        });
        html.find('div.inventory-group.weapon label.attack').on('contextmenu', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                await rollSkill(item.data.data.skill.value, true);
            }
        });
        // Inventory: Roll damage
        html.find('div.inventory-group.weapon label.damage').on('click', async (event) => {
            // TODO: This whole damage roll process is atrocious. It should be multiple types of rolls or something.
            const target = preprocessEvent(event);
            const id = target.closest('div.inventory-item').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                const rollResult = await rollDamage(item.data.data.damage.value, item.data.data.lethality.value, this.actor);
                const templateData: Record<string, any> = { ...rollResult };
                templateData['actor'] = this.actor;

                if (!templateData.hasOwnProperty('success')) {
                    templateData['label'] = 'Damage';
                }

                const renderedTemplate = await renderTemplate(`systems/${SYSTEM_NAME}/templates/roll/PercentileRoll.html`, templateData);
                await ChatMessage.create({
                    content: renderedTemplate,
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
        html.find('section.attributes label.clickable.sanity').on('contextmenu', async (event) => {
            preprocessEvent(event);
            await rollWithModifierPrompt(
                'Sanity',
                [
                    {
                        value: this.actor.data.data.sanity.value,
                        label: 'Sanity',
                    },
                ],
                basicRoll,
            );
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
        html.find('section.attributes label.clickable.luck').on('contextmenu', async (event) => {
            preprocessEvent(event);
            await rollWithModifierPrompt(
                'Luck',
                [
                    {
                        value: this.actor.data.data.luck.value,
                        label: 'Luck',
                    },
                ],
                basicRoll,
            );
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
        html.find('div.stats-field label.clickable.stats').on('contextmenu', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.stats-field').data('id') as StatisticType;
            const statistic = this.actor.data.data.statistics[id];
            await rollWithModifierPrompt(
                statistic.label,
                [
                    {
                        value: statistic.percentile ?? statistic.value * 5,
                        label: statistic.label,
                    },
                ],
                basicRoll,
            );
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

        // Items: Cross an item
        html.find('label.cross-item').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeBond || item.data.type === ItemTypeMotivation || item.data.type === ItemTypeDisorder) {
                await item.update({
                    ['data.crossed.value']: !item.data.data.crossed.value,
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

        // Items: Inline update of check boxes
        html.find('input.modify-item[type="checkbox"]').on('change', async (event) => {
            const target: JQuery = preprocessEvent(event);
            const value = target.prop('checked') as boolean;
            const path = target.data('path') as string;
            const id = target.closest('div[data-id]').data('id') as string;

            await this.actor.updateEmbeddedDocuments('Item', [
                {
                    _id: id,
                    [path]: value,
                },
            ]);
        });
        // Items: Inline update of inputs
        html.find('input.modify-item:not([type="checkbox"])').on('change', async (event) => {
            const target: JQuery = preprocessEvent(event);
            const value = target.val() as string | number;
            const path = target.data('path') as string;
            const id = target.closest('div[data-id]').data('id') as string;

            await this.actor.updateEmbeddedDocuments('Item', [
                {
                    _id: id,
                    [path]: value,
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
