import { ReactElement } from "react";
import SplashPage from "./SplashPage";

export default function TripsSplash(): ReactElement {
  return (
    <SplashPage>
      <h4>Trips</h4>
      <p>Are you looking for the trip you shared? Check your emails for the link.</p>
      <p>Want to create a new trip? Get inspired, <a href="/">Get Trippin</a>.</p>
    </SplashPage>
  )
}