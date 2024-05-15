import { useEffect, useRef, useState } from "react";
import "./styles/style.css";

function App() {
  const [XOrigin, setXOrigin] = useState(0);
  const [YOrigin, setYOrigin] = useState(0);
  const [Angle, setAngle] = useState(20);
  const [IsConnected, setIsConnected] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.getContext("2d");
    setXOrigin(canvas.width / 2);
    setYOrigin(canvas.height - 5);
  }, []);

  useEffect(() => {
    let distance = 50;
    let angle = 0;
    getCoords(distance, angle);
    setAngle(124);
  }, [XOrigin, YOrigin]);

  const getCoords = (dist, angle) => {
    let sdist = dist;
    const radians = angle * (Math.PI / 180);
    const x = Math.cos(radians) * sdist;
    const y = Math.sin(radians) * sdist;
    console.log(x, y);
    updateCanvas(x, y);
  };

  const updateCanvas = (xval, yval) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(XOrigin - xval, YOrigin - yval, 2, 0, Math.PI * 2); // Using XOrigin and YOrigin from state
    ctx.fill();
  };

  async function connectToSerialPort() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      console.log(`Serial port opened at 9600 baud`);
      startReading(port);

      console.log("Data:", value);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  function handleClick() {
    connectToSerialPort();
  }

  async function startReading(port) {
    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();

    let chunks = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        chunks += value;

        const lines = chunks.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          console.log("Received:", lines[i]);
        }
        chunks = lines[lines.length - 1];
      }
    } catch (error) {
      console.error("Read error:", error);
    } finally {
      reader.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  }

  return (
    <>
      <div className="container">
        <button
          className="connect"
          style={{ backgroundColor: `${!IsConnected ? "red" : "greenyellow"}` }}
          onClick={handleClick}
        >
          Connect
        </button>
        <div className="green-scanner" />
        <div
          className="line"
          style={{ transform: `rotate(${Angle - 90}deg)` }}
        ></div>
        <canvas className="canvas-radar" ref={canvasRef} />
      </div>
    </>
  );
}

export default App;
