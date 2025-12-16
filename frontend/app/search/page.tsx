"use client";
import Navbar from "@/components/Navbar";
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

      {/* Search Form */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Modify Search</h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                name="fromCity"
                defaultValue={searchParams.get('fromCity') || ''}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-4">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Price</h4>
                <div className="mb-2 text-sm text-gray-700">₹{maxPrice.toLocaleString()}</div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={1000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>
              </div>

              {/* Class Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Flight Class</h4>
                <div className="space-y-2">
                  {['ECONOMY', 'BUSINESS', 'FIRST'].map((classType) => (
                    <label key={classType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(classType)}
                        onChange={(e) => handleClassChange(classType, e.target.checked)}
                        className="mr-2"
                      />
                      {classType.charAt(0) + classType.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">
                {flights.length > 0 ? `${flights.length} Flights Found` : 'Search for Flights'}
              </h1>
            </div>

            {isSearching ? (
              <div className="text-center py-8">Searching...</div>
            ) : flights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchParams.get('fromCity') ? 'No flights found for your search criteria.' : 'Enter search criteria to find flights.'}
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      {/* Airline */}
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{flight.flightNumber}</p>
                          <p className="text-sm text-gray-600">{flight.aircraft?.model}</p>
                        </div>
                      </div>

                      {/* Flight Route */}
                      <div className="flex items-center justify-center md:justify-start space-x-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {new Date(flight.departureTime).toLocaleString("en-GB", {
                              timeZone: "UTC",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })} IST
                          </p>
                          <p className="text-sm text-gray-600">{flight.fromCity}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-2">
                            <div className="h-px w-8 bg-gray-300"></div>
                            <span className="text-gray-400">→</span>
                            <div className="h-px w-8 bg-gray-300"></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{getDuration(flight.departureTime, flight.arrivalTime)}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {new Date(flight.arrivalTime).toLocaleString("en-GB", {
                              timeZone: "UTC",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })} IST
                          </p>
                          <p className="text-sm text-gray-600">{flight.toCity}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center md:text-right">
                        <div className="space-y-1">
                          {flight.economyPrice && (
                            <p className="text-sm text-gray-600">
                              Economy: ₹{flight.economyPrice.toLocaleString()}
                            </p>
                          )}
                          {flight.businessPrice && (
                            <p className="text-sm text-gray-600">
                              Business: ₹{flight.businessPrice.toLocaleString()}
                            </p>
                          )}
                          {flight.firstPrice && (
                            <p className="text-sm text-gray-600">
                              First: ₹{flight.firstPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="text-center md:text-right">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                          onClick={() => handleBookFlight(flight.id)}
                        >
                          Book Flight
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
                        className={`px-3 py-2 rounded ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
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