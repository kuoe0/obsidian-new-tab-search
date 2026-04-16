import { App, TFile, setIcon } from "obsidian";
import { IconInfo } from "./types";

const iconCache = new Map<string, IconInfo>();
const MAX_CACHE_SIZE = 500;

export async function getIconForFile(app: App, file: TFile): Promise<IconInfo> {
    const cacheKey = file.path + (file as any).mtime; // Use path and modification time as key
    if (iconCache.has(cacheKey)) {
        const info = iconCache.get(cacheKey)!;
        iconCache.delete(cacheKey);
        iconCache.set(cacheKey, info);
        return info;
    }

    let result: IconInfo = { icon: "lucide-file", color: null };

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
                result = {
                    icon: rule.iconId || rule.icon || fileItem?.icon || fileItem?.iconId || "lucide-file",
                    color: rule.color || fileItem?.color || null
                };
            } else if (fileItem) {
                // Then checks manual overrides on the file itself
                result = {
                    icon: fileItem.icon || fileItem.iconId || "lucide-file",
                    color: fileItem.color || null
                };
            }
        }
    } catch (e) {
        console.warn("New Tab: Failed to get icon from Iconic", e);
    }

    // 2. Frontmatter 'icon' property if no Iconic icon
    if (result.icon === "lucide-file") {
        const cache = app.metadataCache.getFileCache(file);
        if (cache?.frontmatter?.icon) {
            result = { icon: cache.frontmatter.icon, color: null };
        }
    }

    // 3. Default based on file type (basic)
    if (result.icon === "lucide-file") {
        if (file.extension === "pdf") result.icon = "lucide-file-text";
        else if (file.extension === "png" || file.extension === "jpg") result.icon = "lucide-image";
        else if (file.extension === "canvas") result.icon = "lucide-layout-dashboard";
    }

    // LRU Eviction
    if (iconCache.size >= MAX_CACHE_SIZE) {
        const firstKey = iconCache.keys().next().value;
        if (firstKey) iconCache.delete(firstKey);
    }

    iconCache.set(cacheKey, result);
    return result;
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
