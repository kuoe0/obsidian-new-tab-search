import { App, TFile, setIcon } from "obsidian";

export interface IconInfo {
    icon: string;
    color: string | null;
}

export async function getIconForFile(app: App, file: TFile): Promise<IconInfo> {
    // 1. Try Iconic Plugin (Internal API)
    try {
        const iconic = (app as any).plugins?.getPlugin("iconic");
        if (iconic) {
            const pageType = file instanceof TFile ? 'file' : 'folder';

            // Iconic Logic: Check for a ruling (rule-based icon), fallback to file item (manual override)
            // We use 'any' to access private methods we found in source code
            const rule = iconic.ruleManager?.checkRuling(pageType, file.path);
            const fileItem = iconic.getFileItem(file.path);

            // Rule takes precedence if it exists
            if (rule) {
                return {
                    icon: rule.icon || fileItem?.icon || "lucide-file",
                    color: rule.color || fileItem?.color || null
                };
            }

            // Then checks manual overrides on the file itself
            if (fileItem) {
                return {
                    icon: fileItem.icon || "lucide-file",
                    color: fileItem.color || null
                };
            }
        }
    } catch (e) {
        console.warn("New Tab: Failed to get icon from Iconic", e);
    }

    // 2. Frontmatter 'icon' property
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.icon) {
        return { icon: cache.frontmatter.icon, color: null };
    }

    // 3. Default based on file type (basic)
    let defaultIcon = "lucide-file";
    if (file.extension === "pdf") defaultIcon = "lucide-file-text";
    else if (file.extension === "png" || file.extension === "jpg") defaultIcon = "lucide-image";
    else if (file.extension === "canvas") defaultIcon = "lucide-layout-dashboard";

    return { icon: defaultIcon, color: null };
}

// Helper to render icon into an element
const ICONIC_COLORS = new Map<string, string>([
    ['red', '--color-red'],
    ['orange', '--color-orange'],
    ['yellow', '--color-yellow'],
    ['green', '--color-green'],
    ['cyan', '--color-cyan'],
    ['blue', '--color-blue'],
    ['purple', '--color-purple'],
    ['pink', '--color-pink'],
    ['gray', '--color-base-70'],
]);

export function renderIcon(app: App, iconName: string, container: HTMLElement, color?: string | null) {
    // Check if it's an emoji
    const isEmoji = /\p{Emoji}/u.test(iconName);
    if (isEmoji && iconName.length < 5) { // Simple heuristic
        container.innerText = iconName;
        container.style.fontSize = "1.5rem";
        // Emojis generally don't get colored by CSS color property
        return;
    }

    // Lucide icon or custom icon
    setIcon(container, iconName);

    if (color) {
        if (ICONIC_COLORS.has(color)) {
            container.style.color = `var(${ICONIC_COLORS.get(color)})`;
        } else {
            container.style.color = color;
        }
    }
}
