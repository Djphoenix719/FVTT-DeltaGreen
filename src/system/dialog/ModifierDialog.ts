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
import { createDeflateRaw } from 'zlib';

/**
 * Data returned by the modifier dialog.
 */
export interface ModifierDialogCallbackArgs {
    modifier: number;
}

/**
 * Callback type for select apps
 * @internal
 */
export type ModifierDialogCallback = (data: ModifierDialogCallbackArgs) => void;

/**
 * Constructor options for a modifier dialog.
 */
export interface ModifierDialogOptions {
    callback: ModifierDialogCallback;
    defaults?: ModifierDialogCallbackArgs;
    title: string;
}

/**
 * Base class for app that uses a select drop down
 * @internal
 */
export class ModifierDialog extends FormApplication<FormApplication.Options, ModifierDialogCallbackArgs> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes, CSS_CLASSES.BASE, ...CSS_CLASSES.DIALOG.MODIFIER];
        options.template = `systems/${SYSTEM_NAME}/templates/dialog/ModifierDialog.html`;
        options.width = 250;
        options.height = 'auto';
        return options;
    }

    public get title(): string {
        return game.i18n.localize(this._title);
    }

    private readonly _title: string;
    private readonly _callback: ModifierDialogCallback;
    private readonly _defaults: ModifierDialogCallbackArgs;

    public constructor(inputOptions: ModifierDialogOptions, options?: FormApplication.Options) {
        super({}, options);

        this._callback = inputOptions.callback;
        this._defaults = inputOptions.defaults ?? {
            modifier: 0,
        };
        this._title = inputOptions.title;
    }

    public async getData(options?: Application.RenderOptions): Promise<ModifierDialogCallbackArgs> {
        const renderData = await super.getData(options);

        renderData.modifier = this._defaults.modifier;

        return renderData;
    }

    protected _updateObject(event: Event, formData: ModifierDialogCallbackArgs): Promise<void> {
        this._callback(formData);
        return Promise.resolve();
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
