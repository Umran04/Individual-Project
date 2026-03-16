import { LINE_COLOURS, OVERGROUND_LINES, ZONE_1_STATIONS } from "./const";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // mention use of FONTAWSOME in report
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons/faLongArrowAltRight";

function isZone1Station(name) {
  return ZONE_1_STATIONS.some(z => name.includes(z));
}

function isOvergroundVariant(lineId){
  return OVERGROUND_LINES.includes(lineId)
}

export default  function LegDisplay({ leg }) {
    const stations = leg.path?.stopPoints || [];
    const lineId =
      leg.routeOptions?.[0]?.lineIdentifier?.id ||
      leg.line?.id ||
      leg.mode?.id;
    const lineColour = LINE_COLOURS[lineId];

    return (
      <div className="leg-container" style={{ borderLeft: `6px solid ${lineColour}` }}>
        <strong className="leg-title" style={{ color: lineColour }}>
          {leg.routeOptions?.[0]?.lineIdentifier?.name ||
            leg.line?.name ||
            leg.mode?.name} {isOvergroundVariant(lineId) && " — OVERGROUND"}
        </strong>
        <p className="leg-route">
          {leg.departurePoint.commonName} <FontAwesomeIcon icon={faLongArrowAltRight} /> {" "} {leg.arrivalPoint.commonName}
        </p>
        {stations.length > 0 && (
          <ul className="station-list">
            {stations.map((s, i) => (
              <li key={i} className="station-list-item" style={{ color: lineColour }}>
                {s.name} 
                {isZone1Station(s.name) && <span className="zone-one"> ZONE 1 </span> } 
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }