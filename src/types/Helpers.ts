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

import Document, { Context } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';

export interface Value<T> {
    value: T;
}

export interface Min<T> {
    min: T;
}

export interface Max<T> {
    max: T;
}

export interface Bounded<T> extends Value<T>, Min<T>, Max<T> {}

export interface Label<T extends string> {
    label: T;
}

export interface DGContext<Parent extends Document<any, any> | null> extends Context<Parent> {
    dg?: {
        ready: boolean;
    }
}
