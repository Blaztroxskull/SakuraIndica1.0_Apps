import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`flex-shrink-0 p-3 rounded-full ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-800 break-words">{value}</p>
        </div>
    </div>
);

export default StatCard;
