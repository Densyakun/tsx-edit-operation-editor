import { useState } from "react";
import { NodeJson, TSMorphSourceFileType } from "../code-compiler/ts-morph/compiler";
import treeState from "../lib/state";
import { ClickAwayListener, IconButton, ListItem, ListItemButton, ListItemText, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function CopyToClipboardButton({ path }: { path: string[] }) {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    if (!treeState.nodeTree) return null;

    let nodeList: TSMorphSourceFileType[] | NodeJson[] | undefined = treeState.nodeTree as TSMorphSourceFileType[];
    let node: TSMorphSourceFileType | NodeJson | undefined;

    for (let n = 0; n < path.length; n++) {
      if (!nodeList) return null;
      node = nodeList.find((node, index) =>
        (node as TSMorphSourceFileType).filePath === undefined
          ? path[n] === index.toString()
          : path[n] === (node as TSMorphSourceFileType).filePath
      ) as TSMorphSourceFileType | NodeJson | undefined;
      if (!node) return null;
      nodeList = (node as TSMorphSourceFileType).filePath === undefined
        ? (node as NodeJson).children
        : (node as TSMorphSourceFileType).syntaxList.children;
    }

    navigator.clipboard.writeText(JSON.stringify(node));

    setOpen(true);
  };

  return <ClickAwayListener onClickAway={handleTooltipClose}>
    <Tooltip
      PopperProps={{
        disablePortal: true,
      }}
      onClose={handleTooltipClose}
      open={open}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title="Copied!"
    >
      <IconButton onClick={handleClick}>
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  </ClickAwayListener>;
}

export default function TreeNodeListItem({
  text,
  color,
  onClick,
  path,
}: {
  text: string;
  color: string;
  onClick: () => void;
  path: string[];
}) {
  return <ListItem disablePadding sx={{ backgroundColor: color }}>
    <ListItemButton onClick={onClick}>
      <ListItemText primary={text} />
    </ListItemButton>
    <CopyToClipboardButton path={path} />
  </ListItem>;
}