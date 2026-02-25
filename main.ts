import { Plugin, WorkspaceLeaf, PluginSettingTab, App, Setting } from "obsidian";
import { NewTabView, NEW_TAB_VIEW_TYPE } from "./view";

interface NewTabSettings {
  replaceNewTab: boolean;
  focusSearch: boolean;
}

const DEFAULT_SETTINGS: NewTabSettings = {
  replaceNewTab: true,
  focusSearch: true,
}

export default class NewTabPlugin extends Plugin {
  settings!: NewTabSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(
      NEW_TAB_VIEW_TYPE,
      (leaf) => new NewTabView(leaf)
    );

    this.addCommand({
      id: "open-new-tab-page",
      name: "Open New Tab Page",
      callback: () => {
        this.activateView();
      },
    });

    this.addRibbonIcon("search", "Open New Tab Search", () => {
      this.activateView();
    });

    this.addSettingTab(new NewTabSettingTab(this.app, this));

    // Override New Tab behavior
    // Use leaf-change event to detect when we switch to an empty leaf or create one
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => { // Triggered when active leaf changes
        if (this.settings.replaceNewTab && leaf) {
          // Check if valid leaf and is empty
          if (leaf.view.getViewType() === "empty") {
            this.activateView(leaf);
          }
        }
      })
    );

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        // optional: strictly enforce? Might be too aggressive.
        // active-leaf-change is usually sufficient for "active" tab.
        // But what if I middle click to open new tab in background?
        // Then it won't be active.
        // Not covering background tabs for now to avoid complexity/performance issues.
      })
    )
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Activates the view. If a leaf is provided, uses that leaf.
   * Otherwise tries to find existing or create new.
   */
  async activateView(leaf?: WorkspaceLeaf) {
    const { workspace } = this.app;

    if (!leaf) {
      const leaves = workspace.getLeavesOfType(NEW_TAB_VIEW_TYPE);
      if (leaves.length > 0) {
        leaf = leaves[0];
      } else {
        leaf = workspace.getLeaf(true);
      }
    }

    // If we are replacing an empty leaf, we definitely want to setViewState
    if (leaf.view.getViewType() !== NEW_TAB_VIEW_TYPE) {
      await leaf.setViewState({
        type: NEW_TAB_VIEW_TYPE,
        active: true,
      });
    }

    workspace.revealLeaf(leaf);
  }
}

class NewTabSettingTab extends PluginSettingTab {
  plugin: NewTabPlugin;

  constructor(app: App, plugin: NewTabPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Replace New Tab")
      .setDesc("Automatically open this view when opening a new tab (empty tab).")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.replaceNewTab)
          .onChange(async (value) => {
            this.plugin.settings.replaceNewTab = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
