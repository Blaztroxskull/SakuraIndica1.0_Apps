import React from 'react';
import { Home, FileText, Bell, Users, MessageSquare, Shield, Landmark, Settings, UserPlus } from 'lucide-react';

const Sidebar = ({ navigate, currentPage, isAdmin, logoUrl }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, adminOnly: false },
        { id: 'registrasi', label: 'Registrasi Warga', icon: UserPlus, adminOnly: false },
        { id: 'surat', label: 'Layanan Surat', icon: FileText, adminOnly: false },
        { id: 'keuangan', label: 'Laporan Keuangan', icon: Landmark, adminOnly: false },
        { id: 'informasi', label: 'Informasi Warga', icon: Bell, adminOnly: false },
        { id: 'forum', label: 'Forum Komunitas', icon: MessageSquare, adminOnly: false },
        { id: 'saluran', label: 'Saluran Komunitas', icon: Users, adminOnly: false },
        { id: 'keamanan', label: 'Keamanan', icon: Shield, adminOnly: false },
        { id: 'pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
    ];

    const NavLink = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => navigate(id)}
            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${currentPage === id ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-600 hover:bg-pink-100 hover:text-pink-600'}`}
        >
            <Icon size={20} className="mr-4" />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <aside className="bg-white w-full md:w-64 p-6 shadow-xl md:min-h-screen flex-shrink-0">
            <div className="flex items-center mb-8">
                <img src={logoUrl} alt="Logo Aplikasi" className="w-12 h-12 mr-3 rounded-full object-cover"/>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sakura Indica</h2>
                    <p className="text-sm text-gray-500">Harvest City</p>
                </div>
            </div>
            <nav className="space-y-2">
                {menuItems.filter(item => !item.adminOnly || isAdmin).map(item => <NavLink key={item.id} {...item} />)}
            </nav>
        </aside>
    );
};

export default Sidebar;
