'use client';

import React, { useRef, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';
import Logo from '../../_components/Logo';
import Image from 'next/image';

export default function AboutUsPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const teamMembers = [
    {
      name: 'FiqrTech',
      role: 'Development Team',
      social: 'https://www.instagram.com/fiqrtech?igsh=ZGcwOGgyeG0ydXN6',
      profileImage: '/team/fiqrtech.png',
    },
    {
      name: 'Abu Alqasim Najah',
      role: 'Graphic Designer',
      social: 'https://www.facebook.com/share/16sXroN6UT/?mibextid=wwXIfr',
      profileImage: '/team/abu-alqasim.jpg',
    },
    {
      name: 'Mary',
      role: 'Student Registration Officer',
      social: null,
      profileImage: '/team/mary.jpg',
    },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      if (!carouselRef.current) return;
      const el = carouselRef.current;
      const scrollAmount = el.clientWidth; // page by container width
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const scrollPrev = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section with Logo */}
      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Logo Section */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="flex items-center justify-center gap-3">
                <Logo />
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-[#272727]">Al-Mrzoq</h1>
                  <p className="text-sm md:text-base text-gray-600 font-semibold">Academy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto">
              {/* Heading */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Al-Mrzoq Academy</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
              </div>

              {/* Content */}
              <div className="space-y-8 text-gray-700 leading-relaxed">
                {/* Paragraph 1 */}
                <div>
                  <p className="text-lg md:text-xl">
                    Al-Mrzoq Academy is an educational platform dedicated to individuals interested in fine arts. It seeks to teach and disseminate the academic foundations of various art forms from a practical perspective, while also presenting and clarifying the theoretical dimensions—such as the philosophy and history of art—for cultural and educational purposes.
                  </p>
                </div>

                {/* Paragraph 2 */}
                <div>
                  <p className="text-lg md:text-xl">
                    The Academy was founded in 2024 by the artist Hasanin Al-Mrzoq, and has featured active contributions from professors and specialists in diverse fields, including art, architecture, medicine, marketing, programming, and others.
                  </p>
                </div>

                {/* Paragraph 3 */}
                <div>
                  <p className="text-lg md:text-xl">
                    Each year, the platform graduates hundreds of students from within Iraq and across different Arab countries, striving to create a genuine and lasting artistic impact on future generations through a rigorous and scientifically grounded approach.
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-16">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">2024</p>
                  <p className="text-gray-700 text-sm md:text-base mt-2">Founded</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-purple-600">500+</p>
                  <p className="text-gray-700 text-sm md:text-base mt-2">Graduates/Year</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-pink-600">10+</p>
                  <p className="text-gray-700 text-sm md:text-base mt-2">Specialties</p>
                </div>
              </div>

              {/* Team Credits Slider */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Credits</h3>
                  <div className="space-x-3">
                    <button onClick={scrollPrev} aria-label="Previous" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">‹</button>
                    <button onClick={scrollNext} aria-label="Next" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">›</button>
                  </div>
                </div>

                <div className="relative">
                  <div ref={carouselRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4">
                    {teamMembers.map((m, idx) => (
                      <article key={idx} className="snap-center flex-shrink-0 min-w-[260px] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            <Image
                            src={m.profileImage}
                            alt={m.name}
                            width={56}
                            height={56}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{m.name}</p>
                            <p className="text-sm text-gray-600">{m.role}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          {m.social ? (
                            m.social.includes('instagram') ? (
                              <a href={m.social} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-pink-600 hover:opacity-90">
                                <FaInstagram />
                                <span className="text-sm">Instagram</span>
                              </a>
                            ) : (
                              <a href={m.social} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:opacity-90">
                                <FaFacebook />
                                <span className="text-sm">Profile</span>
                              </a>
                            )
                          ) : (
                            <span className="text-sm text-gray-500">No public link</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Social Media Section */}
              <div className="border-t pt-12 mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Connect With Us</h3>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-6">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900">almrzoq.academy@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-6">
                    <div className="flex-shrink-0">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-lg font-semibold text-gray-900">+964 786 755 9228</p>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="flex justify-center items-center gap-6 flex-wrap">
                  <p className="text-gray-600 font-semibold w-full text-center mb-4">Follow Us</p>

                  <a href="https://www.facebook.com/share/16hnmTECfW/?mibextid=wwXIfr" target="_blank" className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="Facebook">
                    <FaFacebook className="h-6 w-6" />
                  </a>

                  <a href="https://youtube.com/@almrzoq.academy?si=Nvb3uGQ40X09rT6I" target="_blank" className="bg-gradient-to-br from-red-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="YouTube">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.12C19.813 3.5 12 3.5 12 3.5s-7.813 0-9.386.566A2.999 2.999 0 0 0 .502 6.186 31.38 31.38 0 0 0 0 12a31.38 31.38 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.112 2.12C4.187 20.5 12 20.5 12 20.5s7.813 0 9.386-.566a2.999 2.999 0 0 0 2.112-2.12A31.38 31.38 0 0 0 24 12a31.38 31.38 0 0 0-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                  </a>

                  <a href="https://www.instagram.com/almrzoq.academy?igsh=bWs5dHluMDJkYXNh" target="_blank" className="bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="Instagram">
                    <FaInstagram className="h-6 w-6" />
                  </a>

                  <a href="https://www.tiktok.com/@almrzoq.academy?_r=1&_t=ZS-92DO28XgJld" target="_blank" className="bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110" aria-label="LinkedIn">
                    <FaTiktok className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
