import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { useEffect, useState } from "react";
import { Breadcrumbs, IconButton, Link, List, Skeleton, Stack, Typography } from "@mui/material";
import { TSMorphSourceFileType } from "../code-compiler/ts-morph/compiler";
import { ListItems } from "../code-compiler/ts-morph/client/editor";
import HomeIcon from "@mui/icons-material/Home";

export default function Tree() {
  const { dirPath, breadcrumbs } = useSnapshot(treeState);

  const [tree, setTree] = useState<TSMorphSourceFileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tree/dir?dirPath=${dirPath}`)
      .then(res => res.json())
      .then((json: TSMorphSourceFileType[] | Error) => {
        setLoading(false);
        if (Array.isArray(json)) {
          setTree(json);
          setError(null!);
          console.log(json);
        } else {
          throw json;
        }
      })
      .catch(e => {
        setTree([]);
        setError(e);
      });
  }, [dirPath]);

  if (error) {
    return <>
      {JSON.stringify(error)}
    </>;
  }

  if (loading) {
    return <Skeleton variant="rectangular" />;
  }

  return <Stack spacing={1}>
    {0 < breadcrumbs.length && <Stack spacing={1} direction="row" alignItems="center">
      <IconButton onClick={() => treeState.breadcrumbs.splice(0)}>
        <HomeIcon />
      </IconButton>
      <Breadcrumbs separator=">" maxItems={2}>
        {breadcrumbs.map((value, index, array) =>
          index === array.length - 1
            ? <Typography color="text.primary">{value.label}</Typography>
            : <Link component="button" variant="body2" color="inherit" onClick={() => treeState.breadcrumbs.splice(index + 1)}>
              {value.label}
            </Link>
        )}
      </Breadcrumbs>
    </Stack>}
    <List dense>
      <ListItems tree={tree} breadcrumbsPath={breadcrumbs.map(value => value.path)} />
    </List>
  </Stack>;
}