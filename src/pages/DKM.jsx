import React, { useState, useEffect } from 'react';
import { Users, Calendar, Video, Upload, Trash2, Plus, X } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const DKM = ({ subRole, isAdmin, isDemo }) => {
    const [schedules, setSchedules] = useState([]);
    const [kajian, setKajian] = useState([]);
    const [newSchedule, setNewSchedule] = useState({ date: '', imam: '', khatib: '' });
    const [newKajian, setNewKajian] = useState({ title: '', speaker: '', date: '', description: '' });
    const [activeTab, setActiveTab] = useState('jumat'); // jumat, kajian

    const canManage = isAdmin || subRole === 'dkm';

    useEffect(() => {
        if (isDemo) {
            setSchedules([
                { id: '1', date: '2023-10-27', imam: 'Ustadz Ahmad', khatib: 'Ustadz Budi' },
                { id: '2', date: '2023-11-03', imam: 'Ustadz Cecep', khatib: 'Ustadz Dedi' },
            ]);
            setKajian([
                { id: '1', title: 'Tafsir Al-Quran', speaker: 'Dr. Fulan', date: '2023-10-25', description: 'Membahas tafsir Juz 30.' },
                { id: '2', title: 'Kajian Subuh', speaker: 'Ustadz X', date: '2023-10-26', description: 'Kitab Riyadhus Shalihin.' },
            ]);
            return;
        }

        const qSchedules = query(collection(db, `artifacts/${appId}/public/data/dkm_jumat`), orderBy('date', 'asc'));
        const unsubSchedules = onSnapshot(qSchedules, (snap) => {
            setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qKajian = query(collection(db, `artifacts/${appId}/public/data/dkm_kajian`), orderBy('date', 'desc'));
        const unsubKajian = onSnapshot(qKajian, (snap) => {
            setKajian(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubSchedules(); unsubKajian(); };
    }, [isDemo]);

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        if (!newSchedule.date || !newSchedule.imam) return;
        await addDoc(collection(db, `artifacts/${appId}/public/data/dkm_jumat`), newSchedule);
        setNewSchedule({ date: '', imam: '', khatib: '' });
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm('Hapus jadwal ini?')) {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/dkm_jumat`, id));
        }
    };

    const handleAddKajian = async (e) => {
        e.preventDefault();
        if (!newKajian.title || !newKajian.speaker) return;
        await addDoc(collection(db, `artifacts/${appId}/public/data/dkm_kajian`), newKajian);
        setNewKajian({ title: '', speaker: '', date: '', description: '' });
    };

    const handleDeleteKajian = async (id) => {
        if (window.confirm('Hapus kajian ini?')) {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/dkm_kajian`, id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Users className="text-green-600" /> DKM Masjid
                        </h2>
                        <p className="text-gray-500">Jadwal Sholat Jumat & Kajian Rutin.</p>
                    </div>
                </div>

                <div className="flex space-x-4 border-b mb-6">
                    <button
                        onClick={() => setActiveTab('jumat')}
                        className={`pb-2 px-4 font-semibold ${activeTab === 'jumat' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Jadwal Jumat
                    </button>
                    <button
                        onClick={() => setActiveTab('kajian')}
                        className={`pb-2 px-4 font-semibold ${activeTab === 'kajian' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Kajian & Ceramah
                    </button>
                </div>

                {activeTab === 'jumat' && (
                    <div className="space-y-6 animate-fade-in">
                        {canManage && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-bold text-green-800 mb-2">Tambah Jadwal Jumat</h4>
                                <form onSubmit={handleAddSchedule} className="flex flex-col md:flex-row gap-4">
                                    <input required type="date" className="p-2 border rounded" value={newSchedule.date} onChange={e => setNewSchedule({...newSchedule, date: e.target.value})} />
                                    <input required placeholder="Nama Imam" className="p-2 border rounded flex-1" value={newSchedule.imam} onChange={e => setNewSchedule({...newSchedule, imam: e.target.value})} />
                                    <input required placeholder="Nama Khatib" className="p-2 border rounded flex-1" value={newSchedule.khatib} onChange={e => setNewSchedule({...newSchedule, khatib: e.target.value})} />
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                                        <Plus size={16} /> Tambah
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                        <th className="py-3 px-6 text-left">Tanggal</th>
                                        <th className="py-3 px-6 text-left">Imam</th>
                                        <th className="py-3 px-6 text-left">Khatib</th>
                                        {canManage && <th className="py-3 px-6 text-center">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm font-light">
                                    {schedules.map(s => (
                                        <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap font-medium text-gray-800">
                                                {s.date ? new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="py-3 px-6 text-left font-semibold">{s.imam}</td>
                                            <td className="py-3 px-6 text-left">{s.khatib}</td>
                                            {canManage && (
                                                <td className="py-3 px-6 text-center">
                                                    <button onClick={() => handleDeleteSchedule(s.id)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {schedules.length === 0 && (
                                        <tr>
                                            <td colSpan={canManage ? 4 : 3} className="text-center py-4 text-gray-400">Belum ada jadwal.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'kajian' && (
                    <div className="space-y-6 animate-fade-in">
                        {canManage && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-bold text-purple-800 mb-2">Tambah Jadwal Kajian</h4>
                                <form onSubmit={handleAddKajian} className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <input required type="date" className="p-2 border rounded" value={newKajian.date} onChange={e => setNewKajian({...newKajian, date: e.target.value})} />
                                        <input required placeholder="Judul Kajian" className="p-2 border rounded flex-1" value={newKajian.title} onChange={e => setNewKajian({...newKajian, title: e.target.value})} />
                                        <input required placeholder="Pemateri" className="p-2 border rounded flex-1" value={newKajian.speaker} onChange={e => setNewKajian({...newKajian, speaker: e.target.value})} />
                                    </div>
                                    <textarea placeholder="Deskripsi singkat..." className="w-full p-2 border rounded" value={newKajian.description} onChange={e => setNewKajian({...newKajian, description: e.target.value})}></textarea>
                                    <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2">
                                        <Plus size={16} /> Tambah Kajian
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {kajian.map(k => (
                                <div key={k.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow relative">
                                    {canManage && (
                                        <button onClick={() => handleDeleteKajian(k.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Video size={18} className="text-purple-500" />
                                        <span className="text-sm text-gray-500">{k.date ? new Date(k.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-800 mb-1">{k.title}</h4>
                                    <p className="text-sm font-semibold text-purple-600 mb-2">Oleh: {k.speaker}</p>
                                    <p className="text-gray-600 text-sm">{k.description}</p>
                                </div>
                            ))}
                            {kajian.length === 0 && (
                                <p className="text-gray-400 col-span-2 text-center py-4">Belum ada jadwal kajian.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DKM;
