// DraggableSignature.jsx
import React from "react";
import { useDrag } from "react-dnd";

const DraggableSignature = ({ id, text, font, x, y, onMove }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: "SIGNATURE",
    item: { id, text, font, x, y },
    end: (item, monitor) => {
      const offset = monitor.getDifferenceFromInitialOffset();
      if (offset && onMove) {
        const newX = x + offset.x;
        const newY = y + offset.y;
        onMove(id, newX, newY);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: font,
        fontSize: 20,
        color: "#000",
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
};

export default DraggableSignature;
