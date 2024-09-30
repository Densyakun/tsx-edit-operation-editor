import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import CopyToClipboardButton from "./CopyToClipboardButton";
import { NodeTreeEditorStateType } from "../lib/createNodeTreeEditorState";

export default function TreeNodeListItem({
  nodeTreeEditorState,
  text,
  color,
  onClick,
  path,
}: {
  nodeTreeEditorState: NodeTreeEditorStateType;
  text: string;
  color: string;
  onClick: () => void;
  path: string[];
}) {
  return <ListItem disablePadding sx={{ backgroundColor: color }}>
    <ListItemButton onClick={onClick}>
      <ListItemText primary={text} />
    </ListItemButton>
    <CopyToClipboardButton nodeTreeEditorState={nodeTreeEditorState} breadcrumbPaths={path} />
  </ListItem>;
}