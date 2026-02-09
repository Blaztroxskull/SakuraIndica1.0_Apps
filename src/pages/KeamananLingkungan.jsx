import React, { useState, useEffect } from 'react';
import { Siren, Video, Phone } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

const KeamananLingkungan = ({ onTriggerPanic }) => {
    const [cctvLink, setCctvLink] = useState('#');

    useEffect(() => {
        const cctvRef = doc(db, `artifacts/${appId}/public/data/config`, 'cctvLink');
        const unsubscribe = onSnapshot(cctvRef, (docSnap) => {
            if (docSnap.exists()) {
                setCctvLink(docSnap.data().url || '#');
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tombol Panik (S.O.S)</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Gunakan tombol ini HANYA dalam keadaan darurat (misal: perampokan, kebakaran, medis darurat). Menekan tombol akan mengaktifkan alarm dan mengirim notifikasi ke seluruh warga.</p>
                <button onClick={onTriggerPanic} className="bg-red-600 text-white rounded-full w-48 h-48 flex flex-col items-center justify-center mx-auto shadow-2xl hover:bg-red-700 transition-transform transform hover:scale-105 active:scale-100 animate-pulse-slow">
                    <Siren size={64} />
                    <span className="text-2xl font-bold mt-2">TEKAN DI SINI</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Video className="mr-3 text-blue-500"/> Pantau CCTV
                    </h3>
                    <p className="text-gray-600 mb-4">Akses siaran langsung dari CCTV yang terpasang di lingkungan kita.</p>
                    <a href={cctvLink} target="_blank" rel="noopener noreferrer" className={`w-full block text-center py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 ${cctvLink === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {cctvLink === '#' ? 'Tautan Belum Tersedia' : 'Buka Tautan CCTV'}
                    </a>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Phone className="mr-3 text-green-500"/> Kontak Darurat
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                        <li><strong>Keamanan Cluster:</strong> 021-123-4567</li>
                        <li><strong>Polsek Setempat:</strong> 021-789-1011</li>
                        <li><strong>Ambulans:</strong> 118</li>
                        <li><strong>Pemadam Kebakaran:</strong> 113</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default KeamananLingkungan;
