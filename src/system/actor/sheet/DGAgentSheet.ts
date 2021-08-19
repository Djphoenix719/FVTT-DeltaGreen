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
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
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
        options.template = `systems/${SYSTEM_NAME}/templates/actor/agent/AgentSheet.html`;
        options.classes = [...options.classes, CSS_CLASSES.ACTOR.AGENT];
        options.tabs = [
            {
                navSelector: 'nav.sheet-navigation',
                contentSelector: 'section.sheet-body',
                initial: 'tab-skills',
            },
        ];
        options.scrollY = [...options.scrollY, 'section.sheet-body'];
        return options;
    }

    public async getData(options?: Application.RenderOptions): Promise<DGAgentSheetData> {
        const renderData = await super.getData(options);

        renderData.bonds = this.actor.getItemsOfType('bond');
        renderData.motivations = this.actor.getItemsOfType('motivation');
        renderData.disorders = this.actor.getItemsOfType('disorder');

        return renderData;
    }

}
