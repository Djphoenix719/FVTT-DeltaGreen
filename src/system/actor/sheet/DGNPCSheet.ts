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

import { DGActorSheet, DGActorSheetData, DGActorSheetOptions } from './DGActorSheet';
import { DGNPC } from '../DGNPC';
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { DGAbility } from '../../item/DGAbility';
import { preprocessEventWithId } from '../../util/SheetHelpers';
import { DGPercentileRoll } from '../../dice/DGPercentileRoll';
import { DamagePartType, DGDamageRoll, DGDamageRollPart } from '../../dice/DGDamageRoll';

export interface DGNPCSheetOptions extends DGActorSheetOptions {}
export interface DGNPCSheetData extends DGActorSheetData {
    editMode: boolean;
    unnatural: boolean;
    abilities: DGAbility[];
}
export class DGNPCSheet extends DGActorSheet<DGNPCSheetOptions, DGNPCSheetData, DGNPC> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/static/templates/actor/npc/NPCSheet.html`;
        options.classes = [...options.classes, CSS_CLASSES.ACTOR.NPC];
        options.width = 500;
        options.height = 600;
        return options;
    }

    /**
     * Get the edit mode flag.
     */
    public getEditMode(): boolean {
        if (!this.actor.canUserModify(game.user!, 'update')) {
            return false;
        }
        return this.actor.getFlag(SYSTEM_NAME, 'editMode') as boolean;
    }

    /**
     * Set the edit mode flag.
     * @param value The value of the flag.
     */
    public async setEditMode(value: boolean): Promise<DGNPC> {
        if (!this.actor.canUserModify(game.user!, 'update')) {
            return this.actor;
        }
        return await this.actor.setFlag(SYSTEM_NAME, 'editMode', value);
    }

    public async getData(options?: Application.RenderOptions): Promise<DGNPCSheetData> {
        const renderData = await super.getData(options);

        renderData.editMode = this.getEditMode();
        renderData.unnatural = this.actor.getUnnatural();
        renderData.abilities = this.actor.getItemsOfType('ability');
        renderData.abilities.sort((a, b) => a.name!.localeCompare(b.name!));

        return renderData;
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('section.abilities label.clickable.damage').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const ability = this.actor.items.get(id) as DGAbility;

            let lethalityRoll: DGPercentileRoll | undefined = undefined;
            let damageRoll: DGDamageRoll;

            let damageValue: string;
            if (ability.data.data.lethality.value > 0) {
                damageValue = '2d10';
            } else {
                damageValue = ability.data.data.damage.value;
            }

            if (event.ctrlKey) {
                if (ability.data.data.lethality.value > 0) {
                    const percentileDialogResults = await this.promptPercentileModifier('DG.DICE.lethalityCheck');
                    lethalityRoll = await this.actor.rollLethality(ability.data.data.lethality.value, [
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

                damageRoll = await this.actor.rollDamage(
                    damageValue,
                    ability.data.data.lethality.value,
                    `${ability.name}: ${game.i18n.localize('DG.DICE.damage')}`,
                    modifiers,
                );
            } else {
                if (ability.data.data.lethality.value > 0) {
                    lethalityRoll = await this.actor.rollLethality(ability.data.data.lethality.value);
                }
                damageRoll = await this.actor.rollDamage(
                    damageValue,
                    ability.data.data.lethality.value,
                    `${ability.name}: ${game.i18n.localize('DG.DICE.damage')}`,
                );
            }

            if (lethalityRoll) {
                await this.sendRollToChat(lethalityRoll, false);
            }
            await this.sendRollToChat(damageRoll);
        });
        html.find('section.abilities label.clickable.attack').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            const ability = this.actor.items.get(id) as DGAbility;

            let roll: DGPercentileRoll;
            if (event.ctrlKey) {
                const dialogResults = await this.promptPercentileModifier(ability.name!);
                roll = await this.actor.rollPercentile(
                    {
                        label: ability.name!,
                        value: ability.data.data.attack.value,
                    },
                    ability.name!,
                    [
                        {
                            label: game.i18n.localize('DG.DICE.rollModifier'),
                            value: dialogResults.modifier,
                        },
                    ],
                );
            } else {
                roll = await this.actor.rollPercentile(
                    {
                        label: ability.name!,
                        value: ability.data.data.attack.value,
                    },
                    ability.name!,
                );
            }
            await this.sendRollToChat(roll);
        });

        html.find('label.clickable.edit-mode').on('click', async (event) => {
            await this.setEditMode(!this.getEditMode());
        });
        html.find('label.clickable.unnatural').on('click', async (event) => {
            await this.actor.setUnnatural(!this.actor.getUnnatural());
        });
    }
}
