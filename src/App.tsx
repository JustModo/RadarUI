import { useEffect, useRef, useState } from "react";
import "./styles/style.css";
import CanvasRadar from "./CanvasRadar";

function App() {
  const [Angle, setAngle] = useState(0);
  const [IsConnected, setIsConnected] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);

  const getCoords = (dist, angle) => {
    let sdist = dist;
    const radians = angle * (Math.PI / 180);
    const x = Math.cos(radians) * sdist;
    const y = Math.sin(radians) * sdist;
    console.log("Calculated:", x, y);
    return { x, y };
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
      console.log(`Serial port opened at 9600 baud`);
      await startReading(port);
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
          setIsLoading(false);
          setIsConnected(true);
          console.log("Received:", lines[i]);
          extractData(lines[i]);
        }
        chunks = lines[lines.length - 1];
      }
    } catch (error) {
      console.error("Read error:", error);
    } finally {
      reader.releaseLock();
      await port.close();
      await readableStreamClosed.catch(() => {});
    }
  }

  function extractData(data) {
    try {
      const fdata = data.split(" ");
      const distance = parseInt(fdata[1]);
      const angle = parseInt(fdata[0]);
      const { x, y } = getCoords(distance, angle);
      setSendX(x);
      setSendY(y);
      setSendI(angle);
      setAngle(angle);
    } catch (err) {
      console.log(err);
    }
  }

  // useEffect(() => {
  //   let i = 0;
  //   let direction = 1;
  //   const interval = setInterval(() => {
  //     const { x, y } = getCoords(100, i);
  //     setSendX(x);
  //     setSendY(y);
  //     setSendI(i);
  //     setAngle(i);
  //     console.log("Angle", i);

  //     i += direction;
  //     if (i === 0 || i === 180) {
  //       direction *= -1;
  //     }
  //   }, 20);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // useEffect(() => {
  //   const { x, y } = getCoords(200, 90);
  //   setSendX(x);
  //   setSendY(y);
  //   setSendI(90);
  //   setAngle(90);
  // }, []);

  const [sendX, setSendX] = useState(null);
  const [sendY, setSendY] = useState(null);
  const [sendI, setSendI] = useState(null);

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
        <div
          className={`outer-circle ${IsLoading ? "flash" : ""} ${
            IsConnected ? "ripple" : ""
          }`}
        />
        <div className={`green-scanner `} />
        <div
          className="line"
          style={{ transform: `rotate(${Angle - 90}deg)` }}
        />
        <div className="canvas-radar">
          <CanvasRadar X={sendX} Y={sendY} I={sendI} />
        </div>
      </div>
    </>
  );
}

export default App;
