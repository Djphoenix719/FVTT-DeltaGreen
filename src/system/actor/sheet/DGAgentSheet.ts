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
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { DGAgent } from '../DGAgent';

export interface DGAgentSheetOptions extends DGActorSheetOptions {}
export interface DGAgentSheetData extends DGActorSheetData {
}
export class DGAgentSheet extends DGActorSheet<DGAgentSheetOptions, DGAgentSheetData, DGAgent> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/static/templates/actor/agent/AgentSheet.html`;
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
}
