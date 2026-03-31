import React, { useState, useEffect } from 'react';
import { Siren, Video, Phone, Shield, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const KeamananLingkungan = ({ onTriggerPanic, userId, isAdmin, subRole, isDemo }) => {
    const [cctvLink, setCctvLink] = useState('#');
    const [reports, setReports] = useState([]);
    const [newReport, setNewReport] = useState({ title: '', category: 'Keamanan', description: '' });
    const [activeTab, setActiveTab] = useState('panic'); // panic, aduan

    const canManageReports = isAdmin || subRole === 'keamanan' || subRole === 'rt';

    useEffect(() => {
        // CCTV Link
        const cctvRef = doc(db, `artifacts/${appId}/public/data/config`, 'cctvLink');
        const unsubscribeCctv = onSnapshot(cctvRef, (docSnap) => {
            if (docSnap.exists()) setCctvLink(docSnap.data().url || '#');
        });

        // Aduan
        if (isDemo) {
            setReports([
                { id: '1', title: 'Lampu jalan mati', category: 'Fasilitas', status: 'Pending', description: 'Di depan blok A1', timestamp: new Date() },
                { id: '2', title: 'Sampah menumpuk', category: 'Kebersihan', status: 'Selesai', description: 'Sudah 3 hari tidak diangkut', timestamp: new Date() }
            ]);
            return () => unsubscribeCctv();
        }

        let q;
        if (canManageReports) {
            q = query(collection(db, `artifacts/${appId}/public/data/aduan`), orderBy('timestamp', 'desc'));
        } else if (userId) {
            q = query(collection(db, `artifacts/${appId}/public/data/aduan`), where('userId', '==', userId), orderBy('timestamp', 'desc'));
        }

        if (q) {
            const unsubscribeReports = onSnapshot(q, (snapshot) => {
                setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            });
            return () => { unsubscribeCctv(); unsubscribeReports(); };
        }

        return () => unsubscribeCctv();
    }, [userId, isAdmin, subRole, isDemo, canManageReports]);

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if (!userId) return;

        await addDoc(collection(db, `artifacts/${appId}/public/data/aduan`), {
            ...newReport,
            userId,
            status: 'Pending',
            timestamp: new Date()
        });
        setNewReport({ title: '', category: 'Keamanan', description: '' });
        alert('Laporan berhasil dikirim!');
    };

    const updateStatus = async (id, newStatus) => {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/aduan`, id), { status: newStatus });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'text-yellow-500 bg-yellow-50';
            case 'Proses': return 'text-blue-500 bg-blue-50';
            case 'Selesai': return 'text-green-500 bg-green-50';
            case 'Ditolak': return 'text-red-500 bg-red-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                <button
                    onClick={() => setActiveTab('panic')}
                    className={`pb-2 px-4 font-semibold ${activeTab === 'panic' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Darurat & CCTV
                </button>
                <button
                    onClick={() => setActiveTab('aduan')}
                    className={`pb-2 px-4 font-semibold ${activeTab === 'aduan' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Saran & Pengaduan
                </button>
            </div>

            {activeTab === 'panic' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-md text-center border-l-4 border-red-500">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tombol Panik (S.O.S)</h2>
                        <p className="text-gray-600 mb-6">Tekan HANYA saat darurat! Alarm akan berbunyi di perangkat pengurus.</p>
                        <button onClick={onTriggerPanic} className="bg-red-600 text-white rounded-full w-40 h-40 flex flex-col items-center justify-center mx-auto shadow-xl hover:bg-red-700 transition-transform transform hover:scale-105 active:scale-95 animate-pulse">
                            <Siren size={48} />
                            <span className="text-xl font-bold mt-2">SOS</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {canManageReports && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Video className="text-blue-500"/> Pantau CCTV Lingkungan
                                </h3>
                                <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center mb-4">
                                    <p className="text-gray-400 text-sm">Preview CCTV tidak tersedia</p>
                                </div>
                                <a href={cctvLink} target="_blank" rel="noopener noreferrer" className={`w-full block text-center py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 ${cctvLink === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {cctvLink !== '#' ? 'Buka Stream CCTV' : 'Link Belum Diset'}
                                </a>
                            </div>
                        )}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Phone className="text-green-500"/> Nomor Penting
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between border-b pb-2"><span>Keamanan (Satpam)</span> <span className="font-bold">0812-3456-7890</span></li>
                                <li className="flex justify-between border-b pb-2"><span>Ketua RT</span> <span className="font-bold">0812-9876-5432</span></li>
                                <li className="flex justify-between border-b pb-2"><span>Polsek Terdekat</span> <span className="font-bold">110 / (021) 7890</span></li>
                                <li className="flex justify-between border-b pb-2"><span>Pemadam Kebakaran</span> <span className="font-bold">113</span></li>
                                <li className="flex justify-between"><span>Ambulans</span> <span className="font-bold">118</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'aduan' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Buat Laporan Baru</h3>
                        <form onSubmit={handleSubmitReport} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan</label>
                                    <input required type="text" className="w-full p-2 border rounded-lg" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} placeholder="Contoh: Lampu jalan mati" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select className="w-full p-2 border rounded-lg" value={newReport.category} onChange={e => setNewReport({...newReport, category: e.target.value})}>
                                        <option value="Keamanan">Keamanan</option>
                                        <option value="Kebersihan">Kebersihan</option>
                                        <option value="Fasilitas">Fasilitas Umum</option>
                                        <option value="Administrasi">Administrasi</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail</label>
                                <textarea required rows="3" className="w-full p-2 border rounded-lg" value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} placeholder="Jelaskan detail lokasi dan masalah..."></textarea>
                            </div>
                            <button type="submit" className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-600 flex items-center gap-2">
                                <Send size={18} /> Kirim Laporan
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Riwayat Laporan</h3>
                        {reports.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Belum ada laporan.</p>
                        ) : (
                            reports.map(report => (
                                <div key={report.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-500 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(report.status)}`}>{report.status}</span>
                                            <span className="text-xs text-gray-400">• {report.category}</span>
                                            <span className="text-xs text-gray-400">• {report.timestamp?.toDate ? report.timestamp.toDate().toLocaleDateString('id-ID') : 'Baru saja'}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800">{report.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                                    </div>
                                    {canManageReports && (
                                        <div className="flex items-center gap-2 self-start md:self-center">
                                            {report.status !== 'Selesai' && (
                                                <button onClick={() => updateStatus(report.id, 'Selesai')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Tandai Selesai">
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                            {report.status === 'Pending' && (
                                                <button onClick={() => updateStatus(report.id, 'Proses')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Proses">
                                                    <Clock size={20} />
                                                </button>
                                            )}
                                            {report.status !== 'Ditolak' && report.status !== 'Selesai' && (
                                                <button onClick={() => updateStatus(report.id, 'Ditolak')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Tolak">
                                                    <XCircle size={20} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeamananLingkungan;
