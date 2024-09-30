import { readFileSync, writeFileSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export default function route(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    switch (method) {
      case "GET": {
        try {
          const json = JSON.parse(readFileSync('./addon.json', 'utf8'));

          res.status(200).json(Array.isArray(json) ? json : []);
        } catch (_) {
          res.status(200).json([]);
        }

        break;
      }
      case "POST": {
        const json = JSON.parse(req.body);

        if (!Array.isArray(json) || json.find(addon =>
          typeof addon.name !== "string"
          || typeof addon.description !== "string"
          || typeof addon.author !== "string"
          || typeof addon.website !== "string"
          || typeof addon.compilerCode !== "string"
          || typeof addon.editorCode !== "string"
        )) {
          res.status(400).end();
          break;
        }

        writeFileSync('./addon.json', JSON.stringify(json, undefined, "  "));

        res.status(200).end();

        break;
      }
      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ statusCode: 500, message: err.message });
    } else {
      res.status(500).json({ statusCode: 500 });
    }
  }
}
