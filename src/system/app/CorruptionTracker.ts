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

import { CSS_CLASSES, SYSTEM_NAME } from '../Constants';

const CORRUPTION_FLAG = 'corruption';

export class CorruptionTracker extends Application {
    private static _instance: CorruptionTracker;
    public static get instance() {
        if (!this._instance) {
            this._instance = new CorruptionTracker();
        }
        return this._instance;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/static/templates/app/CorruptionTracker.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, CSS_CLASSES.BASE, 'corruption-tracker'];
        options.width = 300;
        options.height = 'auto';
        return options;
    }

    public static getSceneControlButtons(controls: any[]) {
        if (!game.user!.isGM) {
            return;
        }

        const tokens = controls.find((control) => control.name === 'token');
        tokens.tools.push({
            name: 'corruption-tracker',
            title: `DG.APP.CORRUPTION.title`,
            icon: `fas fa-theater-masks`,
            onClick: () => CorruptionTracker.instance.render(true),
            button: true,
        });
    }

    public get title() {
        return game.i18n.localize(`DG.APP.CORRUPTION.title`);
    }

    /**
     * Get an array of all active characters.
     * @private
     */
    private getActiveActors(): Actor[] {
        return game.users!.map((user) => user.character!).filter((character) => character !== undefined);
    }

    getData(options?: Application.RenderOptions): object | Promise<object> {
        const data = super.getData(options);

        const actors = this.getActiveActors();
        const corruption: Record<string, number> = {};
        for (const actor of actors) {
            const value = actor.getFlag(SYSTEM_NAME, CORRUPTION_FLAG) as number | undefined;
            corruption[actor.id!] = value ?? 0;
        }

        // @ts-ignore
        data.actors = actors;
        // @ts-ignore
        data.corruption = corruption;

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        /**
         * Preprocess an event as above, but also pull the id out.
         * @param event
         */
        const preprocessEventWithId = (event: JQuery.ClickEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const target = $(event.currentTarget);
            const id = target.closest('div[data-id]').data('id') as string;
            return { target, id };
        };

        const modifyCorruption = async (id: string, value: number) => {
            const actor = game.actors!.get(id);
            if (!actor) {
                return;
            }

            let current = (actor.getFlag(SYSTEM_NAME, CORRUPTION_FLAG) as number | undefined) ?? 0;
            current = Math.clamped(current + value, 0, 10);
            await actor.setFlag(SYSTEM_NAME, CORRUPTION_FLAG, current);
            await this.render(true);
        };

        html.find('label.increase').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            await modifyCorruption(id, +1);
        });
        html.find('label.decrease').on('click', async (event) => {
            const { id } = preprocessEventWithId(event);
            await modifyCorruption(id, -1);
        });
    }
}
