import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Popup from './Popup';
import { AUTHORS_API_URL, UPLOAD_IMAGE_API_URL, resolveMediaUrl } from '../utils/api';

const getInitialFormData = (authorItem = null) => ({
  name: authorItem?.name || '',
  bio: authorItem?.bio || '',
  avatar: authorItem?.avatar || ''
});

const AuthorFormPopup = ({ isOpen, onClose, onSuccess, authorItem }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(getInitialFormData(authorItem));
    setImageFile(null);
  }, [authorItem, isOpen]);

  const imagePreview = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return resolveMediaUrl(formData.avatar);
  }, [formData.avatar, imageFile]);

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleClose = () => {
    setImageFile(null);
    setFormData(getInitialFormData());
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      let avatar = formData.avatar.trim();

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const uploadRes = await fetch(UPLOAD_IMAGE_API_URL, {
          method: 'POST',
          body: uploadFormData
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Avatar upload failed');
        }

        avatar = uploadData.filePath || avatar;
      }

      const payload = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        avatar
      };

      const url = authorItem ? `${AUTHORS_API_URL}/${authorItem._id}` : AUTHORS_API_URL;
      const method = authorItem ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save author');
      }

      toast.success(authorItem ? 'Author updated successfully' : 'Author created successfully');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error(error.message || 'Failed to save author');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      title={authorItem ? 'Edit Author' : 'Add Author'}
      panelClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(event) => updateField('bio', event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Short author introduction"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Avatar Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Upload an image file. The selected image will preview below.
          </p>
        </div>

        {imagePreview && (
          <div>
            <img
              src={imagePreview}
              alt={formData.name || 'Author'}
              className="w-24 h-24 object-cover rounded-full border border-gray-200"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : authorItem ? 'Update Author' : 'Create Author'}
          </button>
        </div>
      </form>
    </Popup>
  );
};

export default AuthorFormPopup;
