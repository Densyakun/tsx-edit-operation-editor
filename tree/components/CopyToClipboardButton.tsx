import { useState } from "react";
import treeState from "../lib/state";
import { ClickAwayListener, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getNodeByBreadcrumbs } from "../lib/util";
import { NodeTreeEditorStateType } from "../lib/createNodeTreeEditorState";

export default function CopyToClipboardButton({ nodeTreeEditorState, breadcrumbPaths }: { nodeTreeEditorState: NodeTreeEditorStateType, breadcrumbPaths: string[] }) {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    if (!nodeTreeEditorState.nodeTree) return;

    navigator.clipboard.writeText(JSON.stringify(getNodeByBreadcrumbs(nodeTreeEditorState.nodeTree, breadcrumbPaths, treeState.treeCompilers)));

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