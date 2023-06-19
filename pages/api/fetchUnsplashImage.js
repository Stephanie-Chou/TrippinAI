import { createApi } from "unsplash-js";
const configuration = {accessKey: process.env.UNSPLASH_ACCESS_KEY}
const api = createApi(configuration);

export default async function (req, res) {
  if (!configuration.accessKey) {
    res.status(500).json({
      error: {
        message: "Unsplash key not configured",
      }
    });
    return;
  }

  const locationName = req.body.locationName || '';
      const neighborhood = req.body.neighborhood || '';
      console.log('fetching image for ', locationName, neighborhood)

    try{
      const images = await api.search.getPhotos({
        query: locationName+ ' ' + neighborhood,
        orientation: "landscape",
        perPage: 5
      });
      res.status(200).json({images: images.response.results});
    }catch(error){
      console.log(error);
    }
}