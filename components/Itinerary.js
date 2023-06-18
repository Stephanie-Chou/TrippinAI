function renderWalkingTourShort(tour) {
    if (!tour) return null;

    return tour.map((step) => {
      return <li key={step.name}>{step.name}</li>
    });
}

export default function Itinerary({day}) {
    return (
        <table>
          <tbody>
            <tr>
                <th> Date and Location </th>
                <th> Description </th>
              </tr>
              <tr>
                <td>{day.site}</td>
                <td>{day.short_desc}</td>
              </tr>
              <tr>
                <td> <div>Lunch</div> {day.food.lunch.name}</td>
                <td>{day.food.lunch.desc}</td>
              </tr>
              <tr>
                <td>Walking tour of {day.neighborhood}</td>
                <td>
                  <ol>{renderWalkingTourShort(day.walking_tour)}</ol>
                </td>
              </tr>
              <tr>
                <td> <div>Dinner</div> {day.food.dinner.name}</td>
                <td>{day.food.dinner.desc}</td>
              </tr>
            </tbody>
          </table>
    )
}