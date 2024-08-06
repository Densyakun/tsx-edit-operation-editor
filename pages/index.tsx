import FilePathInput from "@/tree/components/FilePathInput";
import NodeEditor from "@/tree/components/NodeEditor";
import { Stack } from "@mui/material";
import Head from "next/head";

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
