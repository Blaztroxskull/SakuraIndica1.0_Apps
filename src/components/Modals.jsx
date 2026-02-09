import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export const AdminLoginModal = ({ show, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');

        let email = username;
        // Basic mapping if user enters username instead of email
        if (!email.includes('@')) {
             email = `${username}@sakuraindica.com`.toLowerCase();
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
            setUsername('');
            setPassword('');
            setError('');
        } catch (err) {
            console.error("Login failed:", err);
            setError('Login gagal. Periksa username/email dan password Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title="Login Administrator">
            <div className="p-4 space-y-4">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email atau Username" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button onClick={handleLogin} disabled={isLoading} className="w-full px-6 py-3 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:bg-pink-400">
                    {isLoading ? 'Memproses...' : 'Login'}
                </button>
            </div>
        </Modal>
    );
};

export const ConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{title}</h2>
                <p className="text-gray-700 mb-8">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Batal</button>
                    <button onClick={onConfirm} className="px-8 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Ya, Aktifkan!</button>
                </div>
            </div>
        </div>
    );
};
