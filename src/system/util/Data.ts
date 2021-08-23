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

import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

/**
 * Recursively prepare an object for cleaning by inserting non-matching keys with the -= key removal.
 * @param data The target of the cleaning.
 * @param model The valid data model to be followed.
 */
const recursiveClean = (data: Record<string, any>, model: Record<string, any>) => {
    if (typeof data !== 'object') {
        return;
    }

    for (const key in data) {
        if (model.hasOwnProperty(key)) {
            recursiveClean(data[key], model[key]);
        } else {
            data[`-=${key}`] = null;
            delete data[key];
        }
    }
};

/**
 * Update an actor and clean all resulting empty objects.
 * @param entity The actor to update.
 * @param updates Updates to the actor.
 */
export function getCleanedEntityUpdates(entity: ActorData | ItemData, updates: Record<string, any>): Record<string, any> {
    updates = expandObject(duplicate(updates));

    // this data exists at root, before 'data.', so exclude it and add it back in after
    const excludedKeys = ['_id', 'name', 'type', 'img', 'folder', 'items', 'flags'];
    const excludedData: Record<string, any> = {};
    for (const key of excludedKeys) {
        if (updates.hasOwnProperty(key)) {
            excludedData[key] = updates[key];
            delete updates[key];
        }
    }

    updates = flattenObject(updates);

    const types: Record<string, 'Actor' | 'Item'> = {
        agent: 'Actor',
        npc: 'Actor',
        unnatural: 'Actor',

        weapon: 'Item',
        armor: 'Item',
        gear: 'Item',
        skill: 'Item',
        bond: 'Item',
        motivation: 'Item',
        disorder: 'Item',
        ability: 'Item',
    };

    // select correct data model
    const entityType = entity.type ?? excludedData['type'];
    const model = game.system.model[types[entityType]][entityType]!;

    let entityData: Record<string, any> = duplicate(entity.data);
    entityData = mergeObject(entityData, updates);

    recursiveClean(entityData, model);

    // insert missing values from the model defaults
    entityData = flattenObject(entityData);
    const flatModel = flattenObject(model);
    for (const key in flatModel) {
        if (entityData.hasOwnProperty(key)) {
            continue;
        }

        entityData[key] = flatModel[key];
    }
    entityData = expandObject(entityData);

    // user model data updates need to be prepended with 'data.'
    const finalUpdates: Record<string, any> = {};
    for (const key in entityData) {
        if (key.startsWith('data')) {
            finalUpdates[key] = entityData[key];
        } else {
            finalUpdates[`data.${key}`] = entityData[key];
        }
    }

    // merge back in excluded data
    for (const key in excludedData) {
        finalUpdates[key] = excludedData[key];
    }

    return finalUpdates;
}
