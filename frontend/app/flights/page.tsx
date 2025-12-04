"use client";
import Navbar from "@/components/Navbar";
import { getFlights, searchFlights, Flight, SearchFlightsParams } from "@/services/flight.service";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Flights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchFlights = async () => {
      setIsSearching(true);
      try {
        const fromCity = searchParams.get('fromCity');
        const toCity = searchParams.get('toCity');
        const departureTime = searchParams.get('departureTime');
        const arrivalTime = searchParams.get('arrivalTime');

        const hasSearchParams = fromCity || toCity || departureTime || arrivalTime;

        if (hasSearchParams) {
          const searchCriteria: SearchFlightsParams = {
            fromCity: fromCity || undefined,
            toCity: toCity || undefined,
            departureTime: departureTime || undefined,
            arrivalTime: arrivalTime || undefined,
          };
          const results = await searchFlights(searchCriteria);
          setFlights(results);
        } else {
          const results = await getFlights();
          setFlights(results);
        }
      } catch (err) {
        console.error("Failed to fetch flights:", err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  // Calculate duration string
  const getDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };


  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Flights</h1>

        <div className="space-y-6">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                {/* Airline */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{flight.flightNumber}</p>
                  </div>
                </div>

                {/* Flight Route */}
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  {/* Departure */}
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-gray-600">{flight.fromCity}</p>
                  </div>

                  {/* Duration Line */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-px w-8 bg-gray-300"></div>
                      <span className="text-gray-400">→</span>
                      <div className="h-px w-8 bg-gray-300"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getDuration(flight.departureTime, flight.arrivalTime)}</p>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-gray-600">{flight.toCity}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{flight.price.toLocaleString()}</p>
                </div>

                {/* Action: Book is primary, More details is a link */}
                <div className="text-center md:text-right flex flex-col items-center md:items-end gap-2">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                    onClick={() => router.push(`/user/book?flightId=${encodeURIComponent(flight.id)}`)}
                  >
                    Book Flight
                  </button>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setSelectedFlight(flight); }}
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    More details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flight Details Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Flight {selectedFlight.flightNumber}
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => setSelectedFlight(null)}
                >
                  ×
                </button>
              </div>

              {/* Flight Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">From</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedFlight.fromCity}</p>
                    <p className="text-sm text-gray-600">{new Date(selectedFlight.departureTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">To</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedFlight.toCity}</p>
                    <p className="text-sm text-gray-600">{new Date(selectedFlight.arrivalTime).toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-500">Departure Terminal</p>
                      <p className="text-gray-900">{selectedFlight.departureAirportTerminal}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Arrival Terminal</p>
                      <p className="text-gray-900">{selectedFlight.arrivalAirportTerminal}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Total Seats</p>
                      <p className="text-gray-900">{selectedFlight.totalSeats}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Available Seats</p>
                      <p className="text-gray-900">{selectedFlight.availableSeats}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Status</p>
                      <p className="text-gray-900">{selectedFlight.status}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Duration</p>
                      <p className="text-gray-900">{getDuration(selectedFlight.departureTime, selectedFlight.arrivalTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price per ticket</p>
                      <p className="text-2xl font-bold text-gray-900">₹{selectedFlight.price.toLocaleString()}</p>
                    </div>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                      onClick={() => {
                        setSelectedFlight(null);
                        router.push(`/user/book?flightId=${encodeURIComponent(selectedFlight.id)}`);
                      }}
                    >
                      Book Flight
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
