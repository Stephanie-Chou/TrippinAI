import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid, customAlphabet } from 'nanoid'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { data, city } = req.body;

  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join('') : "";

  const nanoid = customAlphabet('1234567890abcdefghijklmnopqrztuvwxyzABCDEFGHIJKLMNOPQRZTUVWXYZ', 10)
  const uuid = 'trip-' + capitalizedCity + '-' + nanoid(6);

  // expire in a month
  const expire_at = Date.now() + 2592000000;
  client.json.set(uuid, '$', data)
  client.expireat(uuid, expire_at)
  res.status(200).json(JSON.stringify({ expire_at, uuid }));
}