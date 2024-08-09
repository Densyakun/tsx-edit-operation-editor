import { useState } from "react";
import treeState from "../lib/state";
import { ClickAwayListener, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getNodeByBreadcrumbs } from "../lib/util";

export default function CopyToClipboardButton({ breadcrumbPaths }: { breadcrumbPaths: string[] }) {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    if (!treeState.nodeTree) return;

    navigator.clipboard.writeText(JSON.stringify(getNodeByBreadcrumbs(treeState.nodeTree, breadcrumbPaths)));

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