import { useEffect, useRef, useState } from "react";
import "./styles/style.css";

function App() {
  const [XOrigin, setXOrigin] = useState(0);
  const [YOrigin, setYOrigin] = useState(0);
  const [Angle, setAngle] = useState(0);
  const [IsConnected, setIsConnected] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.getContext("2d");
    setXOrigin(canvas.width / 2);
    setYOrigin(canvas.height - 5);
  }, []);

  // useEffect(() => {
  //   let distance = 50;
  //   let angle = 90;
  //   getCoords(distance, angle);
  //   setAngle(angle);
  // }, [XOrigin, YOrigin]);

  const getCoords = (dist, angle) => {
    let sdist = dist;
    const radians = angle * (Math.PI / 180);
    const x = Math.cos(radians) * sdist;
    const y = Math.sin(radians) * sdist;
    console.log("Calculated:", x, y);
    return { x, y };
  };

  const updateCanvas = (xval, yval) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(XOrigin - xval, YOrigin - yval, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  //----------------------- Serial Port -----------------------

  function handleClick() {
    connectToSerialPort();
  }

  async function connectToSerialPort() {
    try {
      setIsConnected(false);
      setIsLoading(true);
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setIsLoading(false);
      setIsConnected(true);
      console.log(`Serial port opened at 9600 baud`);
      startReading(port);
    } catch (error) {
      setIsLoading(false);
      setIsConnected(false);
      console.error("Error:", error.message);
    }
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
          extractData(lines[i]);
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

  function extractData(data) {
    try {
      // const objdata = JSON.parse(data);
      // const { angle, distance } = objdata;
      // const { x, y } = getCoords(angle, distance);
      const fdata = data.split(" ");
      const distance = parseInt(fdata[0]);
      const angle = parseInt(fdata[1]);
      const { x, y } = getCoords(distance, angle);
      updateCanvas(x, y);
      setAngle(angle);
    } catch (err) {
      console.log(err);
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
          {IsConnected ? ":D" : IsLoading ? "..." : "Connect"}
        </button>
        <div className={`outer-circle ${IsConnected ? "ripple" : ""}`} />
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
