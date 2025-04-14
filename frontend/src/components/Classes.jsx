import React from "react";
import Book from "../assets/images/illu6.png";

function Classes({ subject, teacher }) {
  return (
     <>
      <div className="flex flex-col  w-full items-center p-4 h-48">
        <div className="p-2 bg-slate-300 rounded-full mb-2">
          <img src={Book} className="w-12 h-12" alt="Book" />
        </div>
        <div className="bg-white p-3 rounded-lg shadow w-full ">
          <div className="w-full break-words text-sm ">
            {subject}
          </div>
          <div className="text-xs text-gray-700">{teacher}</div>
        </div>
      </div>
      <div className="text-sm bg-slate-600  py-3 rounded-b-lg text-center text-white ">
        View
      </div>
     </>

  );
}

export default Classes;
