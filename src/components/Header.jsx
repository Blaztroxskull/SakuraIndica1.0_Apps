import React from 'react';
import { UserCog } from 'lucide-react';

const Header = ({ userId, onAdminClick, isAdmin }) => (
    <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Aplikasi Warga RT</h1>
        <div className="flex items-center space-x-4">
             <button onClick={onAdminClick} className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg ${isAdmin ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                <UserCog size={16} />
                <span>{isAdmin ? 'Keluar Mode Admin' : 'Mode Admin'}</span>
            </button>
            <div className="text-sm text-gray-500 hidden md:block">
                ID Pengguna: <span className="font-semibold text-gray-700">{userId ? userId.substring(0, 10) + '...' : 'Anonim'}</span>
            </div>
        </div>
    </div>
);

export default Header;
