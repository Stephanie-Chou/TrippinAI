import { Configuration } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, OpenAIStreamPayload} from "./OpenAIStream";
import { getStreamResponse } from "../../utils/getStreamResponse";
import { DEFAULT_INTERESTS } from "../../utils/constants";
import isJsonString from "../../utils/isJsonString";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { reason } = req.body

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const prompt: string = generateCategorizationPrompt(reason);

  if (!prompt) {
    res.status(400).json({
      error: {
        message: "No prompt in the request"
      }
    });
  }

  const payload: OpenAIStreamPayload = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  let response = new Response(
    stream, {
      headers: new Headers({
        // 'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      })
    }
  );

  const data = response.body;
  if (!data) {
    console.log('no data')
    return;
  }

  return getStreamResponse(data).then((streamResponse: string) => {
  

    if (isJsonString(streamResponse)) {
      return res.status(200).json(JSON.stringify({result: streamResponse}));
    }
    return res.status(200).json({results: 'general'});
  });
}

function generateCategorizationPrompt(reason: string) {

    return `given a reason for travel, categorize it. The possible categories are ${DEFAULT_INTERESTS.join(' ')}
    
    reason: bachelorette party
    interests: party time

    reason: post graduation backpacking
    interests: adventure, party time, off the beaten path

    reason: vacation
    interests: history, culture, food

    reason: ${reason}
    interests:
  `;
}
