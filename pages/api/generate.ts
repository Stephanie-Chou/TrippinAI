import { ChatCompletionFunctions, ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// export const config = {
//   runtime: "edge",
// };

let messages: ChatCompletionRequestMessage[] = [
  {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: `You are a helpful assistant for a user who is planning at trip. Your goal is to classify their interests based on why they are going on the trip. Example classifications include:
    Adventure
    Nature
    History and Culture
    Food
    Relaxation
    Arts and Entertainment
    Shopping
    Wellness
    Family Fun
    Sports and Recreation
    Sightseeing
    
    Do NOT assume what a user is interested in. If you are given a new destination, always ask why they are going. Ask the user to confirm if these classifications are correct. If they are correct, get recommendations.
    `
  }]

let functions: ChatCompletionFunctions[] = [{
  name: 'get_recommendations',
  description: 'gets recommendations for a destination based on interests',
  parameters: {
    type: "object",
    properties: {
      destination: { type: "string" },
      interests: { types: "string", description: "a list of the interests that you derived from what the user told you about their reason for going on the trip" },
    },
    required: ["destination", "interests"]
  }
}]

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { input, message } = req.body;


  if (input) { messages.push({ role: ChatCompletionRequestMessageRoleEnum.User, "content": input }) }
  if (message) { messages.push(message) };

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    functions,
    temperature: .8
  });
  console.log(completion.data.choices[0].message);

  res.status(200).json({ result: completion.data.choices[0] })
};

// generate a list of activities in a city
function generatePrompt(city: string, interests: string, tripLength: number): string {
  return `Given a trip destination, trip length and your interests, recommend a list of concise activities or attractions during your visit. Provide a corresponding list of locations (neighborhood) where the activity can be done. Both lists should be limited to ${tripLength} items.
  
  
  Destination: [Insert destination here]
  Interests: [Describe what you want to do, see, or experience]
  Trip Length: [How many days are you going]
 
  return: {
    "activities": ["Suggested activity or attraction 1", "Suggested activity or attraction 2", "Suggested activity or attraction 3", ... "Suggested activity or attraction ${tripLength}"],
    "locations": ["Location 1", "Location 2", "Location 3", ... "Location ${tripLength}"]

  }
    
  
  Destination: ${city}
  Interests: ${interests}
  Trip Length: ${tripLength}
  return:
  `;
}


