import { readFile, readdir } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

export type Dir = {
  path: string;
  data: string;
}[];

const recursiveReadDir = async (dirPath: string) => {
  const files: Dir = [];

  const allDirents = await readdir(dirPath, { withFileTypes: true });

  for (const dirent of allDirents) {
    const path = join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...(await recursiveReadDir(path)));
    } else if (dirent.isFile()) {
      files.push({
        path,
        data: (await readFile(path)).toString(),
      });
    }
  }

  return files;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dir | Error>,
) {
  try {
    const dirPath = req.query.dirPath;
    if (typeof dirPath !== "string") res.status(500).end();

    res.status(200).json(await recursiveReadDir(dirPath as string));
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json(e);
    } else {
      res.status(500).end();
    }
  };
}
