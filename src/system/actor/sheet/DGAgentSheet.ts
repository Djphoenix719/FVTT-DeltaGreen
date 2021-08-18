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

import { AdaptationType } from '../../../types/Constants';
import { DGPercentileRoll } from '../../dice/DGPercentileRoll';
import { preprocessEvent } from '../../util/Sheet';
import { DGActorSheet, DGActorSheetData, DGActorSheetOptions } from './DGActorSheet';
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

        this.bindSanityListeners(html);
    }
}
