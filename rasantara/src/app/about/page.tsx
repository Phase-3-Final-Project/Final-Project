"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const founderTitleRef = useRef<HTMLHeadingElement>(null);
  const foundersRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Custom cursor animation
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    if (cursor && cursorDot) {
      const moveCursor = (e: MouseEvent) => {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.5,
          ease: "power2.out",
        });
        gsap.to(cursorDot, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
        });
      };

      const hoverEffect = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest(".hover-target")
        ) {
          gsap.to(cursor, {
            scale: 2,
            backgroundColor: "rgba(92, 64, 51, 0.2)",
            duration: 0.3,
          });
          gsap.to(cursorDot, {
            scale: 0,
            duration: 0.3,
          });
        } else {
          gsap.to(cursor, {
            scale: 1,
            backgroundColor: "rgba(92, 64, 51, 0.1)",
            duration: 0.3,
          });
          gsap.to(cursorDot, {
            scale: 1,
            duration: 0.3,
          });
        }
      };

      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseover", hoverEffect);

      return () => {
        window.removeEventListener("mousemove", moveCursor);
        window.removeEventListener("mouseover", hoverEffect);
      };
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section entrance animation
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
      })
        .from(
          descriptionRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5"
        );

      // Feature cards stagger animation
      if (featureCardsRef.current) {
        gsap.from(featureCardsRef.current.children, {
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
        });
      }

      // Founder section animation
      gsap.from(founderTitleRef.current, {
        scrollTrigger: {
          trigger: founderTitleRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      });

      // Founders cards with parallax effect
      if (foundersRef.current) {
        const founderCards = foundersRef.current.children;
        
        Array.from(founderCards).forEach((card, index) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
            y: 80,
            opacity: 0,
            rotation: index % 2 === 0 ? -5 : 5,
            duration: 1,
            delay: index * 0.15,
            ease: "power3.out",
          });

          // Hover animation for founder cards
          const cardElement = card as HTMLElement;
          cardElement.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -10,
              scale: 1.05,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          cardElement.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        });
      }

      // Parallax effect for hero section
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: 150,
          opacity: 0.8,
          ease: "none",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F5EB] via-[#FFF8E7] to-[#F9F5EB] flex flex-col pt-32 pb-16 overflow-hidden cursor-none">
      {/* Custom Cursor with Nusantara Theme */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-12 h-12 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="relative w-full h-full">
          {/* Outer ring - Batik pattern inspired */}
          <div className="absolute inset-0 rounded-full border-2 border-[#5C4033] opacity-50">
            <div className="absolute inset-1 rounded-full border border-[#8B6F47] opacity-30"></div>
          </div>
          {/* Center ornament */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z"
                fill="#5C4033"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#5C4033] rounded-full pointer-events-none z-[9999]"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="flex-grow flex flex-col items-center justify-center px-4 mb-20"
        id="about"
      >
        <div className="flex flex-col items-center max-w-4xl mb-16">
          <h2
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold text-[#5C4033] mb-6 text-center leading-tight"
          >
            About Rasantara
          </h2>
          <p
            ref={descriptionRef}
            className="text-lg text-gray-700 text-center leading-relaxed max-w-3xl"
          >
            Rasantara is a modern digital platform that celebrates Indonesia’s
            culinary heritage through technology and design. From Sabang to
            Merauke, we bring thousands of local dishes and beverages to your
            screen — each representing the unique flavors and stories of the
            archipelago. Explore the nation’s diverse cuisine through our
            Interactive Map Explorer, where every region reveals its culinary
            treasures. Enjoy stunning visuals enhanced by AI Image Enhancement,
            and experience dishes in lifelike detail with our AI 3D Food
            Overview. More than just a food discovery app, Rasantara connects
            people, culture, and flavor — celebrating the taste of Indonesia,
            one island at a time.
          </p>
        </div>

        {/* Founder Section */}
        <div className="flex flex-col items-center max-w-4xl w-full">
          <h2
            ref={founderTitleRef}
            className="text-4xl md:text-5xl font-bold text-[#5C4033] mb-12 text-center"
          >
            The Founders
          </h2>
          <div
            ref={foundersRef}
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          >
            <div className="text-center group hover-target">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#5C4033]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Image
                  src="/haidar.jpg"
                  alt="Haidar"
                  width={140}
                  height={140}
                  className="rounded-full shadow-xl relative z-10 border-4 border-white"
                />
              </div>
              <p className="text-lg font-bold text-[#5C4033] mb-1">
                Muhammad Haidar
              </p>
              <p className="text-sm text-gray-600">Co-Founder & Developer</p>
            </div>
            <div className="text-center group hover-target">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#5C4033]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Image
                  src="/rizky.jpg"
                  alt="Rizky"
                  width={140}
                  height={140}
                  className="rounded-full shadow-xl relative z-10 border-4 border-white"
                />
              </div>
              <p className="text-lg font-bold text-[#5C4033] mb-1">
                Muhammad Rizky
              </p>
              <p className="text-sm text-gray-600">Co-Founder & Developer</p>
            </div>
            <div className="text-center group hover-target">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#5C4033]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Image
                  src="/andre.jpg"
                  alt="Andre"
                  width={140}
                  height={140}
                  className="rounded-full shadow-xl relative z-10 border-4 border-white"
                />
              </div>
              <p className="text-lg font-bold text-[#5C4033] mb-1">
                Andre Wicaksono
              </p>
              <p className="text-sm text-gray-600">Co-Founder & Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
