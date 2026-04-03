import { useEffect, useState } from "react";
import { ALLOWED_MODES } from "./const";

const API_KEY = import.meta.env.VITE_API_KEY;



export default function StationInput({
  label,
  value,
  setValue,
  setSelectedStop,
  selectStop 
  }) {
    
  const [results, setResults] = useState([]);


  //Only fetch the list of stations if more than 3 characters have been typed
  useEffect(() => {
    if (value.length < 3){
      setResults([]);
      return;
    }

    fetch(`https://api.tfl.gov.uk/StopPoint/Search/${encodeURIComponent( value )}?app_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => setResults(data.matches || []));
  }, [value]);

  return (
    <>
      <h3>{label}</h3>

      <input
        className="station-input"
        value={value}
        onChange={e => {
          setValue(e.target.value);
          setSelectedStop(null);
        }}
      />

      <ul className="station-results">
        {results
          .filter(s => s.modes?.some(m => ALLOWED_MODES.includes(m)))
          .map(stop => (
            <li
              key={stop.id}
              className="station-item"
              onMouseDown={() => {
                selectStop(stop, setSelectedStop, setValue)
                setResults([]);
              }}
            >
              {stop.name}
            </li>
          ))}
      </ul>
    </>
  );
}
