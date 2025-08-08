import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>MARCO POLO</h1>
      <p>Plan your trip using AI-powered recommendations and budgets!</p>

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => navigate('/planner')}>
          Start Planning
        </button>
        <button style={{ ...styles.button, backgroundColor: '#28a745' }} onClick={() => navigate('/map')}>
          Choose on Map
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontSize: '24px',
    textAlign: 'center',
    marginTop: '100px',
    fontFamily: 'Playfair Display, sans-serif',
  },
  buttonGroup: {
    marginTop: '30px',
  },
  button: {
    margin: '10px',
    padding: '12px 24px',
    fontSize: '18px',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default WelcomePage;
