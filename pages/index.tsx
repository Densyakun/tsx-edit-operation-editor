import FilePathInput from "@/tree/components/FilePathInput";
import { Stack } from "@mui/material";
import dynamic from "next/dynamic";
import Head from "next/head";

const NodeEditor = dynamic(() => import('@/tree/components/NodeEditor'), {
  ssr: false
});

export default function Home() {
  return (
    <>
      <Head>
        <title>TSX Edit Operation Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Stack spacing={1}>
          <FilePathInput />
          <NodeEditor />
        </Stack>
      </main>
    </>
  );
}
