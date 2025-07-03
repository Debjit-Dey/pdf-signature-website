import React, { useRef } from "react";
import { useDrop } from "react-dnd";

const SignatureCanvas = ({ pageNumber, onDropSignature, children }) => {
  const containerRef = useRef(null);

  const [, drop] = useDrop(() => ({
    accept: "SIGNATURE",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const containerRect = containerRef.current.getBoundingClientRect();

      const x = clientOffset.x - containerRect.left;
      const y = clientOffset.y - containerRect.top;

      onDropSignature({ ...item, x, y, page: pageNumber });
    },
  }));

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        drop(node);
      }}
      className="relative w-full"
    >
      {children}
    </div>
  );
};

export default SignatureCanvas;
