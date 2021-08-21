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

import { SYSTEM_NAME } from '../../Constants';
import { DGItemSheet, DGItemSheetData, DGItemSheetOptions } from './DGItemSheet';

export interface DGBondSheetOptions extends DGItemSheetOptions {}
export interface DGBondSheetData extends DGItemSheetData {}
export class DGBondSheet extends DGItemSheet<DGBondSheetOptions, DGBondSheetData> {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/static/templates/item/BondSheet.html`;
        return options;
    }
}
