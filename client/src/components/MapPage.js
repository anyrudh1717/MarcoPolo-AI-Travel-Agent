import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Popup
} from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MAPTILER_KEY = 'api';
const DEFAULT_COORDS = [12.9716, 77.5946]; // Bengaluru

function RecenterMap({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], 12);
  return null;
}

function ClickHandler({ setMarker, activeField, setInputs }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      try {
        const res = await axios.get(`https://api.maptiler.com/geocoding/${lng},${lat}.json`, {
          params: { key: MAPTILER_KEY },
        });
        const placeName = res.data.features[0]?.place_name || 'Selected location';
        setMarker(prev => ({
          ...prev,
          [activeField]: { coords: [lat, lng], label: placeName }
        }));
        setInputs(prev => ({
          ...prev,
          [activeField]: placeName
        }));
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    }
  });
  return null;
}

const MapPage = () => {
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState('source');
  const [inputs, setInputs] = useState({ source: '', destination: '' });
  const [markers, setMarkers] = useState({
    source: { coords: DEFAULT_COORDS, label: 'Bengaluru' },
    destination: null
  });

  const handleInputChange = (field) => (e) => {
    setInputs({ ...inputs, [field]: e.target.value });
  };

  const handleSearch = (field) => async (e) => {
    e.preventDefault();
    const query = inputs[field];
    try {
      const res = await axios.get(`https://api.maptiler.com/geocoding/${query}.json`, {
        params: { key: MAPTILER_KEY }
      });
      const coords = res.data.features[0].geometry.coordinates;
      const label = res.data.features[0].place_name;
      setMarkers(prev => ({
        ...prev,
        [field]: { coords: [coords[1], coords[0]], label }
      }));
    } catch (err) {
      console.error(`Geocoding failed for ${field}:`, err);
    }
  };

  return (
    <div className="page-container">
      <h2>Select Source & Destination</h2>

      <form onSubmit={handleSearch(activeField)} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Source location"
            value={inputs.source}
            onChange={handleInputChange('source')}
            onFocus={() => setActiveField('source')}
            style={{ padding: '8px', width: '250px', marginRight: '10px' }}
          />
          <button type="submit" className="button" onClick={handleSearch('source')}>
            Set Source
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Destination location"
            value={inputs.destination}
            onChange={handleInputChange('destination')}
            onFocus={() => setActiveField('destination')}
            style={{ padding: '8px', width: '250px', marginRight: '10px' }}
          />
          <button type="submit" className="button green" onClick={handleSearch('destination')}>
            Set Destination
          </button>
        </div>
      </form>

      <div style={{ height: '400px' }}>
        <MapContainer center={DEFAULT_COORDS} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url={`https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
            attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
          />

          <ClickHandler setMarker={setMarkers} activeField={activeField} setInputs={setInputs} />

          {markers.source && (
            <>
              <Marker position={markers.source.coords}>
                <Popup>Source: {markers.source.label}</Popup>
              </Marker>
              <RecenterMap lat={markers.source.coords[0]} lng={markers.source.coords[1]} />
            </>
          )}
          {markers.destination && (
            <Marker position={markers.destination.coords}>
              <Popup>Destination: {markers.destination.label}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Navigate to planner page with selected locations */}
      <button
        className="button"
        style={{ marginTop: '20px' }}
        disabled={!markers.source || !markers.destination}
        onClick={() =>
          navigate('/planner', {
            state: {
              source: markers.source?.label || '',
              destination: markers.destination?.label || ''
            }
          })
        }
      >
        Plan Trip
      </button>
    </div>
  );
};

export default MapPage;
