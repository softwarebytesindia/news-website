import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';
import { EPAPER_API_URL, UPLOAD_IMAGE_API_URL, UPLOAD_PDF_API_URL } from '../utils/api';

const EpaperFormPopup = ({ isOpen, onClose, onSuccess, epaperItem }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    pdfUrl: '',
    coverImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ pdf: false, image: false });

  useEffect(() => {
    if (epaperItem) {
      setFormData({
        title: epaperItem.title || '',
        date: new Date(epaperItem.date).toISOString().split('T')[0],
        pdfUrl: epaperItem.pdfUrl || '',
        coverImage: epaperItem.coverImage || ''
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        pdfUrl: '',
        coverImage: ''
      });
    }
  }, [epaperItem, isOpen]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = type === 'pdf' ? UPLOAD_PDF_API_URL : UPLOAD_IMAGE_API_URL;
    const bodyFormData = new FormData();
    bodyFormData.append(type, file);

    setUploadProgress(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: bodyFormData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to upload ${type}`);

      setFormData(prev => ({ ...prev, [type === 'pdf' ? 'pdfUrl' : 'coverImage']: data.filePath }));
      toast.success(`${type.toUpperCase()} uploaded successfully`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = epaperItem ? `${EPAPER_API_URL}/${epaperItem._id}` : EPAPER_API_URL;
      const method = epaperItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save epaper');

      toast.success(`Epaper ${epaperItem ? 'updated' : 'created'} successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose} title={epaperItem ? 'Edit Epaper' : 'Add New Epaper'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Date (Required)</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Title (Optional)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Daily Edition - Delhi"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Upload PDF (Required)</label>
            <input
              type="file"
              accept=".pdf"
              required={!formData.pdfUrl}
              onChange={(e) => handleFileUpload(e, 'pdf')}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadProgress.pdf && <p className="text-[10px] text-blue-600 mt-1">Uploading...</p>}
            {formData.pdfUrl && <p className="text-[10px] text-green-600 mt-1 truncate">{formData.pdfUrl}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cover Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadProgress.image && <p className="text-[10px] text-blue-600 mt-1">Uploading...</p>}
            {formData.coverImage && (
              <div className="mt-2 h-20 w-14 bg-gray-100 border rounded overflow-hidden">
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.coverImage}`} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadProgress.pdf || uploadProgress.image}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : epaperItem ? 'Update Epaper' : 'Create Epaper'}
          </button>
        </div>
      </form>
    </Popup>
  );
};

export default EpaperFormPopup;
