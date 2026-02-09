import React from 'react';
import { Users, Building2, Baby, HeartHandshake } from 'lucide-react';

const SaluranKomunitas = () => {
    const channels = [
        { name: 'Karang Taruna', icon: Users, description: 'Kegiatan dan informasi untuk pemuda-pemudi.', color: 'blue' },
        { name: 'Dewan Kesejahteraan Masjid (DKM)', icon: Building2, description: 'Informasi seputar kegiatan keagamaan.', color: 'green' },
        { name: 'Posyandu', icon: Baby, description: 'Jadwal dan layanan kesehatan ibu dan anak.', color: 'red' },
        { name: 'PKK', icon: HeartHandshake, description: 'Program pemberdayaan dan kesejahteraan keluarga.', color: 'purple' }
    ];

    const ChannelCard = ({ name, icon: Icon, description, color }) => (
        <div className={`p-6 rounded-xl shadow-md border-t-4 border-${color}-500 bg-white`}>
            <div className="flex items-center mb-3">
                <Icon size={28} className={`text-${color}-500 mr-4`} />
                <h3 className="text-xl font-bold text-gray-800">{name}</h3>
            </div>
            <p className="text-gray-600 mb-4">{description}</p>
            <button className={`w-full py-2 text-sm font-semibold text-white bg-${color}-500 rounded-lg hover:bg-${color}-600`}>
                Lihat Selengkapnya
            </button>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Saluran Komunitas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {channels.map(channel => <ChannelCard key={channel.name} {...channel} />)}
            </div>
        </div>
    );
};

export default SaluranKomunitas;
