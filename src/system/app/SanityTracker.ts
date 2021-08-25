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

import { DGActor } from '../actor/DGActor';
import { CSS_CLASSES, SYSTEM_NAME } from '../Constants';
import { preprocessEventWithId } from '../util/SheetHelpers';

interface SanityActorData {
    actor: DGActor;
    user: User;
    sanity: {
        value: number;
        max: number;
    };
}
interface SanityTrackerData {
    actors: SanityActorData[];
}

/**
 * App that tracks active users sanity and allows the GM to easily modify it.
 */
export class SanityTracker extends Application {
    private static _instance: SanityTracker;
    public static get instance() {
        if (!this._instance) {
            this._instance = new SanityTracker();
        }
        return this._instance;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/static/templates/app/SanityTracker.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, CSS_CLASSES.BASE, 'sanity-tracker'];
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
            name: 'sanity-tracker',
            title: `DG.APP.SANITY.title`,
            icon: `fas fa-brain`,
            onClick: () => SanityTracker.instance.render(true),
            button: true,
        });
    }

    public get title() {
        return game.i18n.localize(`DG.APP.SANITY.title`);
    }

    public async getData(options?: Application.RenderOptions): Promise<Partial<SanityTrackerData>> {
        const renderData: Partial<SanityTrackerData> = await super.getData(options);
        renderData.actors = [];

        for (const user of game.users!) {
            if (!user.character) {
                continue;
            }

            renderData.actors.push({
                user,
                actor: user.character,
                sanity: {
                    value: user.character.data.data.sanity.value,
                    max: user.character.data.data.sanity.max,
                },
            });
        }

        return renderData;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('input').on('change', async (event) => {
            const { id, target } = preprocessEventWithId(event);
            const actor = game.actors!.get(id)!;
            await actor.update({
                'data.sanity.value': target.val() as number,
            });
        });
    }
}
