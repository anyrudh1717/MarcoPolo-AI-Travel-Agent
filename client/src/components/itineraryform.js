import React, { useState, useEffect } from 'react';
import './itineraryform.css';
import '../App.css';

const ItineraryForm = ({
  startLocation,
  setStartLocation,
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSubmit,
  itinerary
}) => {
  const [loading, setLoading] = useState(false);
  const [localItinerary, setLocalItinerary] = useState('');
  const [typedLines, setTypedLines] = useState([]);
  const [tripHeading, setTripHeading] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTypedLines([]);
    setTripHeading(`${startLocation} ➡️ ${destination}`);

    try {
      const res = await fetch('http://localhost:5000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_location: startLocation,
          destination,
          start_date: startDate,
          end_date: endDate
        })
      });

      const data = await res.json();
      const fullText = data.plan || 'No plan returned.';
      setLocalItinerary(fullText);
    } catch (error) {
      console.error('Fetch failed:', error);
      setLocalItinerary('An error occurred while fetching the itinerary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && localItinerary) {
      const lines = localItinerary.split('\n');
      let currentLine = 0;
      let currentChar = 0;
      let newLines = [];

      const interval = setInterval(() => {
        if (currentLine < lines.length) {
          const line = lines[currentLine];
          const partial = line.slice(0, currentChar + 1);
          newLines[currentLine] = partial;
          setTypedLines([...newLines]);

          currentChar++;
          if (currentChar >= line.length) {
            currentChar = 0;
            currentLine++;
          }
        } else {
          clearInterval(interval);
        }
      }, 5);

      return () => clearInterval(interval);
    }
  }, [localItinerary, loading]);

  return (
    <div className="App">
      <div className="header-bar">
        <h1>M A R C O     P O L O</h1> 
      </div>

      <div className="layout">
        <div className="sidebar">
          <form onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Start Location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <button type="submit">Plan Trip</button>
          </form>
        </div>

        <div className="main-content">
          {loading && (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          )}

          {!loading && typedLines.length > 0 && (
            <div className="output-box">
              <h2>{tripHeading}</h2>
              <pre className="formatted-text">
                {typedLines.map((line, idx) => {
                  const formattedLine = (() => {
                    const dayMatch = line.match(/^Day\s+\d+(.*?)?:/i);
                    if (dayMatch) {
                      const dayText = dayMatch[0];
                      const rest = line.slice(dayText.length);
                      return (
                        <>
                          <span style={{ fontWeight: 'bold', fontSize: '1.5em' }}>{dayText}</span>
                          <span>{rest}</span>
                        </>
                      );
                    }

                    return line.split(/(\*\*.*?\*\*)|(\*.*)/g).map((part, i) => {
                      if (!part) return null;

                      if (/^\*\*(.*?)\*\*$/.test(part)) {
                        const inner = part.replace(/\*\*/g, '');
                        return (
                          <span key={i} style={{ fontWeight: 'bold', fontSize: '1.5em' }}>
                            {inner}
                          </span>
                        );
                      } else if (/^\*.*/.test(part)) {
                        const bullet = part.replace(/^\*\s*/, '• ');
                        return <span key={i}>{bullet}</span>;
                      } else {
                        return <span key={i}>{part}</span>;
                      }
                    });
                  })();
                  return <div key={idx}>{formattedLine}</div>;
                })}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryForm;
