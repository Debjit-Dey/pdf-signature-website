import React from "react";
import { useDrag } from "react-dnd";

const DraggableSignature = ({ text, font }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: "SIGNATURE",
    item: { text, font },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className="inline-block px-4 py-2 cursor-move border rounded bg-white shadow"
      style={{
        fontFamily: font,
        fontSize: 20,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {text}
    </div>
  );
};

export default DraggableSignature;
