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

import { CSS_CLASSES, SYSTEM_NAME } from '../../Constants';
import { ExpenseType } from '../../../types/Item';

export class DGGearSheet extends ItemSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `systems/${SYSTEM_NAME}/templates/item/Gear.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, CSS_CLASSES.BASE, CSS_CLASSES.ITEM];
        options.width = 500;
        options.height = 350;
        return options;
    }

    public async getData(options?: Application.RenderOptions): Promise<ItemSheet.Data> {
        const data = await super.getData(options);

        // TODO: Figure out how to type this in FVTT-Types
        // @ts-ignore
        data.constants = {
            expense: Object.values(ExpenseType).map((type) => {
                return {
                    value: type,
                    label: type.capitalize(),
                };
            }),
        };
        // data.constants = {
        //     expense: [
        //         {
        //             value: 'trivial',
        //             label: 'Trivial',
        //         },
        //         {
        //             value: 'standard',
        //             label: 'Standard',
        //         },
        //         {
        //             value: 'unusual',
        //             label: 'Unusual',
        //         },
        //         {
        //             value: 'major',
        //             label: 'Major',
        //         },
        //         {
        //             value: 'extreme',
        //             label: 'Extreme',
        //         },
        //     ],
        // };

        console.warn(data);

        return data;
    }
}
