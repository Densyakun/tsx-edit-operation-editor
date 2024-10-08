import { NextApiRequest, NextApiResponse } from "next";
import { loadDirectory } from "@/tree/code-compiler/ts-morph/compiler";

export default function route(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const projectPath = req.query.dirPath as string;

      const json = loadDirectory(projectPath);

      res.status(200).json(json);
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ statusCode: 500, message: err.message });
    } else {
      res.status(500).json({ statusCode: 500 });
    }
  }
}
