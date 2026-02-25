import { App, TFile, setIcon } from "obsidian";

export async function getIconForFile(app: App, file: TFile): Promise<string> {
    // 1. Try Iconic Plugin (Internal API)
    try {
        const iconic = (app as any).plugins?.getPlugin("iconic");
        if (iconic) {
            const pageType = file instanceof TFile ? 'file' : 'folder';

            // Iconic Logic: Check for a ruling (rule-based icon), fallback to file item (manual override)
            // We use 'any' to access private methods we found in source code
            const rule = iconic.ruleManager?.checkRuling(pageType, file.path);
            const fileItem = iconic.getFileItem(file.path);

            // Rule takes precedence if it exists and has an icon
            if (rule?.icon) return rule.icon;

            // Then checks manual overrides on the file itself
            if (fileItem?.icon) return fileItem.icon;

            // Optional: Use Iconic's default if available (e.g. for specific file types)
            // if (fileItem?.iconDefault) return fileItem.iconDefault;
        }
    } catch (e) {
        console.warn("New Tab: Failed to get icon from Iconic", e);
    }

    // 2. Frontmatter 'icon' property
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.icon) {
        return cache.frontmatter.icon;
    }

    // 3. Default based on file type (basic)
    if (file.extension === "pdf") return "lucide-file-text";
    if (file.extension === "png" || file.extension === "jpg") return "lucide-image";
    if (file.extension === "canvas") return "lucide-layout-dashboard";

    return "lucide-file"; // Default
}

// Helper to render icon into an element
export function renderIcon(app: App, iconName: string, container: HTMLElement) {
    // Check if it's an emoji
    const isEmoji = /\p{Emoji}/u.test(iconName);
    if (isEmoji && iconName.length < 5) { // Simple heuristic
        container.innerText = iconName;
        container.style.fontSize = "1.5rem";
        return;
    }

    // Lucide icon or custom icon
    setIcon(container, iconName);
}
