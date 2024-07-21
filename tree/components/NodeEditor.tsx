import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { Stack, Typography } from "@mui/material";
import { NodeJson, TSMorphSourceFileType } from "../code-compiler/ts-morph/compiler";

export default function NodeEditor() {
  const { nodeTree, breadcrumbs } = useSnapshot(treeState);

  if (!nodeTree || !breadcrumbs.length) return null;

  let nodeList: TSMorphSourceFileType[] | NodeJson[] | undefined = nodeTree as TSMorphSourceFileType[];
  let node: TSMorphSourceFileType | NodeJson | undefined;

  for (let n = 0; n < breadcrumbs.length; n++) {
    if (!nodeList) return null;
    node = nodeList.find((node, index) =>
      (node as TSMorphSourceFileType).filePath === undefined
        ? breadcrumbs[n].path === index.toString()
        : breadcrumbs[n].path === (node as TSMorphSourceFileType).filePath
    ) as TSMorphSourceFileType | NodeJson | undefined;
    if (!node) return null;
    nodeList = (node as TSMorphSourceFileType).filePath === undefined
      ? (node as NodeJson).children
      : (node as TSMorphSourceFileType).syntaxList.children;
  }

  return <Stack spacing={1}>
    <Typography color="text.primary">{JSON.stringify(
      (node as TSMorphSourceFileType).filePath
        ? {
          commentRangesAtEndOfFile: (node as TSMorphSourceFileType).commentRangesAtEndOfFile,
        }
        : (node as NodeJson).text
          ? {
            leadingCommentRanges: (node as NodeJson).leadingCommentRanges,
            text: (node as NodeJson).text,
            trailingCommentRanges: (node as NodeJson).trailingCommentRanges,
          }
          : ""
    )}</Typography>
  </Stack>;
}