import { useState } from "react";
import { Button } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import treeState from "../lib/state";
import { projectNodeTreeEditorState } from "./ProjectNodeEditor";
import { TreeNodeType } from "../lib/type";
import { TSMorphProjectType, TSMorphProjectTypeId } from "../code-compiler/ts-morph/compiler";

export default function SaveProjectButton() {
  const [isDisabled, setIsDisabled] = useState(false);

  return <Button
    variant="contained"
    disabled={isDisabled}
    onClick={() => {
      if (!projectNodeTreeEditorState.nodeTree) return;

      setIsDisabled(true);

      let nodeTree: TreeNodeType = projectNodeTreeEditorState.nodeTree;

      for (const compiler of treeState.treeCompilers) {
        try {
          nodeTree = compiler.compile(nodeTree);
        } catch (err) {
          console.error(err);
          setIsDisabled(false);
        }
      }

      if (nodeTree.type !== TSMorphProjectTypeId) {
        console.error(`nodeTree.type is ${nodeTree.type}`);
        setIsDisabled(false);
        return;
      }

      fetch(
        `/api/tree/dir?dirPath=${encodeURIComponent(treeState.dirPath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project: nodeTree as TSMorphProjectType })
      })
        .then((response: Response) => {
          if (!response.ok) throw new Error('Network response was not OK');
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          setIsDisabled(false);
        });
    }}
    startIcon={<SaveIcon />}
  >
    Save
  </Button>;
}