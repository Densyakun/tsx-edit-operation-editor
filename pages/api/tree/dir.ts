import { NextApiRequest, NextApiResponse } from "next";
import { loadDirectory, saveDirectory, TSMorphProjectType, TSMorphProjectTypeId } from "@/tree/code-compiler/ts-morph/compiler";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default function route(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projectPath = decodeURIComponent(req.query.dirPath as string);

    if (req.method === 'GET') {
      const json = loadDirectory(projectPath);

      res.status(200).json(json);
    } else if (req.method === 'POST') {
      const projectJson = req.body?.project as TSMorphProjectType;
      if (projectJson.type !== TSMorphProjectTypeId) return res.status(400).end();

      saveDirectory(projectPath, projectJson);

      res.status(200).end();
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ statusCode: 500, message: err.message });
    } else {
      res.status(500).json({ statusCode: 500 });
    }
  }
}
