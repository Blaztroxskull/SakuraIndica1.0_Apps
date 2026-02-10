import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, MessageCircle, QrCode, X, Phone, Image as ImageIcon } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, where, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';
import { dummyMarketplace } from '../lib/dummyData';

const Marketplace = ({ userId, isDemo }) => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // For detail view or QRIS modal
    const [newItem, setNewItem] = useState({
        title: '', description: '', price: '', stock: '', phone: '', hasQris: false
    });
    const [productImage, setProductImage] = useState(null);
    const [qrisImage, setQrisImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isDemo) {
            setItems(dummyMarketplace || []);
            return;
        }

        const q = query(collection(db, `artifacts/${appId}/public/data/marketplace`), orderBy('timestamp', 'desc'), limit(30));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(itemsData);
        }, (error) => console.error("Error fetching marketplace:", error));
        return () => unsubscribe();
    }, [isDemo]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!userId) return;
        setIsLoading(true);

        try {
            let productImageUrl = '';
            let qrisImageUrl = '';

            if (productImage) {
                const storageRef = ref(storage, `marketplace/products/${Date.now()}_${productImage.name}`);
                await uploadBytes(storageRef, productImage);
                productImageUrl = await getDownloadURL(storageRef);
            }

            if (qrisImage) {
                const storageRef = ref(storage, `marketplace/qris/${Date.now()}_${qrisImage.name}`);
                await uploadBytes(storageRef, qrisImage);
                qrisImageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, `artifacts/${appId}/public/data/marketplace`), {
                ...newItem,
                price: Number(newItem.price),
                stock: Number(newItem.stock),
                productImageUrl,
                qrisImageUrl,
                sellerId: userId,
                timestamp: new Date()
            });

            setShowAddModal(false);
            setNewItem({ title: '', description: '', price: '', stock: '', phone: '', hasQris: false });
            setProductImage(null);
            setQrisImage(null);
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Gagal menambahkan barang.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus barang ini?")) {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/marketplace`, id));
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Pasar Warga (Marketplace)</h2>
                    <p className="text-gray-500">Jual beli antar tetangga, dukung UMKM lokal!</p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari barang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center gap-2 font-semibold whitespace-nowrap"
                    >
                        <Plus size={20} /> Jualan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="h-48 bg-gray-200 relative overflow-hidden group">
                            {item.productImageUrl ? (
                                <img src={item.productImageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                            {item.stock <= 0 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm transform -rotate-12">HABIS</span>
                                </div>
                            )}
                            {userId === item.sellerId && (
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{item.title}</h3>
                            <p className="text-pink-600 font-bold text-xl mb-2">{formatRupiah(item.price)}</p>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>

                            <div className="mt-auto space-y-2">
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>Stok: {item.stock}</span>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`https://wa.me/${item.phone}?text=Halo, saya tertarik dengan ${item.title}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors font-medium text-sm"
                                    >
                                        <MessageCircle size={18} /> Chat
                                    </a>
                                    {item.qrisImageUrl && (
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="Lihat QRIS"
                                        >
                                            <QrCode size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Belum ada barang yang dijual.</p>
                </div>
            )}

            {/* Modal Tambah Barang */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Jual Barang Baru</h3>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                                <input required type="text" className="w-full p-2 border rounded-lg" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                                    <input required type="number" className="w-full p-2 border rounded-lg" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                    <input required type="number" className="w-full p-2 border rounded-lg" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (format: 628...)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input required type="tel" placeholder="628123456789" className="w-full pl-10 p-2 border rounded-lg" value={newItem.phone} onChange={e => setNewItem({...newItem, phone: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea required rows="3" className="w-full p-2 border rounded-lg" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Barang</label>
                                <input required type="file" accept="image/*" onChange={e => setProductImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <input type="checkbox" checked={newItem.hasQris} onChange={e => setNewItem({...newItem, hasQris: e.target.checked})} className="rounded text-pink-500 focus:ring-pink-500" />
                                    Terima Pembayaran QRIS?
                                </label>
                                {newItem.hasQris && (
                                    <input required type="file" accept="image/*" onChange={e => setQrisImage(e.target.files[0])} className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
                                )}
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 disabled:bg-pink-300">
                                {isLoading ? 'Menambahkan...' : 'Mulai Jualan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal QRIS */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold mb-2">Scan QRIS</h3>
                        <p className="text-gray-500 mb-4">Pembayaran untuk {selectedItem.title}</p>
                        <div className="bg-white p-2 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                            <img src={selectedItem.qrisImageUrl} alt="QRIS Code" className="w-64 h-64 object-contain" />
                        </div>
                        <p className="text-sm text-gray-400 mt-4">Tunjukkan bukti transfer ke penjual via WhatsApp.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
