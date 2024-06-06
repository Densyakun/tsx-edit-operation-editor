import FilePathInput from "@/tree/components/FilePathInput";
import Tree from "@/tree/components/Tree";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>TSX Edit Operation Editor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <FilePathInput />
        <Tree />
      </main>
    </>
  );
}
