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

import { InputDialog, InputDialogResults } from './InputDialog';
import { SYSTEM_NAME } from '../Constants';

export interface PercentileModifierDialogResults extends InputDialogResults {
    modifier: number;
}

export class PercentileModifierDialog extends InputDialog<PercentileModifierDialogResults> {
    public get template(): string {
        return `systems/${SYSTEM_NAME}/templates/dialog/PercentileModifierDialog.html`;
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        const preprocessEvent = (event: JQuery.ClickEvent | JQuery.ChangeEvent) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            return $(event.currentTarget);
        };

        /**
         * Highlight the correct button based on current modifier value by toggling the CSS.
         */
        html.find('input[name="modifier"]').on('change', (event) => {
            const target = preprocessEvent(event);
            const value = parseInt(target.val() as string);
            html.find('div.buttons button.quick-set').each((index, element) => {
                const button = $(element);
                if (parseInt(button.data('value')) === value) {
                    button.addClass('active');
                } else {
                    button.removeClass('active');
                }
            });
        });

        /**
         * Quick set the modifier value to the corresponding value on the button.
         */
        html.find('div.buttons button.quick-set').on('click', (event) => {
            const target = preprocessEvent(event);
            const value = parseInt(target.data('value'));
            const input = html.find('input[name="modifier"]');
            input.val(value);
            input.trigger('change');
        });
    }
}
