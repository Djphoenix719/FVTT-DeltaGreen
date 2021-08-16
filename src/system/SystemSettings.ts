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

import { SYSTEM_NAME } from './Constants';

/**
 * All system settings.
 */
export enum SystemSetting {
    NiceCriticals = 'nice-criticals',
}

interface SystemSettingTypes {
    [SystemSetting.NiceCriticals]: boolean;
}

export class SystemSettings {
    /**
     * Get a system setting.
     * @param key The setting key.
     */
    public static get<TKey extends SystemSetting>(key: TKey): SystemSettingTypes[TKey] {
        return game.settings.get(SYSTEM_NAME, key) as SystemSettingTypes[TKey];
    }

    /**
     * Set a system setting.
     * @param key The setting key.
     * @param value The value of the setting.
     */
    public static async set<TKey extends SystemSetting>(key: TKey, value: SystemSettingTypes[TKey]): Promise<boolean> {
        return game.settings.set(SYSTEM_NAME, key, value);
    }

    /**
     * Register all system settings.
     */
    public static async registerAll() {
        game.settings.register(SYSTEM_NAME, SystemSetting.NiceCriticals, {
            name: game.i18n.localize('DG.SETTINGS.niceCriticalsName'),
            hint: game.i18n.localize('DG.SETTINGS.niceCriticalsHint'),
            scope: 'world',
            type: Boolean,
            config: true,
        });
    }
}
