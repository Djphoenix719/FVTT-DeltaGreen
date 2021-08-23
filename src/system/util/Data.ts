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
        }
    }
};

/**
 * Update an actor and clean all resulting empty objects.
 * @param entity The actor to update.
 * @param updates Updates to the actor.
 */
export async function updateAndCleanEntity<T extends Actor | Item>(entity: T, updates: Record<string, any>): Promise<T> {
    updates = flattenObject(duplicate(updates));

    // select correct data model
    const entityType = entity instanceof Actor ? 'Actor' : 'Item';
    const model = game.system.model[entityType][entity.type]!;

    let entityData: Record<string, any> = duplicate(entity.data.data);
    entityData = mergeObject(entityData, updates);

    recursiveClean(entityData, model);

    const finalUpdates: Record<string, any> = {};
    for (const key in entityData) {
        if (key.startsWith('data.')) {
            finalUpdates[key] = entityData[key];
        } else if (['_id', 'name', 'type', 'img', 'folder'].includes(key)) {
            finalUpdates[key] = entityData[key];
        } else {
            finalUpdates[`data.${key}`] = entityData[key];
        }
    }

    return (await entity.update(finalUpdates)) as T;
}
