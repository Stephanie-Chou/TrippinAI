import Page from "./Page";

export default function DayTrips({dayTrips, locationName}) {
    if (!dayTrips) return;

    return dayTrips.map((trip, index) => {
      return (
        <Page
          header={locationName}
          subheader="Day Trip"
          id={index}
        >
          <h1>{trip.name}</h1>
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
                  <td>Eat at {trip.food.name}</td>
                  <td>{trip.food.desc}</td>
                </tr>
              </tbody>
            </table>
        </Page>     
      )
    })
}