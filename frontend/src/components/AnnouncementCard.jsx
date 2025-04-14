import React from 'react';

const AnnouncementCard = ({ title, message, date, isNew }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 max-w-xl w-full">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Megaphone className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {isNew && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{message}</p>
          <div className="flex items-center text-xs text-gray-400 mt-3">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
