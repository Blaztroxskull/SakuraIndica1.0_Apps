import React, { useState } from 'react';
import { Edit } from 'lucide-react';

const LaporanKeuangan = ({ isAdmin }) => {
    const [showFinanceModal, setShowFinanceModal] = useState(false);

    return (
        <div className="space-y-8">
            {isAdmin && (
                <div className="flex justify-end">
                    <button onClick={() => setShowFinanceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">
                        <Edit size={16}/> Kelola Keuangan
                    </button>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Laporan Keuangan</h2>
                <div className="border rounded-lg p-8 text-center text-gray-500">
                    <p>Detail laporan keuangan akan ditampilkan di sini.</p>
                </div>
            </div>

            {showFinanceModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Kelola Keuangan</h2>
                        <p className="mb-4">Fungsi pengelolaan keuangan.</p>
                        <button onClick={() => setShowFinanceModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaporanKeuangan;
