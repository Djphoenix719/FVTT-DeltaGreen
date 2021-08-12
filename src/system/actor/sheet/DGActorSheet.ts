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
    ItemTypeBond,
    ItemTypeDisorder,
    ItemTypeMotivation,
    ItemTypeWeapon,
    RollResultType,
    StatisticType,
} from '../../../types/Constants';
import { DGItem } from '../../item/DGItem';
import { ItemType } from '../../../types/Item';
import { ModifierDialog } from '../../dialog/ModifierDialog';
import { DGPercentileRoll } from '../../dice/DGPercentileRoll';
import { DGDamageRoll } from '../../dice/DGDamageRoll';

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
        options.scrollY = [...options.scrollY, 'section.sheet-body'];
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
         * Preprocess an event; call stopPropagation and preventDefault, wrap the currentTarget in JQuery.
         * @param event
         */
        const preprocessEvent = (event: JQuery.ClickEvent | JQuery.ChangeEvent | JQuery.ContextMenuEvent) => {
            event.preventDefault();
            event.stopPropagation();
            return $(event.currentTarget);
        };

        // TODO: Pass sound as an option
        const sendPercentileRollToChat = async (roll: DGPercentileRoll) => {
            const templateData: Record<string, any> = { roll };
            templateData['actor'] = this.actor;

            await ChatMessage.create({
                user: game.user?.id,
                content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/roll/PercentileRoll.html`, templateData),
                roll: JSON.stringify(roll),
                sound: `/sounds/dice.wav`,
            });
        };
        const sendDamageRollToChat = async (roll: DGDamageRoll) => {
            const templateData: Record<string, any> = { roll };
            templateData['actor'] = this.actor;

            await ChatMessage.create({
                user: game.user?.id,
                content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/roll/DamageRoll.html`, templateData),
                roll: JSON.stringify(roll),
            });
        };

        /**
         * Prompt the user for a modifier by displaying the DICE.rollModifier dialog.
         * Resolves when the user hits confirm, NEVER RESOLVES OTHERWISE.
         * @param label The window title.
         */
        const promptUserModifier = (label: string): Promise<number> => {
            return new Promise<number>((resolve) => {
                const dialog = new ModifierDialog({
                    title: `${game.i18n.localize('DG.DICE.roll')}: ${game.i18n.localize(label)}`,
                    callback: async (data) => {
                        resolve(parseInt(data.modifier.toString()));
                    },
                });
                dialog.render(true);
            });
        };

        // <editor-fold desc="Rolls">

        // Skill: Roll skill
        html.find('div.skills-item label.name').on('click', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;
            const roll = await this.actor.rollSkill(id);
            await sendPercentileRollToChat(roll);
        });
        html.find('div.skills-item label.name').on('contextmenu', async (event) => {
            const target: JQuery<HTMLInputElement> = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;

            const skillName = this.actor.getSkillName(id);
            if (skillName) {
                const modifier = await promptUserModifier(skillName);
                const roll = await this.actor.rollSkill(id, [
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: modifier,
                    },
                ]);
                await sendPercentileRollToChat(roll);
            }
        });

        // Sanity: Roll sanity
        html.find('section.attributes label.clickable.sanity').on('click', async (event) => {
            preprocessEvent(event);
            const roll = await this.actor.rollSanity();
            await sendPercentileRollToChat(roll);
        });
        html.find('section.attributes label.clickable.sanity').on('contextmenu', async (event) => {
            preprocessEvent(event);
            const modifier = await promptUserModifier(`DG.DICE.sanityCheck`);
            const roll = await this.actor.rollSanity([
                {
                    label: game.i18n.localize('DG.DICE.rollModifier'),
                    value: modifier,
                },
            ]);
            await sendPercentileRollToChat(roll);
        });

        // Luck: Roll luck
        html.find('section.attributes label.clickable.luck').on('click', async (event) => {
            preprocessEvent(event);
            const roll = await this.actor.rollLuck();
            await sendPercentileRollToChat(roll);
        });
        html.find('section.attributes label.clickable.luck').on('contextmenu', async (event) => {
            preprocessEvent(event);
            const modifier = await promptUserModifier(`DG.DICE.luckCheck`);
            const roll = await this.actor.rollSanity([
                {
                    label: game.i18n.localize('DG.DICE.rollModifier'),
                    value: modifier,
                },
            ]);
            await sendPercentileRollToChat(roll);
        });

        // Stats: Roll stats*5
        html.find('div.stats-field label.clickable.stats').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.stats-field').data('id') as StatisticType;
            const roll = await this.actor.rollStatistic(id);
            await sendPercentileRollToChat(roll);
        });
        html.find('div.stats-field label.clickable.stats').on('contextmenu', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div.stats-field').data('id') as StatisticType;
            const modifier = await promptUserModifier('DG.DICE.statisticCheck');
            const roll = await this.actor.rollStatistic(id, [
                {
                    label: game.i18n.localize('DG.DICE.rollModifier'),
                    value: modifier,
                },
            ]);
            await sendPercentileRollToChat(roll);
        });

        // Inventory: Roll attack
        html.find('div.inventory-group.weapon label.attack').on('click', async (event) => {
            const target = preprocessEvent(event);
            const itemId = target.closest('div[data-id]').data('id') as string;
            const item = this.actor.getEmbeddedDocument('Item', itemId) as DGItem | undefined;
            if (item?.data.type === ItemTypeWeapon) {
                if (item.data.data.skill.value !== '') {
                    const roll = await this.actor.rollSkill(item.data.data.skill.value);
                    await sendPercentileRollToChat(roll);
                }
            }
        });
        html.find('div.inventory-group.weapon label.attack').on('contextmenu', async (event) => {
            const target = preprocessEvent(event);
            const itemId = target.closest('div[data-id]').data('id') as string;
            const item = this.actor.getEmbeddedDocument('Item', itemId) as DGItem | undefined;
            if (item?.data.type === ItemTypeWeapon) {
                const skillName = this.actor.getSkillName(item.data.data.skill.value);
                if (skillName && skillName !== '') {
                    const modifier = await promptUserModifier(skillName);
                    const roll = await this.actor.rollSkill(item.data.data.skill.value, [
                        {
                            label: game.i18n.localize('DG.DICE.rollModifier'),
                            value: modifier,
                        },
                    ]);
                    await sendPercentileRollToChat(roll);
                }
            }
        });

        // Inventory: Roll damage
        html.find('div.inventory-group.weapon label.damage').on('click', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                if (item.data.data.lethality.value > 0) {
                    const lethalityRoll = await this.actor.rollLethalityForWeapon(id);
                    await sendPercentileRollToChat(lethalityRoll);
                }
                const damageRoll = await this.actor.rollDamageForWeapon(id);
                await sendDamageRollToChat(damageRoll);
            }
        });
        // TODO: Allow damage modifications
        html.find('div.inventory-group.weapon label.damage').on('contextmenu', async (event) => {
            const target = preprocessEvent(event);
            const id = target.closest('div[data-id]').data('id') as string;
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                if (item.data.data.lethality.value > 0) {
                    const lethalityRoll = await this.actor.rollLethalityForWeapon(id, [
                        {
                            label: game.i18n.localize('DG.DICE.criticalSuccess'),
                            value: item.data.data.lethality.value,
                        },
                    ]);
                    await sendPercentileRollToChat(lethalityRoll);
                }
                const damageRoll = await this.actor.rollDamageForWeapon(id);
                await sendDamageRollToChat(damageRoll);
            }
        });

        // </editor-fold>

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
                    ['data.ammo.value']: item.data.data.ammo.max,
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
            let value = target.val() as string | number;
            const path = target.data('path') as string;
            const id = target.closest('div[data-id]').data('id') as string;

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
