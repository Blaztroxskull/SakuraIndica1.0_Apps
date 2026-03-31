import React, { useState } from 'react';
import { CheckCircle, Trash2, PlusCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';
import FileUpload from '../components/FileUpload';

const RegistrasiWarga = ({ userId, isDemo }) => {
    const [formData, setFormData] = useState({
        username: '',
        namaLengkap: '',
        gender: '',
        familyStatus: '',
        alamatKTP: '',
        alamatCluster: '',
        telepon: ['', '', ''],
        email: '',
        statusKawin: 'lajang',
        agama: '',
        pekerjaan: '',
        anggotaKeluarga: [],
        statusMenetap: 'menetap',
        statusRumah: 'pribadi',
        infoSewa: { durasi: '', namaPemilik: '', hpPemilik: '' },
        kendaraan: [],
        hobi: '',
        kontakDarurat: { nama: '', hubungan: '', telepon: '' }
    });
    const [ktpFile, setKtpFile] = useState(null);
    const [kkFile, setKkFile] = useState(null);
    const [fileErrors, setFileErrors] = useState({ ktp: '', kk: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleNestedChange = (group, name, value) => { setFormData(prev => ({ ...prev, [group]: { ...prev[group], [name]: value } })); };
    const handleDynamicListChange = (listName, index, name, value) => { const list = [...formData[listName]]; if (name === null) { list[index] = value; } else { list[index][name] = value; } setFormData(prev => ({ ...prev, [listName]: list })); };
    const handleAddToList = (listName, newItem) => { setFormData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] })); };
    const handleRemoveFromList = (listName, index) => { const list = [...formData[listName]]; list.splice(index, 1); setFormData(prev => ({ ...prev, [listName]: list })); };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.username || !formData.namaLengkap || !formData.alamatCluster || !formData.email) { setError('Mohon isi kolom yang wajib diisi (Username, Nama, Alamat Cluster, Email).'); return; }
        if (!ktpFile || !kkFile) { setError('Mohon lampirkan foto KTP dan Kartu Keluarga.'); return; }

        // Specific Validations
        if (formData.username.length > 12) { setError('Username maksimal 12 karakter.'); return; }
        if (formData.namaLengkap.length > 20) { setError('Nama Lengkap maksimal 20 karakter.'); return; }
        if (formData.namaLengkap.trim().split(/\s+/).length > 2) { setError('Nama Lengkap maksimal 2 kata.'); return; }

        setIsLoading(true); setError('');

        if (isDemo) {
            setTimeout(() => {
                setIsSuccess(true);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const ktpStorageRef = ref(storage, `registrations/${userId}/ktp_${Date.now()}_${ktpFile.name}`);
            await uploadBytes(ktpStorageRef, ktpFile);
            const ktpUrl = await getDownloadURL(ktpStorageRef);
            const kkStorageRef = ref(storage, `registrations/${userId}/kk_${Date.now()}_${kkFile.name}`);
            await uploadBytes(kkStorageRef, kkFile);
            const kkUrl = await getDownloadURL(kkStorageRef);

            // Add initial fields for user management
            const submissionData = {
                ...formData,
                ktpUrl,
                kkUrl,
                registeredBy: userId,
                createdAt: new Date(),
                failedLoginAttempts: 0,
                isLocked: false,
                role: 'Warga' // Default role
            };

            await addDoc(collection(db, `artifacts/${appId}/public/data/registrations`), submissionData);
            setIsSuccess(true);
        } catch (err) { console.error("Error submitting registration:", err); setError('Gagal mengirim data registrasi. Silakan coba lagi.'); } finally { setIsLoading(false); }
    };

    if (isSuccess) { return (<div className="bg-white p-8 rounded-xl shadow-md text-center"><CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h2><p className="text-gray-600 mb-6">Data Anda telah diterima. Terima kasih telah melapor diri sebagai warga baru.</p><button onClick={() => window.location.reload()} className="px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600">Kembali ke Dashboard</button></div>); }

    const FormSection = ({ title, children }) => (<div className="bg-gray-50 p-6 rounded-lg border border-gray-200"><h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h3><div className="space-y-4">{children}</div></div>);
    const InputField = ({ label, name, value, onChange, placeholder, type = 'text', maxLength }) => (<div><label className="text-sm font-medium text-gray-600 block mb-1">{label}</label><input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400" /></div>);

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Formulir Registrasi Warga Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <FormSection title="Data Diri & Dokumen">
                    <InputField label="Username (Max 12 Karakter)" name="username" value={formData.username} onChange={handleInputChange} placeholder="Username unik" maxLength={12} />
                    <InputField label="Nama Lengkap (Max 20 Huruf, Max 2 Kata)" name="namaLengkap" value={formData.namaLengkap} onChange={handleInputChange} placeholder="Nama Lengkap" maxLength={20} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Jenis Kelamin</label>
                            <div className="flex space-x-4 mt-2">
                                <label className="flex items-center">
                                    <input type="radio" name="gender" value="Laki-laki" checked={formData.gender === 'Laki-laki'} onChange={handleInputChange} className="mr-2 text-pink-600 focus:ring-pink-500" />
                                    <span>Laki-laki</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="gender" value="Perempuan" checked={formData.gender === 'Perempuan'} onChange={handleInputChange} className="mr-2 text-pink-600 focus:ring-pink-500" />
                                    <span>Perempuan</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Status Keluarga</label>
                            <select name="familyStatus" value={formData.familyStatus} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                                <option value="">Pilih Status</option>
                                <option value="Kepala Keluarga">Kepala Keluarga / Head of Family</option>
                                <option value="Istri">Istri / Wife</option>
                                <option value="Anak">Anak / Child</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUpload label="Foto KTP" onFileSelect={(file, err) => { setKtpFile(file); setFileErrors(p => ({...p, ktp: err})); }} selectedFile={ktpFile} error={fileErrors.ktp} />
                        <FileUpload label="Foto Kartu Keluarga" onFileSelect={(file, err) => { setKkFile(file); setFileErrors(p => ({...p, kk: err})); }} selectedFile={kkFile} error={fileErrors.kk} />
                    </div>
                    <InputField label="Alamat (sesuai KTP)" name="alamatKTP" value={formData.alamatKTP} onChange={handleInputChange} placeholder="Alamat KTP" />
                    <InputField label="Alamat Cluster Sakura Indica" name="alamatCluster" value={formData.alamatCluster} onChange={handleInputChange} placeholder="Blok dan Nomor Rumah" />
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Nomor Handphone</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {formData.telepon.map((phone, index) => (<input key={index} type="tel" value={phone} onChange={(e) => handleDynamicListChange('telepon', index, null, e.target.value)} placeholder={`Nomor HP ${index + 1}${index > 0 ? ' (Opsional)' : ''}`} className="w-full p-2 border border-gray-300 rounded-md" />))}
                        </div>
                    </div>
                    <InputField label="Alamat Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contoh@email.com" type="email" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Status Perkawinan</label>
                            <select name="statusKawin" value={formData.statusKawin} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                                <option value="lajang">Lajang</option>
                                <option value="menikah">Menikah</option>
                            </select>
                        </div>
                        <InputField label="Agama" name="agama" value={formData.agama} onChange={handleInputChange} placeholder="Contoh: Islam" />
                    </div>
                    <InputField label="Jenis Pekerjaan" name="pekerjaan" value={formData.pekerjaan} onChange={handleInputChange} placeholder="Contoh: Karyawan Swasta" />
                    <InputField label="Hobi" name="hobi" value={formData.hobi} onChange={handleInputChange} placeholder="Contoh: Membaca, Olahraga" />
                </FormSection>

                <FormSection title="Data Anggota Keluarga">
                    {formData.anggotaKeluarga.map((member, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md items-center">
                            <input value={member.nama} onChange={(e) => handleDynamicListChange('anggotaKeluarga', index, 'nama', e.target.value)} placeholder="Nama Anggota Keluarga" className="w-full p-2 border border-gray-200 rounded-md" />
                            <div className="flex items-center gap-2">
                                <input value={member.nik} onChange={(e) => handleDynamicListChange('anggotaKeluarga', index, 'nik', e.target.value)} placeholder="NIK" className="w-full p-2 border border-gray-200 rounded-md" />
                                <button type="button" onClick={() => handleRemoveFromList('anggotaKeluarga', index)} className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddToList('anggotaKeluarga', { nama: '', nik: '' })} className="flex items-center gap-2 text-sm text-pink-600 font-semibold">
                        <PlusCircle size={16} /> Tambah Anggota Keluarga
                    </button>
                </FormSection>

                <FormSection title="Status Tinggal & Kendaraan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Status Tinggal</label>
                            <select name="statusMenetap" value={formData.statusMenetap} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                                <option value="menetap">Menetap</option>
                                <option value="sementara">Sementara/Kontrak</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Status Rumah</label>
                            <select name="statusRumah" value={formData.statusRumah} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md">
                                <option value="pribadi">Milik Pribadi</option>
                                <option value="sewa">Sewa</option>
                            </select>
                        </div>
                    </div>
                    {formData.statusRumah === 'sewa' && (
                        <div className="p-4 border-l-4 border-pink-400 bg-pink-50 rounded-r-lg space-y-2">
                            <h4 className="font-semibold">Informasi Pemilik Sewa</h4>
                            <InputField label="Durasi Sewa" name="durasi" value={formData.infoSewa.durasi} onChange={(e) => handleNestedChange('infoSewa', 'durasi', e.target.value)} placeholder="Contoh: 1 Tahun" />
                            <InputField label="Nama Pemilik Unit" name="namaPemilik" value={formData.infoSewa.namaPemilik} onChange={(e) => handleNestedChange('infoSewa', 'namaPemilik', e.target.value)} placeholder="Nama sesuai KTP" />
                            <InputField label="Nomor HP Pemilik" name="hpPemilik" value={formData.infoSewa.hpPemilik} onChange={(e) => handleNestedChange('infoSewa', 'hpPemilik', e.target.value)} placeholder="0812..." />
                        </div>
                    )}
                </FormSection>

                <FormSection title="Data Kendaraan">
                    {formData.kendaraan.map((v, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md items-center">
                            <select value={v.jenis} onChange={(e) => handleDynamicListChange('kendaraan', index, 'jenis', e.target.value)} className="w-full p-2 border border-gray-200 rounded-md">
                                <option value="">Pilih Jenis</option>
                                <option value="Mobil">Mobil</option>
                                <option value="Motor">Motor</option>
                                <option value="Sepeda">Sepeda</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <input value={v.plat} onChange={(e) => handleDynamicListChange('kendaraan', index, 'plat', e.target.value)} placeholder="No. Plat / Keterangan" className="w-full p-2 border border-gray-200 rounded-md" />
                                <button type="button" onClick={() => handleRemoveFromList('kendaraan', index)} className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddToList('kendaraan', { jenis: '', plat: '' })} className="flex items-center gap-2 text-sm text-pink-600 font-semibold">
                        <PlusCircle size={16} /> Tambah Kendaraan
                    </button>
                </FormSection>

                <FormSection title="Kontak Darurat">
                    <InputField label="Nama Kontak Darurat" name="nama" value={formData.kontakDarurat.nama} onChange={(e) => handleNestedChange('kontakDarurat', 'nama', e.target.value)} placeholder="Nama" />
                    <InputField label="Hubungan" name="hubungan" value={formData.kontakDarurat.hubungan} onChange={(e) => handleNestedChange('kontakDarurat', 'hubungan', e.target.value)} placeholder="Contoh: Orang Tua, Saudara" />
                    <InputField label="Nomor Telepon Darurat" name="telepon" value={formData.kontakDarurat.telepon} onChange={(e) => handleNestedChange('kontakDarurat', 'telepon', e.target.value)} placeholder="0812..." />
                </FormSection>

                {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}

                <div className="pt-5">
                    <button type="submit" disabled={isLoading} className="w-full px-6 py-4 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:bg-pink-300 flex items-center justify-center text-lg">
                        {isLoading ? 'Mengirim Data...' : 'Kirim Registrasi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrasiWarga;
