import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Circle } from "react-konva";

export default function CanvasRadar({ X, Y, I }) {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth * 0.8,
    height: (window.innerWidth * 0.8) / 2,
  });

  useEffect(() => {
    if (X === null || Y === null || I === null) return;
    // console.log(X, Y, I);
    addPoint(X, Y, I);
  }, [X, Y, I]);

  const [Origin, setOrigin] = useState({
    X: (window.innerWidth * 0.8) / 2,
    Y: (window.innerWidth * 0.8) / 2,
  });

  const [Radius, setRadius] = useState(3 * ((window.innerWidth * 0.8) / 580));

  const [Scale, setScale] = useState((window.innerWidth * 0.8) / 220);

  const initialArray = new Array(180).fill(null);
  const [circles, setCircles] = useState(initialArray);

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth * 0.8,
        height: (window.innerWidth * 0.8) / 2,
      });
      setOrigin({
        X: (window.innerWidth * 0.8) / 2,
        Y: (window.innerWidth * 0.8) / 2,
      });
      setRadius(3 * ((window.innerWidth * 0.8) / 580));
      setScale((window.innerWidth * 0.8) / 220);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addPoint = (x, y, index) => {
    if (index > 180 || index < 0) return;
    if (x === 0 && y === 0) {
      const newCircles = [...circles];
      newCircles[index] = {
        x: null,
        y: null,
      };
      setCircles(newCircles);
      return;
    }
    const newCircles = [...circles];
    newCircles[index] = {
      x,
      y,
    };
    setCircles(newCircles);
  };

  return (
    <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
      <Layer>
        {circles.map(
          (circle, index) =>
            circle && (
              <Circle
                x={Origin.X - circle.x * Scale}
                y={Origin.Y - circle.y * Scale}
                key={index}
                radius={Radius}
                fill="rgb(18, 249, 58)"
              />
            )
        )}
      </Layer>
    </Stage>
  );
}
