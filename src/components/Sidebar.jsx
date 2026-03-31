import React from 'react';
import { Home, FileText, Bell, Users, ShoppingBag, Shield, Landmark, Settings, UserPlus, LogOut, Tent, BookOpen, MessageCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isAdmin, role, subRole, user, logoUrl, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine display role
    const displayRole = isAdmin ? 'Super Administrator' : (role || 'Warga');
    const displaySub = isAdmin ? 'System Owner' : (subRole ? subRole.charAt(0).toUpperCase() + subRole.slice(1) : (user?.displayName || 'Resident'));

    const menuItems = [
        { id: '/dashboard', label: 'Dashboard', icon: Home, adminOnly: false },
        { id: '/surat', label: 'Administrasi', icon: FileText, adminOnly: false },
        { id: '/registrasi', label: 'Data Warga', icon: UserPlus, adminOnly: false },
        { id: '/marketplace', label: 'Marketplace', icon: ShoppingBag, adminOnly: false },
        { id: '/keuangan', label: 'Keuangan', icon: Landmark, adminOnly: false },
        { id: '/informasi', label: 'Komunitas (Berita)', icon: Bell, adminOnly: false },
        { id: '/fasum', label: 'Fasilitas Umum', icon: Tent, adminOnly: false },
        { id: '/dkm', label: 'DKM Masjid', icon: Users, adminOnly: false },
        { id: '/rohani', label: 'Kerohanian', icon: BookOpen, adminOnly: false },
        { id: '/aduan', label: 'Saran & Pengaduan', icon: Shield, adminOnly: false },
        { id: '/saluran', label: 'Saluran Komunitas', icon: MessageCircle, adminOnly: false },
        { id: '/pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
    ];

    const NavLink = ({ id, label, icon: Icon }) => {
        const isActive = location.pathname === id || (id === '/dashboard' && location.pathname === '/');
        return (
            <button
                onClick={() => navigate(id)}
                className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-600 hover:bg-pink-100 hover:text-pink-600'}`}
            >
                <Icon size={20} className="mr-4" />
                <span className="font-medium">{label}</span>
            </button>
        );
    };

    return (
        <aside className="bg-white w-full md:w-64 flex flex-col shadow-xl md:min-h-screen z-10">
            <div className="p-6 flex-shrink-0">
                <div className="flex items-center mb-2">
                    <img src={logoUrl} alt="Logo Aplikasi" className="w-12 h-12 mr-3 rounded-full object-cover"/>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Sakura Indica</h2>
                    <p className="text-sm text-gray-500 font-bold tracking-widest">SYSTEM</p>
                    </div>
                </div>
                <div className="text-xs text-gray-400 font-semibold tracking-wider mb-4">MENU UTAMA</div>
                <nav className="space-y-2">
                    {menuItems.filter(item => !item.adminOnly || isAdmin).map(item => <NavLink key={item.id} {...item} />)}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100">
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-600 font-bold shadow-sm border">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (isAdmin ? 'A' : 'W')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{displayRole}</p>
                        <p className="text-xs text-gray-500 truncate">{displaySub}</p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={onLogout} className="mt-4 flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <LogOut size={16} className="mr-2" />
                        Keluar
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
