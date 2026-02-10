import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, Car, LifeBuoy } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import StatCard from '../components/StatCard';

const Dashboard = ({ isDemo }) => {
    const [stats, setStats] = useState({
        warga: 1030,
        keluarga: 350,
        kendaraan: 1150,
        pengaduan: 12
    });

    useEffect(() => {
        if (isDemo) {
            setStats({
                warga: 1030,
                keluarga: 350,
                kendaraan: 1150,
                pengaduan: 12
            });
            return;
        }

        const fetchStats = async () => {
            try {
                // Example: Fetch real counts if available.
                // For now, we'll try to count registrations as families.
                const coll = collection(db, `artifacts/${appId}/public/data/registrations`);
                const snapshot = await getCountFromServer(coll);
                const count = snapshot.data().count;

                // Since we don't have real aggregations for everything yet, we might mix real and dummy or just show 0 if empty
                setStats(prev => ({
                    ...prev,
                    keluarga: count,
                    // Estimate warga ~ count * 4
                    warga: count > 0 ? count * 4 : 0,
                    // Reset others or keep dummy if real data missing?
                    // Better to show 0 if real mode to encourage data entry,
                    // but for "Don't change UI/UX" user might prefer seeing numbers.
                    // I will default to 0 for real mode to be accurate.
                    kendaraan: 0,
                    pengaduan: 0
                }));
            } catch (e) {
                console.error("Error fetching stats:", e);
            }
        };

        fetchStats();
    }, [isDemo]);

    const demografiData = [{ name: 'Balita (0-5)', value: isDemo ? 80 : 0, color: '#0088FE' },{ name: 'Muda (6-25)', value: isDemo ? 300 : 0, color: '#00C49F' },{ name: 'Produktif (26-55)', value: isDemo ? 500 : 0, color: '#FFBB28' },{ name: 'Manula (>55)', value: isDemo ? 150 : 0, color: '#FF8042' }];
    const statusData = [{ name: 'Menetap', value: isDemo ? 850 : stats.keluarga },{ name: 'Menyewa', value: isDemo ? 180 : 0 }];
    const kendaraanData = [{ name: 'Mobil', value: isDemo ? 450 : 0 },{ name: 'Motor', value: isDemo ? 700 : 0 }];
    const eventData = [{ name: 'Jan', kematian: 1, perkawinan: 3 },{ name: 'Feb', kematian: 0, perkawinan: 5 },{ name: 'Mar', kematian: 2, perkawinan: 2 },{ name: 'Apr', kematian: 1, perkawinan: 4 },{ name: 'Mei', kematian: 0, perkawinan: 6 },{ name: 'Jun', kematian: 1, perkawinan: 1 }];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Warga" value={stats.warga} icon={Users} color="bg-blue-500" />
                <StatCard title="Jumlah Keluarga" value={stats.keluarga} icon={Home} color="bg-green-500" />
                <StatCard title="Total Kendaraan" value={stats.kendaraan} icon={Car} color="bg-yellow-500" />
                <StatCard title="Pengaduan Bulan Ini" value={stats.pengaduan} icon={LifeBuoy} color="bg-red-500" />
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
