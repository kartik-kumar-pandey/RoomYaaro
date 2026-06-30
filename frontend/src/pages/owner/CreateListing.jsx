import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../layouts/DashboardLayout';

const ROOM_TYPES    = ['SINGLE', 'DOUBLE', 'SHARED', 'STUDIO', 'ENTIRE_FLAT'];
const FURNISHING    = ['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'];

const labelFor = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const FieldGroup = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const CreateListing = () => {
  const [form, setForm] = useState({
    title: '', location: '', rent: '', availableFrom: '',
    roomType: 'SINGLE', furnishingStatus: 'FURNISHED', description: '',
  });
  const [photos, setPhotos]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast    = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach(file => fd.append('photos', file));
      await listingAPI.create(fd);
      toast.success('Listing created successfully!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Owner</p>
        <h1 className="text-3xl font-black text-white">Create New Listing</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5" style={{ animation: 'fadeUp .4s .05s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="card p-6 space-y-5">
            <h2 className="text-base font-bold text-white border-b border-white/8 pb-3">Property Details</h2>

            <FieldGroup label="Listing Title" required>
              <input className="input-field" placeholder="e.g. Spacious Double Room in Indiranagar" value={form.title} onChange={set('title')} required />
            </FieldGroup>

            <FieldGroup label="Location" required>
              <input className="input-field" placeholder="e.g. Koramangala, Bengaluru" value={form.location} onChange={set('location')} required />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Rent per Month (₹)" required>
                <input type="number" min="1" className="input-field" placeholder="e.g. 12000" value={form.rent} onChange={set('rent')} required />
              </FieldGroup>
              <FieldGroup label="Available From" required>
                <input type="date" className="input-field" value={form.availableFrom} onChange={set('availableFrom')} required />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Room Type">
                <select className="input-field" value={form.roomType} onChange={set('roomType')}>
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{labelFor(t)}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Furnishing Status">
                <select className="input-field" value={form.furnishingStatus} onChange={set('furnishingStatus')}>
                  {FURNISHING.map(t => <option key={t} value={t}>{labelFor(t)}</option>)}
                </select>
              </FieldGroup>
            </div>

            <FieldGroup label="Description" required>
              <textarea
                className="input-field h-28 resize-none"
                placeholder="Describe the room, amenities, house rules, nearby places..."
                value={form.description}
                onChange={set('description')}
                required
              />
            </FieldGroup>
          </div>

          {/* Photo Upload */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-white/8 pb-3">Photos</h2>
            <label className="block">
              <div className="border-2 border-dashed border-white/10 hover:border-primary-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Click to upload photos</p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 5MB each · Max 5 photos</p>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating Listing...</>
            ) : 'Create Listing'}
          </button>
        </form>

        {/* Sidebar tips */}
        <div className="space-y-4" style={{ animation: 'fadeUp .4s .15s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-white mb-3">Listing Tips</h3>
            <ul className="space-y-3">
              {[
                ['Title', 'Be specific — include the room type and locality.'],
                ['Photos', 'Listings with photos get 3× more views.'],
                ['Description', 'Mention amenities, house rules, and nearby landmarks.'],
                ['Price',  'Set a competitive price to rank higher in searches.'],
              ].map(([title, tip]) => (
                <li key={title} className="flex gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  <span className="text-slate-400"><span className="text-slate-200 font-medium">{title}:</span> {tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-400 mb-1">AI Matching Active</p>
                <p className="text-xs text-slate-400 leading-relaxed">Our Gemini AI will automatically match your listing to tenants and send you real-time compatibility scores.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;
