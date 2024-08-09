import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import CopyToClipboardButton from "./CopyToClipboardButton";

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
    <CopyToClipboardButton breadcrumbPaths={path} />
  </ListItem>;
}