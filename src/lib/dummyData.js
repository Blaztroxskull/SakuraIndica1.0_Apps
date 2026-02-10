export const dummyRegistrations = [
    { namaLengkap: 'Budi Santoso', alamatCluster: 'Sakura Indica B1/10', email: 'budi@example.com', pekerjaan: 'Pegawai Swasta', statusKawin: 'menikah', id: '1', statusRumah: 'pribadi', kendaraan: [{jenis: 'Mobil', plat: 'B 1234 CD'}] },
    { namaLengkap: 'Ani Wijaya', alamatCluster: 'Sakura Indica B2/05', email: 'ani@example.com', pekerjaan: 'Guru', statusKawin: 'menikah', id: '2', statusRumah: 'sewa', kendaraan: [{jenis: 'Motor', plat: 'B 5678 EF'}] },
    { namaLengkap: 'Candra Gunawan', alamatCluster: 'Sakura Indica B3/12', email: 'candra@example.com', pekerjaan: 'Wiraswasta', statusKawin: 'lajang', id: '3', statusRumah: 'pribadi', kendaraan: [] },
];

export const dummyInfo = [
    { id: '1', content: 'Kerja Bakti akan dilaksanakan hari Minggu depan. Harap partisipasinya.', author: 'Pengurus RT', timestamp: { toDate: () => new Date('2023-10-25T08:00:00') }, attachmentURL: null, attachmentType: '' },
    { id: '2', content: 'Posyandu balita diadakan setiap tanggal 5 bulan berjalan di Balai Warga.', author: 'Posyandu', timestamp: { toDate: () => new Date('2023-10-20T10:00:00') }, attachmentURL: null, attachmentType: '' },
];

export const dummyForum = [
    { id: '1', text: 'Ada yang jual galon air mineral?', authorId: 'user123', timestamp: { toDate: () => new Date('2023-10-26T14:30:00') } },
    { id: '2', text: 'Saya jual, bisa diantar ke blok B2.', authorId: 'user456', timestamp: { toDate: () => new Date('2023-10-26T14:35:00') } },
];
