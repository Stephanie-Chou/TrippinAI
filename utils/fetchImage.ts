import { Photo } from "./types";

export default async function fetchImage(site: string, index: number, city?: string): Promise<Photo> {
  try {
    const response = await fetch("/api/fetchUnsplashImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city, site })
    });


    const data = await response.json();
    if (response.status !== 200) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }

    return data.images[0]
  } catch (error) {
    // Consider implementing your own error handling logic here
    console.error(error);
  }
}