import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { data, city } = req.body;

  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join('') : "";
  const uuid = 'trip-' + capitalizedCity + '-'

  //const uuid = 'example-seattle';
  // expire in a month
  const expire_at = Date.now() + 2592000000;

  // const json = client.json.set(uuid, '$', data)
  // client.expireat(uuid, expire_at)
  res.status(200).json(JSON.stringify({ expire_at, uuid }));
}