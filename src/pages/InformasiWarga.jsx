import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';
import { dummyInfo } from '../lib/dummyData';

const InformasiWarga = ({ userId, isAdmin, isDemo }) => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isDemo) {
            setPosts(dummyInfo);
            return;
        }

        if (!userId) return;
        const infoCollectionRef = collection(db, `artifacts/${appId}/public/data/informasi`);
        // Limit to latest 20 posts for performance with 450+ families
        const q = query(infoCollectionRef, orderBy('timestamp', 'desc'), limit(20));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const infoData = [];
            querySnapshot.forEach((doc) => { infoData.push({ id: doc.id, ...doc.data() }); });
            // Sort client-side redundant if query ordered, but safe to keep for consistency
            infoData.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
            setPosts(infoData);
        }, (error) => console.error("Kesalahan listener informasi:", error));
        return () => unsubscribe();
    }, [userId, isDemo]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (newPost.trim() === '' || !userId) return;
        setIsLoading(true);

        let attachmentURL = '';
        let attachmentType = '';

        if (attachmentFile) {
            const storageRef = ref(storage, `informasi/${Date.now()}_${attachmentFile.name}`);
            await uploadBytes(storageRef, attachmentFile);
            attachmentURL = await getDownloadURL(storageRef);
            attachmentType = attachmentFile.type;
        }

        await addDoc(collection(db, `artifacts/${appId}/public/data/informasi`), {
            content: newPost,
            author: `Pengurus RT`,
            timestamp: new Date(),
            attachmentURL,
            attachmentType
        });

        setNewPost('');
        setAttachmentFile(null);
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi & Himbauan Pengurus</h2>
            {isAdmin && (
                <form onSubmit={handlePostSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
                    <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Tulis pengumuman baru..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent" rows="3"></textarea>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lampirkan File (Opsional)</label>
                        <input type="file" onChange={(e) => setAttachmentFile(e.target.files[0])} accept="image/png, image/jpeg, application/pdf" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>
                        {attachmentFile && <p className="text-xs text-gray-500 mt-1">File: {attachmentFile.name}</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className="mt-4 px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-pink-300">
                        {isLoading ? "Mengirim..." : "Kirim Informasi"}
                    </button>
                </form>
            )}
            <div className="space-y-6">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                        {post.attachmentURL && (
                            <div className="mt-4">
                                {post.attachmentType && post.attachmentType.startsWith('image/') ? (
                                    <img src={post.attachmentURL} alt="Lampiran" className="rounded-lg max-w-full h-auto md:max-w-md" />
                                ) : (
                                    <a href={post.attachmentURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200">
                                        <Download size={16} /> Unduh Dokumen (PDF)
                                    </a>
                                )}
                            </div>
                        )}
                        <div className="text-right text-xs text-gray-500 mt-3">
                            <span>{post.author}</span> - <span>{post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString('id-ID') : 'Baru saja'}</span>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500">Belum ada informasi terbaru.</p>
                )}
            </div>
        </div>
    );
};

export default InformasiWarga;
