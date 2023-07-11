import axios from "axios";

export default async function (req, res) {
  const { city, neighborhoods, activities, foods, dayTrips } = req.body;

  const html = generateHtml(city, neighborhoods, activities, foods, dayTrips);
  const config = {
    url: "https://api.docraptor.com/docs",
    method: "post",
    responseType: "arraybuffer", //IMPORTANT! Required to fetch the binary PDF
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      user_credentials: "YOUR_API_KEY_HERE", // this key works in test mode!
      doc: {
        test: true, // test documents are free but watermarked
        document_type: "pdf",
        document_content: html,
      }
    }
  };
  return axios(config)
    .then(function (response) {
      res.status(200).json({ result: response.data });
    })
    .catch(function (error) {
      // DocRaptor error messages are contained in the response body
      // Since the response is binary encoded, let's decode
      var decoder = new TextDecoder("utf-8");
      console.log(decoder.decode(error.response.data));
    });
};

function generateStyles() {
  return `
  <style type="text/css">
  /* setup the page */
  @page {
    size: US-Letter;
    margin: 0 3cm 0 3cm;
    background: #F9F5F0;
  }

  /* setup the footer */
  @page {
    @bottom {
      content: flow(footer);
    }
  }

  @page table, figure {
    page-break-inside: avoid;
  }

  @page section {
    page-break-after: always;
  }

  footer {
    flow: static(footer);
  }

  body {
    border-top: 10px solid #3877B1;
    font-family: "myriad-pro-1", "myriad-pro-2", sans-serif;
  }

  #container {
    margin: 0 auto;
  }

  header, #main {
    margin: 15mm;
  }

  header {
    margin-top: 5mm;
    border-bottom: 1px solid #7E7E7E;
    padding-bottom: 5mm;
  }


  .brand {
    font-weight: bold;
    font-size: 30px;
    color: #333;
    padding: 10px 0 2px;
    overflow: auto;
  }

  .brand span, .brand img {
    float: left;
  }

  .brand span {
    display: block;
    margin: 8px 0 0 5px;
  }

 

  /* main */
  .page {
    min-height: 100vh;
    max-height: fit-content;
    width: clamp(320px, 100vw, 600px);
    background-color: #F9F5F0;
    font-family: 'Space Grotesk', sans-serif;
  }

  .page .container {
    margin: 20px;
  }

  .page .header {
    padding-top: 20px;
  }

  .page .longDescription {
    text-align: justify;
    margin: 24px 0;
  }

  .activity_long_desc {
    margin-bottom: 18px;
  }

  .main h3 {
    font-size: 32px;
    line-height: 40px;
    font-weight: bold;
    color: #202123;
    margin: 16px 0 40px;
  }

  .tag {
    height: 40px;
    max-width: 50%;
    margin: 24px 0;
    background-color: #142639;
    color: #F9F5F0;
    padding: 4px;
  }

  .tag .tagHeader {
    font-size: 18px;
    text-transform: uppercase;
  }

  .tag .tagSubheader {
    font-size: 12px;
    text-transform: uppercase;
  }


  .container td, .container th {
    border: 1px solid #ddd;
    padding: 8px;
    font-size: 12px;
  }

  .container tr:nth-child(even){background-color: #f2f2f2;}

  .container tr:hover {background-color: #ddd;}

  .container th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
  }

  .image {
      width: 100%;
      max-height: 320px;
  }


  /* footer */
  footer {
    text-align: center;
  }

  footer p {
    background: #F3F3F3;
    color: #888;
    text-align: center;
    font-size: 8pt;
    line-height: 12pt;
    padding: 7mm 0;
    margin-top: 2mm;
  }

  .clearfix{ clear: both; }
</style>
</head>`
}

function getImg(image) {
  if (!image) return '';

  if (image.urls) {
    if (image.urls.regular) {
      return `<img class="image" src="${image.urls.regular}"/>`
    }
    return '';
  }
  return '';
}

function getWalkingTour(tour) {
  // error handling. if no walking tour exists then we need to provide something else
  return (tour && tour.length > 0) ? tour : [{ name: '', desc: '' }, { name: '', desc: '' }, { name: '', desc: '' }];
}

// generate a list of day trips from a city.
function generateHtml(city, neighborhoods, activities, foods, dayTrips) {

  const capitalizedCity = (!city || city.length === 0) ? '' : city[0].toUpperCase() + city.slice(1).toLowerCase();

  const htmlStart = `<html>${generateStyles()}<body><div class="main">`;
  const htmlEnd = `</div></body></html>`
  let dayItineraryHtml = activities.map((activity, index) => {
    let neighborhood = neighborhoods[index];
    let food = foods[index];
    let subheader = index + 1;
    const walking_tour = getWalkingTour(neighborhood.walking_tour);

    return `<section class="page"><div class="header"><div class="tag">` +
      `<div class="tagHeader">${capitalizedCity}</div>` +
      `<div class="tagSubheader">Day ${subheader}</div>` +
      `</div></div>` +
      `<div class="container">` +
      `<h3> ${neighborhood.name}</h3>` +
      `<div class="activity_long_desc">${activity.long_desc}</div>` +
      `<table>` +
      `<tbody>` +
      `<tr>` +
      `<th> Activity </th>` +
      `<th> Description </th>` +
      `</tr>` +
      `<tr>` +
      `<td>${activity.name}</td>` +
      `<td>${activity.short_desc}</td>` +
      `</tr>` +
      `<tr>` +
      `<td> <div>Lunch</div> ${food.lunch ? food.lunch.name : ''}</td>` +
      `<td>${food.lunch ? food.lunch.desc : ''}</td>` +
      `</tr>` +
      `<tr>` +
      `<td>What to Do in ${neighborhood.name}</td>` +
      `<td>` +
      `<ol>` +
      `<li>${walking_tour[0].name}</li>` +
      `<li>${walking_tour[1].name}</li>` +
      `<li>${walking_tour[2].name}</li>` +
      `</ol>` +
      `</td>` +
      `</tr>` +
      `<tr>` +
      `<td> <div>Dinner</div> ${food.dinner ? food.dinner.name : ''}</td>` +
      `<td> ${food.dinner ? food.dinner.desc : ''}</td>` +
      `</tr>` +
      `</tbody>` +
      `</table>` +
      `</div >` +
      `</section>`;
  });

  let walkingTourHtml = neighborhoods.map((neighborhood, index) => {
    let subheader = index + 1;
    const image = getImg(neighborhood.image);
    const walking_tour = getWalkingTour(neighborhood.walking_tour)

    return `<section class="page"><div class="header"><div class="tag">` +
      `<div class="tagHeader">${capitalizedCity}</div>` +
      `<div class="tagSubheader">Day ${subheader}</div>` +
      `</div></div>` +
      `<div class="container">` +
      `<h3> ${neighborhood.name} Walking Tour</h3>` +
      `<ol>` +
      `<li>${walking_tour[0].name} ${walking_tour[0].desc}</li>` +
      `<li>${walking_tour[1].name} ${walking_tour[1].desc}</li>` +
      `<li>${walking_tour[2].name} ${walking_tour[2].desc}</li>` +
      `</ol>` +
      `${image}` +
      `</div>` +
      `</section>`;
  })


  let dayTripHtml = dayTrips.map((trip) => {

    const image = getImg(trip.image);
    return `<section class="page"><div class="header"><div class="tag">` +
      `<div class="tagHeader">${capitalizedCity}</div>` +
      `<div class="tagSubheader">Day Trip</div>` +
      `</div></div>` +
      `<div class="container">` +
      `<h3>${trip.name}</h3>` +
      `<div>${trip.long_desc}</div>` +
      `<table>` +
      `<tbody>` +
      `<tr>` +
      `<th> Activity </th>` +
      `<th> Description </th>` +
      `</tr>` +
      `<tr>` +
      `<td>Morning Travel</td>` +
      `<td>Travel to ${trip.name}</td>` +
      `</tr>` +
      `<tr>` +
      `<td>${trip.name} </td>` +
      `<td>${trip.short_desc}</td>` +
      `</tr>` +
      `<tr>` +
      `<td>Eat at ${trip.food.name}  </td>` +
      `<td>${trip.food.desc}</td>` +
      `</tr>` +
      `</tbody>` +
      `</table>` +
      `${image}` +
      `</div>` +
      `</section>`;
  });

  let returnHTML = htmlStart
  for (let i = 0; i < neighborhoods.length; i++) {
    returnHTML += dayItineraryHtml[i] + walkingTourHtml[i]
  }
  returnHTML += dayTripHtml.join(' ')
  returnHTML += htmlEnd;
  return returnHTML;
}



{/* <html><body><div class="main">
        <section class="page">
          <div class="header">
            <div class="tag">
              <div class="tagHeader">${city}</div>
              <div class="tagSubheader">Day 1</div>
            </div>
          </div>
          <div class="container">
            <h3> Tsukuji Market</h3>
            <table>
              <tbody>
                <tr>
                  <th> Activity </th>
                  <th> Description </th>
                </tr>
                <tr>
                  <td>Tsukiji</td>
                  <td>World's largest fish market, with famous tuna auctions.</td>
                </tr>
                <tr>
                  <td> <div>Lunch</div> Sushi Dai</td>
                  <td>Tuck into some of the freshest sushi in Tokyo, made from sustainably sourced seafood.</td>
                </tr>
                <tr>
                  <td>What to Do in Tsukuji</td>
                  <td>
                    <ol>
                      <li>Tsukiji Outer Market</li>
                      <li>Tsukiji Honganji Temple</li>
                      <li>Tsukiji Fish Market</li>
                    </ol>
                  </td>
                </tr>
                <tr>
                  <td> <div>Dinner</div> Tsukiji Sushi Sei</td>
                  <td>Choose from an array of seasonal sushi and sashimi dishes from the vast selection of the Tsukiji market.</td>
                </tr>
              </tbody>
            </table>
            <h4>The Neighborhood</h4>
            <div>Tsukiji Fish Market is the world's largest fish market, offering an incredible variety of seafood from all over the world. Don't miss the famous tuna auctions, offering the freshest catches of the day.</div>
          </div >
        </section>

        <section class="page">
          <div class="header">
            <div class="tag">
              <div class="tagHeader">Tokyo</div>
              <div class="tagSubheader">Day 1</div>
            </div>
          </div>
          <div class="container">
            <h3> Tsukuji Walking Tour</h3>

            <ol>
              <li>Senso-ji Temple: Explore the oldest Buddhist temple in Tokyo, and browse the nearby Nakamise shopping street.</li>
              <li>Kaminarimon Gate: Admire the iconic red paper lantern, which marks the entrance to the temple grounds.</li>
              <li>Asakusa Shrine: Visit this Shinto shrine, located just outside the temple gates, and marvel at its intricate wooden architecture.</li>
            </ol>
            <img class="image" src="https://images.unsplash.com/photo-1665236494140-db0fbf7309ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NjM2MDh8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEFzYWt1c2F8ZW58MHwwfHx8MTY4NzQ3MjkwNnww&ixlib=rb-4.0.3&q=80&w=1080" />
          </div>
        </section>

        <section class="page">
          <div class="header">
            <div class="tag">
              <div class="tagHeader">Tokyo</div>
              <div class="tagSubheader">Day Trip</div>
            </div>
          </div>

          <div class="container">
            <h3>Mt. Fuji</h3>
            <div>Mt. Fuji is a symbol of Japan and an iconic sight in the country. Climb the mountain and experience breathtaking views of the surrounding landscape. Enjoy the unique atmosphere of the mountain and its remarkable views.</div>
            <table>
              <tbody>
                <tr>
                  <th> Activity </th>
                  <th> Description </th>
                </tr>
                <tr>
                  <td>Morning Travel</td>
                  <td>Travel to Mt. Fuji</td>
                </tr>
                <tr>
                  <td>Mt. Fuji </td>
                  <td>climb Japan's iconic mountain and enjoy stunning views of the surrounding landscape</td>
                </tr>
                <tr>
                  <td>Eat at Kawaguchiko Okonomiyaki  </td>
                  <td>This traditional Japanese dish is made with grated yam, scallions, shrimp, and pork, all cooked together on a hot griddle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
  </body>
</html> */}