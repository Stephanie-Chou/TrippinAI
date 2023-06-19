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

/** array of activity objects
activity object:
neighborhood
{
  name:
  walking_tour:
}

food
{
  lunch
  dinner
}

activity
  {
    name:
    short_desc
    long_desc
    neighborhood
  }


the number of activities is going to equal the number of days. make an array. the indexes will correlate the day and the activity.
given the number of days, initialize 3 sets


1. activities
2. foods
3. neighborhoods

// given a location and parameters, generate a list of activities and their corresponding neighhorhoods.


// given a neighborhood, generate a walking tour

// given a neighborhood, generate the lunch and dinner opctions


*/ 


function generatePrompt(city, interests) {

  return `Given a neighborhood, recommend a lunch and dinner place to eat with description. Should return valid JSON.

  Neighborhood: Pike Place Market
  food: {
      "lunch": {"name": "Pike Place Chowder", "desc": "Indulge in delicious and hearty chowders featuring fresh local ingredients."},
      "dinner": {"name": "Matt's in the Market", "desc": "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market."}
  }
  Neighborhood: Fremont
  food: {
      "lunch": {"name": "Paseo Caribbean Food", "desc": "Savor mouthwatering Caribbean sandwiches filled with flavorful marinated meats and spices."},
      "dinner": {"name": "Revel", "desc": "Experience innovative Korean-inspired cuisine in a trendy setting."}
  }
  Neighborhood: Capitol Hill
  food: {
      "lunch": {"name": "Stateside", "desc": "Enjoy a fusion of French and Vietnamese flavors, with dishes like banh mi and crispy duck rolls."},
      "dinner": {"name": "Canon", "desc": "Delight in craft cocktails and an extensive whiskey selection at this award-winning bar and restaurant."}
  }
  Neighborhood: Ancient Rome
  food: {
      "lunch": { "name":  "Trattoria da Lucia", "desc":"Indulge in traditional Roman cuisine, including pasta, pizza, and classic Roman dishes."},
      "dinner": { "name":  "Osteria Barberini", "desc":"Experience authentic Roman flavors in a cozy and welcoming atmosphere."}
  }
  Neighborhood: ${city}
  food:
`;
}


// City: Rome
// interests: Adventure
// Blurb: Rome, a city of adventure, offers thrilling experiences like witnessing the fascinating remnants of early Christian and pagan burial practices in the catacombs, biking along the Appian Way, and discovering hidden gems in its vibrant neighborhoods. Embark on thrilling adventures by exploring ancient ruins, such as the Colosseum and Roman Forum, where you can imagine the epic battles that once took place. 
// City: Rome
// interests: History
// Blurb: Rome, the Eternal City, is a captivating blend of ancient wonders and modern vibrancy, where history comes alive at every turn. From the Colosseum to the Roman Forum, immerse yourself in the rich tapestry of Rome's iconic landmarks and archaeological treasures. The Romans built over 50,000 miles of roads, connecting their vast empire and facilitating trade, communication, and military movements. 
// City: Rome
// interests: Off the Beaten Path
// Blurb: Discover Rome's offbeat activities: explore street art in Ostiense, visit the non-Catholic Cemetery, or take a bike tour along the ancient Appian Way.
// City: Rome
// interests: food
// Blurb: Rome, a gastronomic paradise, tempts food lovers with its mouthwatering pizza, pasta, gelato, and world-class culinary scene. One interesting fact about Roman food is the use of "garum," a fermented fish sauce, as a popular condiment in ancient Roman cuisine. Garum was made by fermenting fish guts and salt and was used to enhance the flavors of various dishes
// City: Rome
// interests: general
// Blurb: 
// Rome, the Eternal City, home to the Colosseum and Vatican City, offers a blend of ancient wonders and religious treasures, captivating visitors with its 2,500-year-old history.
// City: ${city}
// interests: ${interests}
// Blurb: