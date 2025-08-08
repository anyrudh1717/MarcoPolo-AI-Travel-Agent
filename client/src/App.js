import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ItineraryForm from './components/itineraryform';
import WelcomePage from './components/WelcomePage';
import MapPage from './components/MapPage';
import './App.css';

function AppWrapper() {
  const location = useLocation();
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itinerary, setItinerary] = useState('');

  // Sync state with router location state if coming from /map
  useEffect(() => {
    if (location.state?.source) {
      setStartLocation(location.state.source);
    }
    if (location.state?.destination) {
      setDestination(location.state.destination);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_location: startLocation,
          destination,
          start_date: startDate,
          end_date: endDate
        }),
      });

      const data = await res.json();
      setItinerary(data.plan || 'No plan returned.');
    } catch (error) {
      console.error('Fetch failed:', error);
      setItinerary('An error occurred while fetching the itinerary.');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route
        path="/planner"
        element={
          <ItineraryForm
            startLocation={startLocation}
            setStartLocation={setStartLocation}
            destination={destination}
            setDestination={setDestination}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            handleSubmit={handleSubmit}
            itinerary={itinerary}
          />
        }
      />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}

// Wrap in <Router>
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
