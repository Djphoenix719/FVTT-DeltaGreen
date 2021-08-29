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
import { DataMigrator } from './migration/DataMigrator';

/**
 * All system settings.
 */
export enum SystemSetting {
    SchemaVersion = 'schema-version',
    NiceCriticals = 'nice-criticals',
    SecretSanity = 'secret-sanity',
    InhumanStatTests = 'inhuman-stats-tests',
}

interface SystemSettingTypes {
    [SystemSetting.SchemaVersion]: number;
    [SystemSetting.NiceCriticals]: boolean;
    [SystemSetting.SecretSanity]: boolean;
    [SystemSetting.InhumanStatTests]: boolean;
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
    public static async set<TKey extends SystemSetting>(key: TKey, value: SystemSettingTypes[TKey]): Promise<SystemSettingTypes[TKey]> {
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
            default: false,
            type: Boolean,
            config: true,
        });

        game.settings.register(SYSTEM_NAME, SystemSetting.SecretSanity, {
            name: game.i18n.localize('DG.SETTINGS.secretSanityName'),
            hint: game.i18n.localize('DG.SETTINGS.secretSanityHint'),
            scope: 'world',
            default: false,
            type: Boolean,
            config: true,
        });

        game.settings.register(SYSTEM_NAME, SystemSetting.InhumanStatTests, {
            name: game.i18n.localize('DG.SETTINGS.inhumanStatTestsName'),
            hint: game.i18n.localize('DG.SETTINGS.inhumanStatTestsHint'),
            scope: 'world',
            default: false,
            type: Boolean,
            config: true,
        });

        game.settings.register(SYSTEM_NAME, SystemSetting.SchemaVersion, {
            name: 'Schema Version',
            scope: 'world',
            type: Number,
            config: false,
        });

        if (this.get(SystemSetting.SchemaVersion) === 0) {
            await DataMigrator.run();
        }
    }
}
