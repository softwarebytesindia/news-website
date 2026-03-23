import { useEffect } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { applySeoMeta } from '../utils/news';

const highlights = [
  'समाचार सामग्री केवल सूचनात्मक उद्देश्यों के लिए',
  'बाहरी सामग्री और विज्ञापनों के लिए हम जिम्मेदार नहीं',
  'वेबसाइट का उपयोग करने का अर्थ है इन शर्तों को स्वीकार करना',
  'हम अपनी सेवाओं में बदलाव कर सकते हैं'
];

const sections = [
  {
    title: '1. परिचय और स्वीकृति',
    description: 'न्यू भारत डिजिटल वेबसाइट एक डिजिटल समाचार पोर्टल है जो देश और दुनिया की ताज़ा खबरें प्रदान करता है। इस वेबसाइट का उपयोग करने से पहले कृपया इन नियमों और शर्तों को ध्यान से पढ़ें। वेबसाइट पर पहुँचने या उपयोग करने का अर्थ है आपकी पूर्ण सहमति इन शर्तों से।'
  },
  {
    title: '2. सामग्री का उपयोग',
    description: 'हमारी वेबसाइट पर प्रकाशित सभी समाचार लेख, फोटो, वीडियो, ग्राफ़िक्स और अन्य सामग्री न्यू भारत डिजिटल या उसके स्रोतों की बौद्धिक संपदा है। आप इन सामग्री का व्यक्तिगत, गैर-व्यावसायिक उपयोग कर सकते हैं, बशर्ते मूल स्रोत का उल्लेख किया जाए। किसी भी सामग्री को बिना अनुमति के पुनर्प्रकाशित, वितरित या संशोधित नहीं किया जा सकता।'
  },
  {
    title: '3. उपयोगकर्ता की जिम्मेदारी',
    description: 'वेबसाइट का उपयोग करते समय आप सहमत हैं कि आप किसी भी अवैध गतिविधि में संलग्न नहीं होंगे, वेबसाइट को किसी भी प्रकार से नुकसान नहीं पहुँचाएंगे, और किसी भी प्रकार के दुर्भावनापूर्ण कोड, वायरस या डेटा का प्रसारण नहीं करेंगे। आप सामग्री की सटीकता या विश्वसनीयता के बारे में कोई दावा नहीं करेंगे।'
  },
  {
    title: '4. बाहरी लिंक और विज्ञापन',
    description: 'हमारी वेबसाइट में तृतीय-पक्ष वेबसाइटों, विज्ञापनदाताओं या स्पॉन्सर्ड सामग्री के लिंक शामिल हो सकते हैं। न्यू भारत डिजिटल इन बाहरी साइटों की सामग्री, गोपनीयता नीतियों या प्रथाओं के लिए जिम्मेदार नहीं है। विज्ञापनदाताओं की सामग्री और उनकी गतिविधियों के लिए उनकी अपनी नीतियाँ लागू होती हैं।'
  },
  {
    title: '5. राय और टिप्पणियाँ',
    description: 'वेबसाइट पर उपयोगकर्ता द्वारा भेजी गई कोई भी टिप्पणी, फीडबैक या सुझाव न्यू भारत डिजिटल की संपत्ति बन जाते हैं और हम उन्हें अपने विवेक से उपयोग कर सकते हैं। उपयोगकर्ता द्वारा भेजी गई सामग्री में अपवंचनात्मक, अपमानजनक या अवैध सामग्री के लिए उपयोगकर्ता पूर्ण रूप से जिम्मेदार होगा।'
  },
  {
    title: '6. बौद्धिक संपदा अधिकार',
    description: 'न्यू भारत डिजिटल की वेबसाइट पर मौजूद सभी ट्रेडमार्क, लोगो, डिज़ाइन, सामग्री और ग्राफ़िक्स न्यू भारत डिजिटल की बौद्धिक संपदा हैं। इनका उपयोग केवल हमारी लिखित अनुमति से किया जा सकता है। किसी भी प्रकार की चोरी या उल्लंघन पर कानूनी कार्रवाई की जा सकती है।'
  },
  {
    title: '7. अस्वीकरण',
    description: 'हमारी वेबसाइट पर प्रकाशित जानकारी सामान्य सूचनात्मक उद्देश्यों के लिए है। हम सामग्री की सटीकता, पूर्णता या समयबद्धता की गारंटी नहीं देते। पाठकों को सलाह दी जाती है कि वे किसी भी महत्वपूर्ण निर्णय लेने से पहले अन्य विश्वसनीय स्रोतों से भी जानकारी प्राप्त करें। किसी भी नुकसान या हानि के लिए हम जिम्मेदार नहीं होंगे।'
  },
  {
    title: '8. सेवा में बदलाव और समाप्ति',
    description: 'न्यू भारत डिजिटल किसी भी समय बिना पूर्व सूचना के वेबसाइट, उसकी सामग्री, सुविधाओं या इन नियमों और शर्तों में परिवर्तन कर सकता है। हम किसी भी समय किसी भी कारण से वेबसाइट तक पहुँच को प्रतिबंधित या समाप्त कर सकते हैं।'
  },
  {
    title: '9. गवर्निंग लॉ और विवाद',
    description: 'ये नियम और शर्तें भारतीय कानूनों के अनुसार संचालित होते हैं। इन शर्तों से संबंधित कोई भी विवाद भारतीय न्यायालयों के अधिकार क्षेत्र में होगा। वेबसाइट का उपयोग करके आप इस अधिकार क्षेत्र को स्वीकार करते हैं।'
  }
];

const sideNotes = [
  'समाचार सामग्री केवल सूचनात्मक उद्देश्यों के लिए है।',
  'बाहरी लिंक और विज्ञापनों के लिए हम जिम्मेदार नहीं हैं।',
  'सभी बौद्धिक संपदा अधिकार सुरक्षित हैं।',
  'शर्तों में बदलाव बिना सूचना के किए जा सकते हैं।'
];

const TermsAndConditions = () => {
  useEffect(() => applySeoMeta({
    title: 'नियम और शर्तें | न्यू भारत डिजिटल',
    description: 'न्यू भारत डिजिटल की नियम और शर्तें पढ़ें। वेबसाइट उपयोग, बौद्धिक संपदा, उपयोगकर्ता जिम्मेदारी और अस्वीकरण के बारे में जानें।'
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-800">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-200 blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-200 blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
              <img
                src="/news.webp"
                alt="New Bharat Digital"
                className="h-12 sm:h-14 w-auto mb-4"
              />
              <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-4 py-1 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
                Terms & Conditions
              </span>
              <h1 className="mt-4 text-2xl md:text-2xl font-bold leading-tight max-w-2xl">
                उपयोग की शर्तें और नियम
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-slate-600">
                यह पृष्ठ बताता है कि न्यू भारत डिजिटल वेबसाइट का उपयोग करते समय आपको क्या अधिकार और जिम्मेदारियाँ हैं।
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <p className="text-sm sm:text-base font-medium text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_360px] gap-8 items-start">
            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-sm border border-stone-200">
                <div className="flex items-center gap-3 mb-8">
                  <span className="h-10 w-1 rounded-full bg-red-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.24em] uppercase text-red-600">Terms Overview</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900">नियम और शर्तें</h2>
                  </div>
                </div>

                <div className="space-y-5">
                  {sections.map((section) => (
                    <div key={section.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-stone-900">{section.title}</h3>
                      <p className="mt-3 text-[15px] sm:text-[16px] leading-8 text-stone-700">
                        {section.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <div className="rounded-[28px] bg-stone-950 text-white p-6 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-red-300">महत्वपूर्ण बिंदु</p>
                <ul className="mt-5 space-y-3 text-sm sm:text-base leading-7 text-white/85">
                  {sideNotes.map((note) => (
                    <li key={note} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] bg-white p-6 border border-stone-200 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-red-600">सामग्री उपयोग</p>
                <p className="mt-4 text-sm leading-7 text-stone-700">
                  हमारी वेबसाइट पर प्रकाशित समाचार सामग्री केवल सूचनात्मक उद्देश्यों के लिए है। किसी भी व्यावसायिक, कानूनी या वित्तीय निर्णय के लिए इस पर निर्भर न रहें। सटीक जानकारी के लिए कृपया आधिकारिक स्रोतों की जाँच करें।
                </p>
              </div>

              <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-lg font-bold text-stone-900">संपर्क</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  यदि इन नियमों और शर्तों के बारे में कोई प्रश्न हो, तो आप वेबसाइट पर उपलब्ध संपर्क माध्यम से हमसे संपर्क कर सकते हैं।
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
