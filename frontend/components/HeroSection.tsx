// app/components/LandingSections.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { searchFlightsAdmin, SearchFlightsParams } from "@/services/flight.service";

const popularCities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow"
];

export default function HeroSection() {
  const router = useRouter();
  
  // State to track selected cities
  const [selectedFromCity, setSelectedFromCity] = useState("");
  const [selectedToCity, setSelectedToCity] = useState("");

  const destinations = [
    { name: "Ahmedabad", img: "ahmedabad.jpg" },
    { name: "Mumbai", img: "mumbai.jpg" },
    { name: "Banglore", img: "banglore.jpeg" },
    { name: "Chennai", img: "chennai.jpg" },
    { name: "Delhi", img: "delhi.jpg" },
    { name: "Jaipur", img: "jaipur.jpg" },
    { name: "Kolkata", img: "kolkata.jpg" },
    { name: "Lucknow", img: "lucknow.jpg" },
    { name: "Hydrabad", img: "hydrabad.jpg" },
    { name: "Pune", img: "pune.jpg" },
    
  ];

  // Carousel state
  const visibleCount = 3;
  const maxIndex = Math.max(0, destinations.length - visibleCount);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const autoplayRef = useRef<number | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fromCity = formData.get('fromCity') as string;
    const toCity = formData.get('toCity') as string;
    const departureDate = formData.get('departureDate') as string;

    // Build search params
    const searchParamsObj: SearchFlightsParams = {
      fromCity: fromCity || undefined,
      toCity: toCity || undefined,
      departureTimeFrom: departureDate ? new Date(departureDate).toISOString() : undefined,
      departureTimeTo: departureDate ? new Date(new Date(departureDate).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
      page: 1,
      limit: 20,
      sortBy: 'departureTime',
      sortOrder: 'asc',
    };

    try {
      const result = await searchFlightsAdmin(searchParamsObj);
      if (result.data.length === 0) {
        toast.error("No available flights for these cities");
        return;
      }

      // Build query params for navigation
      const params = new URLSearchParams();
      if (fromCity) params.append('fromCity', fromCity);
      if (toCity) params.append('toCity', toCity);
      if (departureDate) params.append('departureTime', departureDate);

      // Navigate to search page with params
      router.push(`/search?${params.toString()}`);
    } catch (err) {
      console.error("Failed to search flights:", err);
      toast.error("Failed to search flights");
    }
  };

  useEffect(() => {
    if (destinations.length <= visibleCount) return;

    const play = () => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    };

    if (!paused) {
      autoplayRef.current = window.setInterval(play, 2000);
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
      <Toaster position="bottom-right" />
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Plane Animation */}
        <img
          src="/plane-removebg-preview.png"
          alt=""
          className="absolute w-44 right-[-200px] top-2/5 animate-fly opacity-95 z-10"
        />

        {/* Hero Content */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 w-full">
          {/* Hero Text */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-2 drop-shadow-lg">
              Explore the world with comfort and style
            </p>
            <p className="text-lg text-white/80 drop-shadow-lg">
              Book your dream flight in just a few clicks ✈️
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/30 max-w-5xl mx-auto transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Find Your Flight</h2>
                <p className="text-gray-500 text-sm">Search from thousands of destinations</p>
              </div>
            </div>

            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* From City */}
                <div className="relative group">
                  <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    From City
                  </label>
                  <select
                    name="fromCity"
                    value={selectedFromCity}
                    onChange={(e) => setSelectedFromCity(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white cursor-pointer hover:border-blue-300"
                    required
                  >
                    <option value="">Select departure city</option>
                    {popularCities
                      .filter((city) => city !== selectedToCity)
                      .map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-[52px] pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* To City */}
                <div className="relative group">
                  <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    To City
                  </label>
                  <select
                    name="toCity"
                    value={selectedToCity}
                    onChange={(e) => setSelectedToCity(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white cursor-pointer hover:border-blue-300"
                    required
                  >
                    <option value="">Select destination city</option>
                    {popularCities
                      .filter((city) => city !== selectedFromCity)
                      .map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-[52px] pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Departure Date */}
                <div className="relative group">
                  <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Departure Date
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Flights
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            {/* Quick Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Best Prices</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">24/7 Support</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Secure Booking</p>
                </div>
              </div>
            </div>
          </div>
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
