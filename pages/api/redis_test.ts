import { Redis } from '@upstash/redis'
import { mock_cache_input, mock_full_page_cache_response } from '../../utils/stubData'

export default async function (req, res) {
  /** Check cache */
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const json = await client.json.get('example_none');

  // const json = client.json.set('example', '$', JSON.stringify(mock_full_page_cache_response))

  res.status(200).json(json);
  return;
}