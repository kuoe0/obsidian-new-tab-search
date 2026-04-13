import * as React from "react";
import { App } from "obsidian";
import { renderIcon } from "../iconUtils";

interface IconDisplayProps {
  app: App;
  iconName?: string;
  color?: string | null;
  className?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({ app, iconName, color, className }) => {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (ref.current && iconName) {
      ref.current.empty();
      renderIcon(app, iconName, ref.current, color);
    }
  }, [iconName, color, app]);

  if (!iconName) return <span className={`icon-placeholder ${className || ''}`}>📄</span>;

  return <span ref={ref} className={`icon-render ${className || ''}`} />;
};
