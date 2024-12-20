import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { getNodeEditor, putNodeByBreadcrumbs } from "../lib/util";
import { AddChildNodeType, EditorType } from "../lib/type";
import { Breadcrumbs, Button, Dialog, DialogTitle, FormControl, IconButton, InputLabel, Link, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import type { NodeTreeEditorStateType } from "../lib/createNodeTreeEditorState";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ItemList from "./ItemList";
import { useState } from "react";

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  addChildNodeList: AddChildNodeType[];
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, open, addChildNodeList } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Add child node</DialogTitle>
      <List sx={{ pt: 0 }}>
        {addChildNodeList.map(({ label, func }) =>
          <ListItem disableGutters key={label}>
            <ListItemButton onClick={() => func()}>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
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
      {nodeEditor.editorui && (
        nodeEditor.editorui.type === "string"
          ? nodeEditor.editorui.selectItems
            ? <FormControl fullWidth>
              <InputLabel>{nodeEditor.editorui.label}</InputLabel>
              <Select
                value={nodeEditor.editorui.getter()}
                onChange={(event: SelectChangeEvent) => {
                  nodeEditor.editorui?.setter(event.target.value);
                }}
                label={nodeEditor.editorui.label}
              >
                {nodeEditor.editorui.selectItems.map((item, index) =>
                  <MenuItem key={index} value={item}>{item}</MenuItem>
                )}
              </Select>
            </FormControl>
            : <TextField
              label={nodeEditor.editorui.label}
              value={nodeEditor.editorui.getter()}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                nodeEditor.editorui?.setter(event.target.value);
              }}
            />
          : nodeEditor.editorui.type === "number"
            ? <>
              <TextField
                label={nodeEditor.editorui.label}
                value={nodeEditor.editorui.getter()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  nodeEditor.editorui?.setter(event.target.value);
                }}
              />
              <Typography gutterBottom>
                {Number(nodeEditor.editorui.getter()).toString()}
              </Typography>
            </>
            : null
      )}
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