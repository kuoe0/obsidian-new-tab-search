import { Plugin, WorkspaceLeaf } from "obsidian";
import { NewTabView, NEW_TAB_VIEW_TYPE } from "./view";
import { NewTabSettings, DEFAULT_SETTINGS } from "./types";
import { NewTabSettingTab } from "./settings";

export default class NewTabPlugin extends Plugin {
  settings: NewTabSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(
      NEW_TAB_VIEW_TYPE,
      (leaf) => new NewTabView(leaf, this)
    );

    this.addSettingTab(new NewTabSettingTab(this.app, this));

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

    // Override New Tab behavior
    // Use leaf-change event to detect when we switch to an empty leaf or create one
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => { // Triggered when active leaf changes
        if (leaf) {
          // Check if valid leaf and is empty
          if (leaf.view.getViewType() === "empty") {
            this.activateView(leaf);
          }
        }
      })
    );
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Refresh all open new tab views
    this.app.workspace.getLeavesOfType(NEW_TAB_VIEW_TYPE).forEach((leaf) => {
      if (leaf.view instanceof NewTabView) {
        leaf.view.refresh();
      }
    });
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

    await leaf.setViewState({
      type: NEW_TAB_VIEW_TYPE,
      active: true,
    });

    workspace.revealLeaf(leaf);
  }
}
