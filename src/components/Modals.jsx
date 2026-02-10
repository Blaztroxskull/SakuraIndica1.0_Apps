import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, increment, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
    const [showPassword, setShowPassword] = useState(false);
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
            // Attempt login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if locked
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.isLocked) {
                    await signOut(auth);
                    setError('Akun Anda terkunci. Hubungi Super Admin.');
                    setIsLoading(false);
                    return;
                }

                // Reset failed attempts on success
                await updateDoc(userRef, { failedLoginAttempts: 0 });
            }

            onClose();
            setUsername('');
            setPassword('');
            setError('');
        } catch (err) {
            console.error("Login failed:", err);

            // Handle Failed Attempts Logic
            // Note: This requires 'users' collection to be queryable/writable by unauthenticated users for this specific flow
            // or we use a Cloud Function. Implementing client-side best effort.
            try {
                const q = query(collection(db, 'users'), where('email', '==', email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const currentAttempts = (userDoc.data().failedLoginAttempts || 0) + 1;

                    await updateDoc(userDoc.ref, {
                        failedLoginAttempts: increment(1),
                        isLocked: currentAttempts >= 3
                    });

                    if (currentAttempts >= 3) {
                        setError('Akun Anda telah dikunci karena terlalu banyak percobaan gagal.');
                    } else {
                        setError(`Password salah. Sisa percobaan: ${3 - currentAttempts}`);
                    }
                } else {
                     setError('Login gagal. Periksa username/email dan password Anda.');
                }
            } catch (updateErr) {
                // Fallback if permission denied
                 setError('Login gagal. Periksa username/email dan password Anda.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title="Login Administrator">
            <div className="p-4 space-y-4">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email atau Username" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" />
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
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

export const SecurityWarningModal = ({ show, onClose, onSend, username }) => {
    const [message, setMessage] = useState('');
    const [blockUser, setBlockUser] = useState(false);

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} title="Peringatan Keamanan">
            <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-700">
                        Anda akan mengirim peringatan kepada <strong>{username}</strong>.
                    </p>
                </div>
                <textarea
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    placeholder="Isi pesan peringatan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="blockUser"
                        checked={blockUser}
                        onChange={(e) => setBlockUser(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="blockUser" className="text-sm font-medium text-red-700">Blokir akun ini secara permanen</label>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>
                    <button
                        onClick={() => onSend(message, blockUser)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Kirim & Terapkan
                    </button>
                </div>
            </div>
        </Modal>
    );
};
