import { ReactElement } from "react";
import { WalkingTourStep } from "../utils/types";

function renderWalkingTourShort(tour: WalkingTourStep[]): ReactElement {
  if (!tour) return null;

  return (
    <ol>
      {tour.map((step: WalkingTourStep, index: number) => <li key={index}>{step.name}</li>)}
    </ol>
  );
}

export default function Itinerary({ activity, food, neighborhood }): ReactElement {
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
          <td> <div>Lunch</div> {food.lunch ? food.lunch.name : ""}</td>
          <td>{food.lunch ? food.lunch.desc : ""}</td>
        </tr>
        <tr>
          <td>Where to go in {neighborhood.name}</td>
          <td>
            {renderWalkingTourShort(neighborhood.walking_tour)}
          </td>
        </tr>
        <tr>
          <td> <div>Dinner</div> {food.dinner ? food.dinner.name : ""}</td>
          <td>{food.dinner ? food.dinner.desc : ""}</td>
        </tr>
      </tbody>
    </table>
  )
}