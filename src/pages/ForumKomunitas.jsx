import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const ForumKomunitas = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!userId) return;
        const forumCollectionRef = collection(db, `artifacts/${appId}/public/data/forum`);
        const q = query(forumCollectionRef);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => { msgs.push({ id: doc.id, ...doc.data() }); });
            msgs.sort((a, b) => (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0));
            setMessages(msgs);
        }, (error) => console.error("Kesalahan listener forum:", error));
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !userId) return;
        await addDoc(collection(db, `artifacts/${appId}/public/data/forum`), { text: newMessage, authorId: userId, timestamp: new Date() });
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-md">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Forum Warga</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.authorId === userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.authorId === userId ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm font-bold mb-1">{msg.authorId === userId ? 'Anda' : `Warga ${msg.authorId.substring(0, 6)}...`}</p>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.authorId === userId ? 'text-pink-100' : 'text-gray-500'} text-right`}>
                                    {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan Anda..." className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent" />
                    <button type="submit" className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">Kirim</button>
                </form>
            </div>
        </div>
    );
};

export default ForumKomunitas;
