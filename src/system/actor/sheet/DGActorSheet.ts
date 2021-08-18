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
import { DGDamageRoll } from '../../dice/DGDamageRoll';
import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';
import { PercentileModifierDialog, PercentileModifierDialogResults } from '../../dialog/PercentileModifierDialog';
import { DamageModifierDialog, DamageModifierDialogResults } from '../../dialog/DamageModifierDialog';
import { preprocessEvent } from '../../util/Sheet';
import { DGActor } from '../DGActor';

export interface DGActorSheetOptions extends ActorSheet.Options {}
export interface DGActorSheetData extends ActorSheet.Data {}

export abstract class DGActorSheet<TOptions extends DGActorSheetOptions, TData extends DGActorSheetData, TActor extends DGActor> extends ActorSheet<
    TOptions,
    TData
> {
    static get defaultOptions() {
        const options = super.defaultOptions;
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

    /**
     * Send a roll to the chat by rendering the proper template with extra data.
     * @param roll The roll to base the chat card on.
     * @param sound Play dice roll sound.
     */
    protected async sendRollToChat(roll: DGPercentileRoll | DGDamageRoll, sound: boolean = true) {
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

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        this.bindCollapsibleListeners(html);
    }
}
