import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {

  return;
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
      prompt: generatePrompt(input, interests),
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

function generatePrompt(city, interests) {

  return `I am a tourist visiting a location. I want to learn something about the location that matches my interests. My interests are ${interests}. provide a paragraph ofr 50-60 words describing the location.

City: Rome
interests: Adventure
Blurb: Rome, a city of adventure, offers thrilling experiences like witnessing the fascinating remnants of early Christian and pagan burial practices in the catacombs, biking along the Appian Way, and discovering hidden gems in its vibrant neighborhoods. Embark on thrilling adventures by exploring ancient ruins, such as the Colosseum and Roman Forum, where you can imagine the epic battles that once took place. 
City: Rome
interests: History
Blurb: Rome, the Eternal City, is a captivating blend of ancient wonders and modern vibrancy, where history comes alive at every turn. From the Colosseum to the Roman Forum, immerse yourself in the rich tapestry of Rome's iconic landmarks and archaeological treasures. The Romans built over 50,000 miles of roads, connecting their vast empire and facilitating trade, communication, and military movements. 
City: Rome
interests: Off the Beaten Path
Blurb: Discover Rome's offbeat activities: explore street art in Ostiense, visit the non-Catholic Cemetery, or take a bike tour along the ancient Appian Way.
City: Rome
interests: food
Blurb: Rome, a gastronomic paradise, tempts food lovers with its mouthwatering pizza, pasta, gelato, and world-class culinary scene. One interesting fact about Roman food is the use of "garum," a fermented fish sauce, as a popular condiment in ancient Roman cuisine. Garum was made by fermenting fish guts and salt and was used to enhance the flavors of various dishes
City: Rome
interests: general
Blurb: 
Rome, the Eternal City, home to the Colosseum and Vatican City, offers a blend of ancient wonders and religious treasures, captivating visitors with its 2,500-year-old history.
City: ${city}
interests: ${interests}
Blurb:

`;
}
