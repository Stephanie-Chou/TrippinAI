import { ReactElement } from "react";
import Page from "./Page";
import styles from "./day.module.css";
import { DayTrip } from "../utils/types";

export default function DayTrips({dayTrips, locationName, retry}) : ReactElement{
    if (!dayTrips) return;

    return dayTrips.map((trip: DayTrip, index: number) => {
      return (
        <Page
          header={locationName}
          subheader="Day Trip"
          key={index}
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
        </Page>     
      )
    })
}