// app/components/LandingSections.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const destinations = [
    { name: "Dubai", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
    { name: "London", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80" },
    { name: "Singapore", img: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80" },
    { name: "Paris", img: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=800&q=80" },
    { name: "Tokyo", img: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80" },
    { name: "New York", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80" },
  ];

  // Carousel state
  const visibleCount = 3;
  const maxIndex = Math.max(0, destinations.length - visibleCount);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const autoplayRef = useRef<number | null>(null);

  useEffect(() => {
    if (destinations.length <= visibleCount) return;

    const play = () => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    };

    if (!paused) {
      autoplayRef.current = window.setInterval(play, 3000);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [paused, maxIndex, destinations.length]);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        {/* Plane Animation */}
        <img
          src="/plane-removebg-preview.png"
          alt=""
          className="absolute w-44 right-[-200px] top-2/5 animate-fly opacity-95"
        />

        {/* Hero Box */}
        <div className="max-w-lg bg-white p-10 rounded-2xl shadow-2xl absolute left-10 top-1/3 mb-20">
          <h1 className="text-4xl font-bold mb-4">
            Discover the World <br /> with our flights.
          </h1>
          <p className="text-gray-500 mb-6">Plan your next adventure with ease.</p>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold mb-1">Takeoff</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>New Delhi</option>
                  <option>Mumbai</option>
                  <option>Bengaluru</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Arrival</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Dubai</option>
                  <option>London</option>
                  <option>Singapore</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-semibold mb-1">Departure Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Return Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 text-lg rounded-lg hover:bg-blue-700 transition">
              Search
            </button>
          </form>
        </div>

        {/* Plane animation keyframes */}
        <style jsx>{`
          @keyframes fly {
            0% {
              transform: translateX(0) translateY(0) rotate(8deg);
            }
            50% {
              transform: translateX(-800px) translateY(-30px) rotate(8deg);
            }
            100% {
              transform: translateX(-1600px) translateY(0) rotate(8deg);
            }
          }
          .animate-fly {
            animation: fly 9s linear infinite;
          }
        `}</style>
      </section>

      {/* Destinations Section (carousel showing 3 cards by default) */}
      <section className="py-20 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-12">Popular Destinations</h2>

        <div
          className="mx-auto max-w-7xl overflow-hidden relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Track */}
          <div
            className="flex will-change-transform transition-transform duration-700"
            style={{
              transform: `translateX(-${(index * 100) / visibleCount}%)`,
            }}
          >
            {destinations.map((dest) => (
              <div
                key={dest.name}
                className="p-4"
                style={{ flex: `0 0 ${100 / visibleCount}%` }}
              >
                <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-white">
                  <img src={dest.img} alt={dest.name} className="h-58 w-full object-cover" />
                  <h5 className="text-xl font-bold p-4">{dest.name}</h5>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full ${i === index ? "bg-blue-600" : "bg-gray-300"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-50 text-center">
        <h2 className="text-3xl font-bold mb-12">What Our Passengers Say</h2>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            {
              name: "Priya Sharma",
              img: "https://randomuser.me/api/portraits/women/68.jpg",
              text: "Amazing flight experience! Very smooth booking and the staff was super helpful. Will fly again!",
            },
            {
              name: "Rahul Verma",
              img: "https://randomuser.me/api/portraits/men/75.jpg",
              text: "Super comfortable seats and great food. SkyFly made my journey enjoyable!",
            },
            {
              name: "Anjali Desai",
              img: "https://randomuser.me/api/portraits/women/50.jpg",
              text: "Affordable tickets and on-time flights. Highly recommended for frequent travelers.",
            },
          ].map((review) => (
            <div
              key={review.name}
              className="w-80 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center"
            >
              <img
                src={review.img}
                alt={review.name}
                className="w-20 h-20 rounded-full mb-4"
              />
              <h5 className="font-bold mb-2">{review.name}</h5>
              <p className="text-yellow-400 mb-2">★★★★★</p>
              <p className="text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
