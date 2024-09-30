import treeState from "@/tree/lib/state";
import { AddonJsonType } from "@/tree/tree-compiler/type";
import { Skeleton, Stack } from "@mui/material";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  return res.json();
};

const AppTab = dynamic(() => import('@/tree/components/AppTab'), {
  ssr: false
});

export default function Home() {
  const { data: addonsJson, error, isLoading } = useSWR<AddonJsonType[]>(`/api/addons`, fetcher);

  useEffect(() => {
    if (!addonsJson) return;

    treeState.addonsJson = addonsJson;
  }, [addonsJson]);

  if (error) return;
  if (isLoading) return <Skeleton variant="rectangular" sx={{ maxWidth: 360 }} />;

  return (
    <>
      <Head>
        <title>TSX Edit Operation Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Stack spacing={1}>
          <AppTab />
        </Stack>
      </main>
    </>
  );
}
