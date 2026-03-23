"use client";
import Navbar from "@/layout/Navbar";
import { searchFlightsAdmin, Flight, SearchFlightsParams, SearchFlightsResponse } from "@/services/flight.service";
import { isAuthenticated } from "@/lib/auth";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

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

export default function SearchPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pagination, setPagination] = useState<SearchFlightsResponse['pagination'] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClassChange = (classType: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses(prev => [...prev, classType]);
    } else {
      setSelectedClasses(prev => prev.filter(c => c !== classType));
    }
  };

  const performSearch = async (params: SearchFlightsParams = {}) => {
    setIsSearching(true);
    try {
      // Build search params from URL and filters
      const searchParamsObj: SearchFlightsParams = {
        fromCity: searchParams.get('fromCity') || undefined,
        toCity: searchParams.get('toCity') || undefined,
        departureTimeFrom: searchParams.get('departureTime') ? new Date(searchParams.get('departureTime')!).toISOString() : undefined,
        departureTimeTo: searchParams.get('departureTime') ? new Date(new Date(searchParams.get('departureTime')!).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        maxPrice: maxPrice,
        classes: selectedClasses.length > 0 ? selectedClasses : undefined,
        page: params.page || 1,
        limit: 20,
        sortBy: 'departureTime',
        sortOrder: 'asc',
        ...params
      };

      const result = await searchFlightsAdmin(searchParamsObj);
      setFlights(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to search flights:", err);
      toast.error("Failed to search flights");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('fromCity') || searchParams.get('toCity') || searchParams.get('departureTime')) {
      performSearch();
    }
  }, [searchParams, selectedClasses, maxPrice]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fromCity = formData.get('fromCity') as string;
    const toCity = formData.get('toCity') as string;
    const departureDate = formData.get('departureDate') as string;

    // Build query params
    const params = new URLSearchParams();
    if (fromCity) params.append('fromCity', fromCity);
    if (toCity) params.append('toCity', toCity);
    if (departureDate) params.append('departureTime', departureDate);

    router.push(`/search?${params.toString()}`);
  };

  // Calculate duration string
  const getDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  const handleBookFlight = (flightId: number) => {
    if (!isAuthenticated()) {
      const bookingData = {
        flightId: flightId.toString(),
        searchParams: Object.fromEntries(searchParams.entries())
      };
      sessionStorage.setItem('bookingIntent', JSON.stringify(bookingData));
      router.push('/login');
    } else {
      router.push(`/user/book?flightId=${encodeURIComponent(flightId.toString())}`);
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="bottom-right" />

      {/* Hero + search shell */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-700">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_20%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.18),transparent_22%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-10 text-white">
          <div className="mt-2 bg-white/95 text-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 border border-white/40 backdrop-blur">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Refine your search</h2>
              <form
                onSubmit={handleSearch}
                className="mt-4 flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-4"
              >
                <select
                  name="fromCity"
                  defaultValue={searchParams.get('fromCity') || ''}
                  className="w-full md:w-48 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="">From City</option>
                  {popularCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  name="toCity"
                  defaultValue={searchParams.get('toCity') || ''}
                  className="w-full md:w-48 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="">To City</option>
                  {popularCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <input
                  type="date"
                  name="departureDate"
                  defaultValue={searchParams.get('departureTime')?.split('T')[0] || ''}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full md:w-48 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />

                <button
                  type="submit"
                  className="w-full md:w-auto rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-white font-semibold shadow-lg shadow-sky-500/30 hover:from-sky-700 hover:to-blue-700 transition-colors"
                >
                  Search flights
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-12">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-900/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Current filters</h3>
                  <span className="text-xs text-slate-500">Live</span>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>From</span>
                    <span className="font-semibold text-slate-900">{searchParams.get('fromCity') || 'Any'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>To</span>
                    <span className="font-semibold text-slate-900">{searchParams.get('toCity') || 'Any'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>Date</span>
                    <span className="font-semibold text-slate-900">{searchParams.get('departureTime')?.split('T')[0] || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>Max fare</span>
                    <span className="font-semibold text-slate-900">₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>Cabin</span>
                    <span className="font-semibold text-slate-900">{selectedClasses.length ? selectedClasses.map(c => c[0] + c.slice(1).toLowerCase()).join(', ') : 'Any'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-900/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <span className="text-xs text-slate-500">Live</span>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Price</h4>
                    <span className="text-xs text-slate-500">cap</span>
                  </div>
                  <div className="mb-2 text-sm text-slate-700">₹{maxPrice.toLocaleString()}</div>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={1000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>₹0</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>
                </div>

                {/* Class Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Cabin</h4>
                  <div className="space-y-2">
                    {['ECONOMY', 'BUSINESS', 'FIRST'].map((classType) => (
                      <label key={classType} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-sky-500">
                        <span>{classType.charAt(0) + classType.slice(1).toLowerCase()}</span>
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(classType)}
                          onChange={(e) => handleClassChange(classType, e.target.checked)}
                          className="h-4 w-4 text-sky-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {flights.length > 0 ? `${flights.length} Flights found` : 'Search for flights'}
                </h1>
                <p className="text-sm text-slate-500">Times displayed in your local timezone. Pricing reflects current cap.</p>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Live availability
              </div>
            </div>

            {isSearching ? (
              <div className="text-center py-10 text-slate-500">Searching…</div>
            ) : flights.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200 shadow-inner">
                {searchParams.get('fromCity') ? 'No flights matched those filters. Try widening the price or cabin.' : 'Set cities and a date to see live options.'}
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-900/5 hover:shadow-lg transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                      {/* Airline */}
                      <div className="md:col-span-3 flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 font-semibold flex items-center justify-center">
                          ✈
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{flight.flightNumber}</p>
                          <p className="text-sm text-slate-600">{flight.aircraft?.model || 'Aircraft TBD'}</p>
                        </div>
                      </div>

                      {/* Flight Route */}
                      <div className="md:col-span-5 flex items-center gap-6">
                        <div className="text-left">
                          <p className="text-xl font-bold text-slate-900">
                            {new Date(flight.departureTime).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </p>
                          <p className="text-sm text-slate-600">{flight.fromCity}</p>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-slate-400">→</span>
                            <div className="h-px flex-1 bg-slate-200" />
                          </div>
                          <p className="mt-1 text-xs text-slate-500 text-center">{getDuration(flight.departureTime, flight.arrivalTime)}</p>
                        </div>

                        <div className="text-left">
                          <p className="text-xl font-bold text-slate-900">
                            {new Date(flight.arrivalTime).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </p>
                          <p className="text-sm text-slate-600">{flight.toCity}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-left md:text-right">
                        <div className="space-y-1 text-sm text-slate-600">
                          {flight.economyPrice && (
                            <p>
                              <span className="text-slate-500">Economy</span>: <span className="font-semibold text-slate-900">₹{flight.economyPrice.toLocaleString()}</span>
                            </p>
                          )}
                          {flight.businessPrice && (
                            <p>
                              <span className="text-slate-500">Business</span>: <span className="font-semibold text-slate-900">₹{flight.businessPrice.toLocaleString()}</span>
                            </p>
                          )}
                          {flight.firstPrice && (
                            <p>
                              <span className="text-slate-500">First</span>: <span className="font-semibold text-slate-900">₹{flight.firstPrice.toLocaleString()}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="md:col-span-2 flex items-center md:justify-end">
                        <button
                          className="w-full md:w-auto rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-white font-semibold shadow-lg shadow-sky-500/30 hover:from-sky-700 hover:to-blue-700 transition-colors"
                          onClick={() => handleBookFlight(flight.id)}
                        >
                          Book flight
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => page >= pagination.page - 2 && page <= pagination.page + 2)
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => performSearch({ page })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === pagination.page
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}