import { App, PluginSettingTab, Setting } from "obsidian";
import NewTabPlugin from "./main";

export class NewTabSettingTab extends PluginSettingTab {
    plugin: NewTabPlugin;

    constructor(app: App, plugin: NewTabPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Custom Greeting")
            .setDesc("Leave empty to use time-based greeting (Good Morning, etc.)")
            .addText((text) =>
                text
                    .setPlaceholder("Hello!")
                    .setValue(this.plugin.settings.customGreeting)
                    .onChange(async (value) => {
                        this.plugin.settings.customGreeting = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Show Daily Note Widget")
            .setDesc("Show a button to quickly open today's daily note.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showDailyNote)
                    .onChange(async (value) => {
                        this.plugin.settings.showDailyNote = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Show Bookmarks")
            .setDesc("Show your bookmarked files when search is empty.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showBookmarks)
                    .onChange(async (value) => {
                        this.plugin.settings.showBookmarks = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
