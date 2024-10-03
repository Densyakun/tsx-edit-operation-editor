import { Box, Button, List, ListItem, ListItemButton, ListItemText, Stack, Switch, Typography } from "@mui/material";
import treeState, { saveAddonsJsonToServer, updateEditor } from "../lib/state";
import { useSnapshot } from "valtio";
import { AddonJsonType } from "../tree-compiler/type";
import { useState } from "react";
import NodeEditor from "./NodeEditor";
import createNodeTreeEditorState from "../lib/createNodeTreeEditorState";

const nodeTreeEditorState = createNodeTreeEditorState();

enum ShowMode {
  addon,
  compilerCode,
  editorCode,
};

function Addon({ addonIndex, addonJson }: { addonIndex: number, addonJson: AddonJsonType }) {
  const [showMode, setShowMode] = useState(ShowMode.addon);

  if (showMode === ShowMode.compilerCode) {
    return <>
      <Box><Button variant="outlined" onClick={() => setShowMode(ShowMode.addon)}>{"< Back"}</Button></Box>
      <Typography variant="h5" component="h1" gutterBottom>Compiler code</Typography>
      <NodeEditor nodeTreeEditorState={nodeTreeEditorState} />
    </>;
  }

  if (showMode === ShowMode.editorCode) {
    return <>
      <Box><Button variant="outlined" onClick={() => setShowMode(ShowMode.addon)}>{"< Back"}</Button></Box>
      <Typography variant="h5" component="h1" gutterBottom>Editor code</Typography>
      <NodeEditor nodeTreeEditorState={nodeTreeEditorState} />
    </>;
  }

  return <Stack spacing={1}>
    <Box><Button variant="outlined" onClick={() => treeState.navigatedAddonIndex = -1}>{"< Back"}</Button></Box>
    <Typography variant="h5" component="h1" gutterBottom>Addon</Typography>
    <Typography variant="h6" component="h2" gutterBottom>{addonJson.name}</Typography>
    <Typography variant="h6" component="h2" gutterBottom>Description:</Typography>
    <Typography variant="body1" gutterBottom>{addonJson.description}</Typography>
    <Typography variant="h6" component="h2" gutterBottom>Author:</Typography>
    <Typography variant="body1" gutterBottom>{addonJson.author}</Typography>
    <Typography variant="h6" component="h2" gutterBottom>Website:</Typography>
    <Typography variant="body1" gutterBottom>{addonJson.website}</Typography>
    <Box><Button variant="outlined" onClick={() => {
      setShowMode(ShowMode.compilerCode);
      nodeTreeEditorState.nodeTree = treeState.addons[addonIndex]?.compilerSyntaxList;
    }}>Compiler code</Button></Box>
    <Box><Button variant="outlined" onClick={() => {
      setShowMode(ShowMode.editorCode);
      nodeTreeEditorState.nodeTree = treeState.addons[addonIndex]?.editorSyntaxList;
    }}>Editor code</Button></Box>
  </Stack>;
}

export default function Addons() {
  const { addonsJson, navigatedAddonIndex } = useSnapshot(treeState);

  return <>
    {
      navigatedAddonIndex === -1
        ? <>
          <Typography variant="h5" component="h1" gutterBottom>Addons</Typography>
          <List dense sx={{ maxWidth: 360 }}>
            {addonsJson.map((addonJson, index) =>
              <ListItem key={index} disablePadding/* sx={{ backgroundColor: color }}*/>
                <ListItemButton onClick={() => treeState.navigatedAddonIndex = index}>
                  <ListItemText primary={`(${index + 1}) ` + (addonJson.name || "")} />
                </ListItemButton>
                <Switch
                  edge="end"
                  onChange={e => {
                    treeState.addons[index].enabled = treeState.addonsJson[index].enabled = e.target.checked;
                    updateEditor();
                    saveAddonsJsonToServer();
                  }}
                  checked={addonJson.enabled}
                />
              </ListItem>
            )}
            <ListItem disablePadding sx={{ border: 1 }}>
              <ListItemButton onClick={() => {
                treeState.addonsJson = [...treeState.addonsJson, {
                  enabled: true,
                  compilerCode: "",
                  editorCode: "",
                  name: "",
                  description: "",
                  author: "",
                  website: "",
                }];

                saveAddonsJsonToServer();
              }}>
                <ListItemText primary="Add" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
        : <Addon addonIndex={navigatedAddonIndex} addonJson={addonsJson[navigatedAddonIndex]} />
    }
  </>;
}