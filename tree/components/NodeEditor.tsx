import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { getNodeEditor } from "../lib/util";
import { EditorType } from "../lib/type";
import { Breadcrumbs, IconButton, Link, List, Stack, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { NodeTreeEditorStateType } from "../lib/createNodeTreeEditorState";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ItemList from "./ItemList";

export default function NodeEditor({ nodeTreeEditorState }: { nodeTreeEditorState: NodeTreeEditorStateType }) {
  const { navigatedNode, breadcrumbs, breadcrumbPaths } = useSnapshot(nodeTreeEditorState);
  const { editors } = useSnapshot(treeState);

  const nodeEditor = navigatedNode && getNodeEditor(navigatedNode, editors as EditorType[]);

  return <Stack spacing={1}>
    {0 < breadcrumbs.length && <Stack spacing={1} direction="row" alignItems="center">
      <IconButton onClick={() => nodeTreeEditorState.breadcrumbs.splice(0)}>
        <HomeIcon />
      </IconButton>
      <Breadcrumbs separator=">" maxItems={2}>
        {breadcrumbs.map((value, index, array) =>
          index === array.length - 1
            ? <Typography key={index} color="text.primary">{value.label}</Typography>
            : <Link key={index} component="button" variant="body2" color="inherit" onClick={() => nodeTreeEditorState.breadcrumbs.splice(index + 1)}>
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
        <CopyToClipboardButton nodeTreeEditorState={nodeTreeEditorState} breadcrumbPaths={breadcrumbPaths as string[]} />
      </Stack>
      <List dense sx={{ maxWidth: 360 }}>
        {nodeEditor.itemLists && Object.keys(nodeEditor.itemLists)
          .sort((keyA, keyB) => (nodeEditor.topItemListKeys?.find(key => key === keyA) ? -1 : 0)
            - (nodeEditor.topItemListKeys?.find(key => key === keyB) ? -1 : 0))
          .map(key => {
            const itemList = nodeEditor.itemLists![key];

            return <ItemList key={key} nodeTreeEditorState={nodeTreeEditorState} title={key} itemList={itemList} />;
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