import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { useEffect, useState } from "react";
import { Breadcrumbs, IconButton, Link, List, Skeleton, Stack, Typography } from "@mui/material";
import { TSMorphSourceFileType } from "../code-compiler/ts-morph/compiler";
import { ListItems } from "../code-compiler/ts-morph/client/editor";
import HomeIcon from "@mui/icons-material/Home";

export default function Tree() {
  const { dirPath, nodeTree, breadcrumbs } = useSnapshot(treeState);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tree/dir?dirPath=${dirPath}`)
      .then(res => res.json())
      .then((nodeTree: TSMorphSourceFileType[]) => {
        setLoading(false);
        treeState.nodeTree = nodeTree;
        setError(null!);
      })
      .catch(e => {
        treeState.nodeTree = undefined;
        setError(e);
      });
  }, [dirPath]);

  if (error) {
    return <>
      {JSON.stringify(error)}
    </>;
  }

  if (loading) {
    return <Skeleton variant="rectangular" sx={{ maxWidth: 360 }} />;
  }

  if (!nodeTree) return null;

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
    <List dense sx={{ maxWidth: 360 }}>
      <ListItems breadcrumbsPath={breadcrumbs.map(value => value.path)} />
    </List>
  </Stack>;
}