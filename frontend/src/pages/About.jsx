import { useEffect } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { applySeoMeta } from '../utils/news';

const highlights = [
  { icon: '🎯', title: 'सटीक और निष्पक्ष समाचार', desc: 'पुष्टि के बाद ही प्रकाशित' },
  { icon: '🌐', title: 'राष्ट्रीय और अंतरराष्ट्रीय कवरेज', desc: 'देश-दुनिया की खबरें' },
  { icon: '📰', title: 'व्यापक विषयों पर फोकस', desc: 'कॉर्पोरेट, खेल, मनोरंजन, सामाजिक' },
  { icon: '💡', title: 'सकारात्मक दृष्टिकोण', desc: 'जिम्मेदार पत्रकारिता' }
];

const values = [
  {
    icon: '✓',
    title: 'विश्वसनीयता',
    description: 'हर खबर को प्रकाशित करने से पहले उसकी सच्चाई, संदर्भ और प्रभाव को समझना हमारी प्राथमिकता है।'
  },
  {
    icon: '💭',
    title: 'सकारात्मक दृष्टिकोण',
    description: 'हम केवल सूचना नहीं देते, बल्कि खबर के रचनात्मक और समाजोपयोगी पहलुओं को भी सामने लाते हैं।'
  },
  {
    icon: '💻',
    title: 'डिजिटल प्रस्तुति',
    description: 'नवीनतम तकनीक और आधुनिक डिजिटल माध्यमों के जरिए खबर को सरल, आकर्षक और प्रभावी रूप में प्रस्तुत किया जाता है।'
  }
];

const topics = [
  'राष्ट्रीय समाचार',
  'अंतरराष्ट्रीय समाचार',
  'कॉर्पोरेट जगत',
  'व्यवसाय',
  'मनोरंजन',
  'खेल',
  'राजनीति',
  'सामाजिक मुद्दे',
  'धर्म-अध्यात्म',
  'साहित्य',
  'जीवनशैली'
];

const paragraphs = [
  'न्यू भारत डिजिटल पोर्टल एक आधुनिक डिजिटल समाचार मंच है, जिसका उद्देश्य देश और दुनिया से जुड़ी महत्वपूर्ण खबरों को पाठकों तक सटीक, निष्पक्ष और सकारात्मक दृष्टिकोण के साथ पहुंचाना है। हम डिजिटल युग की तेज रफ्तार में आपको विश्वसनीय और सार्थक जानकारी प्रदान करने के लिए प्रतिबद्ध हैं।',
  'इस पोर्टल के माध्यम से हम राष्ट्रीय एवं अंतरराष्ट्रीय समाचारों के साथ-साथ कॉर्पोरेट जगत, व्यवसाय, मनोरंजन, खेल, राजनीति, सामाजिक मुद्दों, धर्म-अध्यात्म, साहित्य और जीवनशैली से संबंधित विषयों को कवर करते हैं। हमारा प्रयास केवल समाचार देना नहीं, बल्कि हर खबर के पीछे की सच्चाई, उसके प्रभाव और सकारात्मक पहलू को पाठकों तक पहुंचाना है।',
  'न्यू भारत डिजिटल पोर्टल का उद्देश्य एक ऐसा मंच बनना है जहां पाठक न केवल खबर पढ़ें, बल्कि उन्हें समझें और उनसे जुड़ाव महसूस करें। हम मानते हैं कि मीडिया का काम केवल जानकारी देना नहीं, बल्कि समाज में जागरूकता, सकारात्मक सोच और जिम्मेदारी की भावना को बढ़ावा देना भी है।',
  'हमारी टीम अनुभवी लेखक, संपादक और डिजिटल क्रिएटर्स से मिलकर बनी है, जो लगातार गुणवत्ता और विश्वसनीयता बनाए रखने के लिए काम करते हैं। हम नवीनतम तकनीक और डिजिटल प्लेटफॉर्म का उपयोग करके खबर को सरल, आकर्षक और प्रभावी तरीके से प्रस्तुत करते हैं।',
  'न्यू भारत डिजिटल पोर्टल का लक्ष्य है कि वह एक भरोसेमंद और लोकप्रिय समाचार मंच बने, जहां हर वर्ग के पाठक अपनी रुचि के अनुसार जानकारी प्राप्त कर सकें। हम अपने पाठकों के विश्वास को अपनी सबसे बड़ी ताकत मानते हैं और उसे बनाए रखने के लिए निरंतर प्रयासरत हैं।'
];

const About = () => {
  useEffect(() => applySeoMeta({
    title: 'हमारे बारे में | न्यू भारत डिजिटल',
    description: 'न्यू भारत डिजिटल पोर्टल के उद्देश्य, संपादकीय दृष्टिकोण, कवरेज और पत्रकारिता मूल्यों के बारे में जानें।'
  }), []);

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
                About Us
              </span>
              <h1 className="text-2xl md:text-2xl font-bold leading-tight max-w-2xl mb-2 sm:mb-6">
                भरोसेमंद, निष्पक्ष और सार्थक डिजिटल पत्रकारिता
              </h1>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-3 hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <div className="text-xl mb-1">{item.icon}</div>
                  <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-white rounded-full"></span>
                    हमारी पहचान
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">पाठक के विश्वास पर आधारित मंच</h3>
                  <div className="space-y-5 text-sm sm:text-[15px] leading-7 text-gray-700">
                    {paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-lg mb-4">
                      {value.icon}
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{value.title}</h4>
                    <p className="text-sm leading-7 text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-5 py-4">
                  <h3 className="text-base font-bold text-white">हम क्या कवर करते हैं</h3>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-gray-100 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-full text-sm text-gray-700 transition-colors cursor-default"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-red-600 px-5 py-4">
                  <h3 className="text-base font-bold text-white">संपादकीय दृष्टि</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-3 text-sm leading-7 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">●</span>
                      हर खबर के पीछे की सच्चाई को सरल भाषा में सामने लाना।
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">●</span>
                      समाज में जागरूकता, सकारात्मक सोच और जिम्मेदारी की भावना को बढ़ावा देना।
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">●</span>
                      हर वर्ग के पाठकों तक उनकी रुचि के अनुसार उपयोगी जानकारी पहुंचाना।
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl border border-red-200 p-5">
                <h4 className="font-bold text-gray-900 text-lg mb-2">हमारी सबसे बड़ी ताकत</h4>
                <p className="text-sm leading-7 text-gray-700">
                  हमारे पाठकों का विश्वास। न्यू भारत डिजिटल उसी विश्वास को बनाए रखने के लिए निरंतर गुणवत्ता, स्पष्टता और जिम्मेदार रिपोर्टिंग पर काम करता है।
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

export default About;
