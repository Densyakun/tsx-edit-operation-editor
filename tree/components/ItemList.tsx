import { useSnapshot } from "valtio";
import { Typography } from "@mui/material";
import TreeNodeListItem from "./TreeNodeListItem";
import { TreeNodeListItemType } from "../lib/type";
import { NodeTreeEditorStateType } from "../lib/createNodeTreeEditorState";

export default function ItemList({ nodeTreeEditorState, title, itemList }: { nodeTreeEditorState: NodeTreeEditorStateType, title: string, itemList: TreeNodeListItemType[] }) {
  const { breadcrumbPaths } = useSnapshot(nodeTreeEditorState);

  return <>
    <Typography variant="h6" component="h2" gutterBottom>
      {title}
    </Typography>
    {itemList.length
      ? itemList.map(item => {
        const breadcrumbPaths_ = [...breadcrumbPaths, item.breadcrumb.path];

        return <TreeNodeListItem
          key={JSON.stringify(breadcrumbPaths_)}
          nodeTreeEditorState={nodeTreeEditorState}
          text={item.text}
          color={item.color}
          onClick={() => nodeTreeEditorState.breadcrumbs.push(item.breadcrumb)}
          path={breadcrumbPaths_}
        />;
      })
      : <Typography color="text.primary">
        (None)
      </Typography>
    }
  </>;
}