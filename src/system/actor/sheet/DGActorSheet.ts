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
    ItemTypeSkill,
    ItemTypeWeapon,
    StatisticType,
} from '../../../types/Constants';
import { DGItem } from '../../item/DGItem';
import { ItemType } from '../../../types/Item';
import { DGPercentileRoll } from '../../dice/DGPercentileRoll';
import { DamagePartType, DGDamageRoll, DGDamageRollPart } from '../../dice/DGDamageRoll';
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';
import { PercentileModifierDialog, PercentileModifierDialogResults } from '../../dialog/PercentileModifierDialog';
import { DamageModifierDialog, DamageModifierDialogResults } from '../../dialog/DamageModifierDialog';
import { preprocessEvent, preprocessEventWithId } from '../../util/Sheet';

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

        const skillGroups = Object.entries(this.actor.skillGroups).map(([key, value]) => {
            return {
                name: key,
                skills: value,
            };
        });
        for (const group of skillGroups) {
            group.skills.sort((a, b) => {
                return a.data.name.localeCompare(b.data.name);
            });
        }
        skillGroups.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        // @ts-ignore
        renderData.skills = skillGroups;

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
         * Send a roll to the chat by rendering the proper template with extra data.
         * @param roll The roll to base the chat card on.
         * @param sound Play dice roll sound.
         */
        const sendRollToChat = async (roll: DGPercentileRoll | DGDamageRoll, sound: boolean = true) => {
            const templateData: Record<string, any> = { roll };
            templateData['actor'] = this.actor;

            let template: string;
            if (roll instanceof DGPercentileRoll) {
                template = `systems/${SYSTEM_NAME}/templates/roll/PercentileRoll.html`;
            } else {
                template = `systems/${SYSTEM_NAME}/templates/roll/DamageRoll.html`;
            }

            let data: ChatMessageDataConstructorData = {
                user: game.user?.id,
                type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
                content: await renderTemplate(template, templateData),
                roll: JSON.stringify(roll),
                speaker: {
                    alias: this.actor.name,
                },
            };

            if (sound) {
                data.sound = `/sounds/dice.wav`;
            }

            await ChatMessage.create(data);
        };

        /**
         * Prompt the user for a modifier by displaying the DICE.rollModifier dialog.
         * Resolves when the user hits confirm, NEVER RESOLVES OTHERWISE.
         * @param label The window title.
         */
        const promptPercentileModifier = (label: string): Promise<PercentileModifierDialogResults> => {
            return new Promise<PercentileModifierDialogResults>((resolve) => {
                const dialog = new PercentileModifierDialog({
                    title: `${game.i18n.localize('DG.DICE.roll')}: ${game.i18n.localize(label)}`,
                    defaults: {
                        modifier: 0,
                    },
                    callback: resolve,
                });
                dialog.render(true);
            });
        };

        const promptDamageModifier = (label: string): Promise<DamageModifierDialogResults> => {
            return new Promise<DamageModifierDialogResults>((resolve) => {
                const dialog = new DamageModifierDialog({
                    title: `${game.i18n.localize('DG.DICE.roll')}: ${game.i18n.localize(label)}`,
                    defaults: {
                        add: '',
                        multiply: '',
                    },
                    callback: resolve,
                });
                dialog.render(true);
            });
        };

        // <editor-fold desc="Rolls">

        // Skill: Roll skill
        html.find('div.skills-item label.name').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const roll = await this.actor.rollSkill(id);
            await sendRollToChat(roll);
        });
        html.find('div.skills-item label.name').on('contextmenu', async (event) => {
            const { id } = preprocessEventWithId(event);

            const skillName = this.actor.getSkillName(id);
            if (skillName) {
                const dialogResults = await promptPercentileModifier(skillName);
                const roll = await this.actor.rollSkill(id, [
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
                await sendRollToChat(roll);
            }
        });

        // Sanity: Roll sanity
        html.find('section.attributes label.clickable.sanity').on('click', async (event) => {
            preprocessEvent(event);
            const roll = await this.actor.rollSanity();
            await sendRollToChat(roll);
        });
        html.find('section.attributes label.clickable.sanity').on('contextmenu', async (event) => {
            preprocessEvent(event);
            const dialogResults = await promptPercentileModifier(`DG.DICE.sanityCheck`);
            const roll = await this.actor.rollSanity([
                {
                    label: game.i18n.localize('DG.DICE.rollModifier'),
                    value: dialogResults.modifier,
                },
            ]);
            await sendRollToChat(roll);
        });

        // Luck: Roll luck
        html.find('section.attributes label.clickable.luck').on('click', async (event) => {
            preprocessEvent(event);
            const roll = await this.actor.rollLuck();
            await sendRollToChat(roll);
        });
        html.find('section.attributes label.clickable.luck').on('contextmenu', async (event) => {
            preprocessEvent(event);
            const dialogResults = await promptPercentileModifier(`DG.DICE.luckCheck`);
            const roll = await this.actor.rollLuck([
                {
                    label: game.i18n.localize('DG.DICE.rollModifier'),
                    value: dialogResults.modifier,
                },
            ]);
            await sendRollToChat(roll);
        });

        // Stats: Roll stats*5
        html.find('div.stats-field label.clickable.stats').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const roll = await this.actor.rollStatistic(id as StatisticType);
            await sendRollToChat(roll);
        });
        html.find('div.stats-field label.clickable.stats').on('contextmenu', async (event) => {
            const { id } = preprocessEventWithId(event);
            const dialogResults = await promptPercentileModifier('DG.DICE.statisticCheck');
            const roll = await this.actor.rollStatistic(id as StatisticType, [
                {
                    label: game.i18n.localize('DG.DICE.rollModifier'),
                    value: dialogResults.modifier,
                },
            ]);
            await sendRollToChat(roll);
        });

        // Inventory: Roll attack
        html.find('div.inventory-group.weapon label.attack').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGItem | undefined;
            if (item?.data.type === ItemTypeWeapon) {
                if (item.data.data.skill.value !== '') {
                    const roll = await this.actor.rollSkill(item.data.data.skill.value);
                    await sendRollToChat(roll);
                }
            }
        });
        html.find('div.inventory-group.weapon label.attack').on('contextmenu', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGItem | undefined;
            if (item?.data.type === ItemTypeWeapon) {
                const skillName = this.actor.getSkillName(item.data.data.skill.value);
                if (skillName && skillName !== '') {
                    const dialogResults = await promptPercentileModifier(skillName);
                    const roll = await this.actor.rollSkill(item.data.data.skill.value, [
                        {
                            label: game.i18n.localize('DG.DICE.rollModifier'),
                            value: dialogResults.modifier,
                        },
                    ]);
                    await sendRollToChat(roll);
                }
            }
        });

        // Inventory: Roll damage
        html.find('div.inventory-group.weapon label.damage').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                if (item.data.data.lethality.value > 0) {
                    const lethalityRoll = await this.actor.rollLethalityForWeapon(id);
                    await sendRollToChat(lethalityRoll, false);
                }
                const damageRoll = await this.actor.rollDamageForWeapon(id);
                await sendRollToChat(damageRoll);
            }
        });
        html.find('div.inventory-group.weapon label.damage').on('contextmenu', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === ItemTypeWeapon) {
                let lethalityRoll: DGPercentileRoll | undefined = undefined;
                if (item.data.data.lethality.value > 0) {
                    const percentileDialogResults = await promptPercentileModifier('DG.DICE.lethalityCheck');
                    lethalityRoll = await this.actor.rollLethalityForWeapon(id, [
                        {
                            label: game.i18n.localize('DG.DICE.rollModifier'),
                            value: percentileDialogResults.modifier,
                        },
                    ]);
                }

                const damageDialogResults = await promptDamageModifier('DG.DICE.damageRoll');

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

                const damageRoll = await this.actor.rollDamageForWeapon(id, modifiers);
                if (lethalityRoll) {
                    await sendRollToChat(lethalityRoll, false);
                }
                await sendRollToChat(damageRoll);
            }
        });

        // </editor-fold>

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
            const { id } = preprocessEventWithId(event);
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
            if (item.data.type === 'bond') {
                await item.update({
                    ['data.damaged.value']: !item.data.data.damaged.value,
                });
            }
        });

        // Items: Cross an item
        html.find('label.cross-item').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
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
            const { id } = preprocessEventWithId(event);
            const item: DGItem = this.actor.getEmbeddedDocument('Item', id) as DGItem;
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
