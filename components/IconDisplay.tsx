import * as React from "react";
import { renderIcon } from "../iconUtils";
import { useAppContext } from "../context";

interface IconDisplayProps {
  iconName?: string;
  color?: string | null;
  className?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({ iconName, color, className }) => {
  const { app } = useAppContext();
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
