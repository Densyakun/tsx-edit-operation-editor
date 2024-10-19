import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { Accordion, AccordionDetails, AccordionSummary, Alert, AlertTitle, Skeleton, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TSMorphProjectType } from "../code-compiler/ts-morph/compiler";
import { TreeNodeType } from "../lib/type";
import useSWR from "swr";
import { useEffect, useState } from "react";
import NodeEditor from "./NodeEditor";
import createNodeTreeEditorState from "../lib/createNodeTreeEditorState";

export const projectNodeTreeEditorState = createNodeTreeEditorState();

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  return res.json();
};

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

export default function ProjectNodeEditor() {
  const { dirPath, treeCompilers } = useSnapshot(treeState);

  const { data: sourceFilesNode, error, isLoading } = useSWR<TSMorphProjectType>(dirPath ? `/api/tree/dir?dirPath=${encodeURIComponent(dirPath)}` : null, fetcher);

  const [treeCompileError, setTreeCompileError] = useState<Error | string>();

  useEffect(() => {
    setTreeCompileError(undefined);

    if (!treeCompilers || !sourceFilesNode) return;

    let nodeTree: TreeNodeType = sourceFilesNode;

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

    projectNodeTreeEditorState.nodeTree = nodeTree;
  }, [treeCompilers, sourceFilesNode]);

  if (error) return <NodeEditorError error={error} />;
  if (isLoading) return <Skeleton variant="rectangular" sx={{ maxWidth: 360 }} />;

  if (treeCompileError) return <NodeEditorError error={treeCompileError} />;

  return <NodeEditor nodeTreeEditorState={projectNodeTreeEditorState} />;
}