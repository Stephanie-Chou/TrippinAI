import { ReactElement } from "react";
import Page from "./Page";
import styles from "./day.module.css";
import { DayTrip, Photo } from "../utils/types";
import { DAY_TRIP_IDS } from "../utils/constants";

export default function DayTrips({ dayTrips, locationName, retry }): ReactElement {
  if (!dayTrips) return;
  return dayTrips.map((trip: DayTrip, index: number) => {
    const image: Photo = trip.image;
    let urls = !image ? { regular: '' } : image.urls;
    let user = !image ? { username: '', name: '' } : image.user;
    let username: string = !user ? '' : user.username
    return (
      <Page
        header={locationName}
        subheader="Day Trip"
        key={index}
        id={DAY_TRIP_IDS[index]}
      >
        <h3>{trip.name}</h3>
        <div>{trip.long_desc}</div>
        <table>
          <tbody>
            <tr>
              <th> Date and Location </th>
              <th> Description </th>
            </tr>
            <tr>
              <td>Morning Travel</td>
              <td>Travel to {trip.name}</td>
            </tr>
            <tr>
              <td>{trip.name}</td>
              <td>{trip.short_desc}</td>
            </tr>
            <tr>
              <td>Food: Look for {trip.food.name}</td>
              <td>{trip.food.desc}</td>
            </tr>
          </tbody>
        </table>

        <button className={styles.retryButton} onClick={() => retry(index)}>Regenerate</button>

        {urls ? <img className={styles.image} src={urls.regular} /> : null}
        <a
          className={styles.credit}
          target="_blank"
          href={`https://unsplash.com/@${username}?utm_source=TrippinAI&utm_medium=referral`}
        >
          {user ? user.name : ''}
        </a> on <a className={styles.credit} href="https://unsplash.com?utm_source=TrippinAI&utm_medium=referral">Unsplash</a>
      </Page>
    )
  })
}