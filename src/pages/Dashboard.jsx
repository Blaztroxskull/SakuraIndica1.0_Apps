import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, Car, LifeBuoy } from 'lucide-react';
import StatCard from '../components/StatCard';

const Dashboard = () => {
    const demografiData = [{ name: 'Balita (0-5)', value: 80, color: '#0088FE' },{ name: 'Muda (6-25)', value: 300, color: '#00C49F' },{ name: 'Produktif (26-55)', value: 500, color: '#FFBB28' },{ name: 'Manula (>55)', value: 150, color: '#FF8042' }];
    const statusData = [{ name: 'Menetap', value: 850 },{ name: 'Menyewa', value: 180 }];
    const kendaraanData = [{ name: 'Mobil', value: 450 },{ name: 'Motor', value: 700 }];
    const eventData = [{ name: 'Jan', kematian: 1, perkawinan: 3 },{ name: 'Feb', kematian: 0, perkawinan: 5 },{ name: 'Mar', kematian: 2, perkawinan: 2 },{ name: 'Apr', kematian: 1, perkawinan: 4 },{ name: 'Mei', kematian: 0, perkawinan: 6 },{ name: 'Jun', kematian: 1, perkawinan: 1 }];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Warga" value="1030" icon={Users} color="bg-blue-500" />
                <StatCard title="Jumlah Keluarga" value="350" icon={Home} color="bg-green-500" />
                <StatCard title="Total Kendaraan" value="1150" icon={Car} color="bg-yellow-500" />
                <StatCard title="Pengaduan Bulan Ini" value="12" icon={LifeBuoy} color="bg-red-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Demografi Usia Warga</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={demografiData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                                {demografiData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Peristiwa Bulanan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={eventData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="perkawinan" fill="#8884d8" name="Perkawinan" />
                            <Bar dataKey="kematian" fill="#82ca9d" name="Kematian" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Tinggal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80}/>
                            <Tooltip />
                            <Bar dataKey="value" fill="#ffc658" name="Jumlah" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Jumlah Kendaraan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={kendaraanData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#38bdf8" name="Jumlah" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
