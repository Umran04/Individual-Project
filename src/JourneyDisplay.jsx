import { ALLOWED_MODES } from "./const";
import LegDisplay from "./LegDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // mention use of FONTAWSOME in report
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";


//Subtle change of text depending on the duration of the journey
function formatHour(hours){
  if (hours == 1){
    return 'hour';
  }else if (hours > 1){
    return 'hours';
  }else{
    return '';
  }
}


//Display in HH:MM format, incoperating formatHour function
function formatDuration(minutes){
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return ` ${h > 0 ? h : ''} ${formatHour(h)} ${h > 0 ? 'and' : ''} ${m} minutes `;
}

//Display fare up to 2 decimal points
function formatFare(fare){
  if (!fare) return 'Error calculating fare';

  return `£${(fare/100).toFixed(2)}`;
}


export default function JourneyDisplay({ journey, index, lineStatus }) {

  //ALLOWED_MODES is where it gets the filters from - so tube, DLR, Elizabeth and Overground should be the only modes of transport dispalyed
  const filteredLegs = journey.legs.filter(
    leg => ALLOWED_MODES.includes(leg.mode?.id)
  );

  return (
    <div className="journey-card">
      <h3>Journey {index + 1}</h3>


      
        <p className="journey-info">
          <FontAwesomeIcon icon={faClock} /> 
          {"      "}
          {formatDuration(journey.duration)}
          {"     |     "}
          {formatFare(journey.fare?.totalCost)}
        </p>
        

    
      

      {filteredLegs.map((leg, j) => (
        <div key={j}>
          <LegDisplay leg={leg} lineStatus={lineStatus} />

          {j < filteredLegs.length - 1 && (
            <div className="interchange">
              Change at {leg.arrivalPoint.commonName}
              <FontAwesomeIcon icon={faArrowRight} /> {" "}
              {/* Fallback options for name of station to change to */}
              {filteredLegs[j + 1].routeOptions?.[0]?.lineIdentifier?.name || filteredLegs[j + 1].line?.name || filteredLegs[j + 1].mode?.name} {/* -> Used AI to generate this line of code */}
            </div>
          )}
        </div>
      ))}
      

      
    </div>
  );
}
