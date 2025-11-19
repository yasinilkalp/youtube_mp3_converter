import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaSearch, FaDownload, FaMusic, FaYoutube } from 'react-icons/fa';
import './App.css';

// Initialize socket connection
const socket = io(); // Connect to same origin

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Progress state
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socket.off();
    };
  }, []);

  const handleFetchInfo = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setVideoInfo(null);
    setConverting(false);
    setProgress(0);

    try {
      const response = await axios.get(`/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch video info. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;
    setConverting(true);
    setProgress(0);
    setStatus('Starting conversion...');
    setError('');

    try {
      // Start conversion job
      const response = await axios.post('/convert', { url });
      const { jobId } = response.data;

      // Listen for progress events for this specific job
      socket.on(`progress-${jobId}`, (data) => {
        console.log('Progress:', data); // Debug log
        setProgress(data.percent);
        setStatus(data.status);

        if (data.status === 'Failed') {
          setError(data.error || 'Conversion failed');
          setConverting(false);
          socket.off(`progress-${jobId}`);
        }

        if (data.percent === 100) {
          setStatus('Download ready!');
          // Trigger file download
          window.location.href = `/download/${jobId}`;

          // Reset after a delay
          setTimeout(() => {
            setConverting(false);
            setProgress(0);
            socket.off(`progress-${jobId}`);
          }, 3000);
        }
      });

    } catch (err) {
      console.error(err);
      setError('Failed to start conversion.');
      setConverting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFetchInfo();
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">
        <FaYoutube style={{ color: '#e94560', marginRight: '10px' }} />
        MP3 Converter
      </h1>

      <div className="input-group">
        <input
          type="text"
          className="url-input"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="convert-btn"
          onClick={handleFetchInfo}
          disabled={loading || converting}
        >
          {loading ? <div className="loader"></div> : <FaSearch />}
          {loading ? ' ' : ' Find'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {videoInfo && (
        <div className="video-card">
          <img src={videoInfo.thumbnail} alt="Thumbnail" className="thumbnail" />
          <div className="video-info">
            <h3 className="video-title">{videoInfo.title}</h3>
            <p className="video-channel">{videoInfo.channel}</p>

            {!converting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="download-btn" onClick={handleDownload}>
                  <FaDownload /> Download MP3
                </button>
                <span style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                  <FaMusic style={{ marginRight: '5px' }} />
                  High Quality
                </span>
              </div>
            ) : (
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-status">
                  <span>{status}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
