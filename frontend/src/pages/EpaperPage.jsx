import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import { EPAPER_API_URL, resolveMediaUrl, applySeoMeta, formatNewsDate } from '../utils/news';

const EpaperPage = () => {
  const [epapers, setEpapers] = useState([]);
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ month: '', year: '' });

  useEffect(() => {
    fetchEpapers();
    fetchArchives();
  }, [filters]);

  useEffect(() => {
    return applySeoMeta({
      title: 'ई-पेपर | New Bharat Digital',
      description: 'न्यू भारत डिजिटल का आज का ई-पेपर और पिछले संस्करण यहाँ पढ़ें।',
      url: window.location.href,
      type: 'website'
    });
  }, []);

  const fetchEpapers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.month) query.append('month', filters.month);
      if (filters.year) query.append('year', filters.year);
      query.append('limit', '24');

      const res = await fetch(`${EPAPER_API_URL}?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch epapers');
      setEpapers(data.epapers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchives = async () => {
    try {
      const res = await fetch(`${EPAPER_API_URL}/archives`);
      const data = await res.json();
      setArchives(data || []);
    } catch (err) {
      console.error('Error fetching archives:', err);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Epaper' }
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">E-Paper</h1>
              <p className="mt-2 text-gray-600">Read daily news editions and archives.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select 
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                <option value="">All Years</option>
                {[...new Set(archives.map(a => a._id.year))].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select 
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{monthNames[i]}</option>
                ))}
              </select>

              {(filters.month || filters.year) && (
                <button 
                  onClick={() => setFilters({ month: '', year: '' })}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] rounded-xl mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-red-700">
                {error}
              </div>
            ) : epapers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Epapers Found</h3>
                <p className="mt-1 text-gray-500">Check back later for today's edition.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {epapers.map((paper) => (
                  <div key={paper._id} className="group flex flex-col">
                    <div className="relative aspect-[3/4.2] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                      {paper.coverImage ? (
                        <img 
                          src={resolveMediaUrl(paper.coverImage)} 
                          alt="Epaper Cover" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4 text-center">
                           <span className="text-gray-400 font-bold text-3xl opacity-20 mb-2">EPAPER</span>
                           <span className="text-xs text-gray-500 font-medium">{formatNewsDate(paper.date)}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <a 
                          href={resolveMediaUrl(paper.pdfUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Read Edition
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{paper.title || 'DAILY EDITION'}</p>
                      <h3 className="mt-1 text-sm font-semibold text-gray-900">{formatNewsDate(paper.date)}</h3>
                      <a 
                        href={resolveMediaUrl(paper.pdfUrl)} 
                        download 
                        className="mt-2 inline-flex items-center text-xs font-medium text-gray-500 hover:text-blue-600"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EpaperPage;
