import { useSnapshot } from "valtio";
import treeState from "../lib/state";
import { useEffect, useState } from "react";
import { Paper, Skeleton, Stack, Tooltip } from "@mui/material";
import { Dir } from "@/pages/api/tree/dir";

export default function Tree() {
  const snap = useSnapshot(treeState);

  const [tree, setTree] = useState<Dir>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tree/dir?dirPath=${snap.dirPath}`)
      .then(res => res.json())
      .then((tree: Dir | Error) => {
        if (Array.isArray(tree)) {
          setTree(tree);
          setError(null!);
        } else {
          setTree([]);
          setError(tree);
        }
        setLoading(false);
      })
      .catch(e => console.error(e));
  }, [snap.dirPath]);

  if (error) {
    return <>
      {JSON.stringify(error)}
    </>;
  }

  if (loading) {
    return <Skeleton variant="rectangular" />;
  }

  return <Stack spacing={1}>
    {tree.map(file => (
      <Tooltip title={file.data}>
        <Paper sx={{ p: 1 }}>
          {file.path}
        </Paper>
      </Tooltip>
    ))}
  </Stack>;
}