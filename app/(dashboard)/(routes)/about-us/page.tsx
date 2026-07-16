'use client';

import React, { useRef, useEffect } from 'react';
import { Contact, Contact2, ContactRound, Mail, MessageCircle, Phone } from 'lucide-react';
import { FaInstagram, FaFacebook, FaTiktok, FaFacebookF, FaYoutube } from 'react-icons/fa';
import Image from 'next/image';
import ExpandableText from '../../_components/ExpandableText';
import Link from 'next/link';

export default function AboutUsPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const teamMembers = [
    {
      name: 'Hasanin Al-Mrzoq',
      role: 'Founder',
      instagram: 'https://www.instagram.com/hasanin_art?igsh=d2NjNnZra2Q2OG5t',
      facebook:  'https://www.facebook.com/share/1BhfVPtcWs/?mibextid=wwXIfr',
      profileImage: '/team/hasanin.jpg',
    },
    {
      name: 'Mary',
      role: 'Student Registration Officer',
      instagram: null,
      facebook: null,
      profileImage: '/team/mary-profile.jpg',
    },
    {
      name: 'FiqrTech',
      role: 'Development Team',
      social: 'https://www.instagram.com/fiqrtech?igsh=ZGcwOGgyeG0ydXN6',
      profileImage: '/team/fiqrtech-w&b.png',
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
    <div className="min-h-dvh bg-background">
      <div className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-8">
          {/* Main Content */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto">
              {/* Heading */}
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary mb-3">Almarzoq Academy</p>
                <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] text-foreground">
                  Teaching the <em className="italic text-primary">foundations</em> of fine art.
                </h2>
              </div>
              {/* Content */}
              <div className="space-y-5 text-foreground leading-relaxed pb-10 border-b border-border">
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
                  className='float-left mr-4 mb-2 rounded-xl object-cover'
                  width={150}
                  height={110}
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
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold">Meet our amazing team</h3>
                  <div className="flex gap-2">
                    <button onClick={scrollPrev} aria-label="Previous" className="w-10 h-10 rounded-lg bg-paper border border-beige text-grey hover:text-primary transition flex items-center justify-center">‹</button>
                    <button onClick={scrollNext} aria-label="Next" className="w-10 h-10 rounded-lg bg-paper border border-beige text-grey hover:text-primary transition flex items-center justify-center">›</button>
                  </div>
                </div>

                <div className="relative">
                  <div ref={carouselRef} className="flex gap-6 overflow-x-hidden no-scrollbar snap-x snap-mandatory scroll-smooth pb-4">
                    {teamMembers.map((m, idx) => (
                      <article key={idx} className="snap-center flex-shrink-0 w-[200px]">
                        <div className="flex flex-col justify-center items-center gap-3">
                          <div className="h-[200px] w-[200px] overflow-hidden rounded-2xl border border-border bg-secondary">
                            <Image
                            src={m.profileImage}
                            alt={m.name}
                            width={200}
                            height={200}
                            className="h-full w-full object-cover"
                            />
                          </div>
                          <div className='flex flex-col justify-center items-center'>
                            <p className="font-semibold mb-2 text-center">{m.name}</p>
                            <p className="text-xs bg-paper border border-beige max-w-fit rounded-full text-grey font-medium px-3 py-1">{m.role}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex mb-2 items-center justify-center gap-3">
                          {
                            m.instagram && m.facebook ? (
                              <div className='flex mb-2 items-center justify-center gap-3'>
                               <a href={m.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:opacity-90 border border-border rounded-full p-2">
                                <FaInstagram />
                              </a>
                              <a href={m.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:opacity-90 border border-border rounded-full p-2">
                                <FaFacebookF />
                              </a>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No public link</span>
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
                <div className="flex flex-col justify-center items-start gap-6 mb-12">
                  {/* Icons */}
                  <div className='flex items-center justify-center gap-4'>
                    <MessageCircle/>
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
                    <FaInstagram className='h-5 w-5' />
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
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <Link
                      href='mailto:almrzoq.academy@gmail.com'
                      >
                      <p className="text-lg font-semibold text-foreground">almrzoq.academy@gmail.com</p>
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <Link
                      href='tel:+9647867559228'
                      >
                      <p className="text-lg font-semibold text-foreground">+964 786 755 9228</p>
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Logo */}
                <div className='hidden mb-13 lg:flex'>
                  <Image
                  src='/logo2.png'
                  width={200}
                  height={200}
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
