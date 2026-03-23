import { useEffect } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { applySeoMeta } from '../utils/news';

const highlights = [
  'समाचार सामग्री केवल सूचनात्मक उद्देश्यों के लिए',
  'विज्ञापनों के लिए तृतीय-पक्ष विज्ञापनदाता जिम्मेदार',
  'बाहरी सामग्री की सटीकता की गारंटी नहीं',
  'वेबसाइट उपयोग स्वीकृति अस्वीकरण मानता है'
];

const sections = [
  {
    title: '1. सामग्री की सटीकता',
    description: 'न्यू भारत डिजिटल पर प्रकाशित समाचार लेख, आँकड़े, तथ्य और जानकारी विभिन्न विश्वसनीय स्रोतों से एकत्र की जाती है। हम सामग्री की सटीकता, पूर्णता और समयबद्धता सुनिश्चित करने का प्रयास करते हैं, लेकिन इसकी गारंटी नहीं दे सकते। पाठकों को सलाह दी जाती है कि वे किसी भी महत्वपूर्ण जानकारी को अन्य आधिकारिक स्रोतों से सत्यापित करें।'
  },
  {
    title: '2. विज्ञापन अस्वीकरण',
    description: 'हमारी वेबसाइट पर प्रदर्शित विज्ञापन तृतीय-पक्ष विज्ञापन नेटवर्क और विज्ञापनदाताओं द्वारा प्रबंधित होते हैं। न्यू भारत डिजिटल इन विज्ञापनों की सामग्री, सटीकता या वैधता के लिए जिम्मेदार नहीं है। किसी भी विज्ञापनदाता के उत्पाद, सेवा या दावों के लिए उनकी अपनी गोपनीयता और नियम शर्तें लागू होती हैं। पाठकों को विज्ञापनों पर क्लिक करने से पहले उनकी सामग्री की जाँच करने की सलाह दी जाती है।'
  },
  {
    title: '3. बाहरी लिंक और सामग्री',
    description: 'हमारी वेबसाइट में अन्य वेबसाइटों, सोशल मीडिया प्लेटफॉर्म, समाचार एजेंसियों और बाहरी स्रोतों के लिंक शामिल हो सकते हैं। इन बाहरी साइटों की सामग्री, गोपनीयता नीतियाँ, विज्ञापन प्रथाएँ या सटीकता के लिए न्यू भारत डिजिटल जिम्मेदार नहीं है। बाहरी साइटों का उपयोग उपयोगकर्ता के अपने जोखिम पर है।'
  },
  {
    title: '4. पेशेवर सलाह नहीं',
    description: 'हमारी वेबसाइट पर प्रकाशित जानकारी केवल सूचनात्मक उद्देश्यों के लिए है और इसे पेशेवर सलाह, वित्तीय सलाह, कानूनी सलाह या चिकित्सा सलाह के रूप में नहीं लिया जाना चाहिए। कोई भी निवेश निर्णय, कानूनी कार्रवाई या स्वास्थ्य संबंधी निर्णय लेने से पहले संबंधित पेशेवर से परामर्श करें। न्यू भारत डिजिटल किसी भी नुकसान या हानि के लिए उत्तरदायी नहीं होगा।'
  },
  {
    title: '5. राय और दृष्टिकोण',
    description: 'वेबसाइट पर प्रकाशित लेखों और समाचारों में व्यक्त विचार, राय और दृष्टिकोण लेखकों के अपने होते हैं और न्यू भारत डिजिटल के विचारों का प्रतिनिधित्व नहीं करते हैं। हम विभिन्न विषयों पर विविध दृष्टिकोण प्रस्तुत करने का प्रयास करते हैं, लेकिन यह हमारी स्वीकृति या समर्थन नहीं है। पाठकों को अपना स्वतंत्र निर्णय बनाने के लिए प्रोत्साहित किया जाता है।'
  },
  {
    title: '6. बौद्धिक संपदा',
    description: 'वेबसाइट पर मौजूद सभी सामग्री, ग्राफ़िक्स, चित्र, वीडियो और डिज़ाइन न्यू भारत डिजिटल या उसके स्रोतों की संपत्ति है। बिना अनुमति के किसी भी सामग्री का पुनर्उपयोग, प्रतिलिपि या वितरण अनुचित है। यदि आप कोई सामग्री उपयोग करना चाहते हैं, तो कृपया हमसे अनुमति प्राप्त करें।'
  },
  {
    title: '7. तकनीकी जानकारी',
    description: 'हम वेबसाइट के निर्बाध संचालन का प्रयास करते हैं, लेकिन तकनीकी समस्याओं, सर्वर गिरावट, या अन्य कारणों से सामग्री की उपलब्धता सुनिश्चित नहीं कर सकते। हम वेबसाइट के उपयोग से उत्पन्न किसी भी तकनीकी समस्या या नुकसान के लिए जिम्मेदार नहीं हैं।'
  },
  {
    title: '8. उपयोग की सीमाएँ',
    description: 'वेबसाइट का उपयोग केवल कानूनी और अनुचित उद्देश्यों के लिए किया जा सकता है। कोई भी उपयोगकर्ता जो इन शर्तों का उल्लंघन करता है, उसे वेबसाइट तक पहुँच से वंचित किया जा सकता है। वेबसाइट का उपयोग करके आप इस अस्वीकरण को स्वीकार करते हैं।'
  },
  {
    title: '9. अस्वीकरण में बदलाव',
    description: 'न्यू भारत डिजिटल किसी भी समय बिना पूर्व सूचना के इस अस्वीकरण में परिवर्तन कर सकता है। संशोधित अस्वीकरण इसी पेज पर प्रकाशित किया जाएगा। वेबसाइट का निरंतर उपयोग आपके द्वारा अद्यतन अस्वीकरण की स्वीकृति माना जाएगा।'
  }
];

const sideNotes = [
  'समाचार केवल सूचनात्मक उद्देश्यों के लिए है।',
  'विज्ञापनदाता अपनी सामग्री के लिए जिम्मेदार हैं।',
  'पेशेवर सलाह के लिए विशेषज्ञ से संपर्क करें।',
  'बाहरी लिंक के लिए हम जिम्मेदार नहीं हैं।'
];

const Disclaimer = () => {
  useEffect(() => applySeoMeta({
    title: 'अस्वीकरण | न्यू भारत डिजिटल',
    description: 'न्यू भारत डिजिटल का अस्वीकरण पढ़ें। विज्ञापन, बाहरी लिंक, सामग्री सटीकता और पेशेवर सलाह के बारे में महत्वपूर्ण जानकारी।'
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
                Disclaimer
              </span>
              <h1 className="mt-4 text-2xl md:text-2xl font-bold leading-tight max-w-2xl">
                महत्वपूर्ण अस्वीकरण
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-slate-600">
                यह पृष्ठ हमारी वेबसाइट पर प्रकाशित सामग्री, विज्ञापन और बाहरी लिंक के संबंध में महत्वपूर्ण जानकारी प्रदान करता है।
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
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-10 w-1 rounded-full bg-red-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.24em] uppercase text-red-600">Disclaimer Overview</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900">अस्वीकरण नीति</h2>
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
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-red-600">विज्ञापन पारदर्शिता</p>
                <p className="mt-4 text-sm leading-7 text-stone-700">
                  हमारी वेबसाइट पर विज्ञापन तृतीय-पक्ष विज्ञापनदाताओं द्वारा प्रदर्शित किए जाते हैं। इन विज्ञापनों में क्लिक करने से जुड़े जोखिम उपयोगकर्ता के अपने होते हैं। विज्ञापनदाताओं की सामग्री और दावों के लिए वे स्वयं जिम्मेदार हैं।
                </p>
              </div>

              <div className="rounded-[28px] bg-white p-6 border border-stone-200 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-red-600">सामग्री सत्यापन</p>
                <p className="mt-4 text-sm leading-7 text-stone-700">
                  समाचार सामग्री विभिन्न स्रोतों से एकत्र की जाती है। किसी भी महत्वपूर्ण निर्णय लेने से पहले आधिकारिक स्रोतों से जानकारी की पुष्टि करें। हम बाहरी सामग्री की सटीकता की गारंटी नहीं देते।
                </p>
              </div>

              <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-lg font-bold text-stone-900">संपर्क</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  यदि इस अस्वीकरण के बारे में कोई प्रश्न हो, तो आप वेबसाइट पर उपलब्ध संपर्क माध्यम से हमसे संपर्क कर सकते हैं।
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

export default Disclaimer;
