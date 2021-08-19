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
    unnatural: boolean;
}
export class DGNPCSheet extends DGActorSheet<DGNPCSheetOptions, DGNPCSheetData, DGNPC> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/templates/actor/npc/NPCSheet.html`;
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

        return renderData;
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('label.clickable.edit-mode').on('click', async (event) => {
            await this.setEditMode(!this.getEditMode());
        });
        html.find('label.clickable.unnatural').on('click', async (event) => {
            await this.actor.setUnnatural(!this.actor.getUnnatural());
        });
    }
}
