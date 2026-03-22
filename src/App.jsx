import { useState } from "react";
import { ALLOWED_MODES } from "./const";
import StationInput from "./StationInput";
import JourneyDisplay from "./JourneyDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faArrowsSpin } from "@fortawesome/free-solid-svg-icons/faArrowsSpin";

const API_KEY = import.meta.env.VITE_API_KEY;

function removeDuplicates(journeys) {
  const seen = new Set();
  
  return journeys.filter(journey => {
    
    const lines = journey.legs
      .filter(leg => ALLOWED_MODES.includes(leg.mode?.id))
      .map(leg => leg.routeOptions?.[0]?.lineIdentifier?.id || leg.line?.id || leg.mode?.id)
      .join('-');
   
    if (seen.has(lines)) {
      return false; 
    }
    
    seen.add(lines);
    return true; 
  });
}



export default function App() {
  // All the states
  const [startStation, setStartStation] = useState("");
  const [startStop, setStartStop] = useState(null);

  const [endStation, setEndStation] = useState("");
  const [endStop, setEndStop] = useState(null);

  const [viaStation, setViaStation] = useState("");
  const [viaStop, setViaStop] = useState(null);

  const [journeys, setJourneys] = useState([]);
  const [journeyError, setJourneyError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* Helper function -> Resolves station HUBS to actual station IDs
     - If station ID starts with "HUB" then fetch the first valid child station
     - Otherwise use the station as it is */

  async function selectStop(stop, setStopState, setInputState) {
    // Fetch children if HUB station is found
    if (stop.id.startsWith("HUB")) {
      try {
        const res = await fetch(
          `https://api.tfl.gov.uk/StopPoint/${stop.id}?app_key=${API_KEY}`
        );
        const hubData = await res.json();

        // Pick first child that matches allowed modes
        const validChild = hubData.children?.find(child =>
          child.modes?.some(m => ALLOWED_MODES.includes(m))
        );

        if (validChild) {
          setStopState(validChild);
          setInputState(validChild.commonName || validChild.name);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch hub children", err);
      }
    }

    // Use normal station if id is found
    setStopState(stop);
    setInputState(stop.name || stop.commonName);
  }

  /* HANDLE SUBMIT */
  function handleSubmit(e) {
    e.preventDefault();
    setJourneys([]);
    setJourneyError("");
    setIsLoading(true);

    if (!startStop || !endStop) {
      setJourneyError("Please input both start and end stations");
      setIsLoading(false);
      return;
    }

    const url =
      `https://api.tfl.gov.uk/Journey/JourneyResults/${startStop.id}/to/${endStop.id}` +
      `?mode=tube,dlr,overground,elizabeth-line` +
      (viaStop ? `&via=${encodeURIComponent(viaStop.id)}` : ``) +
      `&fromName=${encodeURIComponent(startStop.commonName)}` +
      `&toName=${encodeURIComponent(endStop.commonName)}` +
      (viaStop ? `&viaName=${encodeURIComponent(viaStop.commonName)}` : ``) +
      `&includeAlternativeRoutes=true` +
      `&app_key=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.journeys) {
          setJourneyError("No journeys returned");
          return;
        }
        const uniqueJourneys = removeDuplicates(data.journeys)


        setJourneys(uniqueJourneys)
      })
      .catch(() => setJourneyError("Failed to fetch journeys"))
      .finally(() => setIsLoading(false));
  }

  /* CLEAR FUNCTION */
  function clear() {
    setStartStation("");
    setStartStop(null);
    setEndStation("");
    setEndStop(null);
    setViaStation("");
    setViaStop(null);
    setJourneys([]);
    setJourneyError("");
    setIsLoading(false);
  }

  /* JOURNEY DURATION SORT FUNCTION */
  function sortByTime() {
    const sorted = [...journeys].sort((a, b) => a.duration - b.duration);
    setJourneys(sorted);
  }

  /* SORT JOURNEY BY NUMBER OF CHANGES  */
   function sortByChanges() {
    const sorted = [...journeys].sort((a, b) => {
      const x = a.legs.filter(leg => ALLOWED_MODES.includes(leg.mode?.id)).length - 1;
      const y = b.legs.filter(leg => ALLOWED_MODES.includes(leg.mode?.id)).length - 1;
      return x - y; });
    setJourneys(sorted);
  }

  /* DISPLAY */
  return (
    <div className="app-container">
      <h1>London Journey Visualiser</h1>

      <form onSubmit={handleSubmit}>
        <StationInput
          label="Start station"
          value={startStation}
          setValue={setStartStation}
          selectedStop={startStop}
          setSelectedStop={setStartStop}
          selectStop={selectStop}
        />

        <StationInput
          label="End station"
          value={endStation}
          setValue={setEndStation}
          selectedStop={endStop}
          setSelectedStop={setEndStop}
          selectStop={selectStop}
        />

        <StationInput
          label="Via station (optional)"
          value={viaStation}
          setValue={setViaStation}
          selectedStop={viaStop}
          setSelectedStop={setViaStop}
          selectStop={selectStop}
        />

        <button className="submit-button" type="submit" disabled={isLoading}>
          {isLoading ? "Loading…" : "Find journeys"}
        </button>

        <button className="clear-button" onClick={clear}>
          CLEAR
        </button>
      </form>

      

      {journeys.length > 0 && (
        <>
          <button className="sort-time-button" onClick={sortByTime}>
            Sort by Time <FontAwesomeIcon icon={faClock} />
          </button>

          <button className="sort-change-button" onClick={sortByChanges}>
              Sort by Changes <FontAwesomeIcon icon={faArrowsSpin} />
          </button>
        </>
      )}

      {journeyError && <p className="error-message">{journeyError}</p>}
      {isLoading && <p className="loading-message">Loading journeys…</p>}

      {journeys.map((journey, i) => (
        <JourneyDisplay key={i} journey={journey} index={i} />
      ))}
    </div>
  );
}