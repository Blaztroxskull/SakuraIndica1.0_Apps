import React, { useState } from 'react';
import { Edit, UploadCloud } from 'lucide-react';

const LaporanKeuangan = ({ isAdmin, subRole, isDemo }) => {
    const [showFinanceModal, setShowFinanceModal] = useState(false);
    const canManage = isAdmin || subRole === 'bendahara' || subRole === 'dankesos';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h2>
                {canManage && (
                    <button onClick={() => setShowFinanceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 shadow-md transition-all">
                        <UploadCloud size={16}/> Upload Laporan (.xlsx)
                    </button>
                )}
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                    <p className="text-lg font-medium">Belum ada laporan keuangan yang dipublikasikan bulan ini.</p>
                    <p className="text-sm">Laporan akan muncul setelah diunggah oleh Bendahara atau Dankesos.</p>
                </div>
            </div>

            {showFinanceModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Upload Laporan Keuangan</h2>
                            <button onClick={() => setShowFinanceModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-pink-300 bg-pink-50 rounded-lg p-8 text-center cursor-pointer hover:bg-pink-100 transition-colors">
                                <UploadCloud className="mx-auto h-12 w-12 text-pink-500 mb-2" />
                                <p className="text-sm text-pink-700 font-semibold">Klik untuk memilih file Excel (.xlsx)</p>
                                <p className="text-xs text-pink-500 mt-1">Maksimal 5MB</p>
                            </div>

                            <button className="w-full py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 shadow-lg transition-transform active:scale-95">
                                Upload & Publikasikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaporanKeuangan;
