import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { NodeJson, TSMorphSourceFileType } from "../compiler";
import { SyntaxKind } from "ts-morph";
import treeState from "@/tree/lib/state";

export function TreeNodeListItem({ text, color, onClick }: { text: string, color: string, onClick: () => void }) {
  return <ListItem disablePadding sx={{ backgroundColor: color }}>
    <ListItemButton onClick={onClick}>
      <ListItemText primary={text} />
    </ListItemButton>
  </ListItem>;
}

export function ListItems({
  tree,
  breadcrumbsPath,
}: {
  tree: TSMorphSourceFileType[];
  breadcrumbsPath: string[];
}) {
  if (breadcrumbsPath.length === 0)
    return <>
      {tree.map(sourceFile =>
        <TreeNodeListItem text={sourceFile.filePath} color="hsl(0, 0%, 75%)" onClick={() => treeState.breadcrumbs.push({ path: sourceFile.filePath, label: sourceFile.filePath })} />
      )}
    </>;

  const sourceFile = tree.find(sourceFile => sourceFile.filePath === breadcrumbsPath[0]);
  if (!sourceFile) return <></>;

  let node: NodeJson = sourceFile.syntaxList;
  for (let n = 1; n < breadcrumbsPath.length; n++) {
    if (!node.children) return <></>;

    node = node.children[parseInt(breadcrumbsPath[n])];
  }

  return <>
    {node.children?.map((child, index) =>
      <TreeNodeListItem text={SyntaxKind[child.kind]} color="hsl(0, 0%, 75%)" onClick={() => treeState.breadcrumbs.push({ path: index.toString(), label: SyntaxKind[child.kind] })} />
    )}
  </>;
}