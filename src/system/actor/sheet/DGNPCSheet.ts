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

export interface DGNPCSheetOptions extends DGActorSheetOptions {}
export interface DGNPCSheetData extends DGActorSheetData {
    editMode: boolean;
}
export class DGNPCSheet extends DGActorSheet<DGNPCSheetOptions, DGNPCSheetData, DGNPC> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/templates/actor/npc/NPCSheet.html`;
        options.classes = [...options.classes, CSS_CLASSES.ACTOR.NPC];
        options.width = 400;
        return options;
    }

    /**
     * Is the sheet in editing mode?
     */
    public get editMode(): boolean {
        if (!this.actor.canUserModify(game.user!, 'update')) {
            return false;
        }
        return this.actor.getFlag(SYSTEM_NAME, 'editMode') as boolean;
    }

    public async getData(options?: Application.RenderOptions): Promise<DGNPCSheetData> {
        const renderData = await super.getData(options);

        renderData.editMode = this.editMode;

        return renderData;
    }
}
