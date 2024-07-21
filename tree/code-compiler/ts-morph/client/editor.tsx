import { NodeJson } from "../compiler";
import { SyntaxKind } from "ts-morph";
import treeState from "@/tree/lib/state";
import { useSnapshot } from "valtio";
import TreeNodeListItem from '@/tree/components/TreeNodeListItem';

const kindCount = 363;

function getKindHue(kind: number) {
  return kind * 360 / kindCount;
}

export function ListItems({
  breadcrumbsPath,
}: {
  breadcrumbsPath: string[];
}) {
  const { nodeTree: sourceFiles } = useSnapshot(treeState);

  if (!sourceFiles) return null;

  if (breadcrumbsPath.length === 0)
    return <>
      {sourceFiles.map(sourceFile =>
        <TreeNodeListItem
          key={sourceFile.filePath}
          text={sourceFile.relativeFilePath}
          color="hsl(0, 0%, 75%)"
          onClick={() => treeState.breadcrumbs.push({ path: sourceFile.filePath, label: sourceFile.filePath })}
          path={[sourceFile.filePath]}
        />
      )}
    </>;

  const sourceFile = sourceFiles.find(({ filePath }) => filePath === breadcrumbsPath[0]);
  if (!sourceFile) return null;

  let node = sourceFile.syntaxList as Readonly<NodeJson>;
  for (let n = 1; n < breadcrumbsPath.length; n++) {
    if (!node.children) return null;

    node = node.children[parseInt(breadcrumbsPath[n])];
  }

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