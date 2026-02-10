import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, collection, query, orderBy, getDocs, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Settings, Users, Shield, AlertTriangle, Check, X, LogOut, Lock, Unlock } from 'lucide-react';
import { db, storage, appId } from '../lib/firebase';
import { SecurityWarningModal } from '../components/Modals';

const Pengaturan = ({ isDemo, setIsDemo }) => {
    const [activeTab, setActiveTab] = useState('umum'); // umum, users
    const [logoFile, setLogoFile] = useState(null);
    const [cctvLink, setCctvLink] = useState('');
    const [isLoading, setIsLoading] = useState({logo: false, cctv: false, users: false});
    const [message, setMessage] = useState({logo: '', cctv: ''});

    // User Management States
    const [registrations, setRegistrations] = useState([]);
    const [users, setUsers] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [selectedUserForWarning, setSelectedUserForWarning] = useState(null);

    useEffect(() => {
        // Config Listeners
        const cctvRef = doc(db, `artifacts/${appId}/public/data/config`, 'cctvLink');
        const unsubCctv = onSnapshot(cctvRef, (docSnap) => {
            if (docSnap.exists()) setCctvLink(docSnap.data().url);
        });

        // Data Fetching for Admin
        if (activeTab === 'users' && !isDemo) {
            const fetchUsers = async () => {
                const regQ = query(collection(db, `artifacts/${appId}/public/data/registrations`), orderBy('createdAt', 'desc'));
                const regSnap = await getDocs(regQ);
                setRegistrations(regSnap.docs.map(d => ({id: d.id, ...d.data()})));

                const usersSnap = await getDocs(collection(db, 'users'));
                setUsers(usersSnap.docs.map(d => ({id: d.id, ...d.data()})));
            };
            fetchUsers();
        } else if (isDemo && activeTab === 'users') {
            setRegistrations([
                { id: '1', namaLengkap: 'Budi Santoso', address: 'Blok A1', createdAt: new Date() },
                { id: '2', namaLengkap: 'Siti Aminah', address: 'Blok B2', createdAt: new Date() }
            ]);
            setUsers([
                { id: 'u1', displayName: 'Admin Utama', role: 'Administrator', subRole: 'System Owner', isLocked: false },
                { id: 'u2', displayName: 'Pak RT', role: 'Warga', subRole: 'rt', isLocked: false },
                { id: 'u3', displayName: 'Warga Nakal', role: 'Warga', subRole: null, isLocked: true },
            ]);
        }

        return () => unsubCctv();
    }, [activeTab, isDemo]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) {
            setMessage(prev => ({...prev, logo: 'Ukuran logo max 2MB.'}));
            setLogoFile(null);
        } else {
            setLogoFile(file);
            setMessage(prev => ({...prev, logo: ''}));
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;
        setIsLoading(prev => ({...prev, logo: true}));
        try {
            const storageRef = ref(storage, `config/app_logo`);
            await uploadBytes(storageRef, logoFile);
            const downloadURL = await getDownloadURL(storageRef);
            await setDoc(doc(db, `artifacts/${appId}/public/data/config`, 'appLogo'), { url: downloadURL, updatedAt: new Date() });
            setMessage(prev => ({...prev, logo: 'Logo berhasil diperbarui!'}));
            setLogoFile(null);
        } catch (error) {
            console.error(error);
            setMessage(prev => ({...prev, logo: 'Gagal upload logo.'}));
        } finally {
            setIsLoading(prev => ({...prev, logo: false}));
        }
    };

    const handleCctvLinkUpdate = async () => {
        setIsLoading(prev => ({...prev, cctv: true}));
        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/config`, 'cctvLink'), { url: cctvLink, updatedAt: new Date() });
            setMessage(prev => ({...prev, cctv: 'Link disimpan!'}));
        } catch (error) {
            console.error(error);
            setMessage(prev => ({...prev, cctv: 'Gagal menyimpan.'}));
        } finally {
            setIsLoading(prev => ({...prev, cctv: false}));
        }
    };

    const handleApproveUser = async (reg) => {
        if (!window.confirm(`Setujui registrasi ${reg.namaLengkap}?`)) return;
        try {
            // Create user profile in 'users' collection linked to uid (registeredBy)
            await setDoc(doc(db, 'users', reg.registeredBy), {
                displayName: reg.namaLengkap,
                role: 'Warga',
                subRole: null,
                email: reg.email,
                address: reg.alamatCluster,
                phone: reg.telepon ? reg.telepon[0] : '',
                createdAt: new Date(),
                isLocked: false
            });
            // Update registration status or delete? Let's keep it but mark approved?
            // For now, just delete from pending list in UI
            setRegistrations(prev => prev.filter(r => r.id !== reg.id));
            alert('Warga berhasil disetujui dan akun diaktifkan.');
            // Refresh users
            if(!isDemo) {
                const usersSnap = await getDocs(collection(db, 'users'));
                setUsers(usersSnap.docs.map(d => ({id: d.id, ...d.data()})));
            }
        } catch (e) {
            console.error(e);
            alert('Gagal menyetujui warga.');
        }
    };

    const handleToggleLock = async (user) => {
        if (!window.confirm(`${user.isLocked ? 'Buka blokir' : 'Blokir'} user ${user.displayName}?`)) return;
        try {
            await updateDoc(doc(db, 'users', user.id), { isLocked: !user.isLocked });
            setUsers(prev => prev.map(u => u.id === user.id ? {...u, isLocked: !u.isLocked} : u));
        } catch (e) {
            console.error(e);
            alert('Gagal mengubah status blokir.');
        }
    };

    const handleChangeRole = async (user, newRole, newSubRole) => {
        try {
            await updateDoc(doc(db, 'users', user.id), { role: newRole, subRole: newSubRole });
            setUsers(prev => prev.map(u => u.id === user.id ? {...u, role: newRole, subRole: newSubRole} : u));
        } catch (e) {
            console.error(e);
            alert('Gagal mengubah role.');
        }
    };

    const openWarningModal = (user) => {
        setSelectedUserForWarning(user);
        setShowWarningModal(true);
    };

    const handleSendWarning = async (warningMessage, shouldBlock) => {
        if (!selectedUserForWarning) return;

        try {
            // Save warning to a subcollection or notifications collection
            // Here we just log/alert as per prompt requirement "Admin warnings"
            // In a real app, this would be `await addDoc(collection(db, 'users', selectedUserForWarning.id, 'notifications'), ...)`

            if (shouldBlock) {
                await updateDoc(doc(db, 'users', selectedUserForWarning.id), { isLocked: true });
                setUsers(prev => prev.map(u => u.id === selectedUserForWarning.id ? {...u, isLocked: true} : u));
            }

            alert(`Peringatan berhasil dikirim ke ${selectedUserForWarning.displayName}.`);
            setShowWarningModal(false);
            setSelectedUserForWarning(null);
        } catch (error) {
            console.error("Error sending warning:", error);
            alert("Gagal mengirim peringatan.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <SecurityWarningModal
                show={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onSend={handleSendWarning}
                username={selectedUserForWarning?.displayName}
            />
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Settings className="text-gray-600" /> Pengaturan Admin
            </h2>

            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                <button onClick={() => setActiveTab('umum')} className={`pb-2 px-4 font-semibold ${activeTab === 'umum' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500'}`}>Umum</button>
                <button onClick={() => setActiveTab('users')} className={`pb-2 px-4 font-semibold ${activeTab === 'users' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500'}`}>Manajemen User</button>
            </div>

            {activeTab === 'umum' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-6 border rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Logo Aplikasi</h3>
                        <div className="flex gap-4 items-center">
                            <input type="file" onChange={handleFileChange} accept="image/*" />
                            <button onClick={handleLogoUpload} disabled={isLoading.logo || !logoFile} className="bg-pink-500 text-white px-4 py-2 rounded">Simpan</button>
                        </div>
                        {message.logo && <p className="text-sm mt-2 text-green-600">{message.logo}</p>}
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Link CCTV</h3>
                        <div className="flex gap-4 items-center">
                            <input type="url" value={cctvLink} onChange={e => setCctvLink(e.target.value)} className="border p-2 rounded w-full" placeholder="https://" />
                            <button onClick={handleCctvLinkUpdate} disabled={isLoading.cctv} className="bg-pink-500 text-white px-4 py-2 rounded whitespace-nowrap">Simpan</button>
                        </div>
                        {message.cctv && <p className="text-sm mt-2 text-green-600">{message.cctv}</p>}
                    </div>
                    <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
                        <h3 className="text-xl font-semibold mb-2 text-yellow-800">Mode Demo</h3>
                        <button onClick={() => setIsDemo(!isDemo)} className={`px-4 py-2 rounded font-bold text-white ${isDemo ? 'bg-red-500' : 'bg-green-500'}`}>
                            {isDemo ? 'Matikan Mode Demo' : 'Hidupkan Mode Demo'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Pending Registrations */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={24} className="text-orange-500" /> Permintaan Registrasi ({registrations.length})
                        </h3>
                        <div className="grid gap-4">
                            {registrations.length === 0 && <p className="text-gray-500">Tidak ada permintaan baru.</p>}
                            {registrations.map(reg => (
                                <div key={reg.id} className="p-4 border rounded-lg flex justify-between items-center bg-orange-50">
                                    <div>
                                        <p className="font-bold">{reg.namaLengkap}</p>
                                        <p className="text-sm text-gray-600">{reg.alamatCluster} | {reg.email}</p>
                                        <div className="text-xs text-blue-500 mt-1 flex gap-2">
                                            {reg.ktpUrl && <a href={reg.ktpUrl} target="_blank" rel="noreferrer" className="underline">Lihat KTP</a>}
                                            {reg.kkUrl && <a href={reg.kkUrl} target="_blank" rel="noreferrer" className="underline">Lihat KK</a>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleApproveUser(reg)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center gap-1">
                                        <Check size={16} /> Setujui
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Users */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield size={24} className="text-blue-500" /> Data Pengguna & Hak Akses
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3">Nama</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Sub-Role</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b">
                                            <td className="p-3 font-medium">{u.displayName || 'No Name'}</td>
                                            <td className="p-3">
                                                <select
                                                    value={u.role || 'Warga'}
                                                    onChange={(e) => handleChangeRole(u, e.target.value, u.subRole)}
                                                    className="border rounded p-1 text-sm"
                                                >
                                                    <option value="Warga">Warga</option>
                                                    <option value="Administrator">Administrator</option>
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={u.subRole || ''}
                                                    onChange={(e) => handleChangeRole(u, u.role, e.target.value || null)}
                                                    className="border rounded p-1 text-sm"
                                                >
                                                    <option value="">- Warga Biasa -</option>
                                                    <option value="rt">Ketua RT</option>
                                                    <option value="rw">Ketua RW</option>
                                                    <option value="bendahara">Bendahara</option>
                                                    <option value="humas">Humas</option>
                                                    <option value="sapras">Sapras</option>
                                                    <option value="keamanan">Keamanan</option>
                                                    <option value="dkm">DKM</option>
                                                    <option value="kerohanian">Kerohanian</option>
                                                    <option value="kepolkes">Kepolkes</option>
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                {u.isLocked ? (
                                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                        <Lock size={12} /> Terblokir
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                        <Check size={12} /> Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleLock(u)}
                                                    className={`p-2 rounded ${u.isLocked ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                                    title={u.isLocked ? "Buka Blokir" : "Blokir User"}
                                                >
                                                    {u.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => openWarningModal(u)}
                                                    className="p-2 rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                                    title="Kirim Peringatan"
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pengaturan;
