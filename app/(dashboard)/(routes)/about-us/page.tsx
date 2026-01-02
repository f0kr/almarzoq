'use client';

import React, { useRef, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { FaInstagram, FaFacebook, FaTiktok, FaFacebookF, FaYoutube } from 'react-icons/fa';
import Logo from '../../_components/Logo';
import Image from 'next/image';
import ExpandableText from '../../_components/ExpandableText';
import Link from 'next/link';

export default function AboutUsPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const teamMembers = [
    {
      name: 'Hasanin Al-Marzouq',
      role: 'Founder',
      instagram: 'https://www.instagram.com/hasanin_art?igsh=d2NjNnZra2Q2OG5t',
      facebook:  'https://www.facebook.com/share/1BhfVPtcWs/?mibextid=wwXIfr',
      profileImage: '/team/hasanin.jpg',
    },
/*     {
      name: 'FiqrTech',
      role: 'Development Team',
      social: 'https://www.instagram.com/fiqrtech?igsh=ZGcwOGgyeG0ydXN6',
      profileImage: '/team/fiqrtech.png',
    }, */
    {
      name: 'Abu Alqasim Najah',
      role: 'Graphic Designer',
      instagram:'https://www.instagram.com/at.s_artworks/',
      facebook: 'https://www.facebook.com/share/16sXroN6UT/?mibextid=wwXIfr',
      profileImage: '/team/abu-alqasim.jpg',
    },
    {
      name: 'Mary',
      role: 'Student Registration Officer',
      instagram: null,
      facebook: null,
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
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-8">
          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">About Us</h2>
              </div>
              {/* Content */}
              <div className="space-y-5 text-gray-700 leading-relaxed pb-10 border-b-2">
                {/* Paragraph 1 */}
                <div>
                  <ExpandableText
                  previewLength={200}
                  text='Al-Mrzoq Academy is an educational platform dedicated to individuals interested in fine arts. It seeks to teach and disseminate the academic foundations of various art forms from a practical perspective, while also presenting and clarifying the theoretical dimensions—such as the philosophy and history of art—for cultural and educational purposes.'
                  >
                  </ExpandableText>
                </div>

                {/* Paragraph 2 */}
                <div className=''>
                  <Image
                  src="/team/hasanin.jpg"
                  alt='hasanin almarzoq profile picture'
                  className='float-left mr-2'
                  width={150}
                  height={100}
                  />
                  <ExpandableText
                  previewLength={250}
                  text='The Academy was founded in 2024 by the artist Hasanin Al-Mrzoq, and has featured active contributions from professors and specialists in diverse fields, including art, architecture, medicine, marketing, programming, and others.'
                  >
                  </ExpandableText>
                </div>

                {/* Paragraph 3 */}
                <div>
                  <ExpandableText
                  text='Each year, the platform graduates hundreds of students from within Iraq and across different Arab countries, striving to create a genuine and lasting artistic impact on future generations through a rigorous and scientifically grounded approach.'
                  >
                  </ExpandableText>
                </div>
              </div>
              {/* Team Credits Slider */}
              <div className="mb-12 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black">Meet Our <br/> Amazing Team</h3>
                  <div className="space-x-3">
                    <button onClick={scrollPrev} aria-label="Previous" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">‹</button>
                    <button onClick={scrollNext} aria-label="Next" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">›</button>
                  </div>
                </div>

                <div className="relative">
                  <div ref={carouselRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4">
                    {teamMembers.map((m, idx) => (
                      <article key={idx} className="snap-center flex-shrink-0 min-w-[260px] shadow-xs">
                        <div className="flex flex-col justify-center items-center gap-4">
                          <div className="flex items-center justify-center text-white font-bold text-lg">
                            <Image
                            src={m.profileImage}
                            alt={m.name}
                            width={260}
                            height={56}
                            />
                          </div>
                          <div className='flex flex-col justify-center items-center'>
                            <p className="font-bold tracking-tighter mb-2">{m.name}</p>
                            <p className="text-sm bg-gray-50 border-1 max-w-fit rounded-xl text-black-600 font-normal px-2 py-1">{m.role}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex mb-2 items-center justify-center gap-3">
                          {
                            m.instagram && m.facebook ? (
                              <div className='flex mb-2 items-center justify-center gap-3'>
                               <a href={m.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-pink-600 hover:opacity-90 border-1 rounded-full p-1">
                                <FaInstagram color='gray' />
                              </a>
                              <a href={m.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:opacity-90 border-1 rounded-full p-1">
                                <FaFacebookF color='gray' />
                              </a>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No public link</span>
                            )
                          }
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Social Media Section */}
              <div className="flex flex-col  justify-between items-center border-t mx-2 pt-12 mt-12 lg:flex-row">
                <div className="flex flex-col items-start gap-6 mb-12">
                  {/* Icons */}
                  <div className='flex items-center ml-10 justify-center gap-4'>
                    <Link
                    href='https://www.tiktok.com/@almrzoq.academy?_r=1&_t=ZS-92DO28XgJld'
                    target='_blank'
                    >
                    <FaTiktok className='h-5 w-5' />
                    </Link>
                    <Link
                    href='https://www.facebook.com/share/16hnmTECfW/?mibextid=wwXIfr'
                    target='_blank'
                    >
                    <FaFacebook className='h-5 w-5' />
                    </Link>
                    <Link
                    href='https://www.instagram.com/almrzoq.academy?igsh=bWs5dHluMDJkYXNh'
                    target='_blank'
                    >
                    <FaInstagram className='h-5 w-5'  />
                    </Link>
                    <Link
                    href='https://youtube.com/@almrzoq.academy?si=Nvb3uGQ40X09rT6I'
                    target='_blank'
                    >
                    <FaYoutube className='h-5 w-5' />
                    </Link>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-black-800" />
                    </div>
                    <div>
                      <Link
                      href='mailto:almrzoq.academy@gmail.com'
                      >
                      <p className="text-lg font-semibold text-gray-900">almrzoq.academy@gmail.com</p>
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="flex-shrink-0">
                      <Phone className="h-6 w-6 text-black-800" />
                    </div>
                    <div>
                      <Link
                      href='tel:+9647867559228'
                      >
                      <p className="text-lg font-semibold text-gray-900">+964 786 755 9228</p>
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Logo */}
                <div>
                  <Image
                  src='/logo2.svg'
                  width={100}
                  height={100}
                  alt='Almarzoq academy logo'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
