import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { getNodeEditor, putNodeByBreadcrumbs } from "../lib/util";
import { EditorType, NodeEditorUIType } from "../lib/type";
import { AppBar, Breadcrumbs, Button, Dialog, Divider, IconButton, Link, List, ListItem, ListItemButton, ListItemText, Stack, Toolbar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import type { NodeTreeEditorStateType } from "../lib/createNodeTreeEditorState";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ItemList from "./ItemList";
import { useState } from "react";
import NodeEditForm from "./NodeEditForm";

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  addChildNodeList: { [key: string]: NodeEditorUIType };
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, open, addChildNodeList } = props;
  const [selectedKey, setSelectedKey] = useState("");

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullScreen
      onClose={handleClose}
      scroll="paper"
      open={open}
    >
      <AppBar sx={{ position: 'relative' }} color="inherit">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add child node
          </Typography>
        </Toolbar>
      </AppBar>
      <Stack
        sx={{
          width: "100%",
          height: "100%",
        }}
        direction="row"
        divider={<Divider sx={{ height: "100%" }} orientation="vertical" flexItem />}
      >
        <List sx={{ pt: 0 }}>
          {Object.keys(addChildNodeList).map(key =>
            <ListItem disableGutters key={key}>
              <ListItemButton onClick={() => setSelectedKey(key)}>
                <ListItemText primary={key} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
        {addChildNodeList[selectedKey] && <NodeEditForm editorui={addChildNodeList[selectedKey]} />}
      </Stack>
    </Dialog>
  );
}

export default function NodeEditor({ nodeTreeEditorState }: { nodeTreeEditorState: NodeTreeEditorStateType }) {
  const { nodeTree, navigatedNode, breadcrumbs, breadcrumbPaths } = useSnapshot(nodeTreeEditorState);
  const { treeCompilers, editors } = useSnapshot(treeState);

  const nodeEditor = nodeTree && navigatedNode && treeCompilers && getNodeEditor(nodeTree, breadcrumbPaths, navigatedNode, treeCompilers, editors as EditorType[], node => {
    if (!nodeTreeEditorState.nodeTree) return;
    putNodeByBreadcrumbs(nodeTreeEditorState.nodeTree, breadcrumbPaths, treeState.treeCompilers, node);
  });

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return <Stack spacing={1}>
    {0 < breadcrumbs.length && <Stack spacing={1} direction="row" alignItems="center">
      <IconButton onClick={() => nodeTreeEditorState.breadcrumbs.splice(0)}>
        <HomeIcon />
      </IconButton>
      <Breadcrumbs separator=">" maxItems={2}>
        {breadcrumbs.map((value, index, array) =>
          index === array.length - 1
            ? <Typography key={index} color="text.primary">{value.label}</Typography>
            : <Link key={index} component="button" variant="body2" color="inherit" onClick={() => nodeTreeEditorState.breadcrumbs.splice(index + 1)}>
              {value.label}
            </Link>
        )}
      </Breadcrumbs>
    </Stack>}
    {nodeEditor && <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h5" component="h1" gutterBottom>
          {nodeEditor.title}
        </Typography>
        <CopyToClipboardButton nodeTreeEditorState={nodeTreeEditorState} breadcrumbPaths={breadcrumbPaths as string[]} />
      </Stack>
      <List dense sx={{ maxWidth: 360 }}>
        {nodeEditor.itemLists && Object.keys(nodeEditor.itemLists)
          .sort((keyA, keyB) => (nodeEditor.topItemListKeys?.find(key => key === keyA) ? -1 : 0)
            - (nodeEditor.topItemListKeys?.find(key => key === keyB) ? -1 : 0))
          .map(key => {
            const itemList = nodeEditor.itemLists![key];

            return <ItemList key={key} nodeTreeEditorState={nodeTreeEditorState} title={key} itemList={itemList} />;
          })}
      </List>
      {nodeEditor.dataTexts?.length
        ? <>
          <Typography variant="h6" component="h2" gutterBottom>
            Data
          </Typography>
          {nodeEditor.dataTexts.map((text, index) =>
            <Typography key={index} color="text.primary">
              {text}
            </Typography>
          )}
        </>
        : null
      }
      {nodeEditor.editorui && <NodeEditForm editorui={nodeEditor.editorui} />}
      {nodeEditor.addChildNodeList && <>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add
        </Button>
        <SimpleDialog
          open={open}
          onClose={handleClose}
          addChildNodeList={nodeEditor.addChildNodeList}
        />
      </>}
    </>}
  </Stack>;
}