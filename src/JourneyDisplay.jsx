import { ALLOWED_MODES } from "./const";
import LegDisplay from "./LegDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // mention use of FONTAWSOME in report
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";


function formatHour(hours){
  if (hours == 1){
    return 'hour'
  }else if (hours > 1){
    return 'hours'
  }else{
    return ''
  }
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return ` ${h > 0 ? h : ''} ${formatHour(h)} ${h > 0 ? 'and' : ''} ${m} minutes `;
}

export default function JourneyDisplay({ journey, index, lineStatus }) {

  const filteredLegs = journey.legs.filter(
    leg => ALLOWED_MODES.includes(leg.mode?.id)
  );

  return (
    <div className="journey-card">
      <h3>Journey {index + 1}</h3>

      <p className="journey-duration">
        <FontAwesomeIcon icon={faClock} />{" "} {formatDuration(journey.duration)}
      </p>

      {filteredLegs.map((leg, j) => (
        <div key={j}>
          <LegDisplay leg={leg} lineStatus={lineStatus} />

          {j < filteredLegs.length - 1 && (
            <div className="interchange">
              Change at {leg.arrivalPoint.commonName} <FontAwesomeIcon icon={faArrowRight} /> {" "}
              {filteredLegs[j + 1].routeOptions?.[0]?.lineIdentifier?.name ||
               filteredLegs[j + 1].line?.name ||
               filteredLegs[j + 1].mode?.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
