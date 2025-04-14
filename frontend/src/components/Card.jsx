import React from "react";

function Card({ count, label, bgColor = "bg-blue-800" }) {
  return (
    <div
      className={`${bgColor} flex-1 h-36 rounded-lg p-4 mt-8 shadow-2xl w-max `}
    >
      <div className="font-bold text-3xl  m-5 text-slate-50">
        <div className="mb-5">{count}</div>
        <div className="w-max  text-2xl  font-medium  ">{label}</div>
      </div>
    </div>
  );
}

export default Card;
