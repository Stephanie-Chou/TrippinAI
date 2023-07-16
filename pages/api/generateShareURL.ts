import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid, customAlphabet } from 'nanoid'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { city } = req.body;
  console.log('generate share url for', city)
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join('') : "";

  const nanoid = customAlphabet('1234567890abcdefghijklmnopqrztuvwxyzABCDEFGHIJKLMNOPQRZTUVWXYZ', 10)
  const uuid = 'trip-' + capitalizedCity + '-' + nanoid(6);
  // const uuid = 'trip-Lisbon-zt0zFV';
  // const uuid = 'trip-Toulouse-eP2Zgw';

  // expire in a month
  const expire_at = Date.now() + 2592000000;
  await client.json.set(uuid, '$', '')
  await client.expireat(uuid, expire_at)

  res.status(200).json(JSON.stringify({ uuid }));
}