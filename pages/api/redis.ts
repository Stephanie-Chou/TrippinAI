import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { data, uuid } = req.body;

  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  client.json.set(uuid, '$', data)

  res.status(200);
}