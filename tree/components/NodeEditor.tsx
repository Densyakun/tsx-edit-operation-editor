import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { Accordion, AccordionDetails, AccordionSummary, Alert, AlertTitle, Breadcrumbs, IconButton, Link, List, Skeleton, Stack, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TSMorphProjectType } from "../code-compiler/ts-morph/compiler";
import ItemList from "./ItemList";
import CopyToClipboardButton from "./CopyToClipboardButton";
import { EditorType, TreeNodeType } from "../lib/type";
import { getAddonByJson } from "../tree-compiler/util";
import { AddonJsonType, AddonType } from "../tree-compiler/type";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { getNodeEditor } from "../lib/util";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  return res.json();
};

function LoadedNodeEditor() {
  const { navigatedNode, breadcrumbs, breadcrumbPaths, editors } = useSnapshot(treeState);

  const nodeEditor = navigatedNode && getNodeEditor(navigatedNode, editors as EditorType[]);

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
    {nodeEditor && <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h5" component="h1" gutterBottom>
          {nodeEditor.title}
        </Typography>
        <CopyToClipboardButton breadcrumbPaths={breadcrumbPaths as string[]} />
      </Stack>
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
    </>}
  </Stack>;
}

function NodeEditorError({ error }: { error: Error | string }) {
  return (error as Error).name
    ? <Alert variant="filled" severity="error">
      <AlertTitle>{(error as Error).name}</AlertTitle>
      {(error as Error).message}
      {(error as Error).cause ? JSON.stringify((error as Error).cause) : null}
      {(error as Error).stack && <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>Stack</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {(error as Error).stack?.split(/\s/).map((text, index) => <Typography key={index}>
            {text}
          </Typography>)}
        </AccordionDetails>
      </Accordion>}
    </Alert>
    : <Alert variant="filled" severity="error">
      {error as string}
    </Alert>;
}

export default function NodeEditor() {
  const { dirPath, treeCompilers } = useSnapshot(treeState);

  const { data: addonsJson, error, isLoading } = useSWR<AddonJsonType[]>(`/api/addons`, fetcher);

  const { data: sourceFilesNode, error: error1, isLoading: isLoading1 } = useSWR<TSMorphProjectType>(dirPath ? `/api/tree/dir?dirPath=${dirPath}` : null, fetcher);

  const [treeCompileError, setTreeCompileError] = useState<Error | string>();

  useEffect(() => {
    if (!addonsJson) return;

    treeState.addons = addonsJson.map(addonJson => getAddonByJson(addonJson)).filter(addon => addon) as AddonType[];
  }, [addonsJson]);

  useEffect(() => {
    setTreeCompileError(undefined);

    if (!treeCompilers || !sourceFilesNode) return;

    let nodeTree: TreeNodeType = JSON.parse(JSON.stringify(sourceFilesNode));

    for (const compiler of treeCompilers) {
      try {
        nodeTree = compiler.decompile(nodeTree);
      } catch (err) {
        if (err instanceof Error) {
          setTreeCompileError(err);
        } else {
          setTreeCompileError("failed to load");
        }
      }
    }

    treeState.nodeTree = nodeTree;
  }, [treeCompilers, sourceFilesNode]);

  if (error || error1) return <NodeEditorError error={error || error1} />;
  if (isLoading || isLoading1) return <Skeleton variant="rectangular" sx={{ maxWidth: 360 }} />;

  if (treeCompileError) return <NodeEditorError error={treeCompileError} />;

  return <LoadedNodeEditor />;
}