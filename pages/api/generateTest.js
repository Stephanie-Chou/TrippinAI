import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }
  

  const input = req.body.input || '';
  const interests = req.body.interests || 'General';
  const tripLength = req.body.tripLength || 3;

  console.log(tripLength, " days long..." )

  if (input.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid input",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(input, interests, tripLength),
      temperature: 0.6,
      max_tokens: 200
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(city, interests, tripLength) {
  return `I am a tourist visiting a location. I want a list of ${tripLength} activities to do in that location that are relevant to my interests. My interests are ${interests}. each activity should include the neighborhood where it is located. Return valid JSON containing the activities and the neighborhoods
  City: Seattle
  tripLength: 3
  interests: History
  return: {
    "activities": ["Underground Tour", "Museum of History & Industry (MOHAI)", "Klondike Gold Rush National Historical Park"],
    "neighborhoods": ["Pioneer Square", "South Lake Union (SLU)", "Downtown Seattle"]
  }

  City: Seattle
  interests: Off the Beaten Path
  tripLength: 2
  return: {
    "activities": ["Georgetown Art Attack", "Fremont Sunday Market"],
    "neighborhoods": ["Georgetown", "Fremont"]
  }

  City: Seattle
  interests: food
  tripLength: 4
  return: {
    "activities": ["Pike Place Market", "Food tour on Capitol Hill", "Ballard Farmers Market", "Fremont Brewery Tour"],
    "neighborhoods": ["Pike Place Market", "Capitol Hill", "Ballard", "Fremont"]
  }

  City: Seattle
  interests: culture
  tripLength: 3
  return: {
    "activities": ["Seattle Art Museum (SAM)", "Chihuly Garden and Glass", "Wing Luke Museum of the Asian Pacific American Experience"],
    "neighborhoods": ["Downtown Seattle", "Seattle Center", "Industrial District"]
  }

  City: Seattle
  interests: general
  tripLength: 5
  return: {
    "activities": ["Pike Place Market", "Underground Tour", "Chihuly Garden and Glass", "Seattle Art Museum (SAM)", "Golden Gardens Park"],
    "neighborhoods": ["Pike Place Market", "Pioneer Square", "Seattle Center", "Downtown Seattle", "Ballard"]
  }

  City: ${city}
  interests: ${interests}
  return:

`;
}