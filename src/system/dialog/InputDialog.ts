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

import { CSS_CLASSES} from '../Constants';

/**
 * Data returned by the modifier dialog.
 */
export interface InputDialogResults {}

/**
 * Callback type for select apps
 * @internal
 */
export type InputDialogCallback<TResults extends InputDialogResults> = (data: TResults) => void;

/**
 * Constructor options for a modifier dialog.
 */
export interface InputDialogOptions<TResults extends InputDialogResults> {
    callback: InputDialogCallback<TResults>;
    defaults: TResults;
    title: string;
}

/**
 * Base class for app that uses a select drop down
 * @internal
 */
export abstract class InputDialog<TResults extends InputDialogResults> extends FormApplication<FormApplication.Options, Record<string, any>> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes, CSS_CLASSES.BASE, ...CSS_CLASSES.DIALOG.MODIFIER];
        options.width = 250;
        options.height = 'auto';
        return options;
    }

    abstract get template(): string;

    public get title(): string {
        return game.i18n.localize(this._title);
    }

    private readonly _title: string;
    private readonly _callback: InputDialogCallback<TResults>;
    private readonly _defaults: TResults;

    public constructor(inputOptions: InputDialogOptions<TResults>, options?: FormApplication.Options) {
        super({}, options);

        this._callback = inputOptions.callback;
        this._defaults = inputOptions.defaults;
        this._title = inputOptions.title;
    }

    public async getData(options?: Application.RenderOptions): Promise<InputDialogResults> {
        const renderData = await super.getData(options);

        for (const key in this._defaults) {
            renderData[key] = this._defaults[key];
        }

        return renderData;
    }

    protected _updateObject(event: Event, formData: TResults): Promise<void> {
        this._callback(formData);
        return Promise.resolve();
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('input').on('keydown', async (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                event.stopImmediatePropagation();
                await this.submit();
            }
        });
    }
}
