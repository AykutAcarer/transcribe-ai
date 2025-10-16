
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Star, FileText, Share2, Search, UploadCloud, Cpu, Edit3, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

import Footer from '@/components/Footer';

const Flag = ({ code }) => (
  <img
    className="w-8 h-6 rounded-sm object-cover"
    src={`https://flagcdn.com/${code}.svg`}
    alt={`${code} flag`}
  />
);

const LandingPage = () => {
  const { t } = useLanguage();

  const marketingFeatures = [
    {
      icon: <FileText className="w-8 h-8 text-purple-400" />,
      title: t('marketing_feature_1_title'),
      description: t('marketing_feature_1_desc')
    },
    {
      icon: <Share2 className="w-8 h-8 text-pink-400" />,
      title: t('marketing_feature_2_title'),
      description: t('marketing_feature_2_desc')
    },
    {
      icon: <Search className="w-8 h-8 text-blue-400" />,
      title: t('marketing_feature_3_title'),
      description: t('marketing_feature_3_desc')
    }
  ];

  const howItWorksSteps = [
    {
      icon: <UploadCloud className="w-10 h-10 text-purple-400" />,
      title: t('how_it_works_step1_title'),
      description: t('how_it_works_step1_desc'),
      image: <img className="rounded-lg shadow-xl" alt="An illustration of a user uploading an audio file to the cloud." src="https://images.unsplash.com/photo-1693495928043-0506d65d8a56" />
    },
    {
      icon: <Cpu className="w-10 h-10 text-pink-400" />,
      title: t('how_it_works_step2_title'),
      description: t('how_it_works_step2_desc'),
      image: <img className="rounded-lg shadow-xl" alt="An animation showing AI brain processing information." src="https://images.unsplash.com/photo-1696333991019-c06759af30a6" />
    },
    {
      icon: <Edit3 className="w-10 h-10 text-blue-400" />,
      title: t('how_it_works_step3_title'),
      description: t('how_it_works_step3_desc'),
      image: <img className="rounded-lg shadow-xl" alt="A user editing and exporting a transcribed text document." src="https://images.unsplash.com/photo-1553342302-da68ffb063cb" />
    }
  ];

  const testimonials = [
    {
      name: t('testimonial_1_name'),
      role: t('testimonial_1_role'),
      content: t('testimonial_1_content'),
      rating: 5
    },
    {
      name: t('testimonial_2_name'),
      role: t('testimonial_2_role'),
      content: t('testimonial_2_content'),
      rating: 5
    },
    {
      name: t('testimonial_3_name'),
      role: t('testimonial_3_role'),
      content: t('testimonial_3_content'),
      rating: 5
    }
  ];

  const flags = ['us', 'es', 'fr', 'de', 'tr', 'it', 'pt', 'nl', 'jp', 'kr', 'cn', 'ru', 'in', 'br', 'se'];

  return (
    <>
      <Helmet>
        <title>{t('title')} - {t('tagline')}</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      <div className="min-h-screen">
        <nav className="glass-effect fixed top-0 left-0 right-0 z-50 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">{t('title')}</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/features-info" className="text-gray-300 hover:text-white transition">Why Free?</Link>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition">{t('howItWorks')}</a>
                <a href="#features" className="text-gray-300 hover:text-white transition">{t('features')}</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition">{t('testimonials')}</a>
              </div>

              <div className="flex items-center space-x-2">
                <Link to="/upload">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 glow-effect">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start For Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <section className="pt-32 pb-20 px-4">
            <div className="container mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                  {t('tagline')}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  {t('description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/upload">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 glow-effect text-lg px-8 py-6">
                      <Rocket className="w-5 h-5 mr-3" />
                      Start Transcribing Now
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                      {t('howItWorks')}
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>
          </section>


          <section id="how-it-works" className="py-20 px-4 bg-black/20">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('how_it_works_title')}</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('how_it_works_desc')}</p>
                </motion.div>
                <div className="space-y-16">
                    {howItWorksSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5 }}
                            className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'md:grid-flow-row-dense md:[&>*:last-child]:col-start-1' : ''}`}
                        >
                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 border border-white/10 rounded-full mb-6">
                                    {step.icon}
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-white">{step.title}</h3>
                                <p className="text-gray-400 text-lg">{step.description}</p>
                            </div>
                            <div className="flex justify-center">
                              {step.image}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
          </section>


          <section id="features" className="py-20 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('powerfulFeatures')}</h2>
                <p className="text-xl text-gray-300">{t('featureDescription')}</p>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8">
                {marketingFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="glass-effect p-8 rounded-2xl text-center"
                  >
                    <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 px-4">
            <div className="container mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <img src="https://images.unsplash.com/photo-1675320458457-fe4576cbd0f8" className="rounded-2xl shadow-2xl w-full h-auto max-w-sm mx-auto" alt="Modern workspace with a laptop showing data charts" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold mb-4 gradient-text">{t('productivity_title')}</h2>
                  <p className="text-gray-300 text-lg">
                    {t('productivity_desc')}
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-20 px-4">
             <div className="container mx-auto text-center">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, amount: 0.5 }}
               >
                 <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('global_reach_title')}</h2>
                 <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">{t('global_reach_desc')}</p>
                 <div className="flex flex-wrap justify-center gap-4">
                   {flags.map((flag, index) => (
                     <motion.div
                       key={flag}
                       initial={{ opacity: 0, scale: 0.5 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true, amount: 0.8 }}
                       transition={{ delay: index * 0.05 }}
                       className="p-2 bg-white/10 rounded-lg"
                     >
                       <Flag code={flag} />
                     </motion.div>
                   ))}
                 </div>
               </motion.div>
             </div>
          </section>

          <section id="testimonials" className="py-20 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{t('lovedByCreators')}</h2>
                <p className="text-xl text-gray-300">{t('userSayings')}</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect p-8 rounded-2xl"
                  >
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
  


