import { Activity, DayTrip, Food, Meta, Neighborhood, Photo } from "./types"

export const mock_meta: Meta = {
  activities: ["activity 1", "activity 2", "activity 3", '', ''],
  neighborhoods: ["neighborhood 1", "neighborhood 2", "neighborhood 3", '', ''],
  dayTrips: ['trip 1', 'trip 2'],
  foods: ['food 1', 'food 2', 'food 3', '', ''],
}

const photo: Photo = {
  id: 1,
  width: 300,
  height: 150,
  urls: {
    large: 'https://images.unsplash.com/photo-1665236494140-db0fbf7309ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjM2MDh8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEFzYWt1c2F8ZW58MHwwfHx8MTY4NzQ3MjkwNnww&ixlib=rb-4.0.3&q=80&w=1080',
    regular: 'https://images.unsplash.com/photo-1665236494140-db0fbf7309ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjM2MDh8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEFzYWt1c2F8ZW58MHwwfHx8MTY4NzQ3MjkwNnww&ixlib=rb-4.0.3&q=80&w=1080',
    raw: '',
    small: ''
  },
  color: null,
  user: {
    username: "sample user",
    name: "joe bob"
  }
}

export const mock_neighborhoods: Array<Neighborhood> = [
  {
    name: 'Chūō',
    walking_tour: [
      { name: "Kabukiza Theater", desc: "Visit one of the oldest and most famous theaters in Tokyo for a vibrant performance of traditional Japanese kabuki theater." },
      { name: "Ginza Shopping District", desc: "Browse the high-end boutiques and department stores in this upscale shopping district, known for its luxury goods." },
      { name: "Marunouchi Naka-dori Street", desc: "Walk down this bustling street lined with trendy cafes, restaurants, and stores, including the iconic Tokyo Station." }
    ],
    image: photo
  },
  {
    name: 'Manhattan',
    walking_tour: [
      { name: "Flatiron Building", desc: "Admire the iconic triangular building, a National Historic Landmark and a symbol of New York City." },
      { name: "Madison Square Park", desc: "Relax in the park, surrounded by iconic skyscrapers, and enjoy the seasonal art installations." },
      { name: "Eataly Flatiron", desc: "Explore this Italian food emporium, offering delicious gourmet food, coffee, and pastries." }
    ],
    image: photo
  },
  {
    name: 'Manhattan',
    walking_tour: [
      { name: "Flatiron Building", desc: "Admire the iconic triangular building, a National Historic Landmark and a symbol of New York City." },
      { name: "Madison Square Park", desc: "Relax in the park, surrounded by iconic skyscrapers, and enjoy the seasonal art installations." },
      { name: "Eataly Flatiron", desc: "Explore this Italian food emporium, offering delicious gourmet food, coffee, and pastries." }
    ],
    image: photo
  },
  {
    name: 'Manhattan',
    walking_tour: [
      { name: "Flatiron Building", desc: "Admire the iconic triangular building, a National Historic Landmark and a symbol of New York City." },
      { name: "Madison Square Park", desc: "Relax in the park, surrounded by iconic skyscrapers, and enjoy the seasonal art installations." },
      { name: "Eataly Flatiron", desc: "Explore this Italian food emporium, offering delicious gourmet food, coffee, and pastries." }
    ],
    image: photo
  },
  {
    name: 'Manhattan',
    walking_tour: [
      { name: "Flatiron Building", desc: "Admire the iconic triangular building, a National Historic Landmark and a symbol of New York City." },
      { name: "Madison Square Park", desc: "Relax in the park, surrounded by iconic skyscrapers, and enjoy the seasonal art installations." },
      { name: "Eataly Flatiron", desc: "Explore this Italian food emporium, offering delicious gourmet food, coffee, and pastries." }
    ],
    image: photo
  }
]
export const mock_activities: Array<Activity> = [
  {
    name: 'Tsukiji Fish Market',
    short_desc: "The world's largest seafood market.",
    long_desc: "Tsukiji Fish Market is the world's largest seafood market and a top attraction in Tokyo. Explore the vast array of seafood from around the world, sample fresh sushi, and witness the famous tuna auctions that take place every morning."
  },
  {
    name: 'Rome thing',
    short_desc: "World-renowned art collection, including the Sistine Chapel.",
    long_desc: "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci."
  },
  {
    name: 'Another Rome Thing',
    short_desc: "World-renowned art collection, including the Sistine Chapel.",
    long_desc: "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci."
  },
  {
    name: 'Another Rome Thing',
    short_desc: "World-renowned art collection, including the Sistine Chapel.",
    long_desc: "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci."
  },
  {
    name: 'Another Rome Thing',
    short_desc: "World-renowned art collection, including the Sistine Chapel.",
    long_desc: "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci."
  }
]
export const mock_foods: Array<Food> = [
  {
    lunch: { name: "Ichiran Ramen", desc: "Treat yourself to a bowl of savory tonkotsu ramen, served with fresh ingredients and flavorful sauces." },
    dinner: { name: "Hinata", desc: "Savor traditional Japanese dishes, from sushi to skewered yakitori, in a warm and inviting atmosphere." }
  },
  {
    lunch: { name: "Pike Place Chowder", desc: "Indulge in delicious and hearty chowders featuring fresh local ingredients." },
    dinner: { name: "Matt's in the Market", desc: "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market." }
  },
  {
    lunch: { name: "Pike Place Chowder", desc: "Indulge in delicious and hearty chowders featuring fresh local ingredients." },
    dinner: { name: "Matt's in the Market", desc: "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market." }
  },
  {
    lunch: { name: "Pike Place Chowder", desc: "Indulge in delicious and hearty chowders featuring fresh local ingredients." },
    dinner: { name: "Matt's in the Market", desc: "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market." }
  },
  {
    lunch: { name: "Pike Place Chowder", desc: "Indulge in delicious and hearty chowders featuring fresh local ingredients." },
    dinner: { name: "Matt's in the Market", desc: "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market." }
  }
]
export const mock_dayTrips: Array<DayTrip> = [
  {
    name: 'Mt. Fuji',
    long_desc: 'Mt. Fuji is a symbol of Japan and an iconic sight in the country. Climb the mountain and experience breathtaking views of the surrounding landscape. Enjoy the unique atmosphere of the mountain and its remarkable views.',
    short_desc: "climb Japan's iconic mountain and enjoy stunning views of the surrounding landscape",
    food: { name: "Pike Place Chowder", desc: "Indulge in delicious and hearty chowders featuring fresh local ingredients." },
    image: photo
  },
  {
    name: 'Mt. Fuji',
    long_desc: 'Mt. Fuji is a symbol of Japan and an iconic sight in the country. Climb the mountain and experience breathtaking views of the surrounding landscape. Enjoy the unique atmosphere of the mountain and its remarkable views.',
    short_desc: "climb Japan's iconic mountain and enjoy stunning views of the surrounding landscape",
    food: { name: "Pike Place Chowder", desc: "Indulge in delicious and hearty chowders featuring fresh local ingredients." },
    image: photo
  }
];

export const mock_neighborhood_recs: string = `<h4>First Time Visitors</h4>
<b>Downtown / The Loop</b>
<br>
<div>Reason to stay</div>
<div>Central location with easy access to popular attractions like Millennium Park, Art Institute of Chicago, and Magnificent Mile.</div>
<br>    <div>Not suitable for</div>
<div>Travelers on a tight budget, as downtown accommodations can be relatively expensive.</div>
<br>
<b>River North</b>
<br>
<div>Reason to stay</div>
<div>Vibrant neighborhood known for its art galleries, trendy restaurants, and nightlife. Close to Magnificent Mile and Navy Pier.</div>
<br><div>Not suitable for</div>
<div>Those seeking a quiet residential experience or budget-friendly options.</div>
<br>
<h4>Feel like a Local</h4>
<b>Wicker Park</b>
<br>
<div>Reason to stay</div>
<div>Hip and eclectic neighborhood with independent boutiques, vintage shops, music venues, and a lively dining and bar scene.</div>
<br><div>Not suitable for</div>
<div>Travelers looking for a more touristy and central location.</div>
<br>
<b>Logan Square</b>
<br>
<div>Reason to stay</div>
<div>Trendy neighborhood with a thriving arts scene, unique shops, diverse dining options, and access to beautiful parks.</div>
<br><div>Not suitable for</div>
<div>Visitors seeking proximity to downtown attractions or a bustling nightlife.</div>
<br>
<h4>Budget Friendly</h4>
<b>Lakeview</b>
<br>
<div>Reason to stay</div>
<div>Affordable accommodation options, diverse dining choices, proximity to Lake Michigan, and access to Wrigley Field.</div>
<br><div>Not suitable for</div>
<div>Those looking for a central location or seeking a luxurious experience.</div>
<br>
<b>Pilsen</b>
<br>
<div>Reason to stay</div>
<div>A vibrant neighborhood with a rich Hispanic heritage, vibrant street art, affordable eateries, and cultural events.</div>
<br><div>Not suitable for</div>
<div>Travelers prioritizing proximity to downtown attractions or seeking upscale accommodations.</div>`;

export const mock_travelDay: string = `<h4>Getting to New York City</h4>
<ul>
  <li> Fly to one of the three major airports: John F. Kennedy International Airport (JFK), LaGuardia Airport (LGA), or Newark Liberty International Airport (EWR).</li>
  <li> Take a bus, train, or taxi from the airport to your destination.</li>
</ul>

<h4>Getting around</h4>
<ul>
  <li> Consider renting a car if you are traveling outside of Manhattan and need more flexibility.</li>
  <li> Make use of public transportation (NYC Subway and buses) for easy access to most of the city. </li>
  <li> Take advantage of private transportation services like Uber, Lyft, or Via. </li>
  <li> Investigate the possibility of renting a bike to explore the city.</li>
</ul>`;