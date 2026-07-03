import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css'; 

function App() {
  // 1. REFS: Direct references to our DOM elements
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const uiCanvasRef = useRef(null);
  
  const lastPosition = useRef({ x: null, y: null });
  const isDrawing = useRef(false);

  // 2. STATE
  const [color, setColor] = useState('#00ff9f');
  const [status, setStatus] = useState('LOADING AI...');

  useEffect(() => {
    // Extract MediaPipe from the global window object
    const { Hands, Camera } = window;

    if (!Hands || !Camera) {
      setStatus("ERROR: MediaPipe scripts not loaded!");
      return;
    }

    // 3. INITIALIZE MEDIAPIPE
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(onResults);

    // Boot up the camera feed
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video) {
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start().then(() => setStatus('SYSTEM ACTIVE'));
    }
  }, []); 

  // 4. THE AI LOGIC LOOP (Runs 60x a second)
  const onResults = (results) => {
    // --- THIS IS WHERE THE FIX HAPPENED ---
    if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      return;
    }

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // THE FIX: We only set the size ONCE. If we do it every frame, the browser erases the canvas!
    if (canvasRef.current.width !== videoWidth) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }
    if (uiCanvasRef.current.width !== videoWidth) {
      uiCanvasRef.current.width = videoWidth;
      uiCanvasRef.current.height = videoHeight;
    }

    const uiCtx = uiCanvasRef.current.getContext('2d');
    const drawCtx = canvasRef.current.getContext('2d');

    // We ONLY clear the UI layer (so the tracking skeleton doesn't smear)
    uiCtx.clearRect(0, 0, videoWidth, videoHeight);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      const { drawConnectors, drawLandmarks, HAND_CONNECTIONS } = window;

      // Draw the AI skeleton
      drawConnectors(uiCtx, landmarks, HAND_CONNECTIONS, { color: '#ff3cac', lineWidth: 2 });
      drawLandmarks(uiCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });

      // --- DRAWING LOGIC ---
      const indexTip = landmarks[8];
      const indexBase = landmarks[5];
      const middleTip = landmarks[12];
      
      const x =  indexTip.x * videoWidth;
      const y = indexTip.y * videoHeight;

      // Check if Index finger is UP and Middle finger is DOWN
      const isIndexUp = indexTip.y < indexBase.y;
      const isMiddleDown = middleTip.y > landmarks[9].y;

      if (isIndexUp && isMiddleDown) {
        if (!isDrawing.current) {
          lastPosition.current = { x, y };
          isDrawing.current = true;
        } else {
          drawCtx.beginPath();
          drawCtx.moveTo(lastPosition.current.x, lastPosition.current.y);
          drawCtx.lineTo(x, y);
          drawCtx.strokeStyle = color;
          drawCtx.lineWidth = 10;
          drawCtx.lineCap = 'round';
          drawCtx.stroke();

          lastPosition.current = { x, y };
        }
      } else {
        isDrawing.current = false;
      }
    } else {
      isDrawing.current = false;
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div style={{ background: '#0f0f13', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <h2>Air Canvas</h2>
        <span style={{ color: '#00ff9f', fontSize: '12px', fontWeight: 'bold' }}>{status}</span>
        
        <button onClick={clearCanvas} style={{ padding: '10px 20px', background: '#ff3cac', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Clear Board
        </button>
        
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          style={{ cursor: 'pointer', height: '35px', width: '50px', border: 'none', background: 'transparent' }}
        />
        <span style={{ fontSize: '12px', color: '#888' }}>
          GESTURE: Point Index finger up to draw. Open hand to hover.
        </span>
      </div>

      <div style={{ position: 'relative', width: '1280px', height: '720px', border: '2px solid #333', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
        <Webcam
          ref={webcamRef}
          style={{ position: 'absolute', width: '1280px', height: '720px', transform: 'scaleX(-1)', opacity: 0.2 }}
        />
        {/* Layer 2: The Paint */}
        <canvas ref={canvasRef} style={{ position: 'absolute', width: '1280px', height: '720px', zIndex: 10, transform: 'scaleX(-1)' }} />
        {/* Layer 3: The Skeleton */}
        <canvas ref={uiCanvasRef} style={{ position: 'absolute', width: '1280px', height: '720px', zIndex: 20, transform: 'scaleX(-1)' }} />
      </div>
    </div>
  );
}

export default App;