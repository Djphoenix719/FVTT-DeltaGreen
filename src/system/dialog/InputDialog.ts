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

/**
 * Valid type for the input app.
 */
type InputAppValue = string | number;

/**
 * Callback type for select apps
 * @internal
 */
export type InputAppCallback<T> = (value: T) => void;

export interface InputAppOptions<T extends InputAppValue> {
    value: T;
    callback: InputAppCallback<T>;
    title: string;
    label: string;
}

/**
 * Base class for app that uses a select drop down
 * @internal
 */
export class InputDialog<T extends InputAppValue> extends Application {
    // <editor-fold desc="Static Properties">

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes, CSS_CLASSES.BASE];
        options.template = `systems/${SYSTEM_NAME}/templates/dialog/InputDialog.html`;
        options.width = 200;
        options.height = 'auto';
        return options;
    }

    // </editor-fold>
    // <editor-fold desc="Static Methods"></editor-fold>
    // <editor-fold desc="Properties">

    private readonly _value?: T;
    private readonly _label: string;
    private readonly _title: string;
    private readonly _callback?: InputAppCallback<T>;

    // </editor-fold>
    // <editor-fold desc="Constructor & Initialization">

    public constructor(inputOptions: InputAppOptions<T>, options?: Application.Options) {
        super(options);

        this._value = inputOptions.value;
        this._callback = inputOptions.callback;
        this._title = inputOptions.title;
        this._label = inputOptions.label;
    }

    // </editor-fold>
    // <editor-fold desc="Getters & Setters">

    public get title(): string {
        return game.i18n.localize(this._title);
    }

    // </editor-fold>
    // <editor-fold desc="Instance Methods">

    getData(options?: any): any | Promise<any> {
        const data: any = super.getData(options);

        data.data = {
            label: this._label,
            value: this._value,
            type: typeof this._value == 'string' ? 'text' : 'number',
        };

        return data;
    }

    public activateListeners(html: JQuery): void {
        super.activateListeners(html);

        const button = html.find(`button.confirm`);
        button.on('click', async (event) => {
            event.preventDefault();

            const input = html.find(`input, select`) as JQuery<HTMLInputElement>;

            const value = input.val() as string;
            if (this._callback !== undefined) {
                this._callback(value as T);
            }
            await this.close();
        });
    }

    // </editor-fold>
}
