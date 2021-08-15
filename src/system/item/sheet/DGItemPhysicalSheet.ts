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

import { DGItemSheet, DGItemSheetData, DGItemSheetOptions } from './DGItemSheet';
import { ExpenseType } from '../../../types/Constants';
import { SelectOption } from '../../../types/Sheet';

export interface DGItemSheetPhysicalOptions extends DGItemSheetOptions {}
export interface DGItemSheetPhysicalData extends DGItemSheetData {
    subtemplate: string;
    constants: {
        expense: SelectOption[];
    };
}
export abstract class DGItemPhysicalSheet<TOptions extends DGItemSheetPhysicalOptions, TData extends DGItemSheetPhysicalData> extends DGItemSheet<
    TOptions,
    TData
> {
    public async getData(options?: Application.RenderOptions): Promise<TData> {
        const data = await super.getData(options);
        data.constants = {
            expense: Object.values(ExpenseType).map((type) => {
                return {
                    value: type,
                    label: game.i18n.localize(`DG.EXPENSE.${type}`),
                };
            }),
        };
        return data;
    }
}
