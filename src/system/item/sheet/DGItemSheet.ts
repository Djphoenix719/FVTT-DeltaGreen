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

import { CSS_CLASSES } from '../../Constants';

export interface DGItemSheetOptions extends ItemSheet.Options {}
export interface DGItemSheetData extends ItemSheet.Data {}
export abstract class DGItemSheet<TOptions extends DGItemSheetOptions, TData extends DGItemSheetData> extends ItemSheet<TOptions, TData> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes, CSS_CLASSES.BASE, CSS_CLASSES.ITEM.BASE];
        options.width = 500;
        options.height = 'auto';
        options.resizable = true;
        options.tabs = [
            {
                navSelector: 'nav.sheet-navigation',
                contentSelector: 'section.sheet-body',
                initial: 'tab-description',
            },
        ];
        return options;
    }
}
