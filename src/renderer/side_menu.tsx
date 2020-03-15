import * as React from "react";
import { SidebarProps, Menu } from "semantic-ui-react";

export interface SideMenuProps {
  contentViewNames: string[];
  contentViewIndex: number;
  onMenuClick: (menuIndex: number) => void;
}

export function SideMenu({
  contentViewNames,
  contentViewIndex,
  onMenuClick
}: SideMenuProps): React.ReactElement<SidebarProps> {
  return (
    <Menu secondary pointing attached="top">
      {contentViewNames.map((name, index) => (
        <Menu.Item
          key={index.toString()}
          active={index === contentViewIndex}
          onClick={(): void => onMenuClick(index)}
        >
          {name}
        </Menu.Item>
      ))}
    </Menu>
  );
}
