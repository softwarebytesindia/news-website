import { useEffect } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { applySeoMeta } from '../utils/news';

const highlights = [
  'कोई साइन-इन या यूज़र अकाउंट अनिवार्य नहीं',
  'समाचार पढ़ने के लिए सीमित डेटा संग्रह',
  'विज्ञापन और एनालिटिक्स का स्पष्ट उपयोग',
  'भारतीय उपयोगकर्ताओं के लिए पारदर्शी नीति'
];

const sections = [
  {
    title: '1. परिचय',
    description: 'न्यू भारत डिजिटल की यह गोपनीयता नीति बताती है कि हमारी वेबसाइट पर आने वाले उपयोगकर्ताओं से कौन-सी जानकारी ली जा सकती है, उसका उपयोग कैसे किया जाता है, और हम आपकी जानकारी की सुरक्षा के लिए क्या कदम उठाते हैं। यह नीति विशेष रूप से एक डिजिटल समाचार वेबसाइट के लिए तैयार की गई है।'
  },
  {
    title: '2. हम कौन-सी जानकारी एकत्र कर सकते हैं',
    description: 'हमारी वेबसाइट पर समाचार पढ़ने के लिए साइन-इन, रजिस्ट्रेशन या यूज़र अकाउंट की आवश्यकता नहीं है। फिर भी वेबसाइट के सामान्य संचालन, प्रदर्शन मापन, सुरक्षा और विज्ञापन सेवाओं के लिए कुछ सीमित तकनीकी जानकारी जैसे आईपी एड्रेस, ब्राउज़र प्रकार, डिवाइस जानकारी, अनुमानित लोकेशन, रेफ़रर यूआरएल, पेज व्यू और कुकी डेटा एकत्र किया जा सकता है।'
  },
  {
    title: '3. जानकारी का उपयोग',
    description: 'एकत्र की गई जानकारी का उपयोग वेबसाइट को तेज़, सुरक्षित और उपयोगकर्ता-अनुकूल बनाने, कंटेंट प्रदर्शन को समझने, समाचार प्रस्तुति में सुधार करने, अनधिकृत गतिविधि की पहचान करने, और विज्ञापन सेवाओं को बेहतर तरीके से संचालित करने के लिए किया जा सकता है।'
  },
  {
    title: '4. कुकीज़ और विज्ञापन',
    description: 'हमारी वेबसाइट कुकीज़, समान ट्रैकिंग तकनीकों और तृतीय-पक्ष विज्ञापन सेवाओं का उपयोग कर सकती है। इनका उपयोग पेज प्रदर्शन, उपयोगकर्ता व्यवहार की समझ, विज्ञापन मापन, और प्रासंगिक विज्ञापन दिखाने के लिए किया जा सकता है। यदि आप चाहें तो अपने ब्राउज़र की सेटिंग में कुकीज़ को सीमित या बंद कर सकते हैं, हालांकि इससे वेबसाइट की कुछ सुविधाओं के अनुभव पर प्रभाव पड़ सकता है।'
  },
  {
    title: '5. तृतीय-पक्ष सेवाएँ',
    description: 'हम एनालिटिक्स, विज्ञापन, वीडियो एम्बेड, सोशल मीडिया लिंक या अन्य तकनीकी सेवाओं के लिए तृतीय-पक्ष टूल का उपयोग कर सकते हैं। ऐसे मामलों में संबंधित सेवाएँ अपनी गोपनीयता नीतियों के अनुसार सीमित जानकारी संसाधित कर सकती हैं। हम उपयोगकर्ताओं को सलाह देते हैं कि वे इन तृतीय-पक्ष सेवाओं की नीतियों को भी पढ़ें।'
  },
  {
    title: '6. बच्चों की गोपनीयता',
    description: 'हमारी वेबसाइट सामान्य समाचार सामग्री के लिए बनाई गई है और हम जानबूझकर बच्चों से व्यक्तिगत जानकारी एकत्र करने का उद्देश्य नहीं रखते। यदि किसी अभिभावक को लगता है कि बच्चे से अनजाने में कोई व्यक्तिगत जानकारी प्राप्त हुई है, तो वे हमसे संपर्क कर सकते हैं।'
  },
  {
    title: '7. डेटा सुरक्षा',
    description: 'हम उपलब्ध तकनीकी और प्रशासनिक उपायों के माध्यम से जानकारी की सुरक्षा बनाए रखने का प्रयास करते हैं। हालांकि इंटरनेट पर किसी भी डेटा ट्रांसमिशन या स्टोरेज सिस्टम की पूर्ण सुरक्षा की गारंटी नहीं दी जा सकती।'
  },
  {
    title: '8. बाहरी लिंक',
    description: 'हमारी वेबसाइट पर अन्य वेबसाइटों, सोशल मीडिया प्लेटफ़ॉर्म या बाहरी स्रोतों के लिंक हो सकते हैं। उन वेबसाइटों की सामग्री और गोपनीयता प्रथाओं पर हमारा प्रत्यक्ष नियंत्रण नहीं होता, इसलिए उपयोगकर्ता बाहरी साइटों की नीतियाँ अलग से पढ़ें।'
  },
  {
    title: '9. नीति में बदलाव',
    description: 'हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं ताकि कानूनी आवश्यकताओं, तकनीकी बदलावों, विज्ञापन सेवाओं या वेबसाइट संचालन में हुए परिवर्तनों को दर्शाया जा सके। संशोधित नीति इसी पेज पर प्रकाशित की जाएगी।'
  }
];

const sideNotes = [
  'समाचार पढ़ने के लिए यूज़र लॉगिन या सदस्यता अनिवार्य नहीं है।',
  'वेबसाइट पर दिखाई देने वाले विज्ञापन तृतीय-पक्ष नेटवर्क द्वारा प्रबंधित हो सकते हैं।',
  'कुकीज़ का उपयोग अनुभव, प्रदर्शन और विज्ञापन मापन के लिए किया जा सकता है।',
  'गोपनीयता नीति का नवीनतम संस्करण इसी पेज पर उपलब्ध रहेगा।'
];

const PrivacyPolicy = () => {
  useEffect(() => applySeoMeta({
    title: 'गोपनीयता नीति | न्यू भारत डिजिटल',
    description: 'न्यू भारत डिजिटल की गोपनीयता नीति पढ़ें। जानें कि हमारी समाचार वेबसाइट कुकीज़, विज्ञापन, एनालिटिक्स और सीमित तकनीकी डेटा का उपयोग कैसे करती है।'
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
                Privacy Policy
              </span>
              <h1 className="mt-4 text-2xl md:text-2xl font-bold leading-tight max-w-2xl">
                आपकी गोपनीयता हमारे लिए महत्वपूर्ण है
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-slate-600">
                यह नीति बताती है कि न्यू भारत डिजिटल पर समाचार पढ़ते समय आपकी जानकारी का उपयोग, सुरक्षा और विज्ञापन-संबंधी प्रोसेस कैसे किया जा सकता है।
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
                    <p className="text-xs font-semibold tracking-[0.24em] uppercase text-red-600">Privacy Overview</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">गोपनीयता और पारदर्शिता</h2>
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
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-red-600">विज्ञापन और कुकीज़</p>
                <p className="mt-4 text-sm leading-7 text-stone-700">
                  हमारी वेबसाइट पर विज्ञापन दिखाए जा सकते हैं, और विज्ञापन प्रदर्शन मापन के लिए कुकीज़ या तृतीय-पक्ष सेवाओं का उपयोग किया जा सकता है। यह नीति विज्ञापन-अनुकूल और पारदर्शी ढंग से तैयार की गई है ताकि उपयोगकर्ता स्पष्ट रूप से समझ सकें कि डेटा का सीमित उपयोग कैसे होता है।
                </p>
              </div>

              <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-lg font-bold text-stone-900">संपर्क</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  यदि आपको इस गोपनीयता नीति, कुकी उपयोग या डेटा सुरक्षा से संबंधित कोई प्रश्न हो, तो आप वेबसाइट पर उपलब्ध संपर्क माध्यम से हमसे संपर्क कर सकते हैं।
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

export default PrivacyPolicy;
