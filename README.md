# Obsidian New Tab (Search & Bookmarks)

A beautiful, functional "New Tab" page for Obsidian, inspired by modern browser start pages.

## ✨ Features

- **Standard New Tab Replacement**: Automatically opens when you create a new tab (CMD/CTRL+T).
- **Central Search Bar**:
    - **Fuzzy Search**: Quickly find files by name.
    - **Keyboard Navigation**: Use `ArrowUp`/`ArrowDown` and `Enter` to open.
    - **Auto-Focus**: Immediate typing as soon as you open a new tab.
- **Bookmarks Integration**:
    - Displays your **Core Bookmarks** as a modern card grid below the search bar.
    - Supports nested folders (flattened for quick access).
- **Rich Icon Support**:
    - **[Iconic Plugin](https://github.com/gfxholo/iconic)** Deep Integration:
        - Displays custom icons and **colors** set via Iconic rules or manual overrides.
        - Respects your theme's color palette.
    - **Frontmatter Icons**: Fallback to `icon` property in frontmatter.
    - **File Type Icons**: Defaults for PDF, Images, Canvas, etc.
- **Modern UI**:
    - Gradient background with glassmorphism effects.
    - Responsive layout.
    - Smooth interactions and hover states.

## 📦 Installation

### From Source (Manual)

1.  Clone this repository into your Obsidian plugins folder:
    ```bash
    cd /path/to/your/vault/.obsidian/plugins/
    git clone https://github.com/chkuo/obsidian-new-tab.git
    cd obsidian-new-tab
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the plugin:
    ```bash
    npm run build
    ```
4.  Reload Obsidian and enable **"New Tab Search"** in Community Plugins.

### Requirements

- **Obsidian v1.5+** (Uses the new `Bookmarks` core plugin).
- **[Iconic Plugin](https://github.com/gfxholo/iconic)** (Highly Recommended for custom icons/colors).

## 🚀 Usage

1.  Enable the plugin.
2.  Open a new tab (`CMD+T` or `CTRL+T`).
3.  Start typing to search your valut, or click a bookmark card to jump to your favorite notes.

## 🎨 Customization

The plugin automatically uses your current theme's colors.
- **Bookmarks**: Manage your bookmarks using the core **Bookmarks** plugin in the sidebar. The New Tab page reflects these changes automatically.
- **Icons**: Use the **Iconic** plugin to set custom icons and colors for folders/files, and they will appear on the New Tab page.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
