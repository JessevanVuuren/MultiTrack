import { CSSProperties } from "preact";
import { ReactNode } from "preact/compat";
import { useState } from "preact/hooks";

interface HoverButtonProps {
  onClick?: () => void;
  style?: CSSProperties;
  hover_style?: CSSProperties;
  children: ReactNode;
}

export function Button({ onClick, style, hover_style, children }: HoverButtonProps) {
  const [hover, set_hover] = useState(false);

  return (
    <p style={{ ...style, ...(hover ? hover_style : {}) }}
      onPointerDown={onClick}
      onPointerEnter={() => set_hover(true)}
      onPointerLeave={() => set_hover(false)}>
      {children}
    </p>
  );
}