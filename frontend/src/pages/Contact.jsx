import { useEffect } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { applySeoMeta } from '../utils/news';

const Contact = () => {
  useEffect(() => {
    applySeoMeta({
      title: 'संपर्क करें | न्यू भारत डिजिटल',
      description: 'न्यू भारत डिजिटल से संपर्क करें। हमसे जुड़ने के लिए फॉर्म भरें या हमें सीधे कॉल करें।'
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-800 overflow-hidden">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <div className="flex flex-col items-center text-center">
              <img 
                src="/news.webp" 
                alt="New Bharat Digital" 
                className="h-12 sm:h-14 w-auto mb-4"
              />
              <span className="inline-block bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-medium tracking-wide mb-2">
                Contact Us
              </span>
              <h1 className="text-2xl md:text-2xl font-bold leading-tight max-w-2xl mb-2 sm:mb-6">
                हमसे संपर्क करें
              </h1>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-white rounded-full"></span>
                    संपर्क जानकारी
                  </h2>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
                      <p className="text-xs text-gray-500 mb-2">फोन नंबर</p>
                      <a href="tel:+919322525211" className="text-red-600 hover:text-red-700 font-medium">+91 9322525211</a>
                      <span className="text-gray-400 mx-2">|</span>
                      <a href="tel:+917021078381" className="text-red-600 hover:text-red-700 font-medium">7021078381</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-xs text-gray-500 mb-2">ईमेल</p>
                      <a href="mailto:newbharatdigital365@gmail.com" className="text-red-600 hover:text-red-700 font-medium">newbharatdigital365@gmail.com</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-white rounded-full"></span>
                    हमारे बारे में
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-gray-700 leading-7">
                    न्यू भारत डिजिटल पोर्टल एक आधुनिक डिजिटल समाचार मंच है, जिसका उद्देश्य देश और दुनिया से जुड़ी महत्वपूर्ण खबरों को पाठकों तक सटीक, निष्पक्ष और सकारात्मक दृष्टिकोण के साथ पहुंचाना है।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
