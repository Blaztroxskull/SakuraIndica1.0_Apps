import React, { useState } from 'react';
import { FileText, Building2, HeartHandshake, LifeBuoy, UploadCloud, X, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';

const LayananModal = ({ service, onClose, userId }) => {
    if (!service) return null;
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
            setError('Ukuran file tidak boleh lebih dari 5MB.');
            setFile(null);
        } else {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Mohon lampirkan dokumen pendukung.'); return; }
        setIsLoading(true); setError('');
        try {
            const storageRef = ref(storage, `attachments/${userId}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await addDoc(collection(db, `artifacts/${appId}/public/data/service_requests`), {
                userId: userId,
                serviceName: service.name,
                notes: notes,
                attachmentURL: downloadURL,
                fileName: file.name,
                status: 'pending',
                requestedAt: new Date()
            });
            setIsSuccess(true);
        } catch (err) {
            console.error("Error submitting request:", err);
            setError('Gagal mengirim permohonan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
                    <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Permohonan Terkirim!</h2>
                    <p className="text-gray-600 mb-6">Pengurus RT akan segera memproses permohonan Anda. Terima kasih.</p>
                    <button onClick={onClose} className="w-full px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600">Tutup</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h2>
                    <p className="text-gray-600 mb-6">Lengkapi data di bawah ini untuk mengajukan permohonan.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="font-semibold text-gray-700 block mb-2">Dokumen Pendukung</label>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                <strong>Syarat:</strong> {service.docs}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-700 block mb-2">Lampirkan Dokumen</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none">
                                            <span>Pilih file untuk diunggah</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF hingga 5MB</p>
                                </div>
                            </div>
                            {file && <p className="mt-2 text-sm text-gray-600">File terpilih: {file.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="notes" className="font-semibold text-gray-700 block mb-2">Catatan (Opsional)</label>
                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Contoh: Mohon diproses secepatnya untuk keperluan..."></textarea>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:bg-pink-300 flex items-center justify-center">
                                {isLoading ? 'Mengirim...' : 'Kirim Permohonan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const LayananSurat = ({ userId }) => {
    const [selectedService, setSelectedService] = useState(null);
    const suratList = [
        { name: 'Surat Pengantar (Umum)', icon: FileText, docs: 'KTP, Kartu Keluarga, dan dokumen pendukung.' },
        { name: 'Surat Keterangan Domisili', icon: Building2, docs: 'KTP, Kartu Keluarga, bukti kepemilikan/sewa rumah, SKP (Surat Keterangan Pindah) dari domisili sebelumnya, dan dokumen pendukung.' },
        { name: 'Surat Izin Numpang Nikah', icon: HeartHandshake, docs: 'KTP & KK kedua calon, Surat Pengantar dari RT/RW asal, dokumen terkait lainnya dari KUA, dan dokumen pendukung.' },
        { name: 'Lapor Keluhan/Pengaduan', icon: LifeBuoy, docs: 'Foto atau video bukti keluhan/pengaduan (jika ada) dan dokumen pendukung.' }
    ];

    const handleServiceClick = (service) => {
        if (!userId) {
            alert("Gagal mendapatkan ID pengguna. Mohon muat ulang halaman.");
            return;
        }
        setSelectedService(service);
    };

    return (
        <>
            {selectedService && <LayananModal service={selectedService} onClose={() => setSelectedService(null)} userId={userId} />}
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Layanan Administrasi Warga</h2>
                <p className="text-gray-600 mb-6">Pilih jenis layanan yang Anda butuhkan. Anda dapat langsung melampirkan dokumen pendukung melalui aplikasi.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suratList.map((surat, index) => (
                        <button key={index} onClick={() => handleServiceClick(surat)} className="bg-gray-50 p-6 rounded-lg flex items-center text-left hover:bg-pink-100 hover:shadow-lg transition-all duration-200">
                            <surat.icon size={32} className="text-pink-500 mr-5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-lg text-gray-700">{surat.name}</h3>
                                <p className="text-sm text-pink-600">Klik untuk mengajukan permohonan</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                    <h4 className="font-bold">Alur Proses Baru:</h4>
                    <ol className="list-decimal list-inside mt-2 text-sm">
                        <li>Pilih jenis layanan yang dibutuhkan.</li>
                        <li>Isi formulir dan lampirkan dokumen pendukung langsung di aplikasi.</li>
                        <li>Klik "Kirim Permohonan". Data Anda akan tercatat secara otomatis.</li>
                        <li>Pengurus RT akan menerima notifikasi dan memproses permohonan Anda.</li>
                    </ol>
                </div>
            </div>
        </>
    );
};

export default LayananSurat;
