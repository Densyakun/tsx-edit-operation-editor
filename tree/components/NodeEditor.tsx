import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { Breadcrumbs, IconButton, Link, List, Skeleton, Stack, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { getNodeEditor } from "../lib/util";
import { TSMorphProjectType } from "../code-compiler/ts-morph/compiler";
import { useEffect } from "react";
import treeCompiler from "../tree-compiler/tsx-edit-operation-editor/compiler";
import ItemList from "./ItemList";

export default function NodeEditor() {
  const { dirPath, error, loading, navigatedNode, breadcrumbs } = useSnapshot(treeState);

  useEffect(() => {
    treeState.loading = true;
    fetch(`/api/tree/dir?dirPath=${dirPath}`)
      .then(res => res.json())
      .then((sourceFilesNode: TSMorphProjectType) => {
        treeState.loading = false;
        treeState.nodeTree = treeCompiler.decompile(sourceFilesNode);
        treeState.error = undefined;
      })
      .catch(e => {
        treeState.nodeTree = undefined;
        treeState.error = e;
      });
  }, [dirPath]);

  if (error) {
    return <>
      {JSON.stringify(error)}
    </>;
  }

  if (loading) {
    return <Skeleton variant="rectangular" sx={{ maxWidth: 360 }} />;
  }

  if (!navigatedNode) return null;

  const nodeEditor = getNodeEditor(navigatedNode);

  if (!nodeEditor) return null;

  return <Stack spacing={1}>
    {0 < breadcrumbs.length && <Stack spacing={1} direction="row" alignItems="center">
      <IconButton onClick={() => treeState.breadcrumbs.splice(0)}>
        <HomeIcon />
      </IconButton>
      <Breadcrumbs separator=">" maxItems={2}>
        {breadcrumbs.map((value, index, array) =>
          index === array.length - 1
            ? <Typography key={index} color="text.primary">{value.label}</Typography>
            : <Link key={index} component="button" variant="body2" color="inherit" onClick={() => treeState.breadcrumbs.splice(index + 1)}>
              {value.label}
            </Link>
        )}
      </Breadcrumbs>
    </Stack>}
    <Typography variant="h5" component="h1" gutterBottom>
      {nodeEditor.title}
    </Typography>
    <List dense sx={{ maxWidth: 360 }}>
      {nodeEditor.itemLists && Object.keys(nodeEditor.itemLists)
        .sort((keyA, keyB) => (nodeEditor.topItemListKeys?.find(key => key === keyA) ? -1 : 0)
          - (nodeEditor.topItemListKeys?.find(key => key === keyB) ? -1 : 0))
        .map(key => {
          const itemList = nodeEditor.itemLists![key];

          return <ItemList key={key} title={key} itemList={itemList} />;
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
  </Stack>;
}