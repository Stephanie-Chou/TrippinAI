function renderWalkingTourShort(tour) {
    if (!tour) return null;

    return tour.map((step) => {
      return <li key={step.name}>{step.name}</li>
    });
}

export default function Itinerary({activity, food, neighborhood}) {
    return (
        <table>
          <tbody>
            <tr>
                <th> Activity </th>
                <th> Description </th>
              </tr>
              <tr>
                <td>{activity.name}</td>
                <td>{activity.short_desc}</td>
              </tr>
              <tr>
                <td> <div>Lunch</div> {food.lunch ? food.lunch.name : "" }</td>
                <td>{food.lunch.desc}</td>
              </tr>
              <tr>
                <td>Walking tour of {neighborhood.name}</td>
                <td>
                  <ol>{renderWalkingTourShort(neighborhood.walking_tour)}</ol>
                </td>
              </tr>
              <tr>
                <td> <div>Dinner</div> {food.dinner ? food.dinner.name : ""}</td>
                <td>{food.dinner.desc}</td>
              </tr>
            </tbody>
          </table>
    )
}