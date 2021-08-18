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

import { AdaptationType, DEFAULT_ITEM_NAME, ItemTypeBond, ItemTypeDisorder, ItemTypeMotivation, ItemTypeWeapon, StatisticType } from '../../../types/Constants';
import { DGItem } from '../../item/DGItem';
import { ItemType } from '../../../types/Item';
import { DGPercentileRoll } from '../../dice/DGPercentileRoll';
import { DamagePartType, DGDamageRoll, DGDamageRollPart } from '../../dice/DGDamageRoll';
import { preprocessEvent, preprocessEventWithId } from '../../util/Sheet';
import { DGWeapon } from '../../item/DGWeapon';
import { DGActorSheet, DGActorSheetData, DGActorSheetOptions, SkillGroup } from './DGActorSheet';
import { DGSkill } from '../../item/DGSkill';
import { DGArmor } from '../../item/DGArmor';
import { DGGear } from '../../item/DGGear';
import { DGBond } from '../../item/DGBond';
import { DGMotivation } from '../../item/DGMotivation';
import { DGDisorder } from '../../item/DGDisorder';
import { SYSTEM_NAME } from '../../Constants';
import { DGAgent } from '../DGAgent';

export interface DGAgentSheetOptions extends DGActorSheetOptions {}
export interface DGAgentSheetData extends DGActorSheetData {
    bonds: DGBond[];
    motivations: DGMotivation[];
    disorders: DGDisorder[];
}
export class DGAgentSheet extends DGActorSheet<DGAgentSheetOptions, DGAgentSheetData, DGAgent> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/templates/actor/Agent.html`;
        return options;
    }

    public async getData(options?: Application.RenderOptions): Promise<DGAgentSheetData> {
        const renderData = await super.getData(options);

        renderData.bonds = this.actor.getItemsOfType('bond');
        renderData.motivations = this.actor.getItemsOfType('motivation');
        renderData.disorders = this.actor.getItemsOfType('disorder');

        return renderData;
    }

    /**
     * Bind hooks for items without a specific type, e.g. universally bound hooks.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    private bindUniversalItemListeners(html: JQuery) {
        // Items: Cross an item
        html.find('label.cross-item').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGItem;
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
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item && item.sheet) {
                item.sheet.render(true);
            }
        });
        // Items: Delete an item
        html.find('label.delete-item').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            await this.actor.deleteEmbeddedDocuments('Item', [id]);
        });

        // Items: Inline update of check boxes
        html.find('input.modify-item[type="checkbox"]').on('change', async (event) => {
            const { target, id } = preprocessEventWithId(event);
            const value = target.prop('checked') as boolean;
            const path = target.data('path') as string;

            await this.actor.updateEmbeddedDocuments('Item', [
                {
                    _id: id,
                    [path]: value,
                },
            ]);
        });
        // Items: Inline update of inputs
        html.find('input.modify-item:not([type="checkbox"])').on('change', async (event) => {
            const { target, id } = preprocessEventWithId(event);
            let value = target.val() as string | number;
            const path = target.data('path') as string;

            if (target.attr('type') === 'number') {
                value = parseInt(value.toString());
            }

            await this.actor.updateEmbeddedDocuments('Item', [
                {
                    _id: id,
                    [path]: value,
                },
            ]);
        });
    }

    /**
     * Bind misc roll listeners.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    private bindRollListeners(html: JQuery) {
        // Skill: Roll skill
        html.find('div.list-item.skill label.name').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const skillName = this.actor.getSkillName(id);
                const dialogResults = await this.promptPercentileModifier(skillName!);
                roll = await this.actor.rollSkill(id, [
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollSkill(id);
            }

            await this.sendRollToChat(roll);
        });

        // Luck: Roll luck
        html.find('section.attributes label.clickable.luck').on('click', async (event) => {
            preprocessEvent(event);

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const dialogResults = await this.promptPercentileModifier(`DG.DICE.luckCheck`);
                roll = await this.actor.rollLuck([
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollLuck();
            }

            await this.sendRollToChat(roll);
        });

        // Stats: Roll stats*5
        html.find('div.stats-field label.clickable.stats').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const dialogResults = await this.promptPercentileModifier('DG.DICE.statisticCheck');
                roll = await this.actor.rollStatistic(id as StatisticType, [
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollStatistic(id as StatisticType);
            }

            await this.sendRollToChat(roll);
        });
    }

    /**
     * Bind inventory related listeners.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    private bindInventoryListeners(html: JQuery) {
        // Inventory: Roll attack
        html.find('div.inventory-group.weapon label.attack').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGWeapon;
            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const skillName = this.actor.getSkillName(item.data.data.skill.value);
                const dialogResults = await this.promptPercentileModifier(skillName!);
                roll = await this.actor.rollSkill(item.data.data.skill.value, [
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollSkill(item.data.data.skill.value);
            }
            await this.sendRollToChat(roll);
        });

        // Inventory: Roll damage
        html.find('div.inventory-group.weapon label.damage').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGWeapon;

            let lethalityRoll: DGPercentileRoll | undefined = undefined;
            let damageRoll: DGDamageRoll;

            if (event.ctrlKey) {
                if (item.data.data.lethality.value > 0) {
                    const percentileDialogResults = await this.promptPercentileModifier('DG.DICE.lethalityCheck');
                    lethalityRoll = await this.actor.rollLethalityForWeapon(id, [
                        {
                            label: game.i18n.localize('DG.DICE.rollModifier'),
                            value: percentileDialogResults.modifier,
                        },
                    ]);
                }

                const damageDialogResults = await this.promptDamageModifier('DG.DICE.damageRoll');

                let modifiers: DGDamageRollPart[] = [];
                if (damageDialogResults.add) {
                    modifiers.push({
                        value: damageDialogResults.add,
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        type: DamagePartType.Add,
                    });
                }
                if (damageDialogResults.multiply) {
                    modifiers.push({
                        value: damageDialogResults.multiply,
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        type: DamagePartType.Multiply,
                    });
                }

                damageRoll = await this.actor.rollDamageForWeapon(id, modifiers);
            } else {
                if (item.data.data.lethality.value > 0) {
                    lethalityRoll = await this.actor.rollLethalityForWeapon(id);
                }
                damageRoll = await this.actor.rollDamageForWeapon(id);
            }

            if (lethalityRoll) {
                await this.sendRollToChat(lethalityRoll, false);
            }
            await this.sendRollToChat(damageRoll);
        });

        // Inventory: Decrement ammo
        html.find('div.inventory-group.weapon div.ammo label.decrement').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                await item.update({
                    ['data.ammo.value']: item.data.data.ammo.value - 1,
                });
            }
        });

        // Inventory: Reload ammo
        html.find('div.inventory-group.weapon div.ammo label.reload').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                await item.update({
                    ['data.ammo.value']: item.data.data.ammo.max,
                });
            }
        });
    }

    /**
     * Bind sanity related listeners.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    private bindSanityListeners(html: JQuery) {
        // Sanity: Roll sanity
        html.find('section.attributes label.clickable.sanity').on('click', async (event) => {
            preprocessEvent(event);

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const dialogResults = await this.promptPercentileModifier(`DG.DICE.sanityCheck`);
                roll = await this.actor.rollSanity([
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollSanity();
            }
            await this.sendRollToChat(roll);
        });

        // Sanity: Reset breaking point
        html.find('div.breaking-point label.reset').on('click', async (event) => {
            preprocessEvent(event);
            const data = this.actor.data.data;
            const newBreakingPoint = data.sanity.value - data.statistics.power.value;
            await this.actor.update({
                [`data.sanity.breakingPoint.value`]: newBreakingPoint,
            });
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
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        this.bindInventoryListeners(html);
        this.bindRollListeners(html);
        this.bindSanityListeners(html);
        this.bindUniversalItemListeners(html);
    }
}
