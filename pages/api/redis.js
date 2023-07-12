


import { Redis } from '@upstash/redis'


export default async function (req, res) {
  /** Check cache */
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const json = await client.json.get('example');

  res.status(200).json(json);
  return;
}