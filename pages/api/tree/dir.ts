import { NextApiRequest, NextApiResponse } from "next";
import { TSMorphSourceFileType, getFromSourceFile } from "@/tree/code-compiler/ts-morph/compiler";
import { Project } from "ts-morph";
import path from "path";

function loadDirectory(projectPath: string) {
  const project = new Project({
    tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
  });

  const sourceFiles = project.getSourceFiles();

  return sourceFiles.map(sourceFile => getFromSourceFile(path.resolve(process.cwd(), projectPath), sourceFile));
}

export default function route(req: NextApiRequest, res: NextApiResponse<TSMorphSourceFileType[] | string>) {
  try {
    if (req.method === 'GET') {
      const projectPath = req.query.dirPath as string;

      const json = loadDirectory(projectPath);

      res.status(200).json(json);
    }
  } catch (err) {
    res.status(400);

    if (err instanceof Error)
      return res.send(err.message);
    else if (typeof err === 'string')
      return res.send(err);

    console.error(err);
    return res.end();
  }
}
