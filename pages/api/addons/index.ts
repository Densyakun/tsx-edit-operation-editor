import { readFileSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export default function route(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      try {
        const json = JSON.parse(readFileSync('./addon.json', 'utf8'));

        res.status(200).json(Array.isArray(json) ? json : []);
      } catch (_) {
        res.status(200).json([]);
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
