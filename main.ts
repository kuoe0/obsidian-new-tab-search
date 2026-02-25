import { Plugin, WorkspaceLeaf } from "obsidian";
import { NewTabView, NEW_TAB_VIEW_TYPE } from "./view";

export default class NewTabPlugin extends Plugin {
  async onload() {
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
