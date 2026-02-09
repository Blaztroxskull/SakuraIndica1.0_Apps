import React from 'react';
import { FileImage } from 'lucide-react';

const FileUpload = ({ label, onFileSelect, selectedFile, error }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            onFileSelect(null, `${label}: Ukuran file tidak boleh lebih dari 5MB.`);
        } else {
            onFileSelect(file, '');
        }
    };
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor={`file-upload-${label}`} className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none">
                            <span>Pilih file gambar</span>
                            <input id={`file-upload-${label}`} name={`file-upload-${label}`} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p>
                </div>
            </div>
            {selectedFile && <p className="mt-2 text-sm text-green-600">File terpilih: {selectedFile.name}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default FileUpload;
