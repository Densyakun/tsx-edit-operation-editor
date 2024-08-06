import { NextApiRequest, NextApiResponse } from "next";
import { loadDirectory, TSMorphProjectType } from "@/tree/code-compiler/ts-morph/compiler";

export default function route(req: NextApiRequest, res: NextApiResponse<TSMorphProjectType | string>) {
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
