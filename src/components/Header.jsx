import React, { useState, useEffect } from 'react';
import { UserCog, Bell, X } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const Header = ({ userId, onAdminClick, isAdmin }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch latest info as notifications
        const qInfo = query(collection(db, `artifacts/${appId}/public/data/informasi`), orderBy('timestamp', 'desc'), limit(5));

        const unsubInfo = onSnapshot(qInfo, (snap) => {
            const newNotifs = snap.docs.map(d => ({
                id: d.id,
                type: 'info',
                message: `Info Baru: ${d.data().content.substring(0, 30)}...`,
                timestamp: d.data().timestamp
            }));

            // If Admin, also check registrations
            if (isAdmin) {
                // This would be complex to merge in real-time efficiently without more complex code,
                // so for now just show Info for everyone.
                // In a real app, we'd have a 'notifications' collection.
            }

            setNotifications(newNotifs);
            setUnreadCount(newNotifs.length); // Simplified unread logic
        });

        return () => unsubInfo();
    }, [isAdmin]);

    return (
        <div className="flex justify-between items-center mb-6 relative">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Aplikasi Warga RT</h1>
                <p className="text-gray-500 text-sm hidden md:block">Sistem Informasi & Layanan Mandiri</p>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                    <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 relative">
                        <Bell size={20} className="text-gray-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotif && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden animate-fade-in-down">
                            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 text-sm">Notifikasi Terkini</h3>
                                <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer text-sm">
                                            <p className="text-gray-800 font-medium">{n.message}</p>
                                            <p className="text-gray-400 text-xs mt-1">{n.timestamp ? new Date(n.timestamp.toDate()).toLocaleString() : ''}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-400 text-sm">Tidak ada notifikasi baru.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onAdminClick} className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${isAdmin ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    <UserCog size={16} />
                    <span className="hidden md:inline">{isAdmin ? 'Keluar Mode Admin' : 'Mode Admin'}</span>
                </button>
            </div>
        </div>
    );
};

export default Header;
