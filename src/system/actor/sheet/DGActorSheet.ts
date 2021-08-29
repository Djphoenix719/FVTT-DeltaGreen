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

import { DGPercentileRoll } from '../../dice/DGPercentileRoll';
import { DamagePartType, DGDamageRoll, DGDamageRollPart } from '../../dice/DGDamageRoll';
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';
import { PercentileModifierDialog, PercentileModifierDialogResults } from '../../dialog/PercentileModifierDialog';
import { DamageModifierDialog, DamageModifierDialogResults } from '../../dialog/DamageModifierDialog';
import { preprocessEvent, preprocessEventWithId } from '../../util/SheetHelpers';
import { DGActor } from '../DGActor';
import { DGSkill } from '../../item/DGSkill';
import { DGWeapon } from '../../item/DGWeapon';
import { DGArmor } from '../../item/DGArmor';
import { DGGear } from '../../item/DGGear';
import { DGItem } from '../../item/DGItem';
import { AdaptationType, DEFAULT_ITEM_NAME, StatisticType } from '../../../types/Constants';
import { ItemType } from '../../../types/Item';
import { DGBond } from '../../item/DGBond';
import { DGMotivation } from '../../item/DGMotivation';
import { DGDisorder } from '../../item/DGDisorder';
import { SystemSetting, SystemSettings } from '../../SystemSettings';
import { DiceRollMode } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/constants.mjs';

export interface SkillGroup {
    name: string;
    skills: DGSkill[];
}
export interface DGActorSheetOptions extends ActorSheet.Options {}
export interface DGActorSheetData extends ActorSheet.Data {
    skills: SkillGroup[];
    collapsibles: Record<string, boolean>;
    inventory: {
        weapon: DGWeapon[];
        armor: DGArmor[];
        gear: DGGear[];
    };
    bonds: DGBond[];
    motivations: DGMotivation[];
    disorders: DGDisorder[];
    settings: {
        secretSanity: boolean;
    };
}

export abstract class DGActorSheet<TOptions extends DGActorSheetOptions, TData extends DGActorSheetData, TActor extends DGActor> extends ActorSheet<
    TOptions,
    TData
> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes, CSS_CLASSES.BASE, CSS_CLASSES.ACTOR.BASE];
        options.width = 800;
        options.height = 900;
        return options;
    }

    get actor(): TActor {
        return this.object as TActor;
    }

    /**
     * Record of collapsible ids to shown states.
     * @protected
     */
    protected _collapsibles: Record<string, boolean> = {};

    /**
     * Bind collapsibles and update the cache.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    protected bindCollapsibleListeners(html: JQuery) {
        // Collapsibles: Toggle & update cache
        html.find('.collapsible').on('contextmenu', async (event) => {
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

    /**
     * Send a roll to the chat by rendering the proper template with extra data.
     * @param roll The roll to base the chat card on.
     * @param sound Play dice roll sound.
     * @param rollMode
     */
    protected async sendRollToChat(roll: DGPercentileRoll | DGDamageRoll, sound: boolean = true, rollMode?: DiceRollMode) {
        const templateData: Record<string, any> = { roll };
        templateData['actor'] = this.actor;

        let template: string;
        if (roll instanceof DGPercentileRoll) {
            template = `systems/${SYSTEM_NAME}/static/templates/roll/PercentileRoll.html`;
        } else {
            template = `systems/${SYSTEM_NAME}/static/templates/roll/DamageRoll.html`;
        }

        let whisperIds: string[] | undefined;
        if (rollMode === 'blindroll') {
            whisperIds = game.users!.filter((user) => user.isGM).map((user) => user.id!);
        }

        let data: ChatMessageDataConstructorData = {
            user: game.user?.id,
            whisper: whisperIds,
            type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
            content: await renderTemplate(template, templateData),
            roll: JSON.stringify(roll),
            blind: rollMode === 'blindroll',
            speaker: {
                alias: this.actor.name,
            },
        };

        if (sound) {
            data.sound = `/sounds/dice.wav`;
        }

        await ChatMessage.create(data);
    }

    /**
     * Prompt the user for a modifier by displaying the DICE.rollModifier dialog.
     * Resolves when the user hits confirm, NEVER RESOLVES OTHERWISE.
     * @param label The window title.
     */
    protected async promptPercentileModifier(label: string): Promise<PercentileModifierDialogResults> {
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
    }

    /**
     * Prompt the user for a set of damage modifiers.
     * @param label The window title.
     */
    protected async promptDamageModifier(label: string): Promise<DamageModifierDialogResults> {
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
    }

    public async getData(options?: Application.RenderOptions): Promise<TData> {
        const renderData = await super.getData(options);

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

        renderData.skills = skillGroups;
        renderData.inventory = {
            weapon: this.actor.getItemsOfType('weapon'),
            armor: this.actor.getItemsOfType('armor'),
            gear: this.actor.getItemsOfType('gear'),
        };

        renderData.bonds = this.actor.getItemsOfType('bond');
        renderData.motivations = this.actor.getItemsOfType('motivation');
        renderData.disorders = this.actor.getItemsOfType('disorder');

        renderData.settings = {
            secretSanity: SystemSettings.get(SystemSetting.SecretSanity) && !game.user?.isGM,
        };

        renderData.collapsibles = this._collapsibles;

        return renderData;
    }

    /**
     * Bind hooks for items without a specific type, e.g. universally bound hooks.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    protected bindUniversalItemListeners(html: JQuery) {
        // Items: Cross an item
        html.find('label.cross-item').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGBond | DGMotivation | DGDisorder;
            await item.update({
                ['data.crossed.value']: !item.data.data.crossed.value,
            });
        });

        // Items: Add a new item
        html.find('label.add-item').on('click', async (event) => {
            const target = preprocessEvent(event);
            const type = target.data('type') as ItemType;
            await this.actor.createEmbeddedDocuments('Item', [
                {
                    type: type,
                    name: game.i18n.localize(DEFAULT_ITEM_NAME[type]),
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
    protected bindRollListeners(html: JQuery) {
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
        html.find('label.clickable.luck').on('click', async (event) => {
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
        html.find('div.statistic label.clickable.stats').on('click', async (event) => {
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

        // Health: Roll health
        html.find('label.clickable.health').on('click', async (event) => {
            preprocessEvent(event);

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const dialogResults = await this.promptPercentileModifier(`DG.DICE.healthCheck`);
                roll = await this.actor.rollHealth([
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollHealth();
            }

            await this.sendRollToChat(roll);
        });

        // Willpower: Roll willpower
        html.find('label.clickable.willpower').on('click', async (event) => {
            preprocessEvent(event);

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const dialogResults = await this.promptPercentileModifier(`DG.DICE.willpowerCheck`);
                roll = await this.actor.rollWillpower([
                    {
                        label: game.i18n.localize('DG.DICE.rollModifier'),
                        value: dialogResults.modifier,
                    },
                ]);
            } else {
                roll = await this.actor.rollWillpower();
            }

            await this.sendRollToChat(roll);
        });

        // Improve skills
        html.find('label.clickable.improve-skills').on('click', async (event) => {
            preprocessEvent(event);

            type Result = {
                id: string;
                name: string;
                value: number;
            };
            const improvedSkills: Result[] = [];
            const itemUpdates: Record<string, any>[] = [];
            for (const skill of this.actor.getItemsOfType('skill')) {
                if (!skill.data.data.failureImproves.value) {
                    continue;
                }
                if (!skill.data.data.sessionFailure.value) {
                    continue;
                }

                const amount = (await new Roll('1D4').roll({ async: true })).total!;

                improvedSkills.push({
                    id: skill.id!,
                    name: skill.name!,
                    value: amount,
                });

                itemUpdates.push({
                    _id: skill.id,
                    ['data.rating.value']: skill.data.data.rating.value + amount,
                    ['data.sessionFailure.value']: false,
                });
            }

            if (improvedSkills.length === 0) {
                return;
            }

            await this.actor.updateEmbeddedDocuments('Item', itemUpdates);

            const data: ChatMessageDataConstructorData = {
                user: game.user?.id,
                type: foundry.CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: await renderTemplate(`systems/${SYSTEM_NAME}/static/templates/roll/SkillImprovements.html`, { skills: improvedSkills }),
                speaker: {
                    alias: this.actor.name,
                },
            };
            await ChatMessage.create(data);
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

            let rollMode: DiceRollMode | undefined;
            if (SystemSettings.get(SystemSetting.SecretSanity)) {
                rollMode = 'blindroll';
            }

            await this.sendRollToChat(roll, true, rollMode);
        });

        // Sanity: Reset breaking point
        html.find('label.reset-breaking-point').on('click', async (event) => {
            preprocessEvent(event);
            const data = this.actor.data.data;
            const newBreakingPoint = Math.max(0, data.sanity.value - data.statistics.power.value);
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

    /**
     * Bind inventory related listeners.
     * @param html JQuery wrapper for the html to bind over.
     * @private
     */
    protected bindInventoryListeners(html: JQuery) {
        // Inventory: Roll attack
        html.find('div.list-group.weapon label.attack').on('click', async (event) => {
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
        html.find('div.list-group.weapon label.damage').on('click', async (event) => {
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
        html.find('div.list-group.weapon div.ammo label.decrement').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGWeapon;
            await item.update({
                ['data.ammo.value']: item.data.data.ammo.value - 1,
            });
        });

        // Inventory: Reload ammo
        html.find('div.list-group.weapon div.ammo label.reload').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const item = this.actor.getEmbeddedDocument('Item', id) as DGWeapon;
            await item.update({
                ['data.ammo.value']: item.data.data.ammo.max,
            });
        });
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        this.bindCollapsibleListeners(html);

        if (!this.isEditable) {
            return;
        }

        this.bindSanityListeners(html);
        this.bindInventoryListeners(html);
        this.bindRollListeners(html);
        this.bindUniversalItemListeners(html);
    }
}
