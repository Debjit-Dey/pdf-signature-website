import React from "react";
import { Rnd } from "react-rnd";

const DraggableResizableSignature = ({ sig, onUpdate }) => {
  const {
    _id,
    x,
    y,
    width = 120,
    height = 30,
    image,
    text,
    font = "Dancing Script",
  } = sig;

  return (
    <Rnd
      default={{ x, y, width, height }}
      bounds="#pdf-container"
      onDragStop={(e, d) => {
        onUpdate(_id, d.x, d.y, width, height);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const newWidth = ref.offsetWidth;
        const newHeight = ref.offsetHeight;
        onUpdate(_id, position.x, position.y, newWidth, newHeight);
      }}
      style={{
        position: "absolute",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed #999",
        backgroundColor: "rgba(255,255,255,0.3)",
        cursor: "move",
        userSelect: "none",
        padding: "4px",
      }}
    >
      {image ? (
        <img
          src={image}
          alt="signature"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            fontSize: "18px",
            fontFamily: font,
            color: "#111",
          }}
        >
          {text || "Signature"}
        </div>
      )}
    </Rnd>
  );
};

export default DraggableResizableSignature;
