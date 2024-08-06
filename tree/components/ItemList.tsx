import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { Typography } from "@mui/material";
import TreeNodeListItem from "./TreeNodeListItem";
import { TreeNodeListItemType } from "../lib/type";

export default function ItemList({ title, itemList }: { title: string, itemList: TreeNodeListItemType[] }) {
  const { breadcrumbPaths } = useSnapshot(treeState);

  return <>
    <Typography variant="h6" component="h2" gutterBottom>
      {title}
    </Typography>
    {itemList.length
      ? itemList.map(item => {
        const breadcrumbPaths_ = [...breadcrumbPaths, item.breadcrumb.path];

        return <TreeNodeListItem
          key={JSON.stringify(breadcrumbPaths_)}
          text={item.text}
          color={item.color}
          onClick={() => treeState.breadcrumbs.push(item.breadcrumb)}
          path={breadcrumbPaths_}
        />;
      })
      : <Typography color="text.primary">
        (None)
      </Typography>
    }
  </>;
}