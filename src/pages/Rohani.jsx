import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const Rohani = ({ subRole, isAdmin, isDemo }) => {
    const [articles, setArticles] = useState([]);
    const [newArticle, setNewArticle] = useState({ title: '', content: '' });
    const canManage = isAdmin || subRole === 'kerohanian';

    useEffect(() => {
        if (isDemo) {
            setArticles([
                { id: '1', title: 'Kajian Rutin Malam Jumat', content: 'Dihadiri oleh Ustadz Fulan...', date: '2023-10-25' },
                { id: '2', title: 'Persiapan Idul Fitri', content: 'Panitia Zakat Fitrah sudah dibentuk...', date: '2023-10-20' },
            ]);
            return;
        }

        const q = query(collection(db, `artifacts/${appId}/public/data/rohani`), orderBy('date', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArticles(data);
        });
        return () => unsubscribe();
    }, [isDemo]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newArticle.title || !newArticle.content) return;
        if (isDemo) {
            setArticles([{ id: Date.now().toString(), ...newArticle, date: new Date().toISOString().split('T')[0] }, ...articles]);
            setNewArticle({ title: '', content: '' });
            return;
        }
        await addDoc(collection(db, `artifacts/${appId}/public/data/rohani`), {
            ...newArticle,
            date: new Date().toISOString(),
            author: 'Kerohanian'
        });
        setNewArticle({ title: '', content: '' });
    };

    const handleDelete = async (id) => {
        if (isDemo) {
            setArticles(articles.filter(a => a.id !== id));
            return;
        }
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/rohani`, id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <BookOpen className="text-pink-500" /> Kerohanian
                    </h2>
                    <p className="text-gray-500">Artikel dan informasi seputar kegiatan keagamaan.</p>
                </div>
            </div>

            {canManage && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Upload Artikel Baru</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <input
                            placeholder="Judul Artikel"
                            className="w-full p-2 border rounded"
                            value={newArticle.title}
                            onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                        />
                        <textarea
                            placeholder="Isi Artikel..."
                            className="w-full p-2 border rounded h-32"
                            value={newArticle.content}
                            onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                        />
                        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-pink-600">
                            <Upload size={16} /> Publikasikan
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map(article => (
                    <div key={article.id} className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{article.title}</h3>
                                {canManage && (
                                    <button onClick={() => handleDelete(article.id)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.content}</p>
                        </div>
                        <div className="text-xs text-gray-400 mt-2 border-t pt-2">
                            Diposting: {article.date ? new Date(article.date).toLocaleDateString('id-ID') : 'Baru saja'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rohani;
