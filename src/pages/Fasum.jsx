import React, { useState, useEffect } from 'react';
import { Tent, Plus, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const Fasum = ({ subRole, isAdmin, isDemo }) => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: '', condition: 'Baik' });
    const canManage = isAdmin || subRole === 'sapras';

    useEffect(() => {
        if (isDemo) {
            setItems([
                { id: '1', name: 'Tenda Besar', quantity: 5, condition: 'Baik' },
                { id: '2', name: 'Kursi Plastik', quantity: 100, condition: 'Layak Pakai' },
                { id: '3', name: 'Sound System Portable', quantity: 1, condition: 'Perlu Service' },
            ]);
            return;
        }

        const q = query(collection(db, `artifacts/${appId}/public/data/fasum`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(data);
        });
        return () => unsubscribe();
    }, [isDemo]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.quantity) return;
        if (isDemo) {
            setItems([...items, { id: Date.now().toString(), ...newItem }]);
            setNewItem({ name: '', quantity: '', condition: 'Baik' });
            return;
        }
        await addDoc(collection(db, `artifacts/${appId}/public/data/fasum`), newItem);
        setNewItem({ name: '', quantity: '', condition: 'Baik' });
    };

    const handleDelete = async (id) => {
        if (isDemo) {
            setItems(items.filter(i => i.id !== id));
            return;
        }
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/fasum`, id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Tent className="text-pink-500" /> Fasilitas Umum & Inventaris
                    </h2>
                    <p className="text-gray-500">Daftar inventaris milik warga RT.</p>
                </div>
            </div>

            {canManage && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Tambah Inventaris</h3>
                    <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                        <input
                            placeholder="Nama Barang"
                            className="p-2 border rounded flex-1"
                            value={newItem.name}
                            onChange={e => setNewItem({...newItem, name: e.target.value})}
                        />
                        <input
                            type="number"
                            placeholder="Jumlah"
                            className="p-2 border rounded w-24"
                            value={newItem.quantity}
                            onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                        />
                        <select
                            className="p-2 border rounded w-40"
                            value={newItem.condition}
                            onChange={e => setNewItem({...newItem, condition: e.target.value})}
                        >
                            <option value="Baik">Baik</option>
                            <option value="Layak Pakai">Layak Pakai</option>
                            <option value="Perlu Service">Perlu Service</option>
                            <option value="Rusak">Rusak</option>
                        </select>
                        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-pink-600">
                            <Plus size={16} /> Tambah
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-400 relative">
                        {canManage && (
                            <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p>Jumlah: <span className="font-semibold">{item.quantity}</span></p>
                            <p>Kondisi: <span className={`px-2 py-0.5 rounded text-xs text-white ${
                                item.condition === 'Baik' ? 'bg-green-500' :
                                item.condition === 'Rusak' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>{item.condition}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fasum;
