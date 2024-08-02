import { OtherNodeTypeId, SourceFilesTypeId, SourceFileTypeId, SyntaxListTypeId, TSMorphNodeType, TSMorphOtherNodeType, TSMorphSourceFilesType, TSMorphSourceFileType, TSMorphSyntaxListType } from "../compiler";
import { SyntaxKind } from "ts-morph";
import treeState from "@/tree/lib/state";
import { useSnapshot } from "valtio";
import TreeNodeListItem from '@/tree/components/TreeNodeListItem';
import { Stack, Typography } from "@mui/material";

const kindCount = 363;

function getKindHue(kind: number) {
  return kind * 360 / kindCount;
}

function NodeChildrenItemList({
  node,
  breadcrumbsPath,
}: {
  node: TSMorphNodeType;
  breadcrumbsPath: string[];
}) {
  return <>
    {node.children?.map((child, index) => {
      const path = [...breadcrumbsPath, index.toString()];
      return <TreeNodeListItem
        key={JSON.stringify(path)}
        text={SyntaxKind[child.kind]}
        color={`hsl(${getKindHue(child.kind)}, 50%, 75%)`}
        onClick={() => treeState.breadcrumbs.push({ path: index.toString(), label: SyntaxKind[child.kind] })}
        path={path}
      />;
    })}
  </>;
}

const itemListFuncMap: { [key: string]: () => React.ReactNode } = {
  [SourceFilesTypeId]: () => {
    const { navigatedNode: node } = useSnapshot(treeState);

    if (!node) return null;

    return <>
      {(node as TSMorphSourceFilesType).sourceFiles.map(sourceFile =>
        <TreeNodeListItem
          key={sourceFile.filePath}
          text={sourceFile.relativeFilePath}
          color="hsl(0, 0%, 75%)"
          onClick={() => treeState.breadcrumbs.push({ path: sourceFile.filePath, label: sourceFile.filePath })}
          path={[sourceFile.filePath]}
        />
      )}
    </>;
  },
  [SourceFileTypeId]: () => {
    const { navigatedNode: node, breadcrumbTrail } = useSnapshot(treeState);

    if (!node) return null;

    return <NodeChildrenItemList node={(node as TSMorphSourceFileType).syntaxList} breadcrumbsPath={breadcrumbTrail as string[]} />;
  },
  [SyntaxListTypeId]: () => {
    const { navigatedNode: node, breadcrumbTrail } = useSnapshot(treeState);

    if (!node) return null;

    return <NodeChildrenItemList node={(node as TSMorphSyntaxListType)} breadcrumbsPath={breadcrumbTrail as string[]} />;
  },
  [OtherNodeTypeId]: () => {
    const { navigatedNode: node, breadcrumbTrail } = useSnapshot(treeState);

    if (!node) return null;

    return <NodeChildrenItemList node={(node as TSMorphOtherNodeType)} breadcrumbsPath={breadcrumbTrail as string[]} />;
  },
};

// TODO MUIコンポーネントを/tree/*.tsxにまとめる

const nodeEditorFuncMap: { [key: string]: () => React.ReactNode } = {
  [SourceFileTypeId]: () => {
    const { navigatedNode: node } = useSnapshot(treeState);

    if (!node) return null;

    return <Stack spacing={1}>
      <Typography color="text.primary">{JSON.stringify({
        commentRangesAtEndOfFile: (node as TSMorphSourceFileType).commentRangesAtEndOfFile,
      })}</Typography>
    </Stack>;
  },
  [SyntaxListTypeId]: () => {
    const { navigatedNode: node } = useSnapshot(treeState);

    if (!node) return null;

    return <Stack spacing={1}>
      <Typography color="text.primary">{JSON.stringify(
        (node as TSMorphNodeType).text
          ? {
            leadingCommentRanges: (node as TSMorphNodeType).leadingCommentRanges,
            text: (node as TSMorphNodeType).text,
            trailingCommentRanges: (node as TSMorphNodeType).trailingCommentRanges,
          }
          : ""
      )}</Typography>
    </Stack>;
  },
  [OtherNodeTypeId]: () => {
    const { navigatedNode: node } = useSnapshot(treeState);

    if (!node) return null;

    return <Stack spacing={1}>
      <Typography color="text.primary">{JSON.stringify(
        (node as TSMorphNodeType).text
          ? {
            leadingCommentRanges: (node as TSMorphNodeType).leadingCommentRanges,
            text: (node as TSMorphNodeType).text,
            trailingCommentRanges: (node as TSMorphNodeType).trailingCommentRanges,
          }
          : ""
      )}</Typography>
    </Stack>;
  },
};

export default { itemListFuncMap, nodeEditorFuncMap };