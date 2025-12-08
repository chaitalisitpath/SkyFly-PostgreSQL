"use client";
import Navbar from "@/components/Navbar";
import { searchFlights, Flight } from "@/services/flight.service";
import { createBooking, Passenger } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

export default function BookFlight() {
  const [step, setStep] = useState(1); // 1: search, 2: passengers, 3: confirmation
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Search states
  const [searchFromCity, setSearchFromCity] = useState('');
  const [searchToCity, setSearchToCity] = useState('');
  const [searchDepartureDate, setSearchDepartureDate] = useState('');
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const flightId = searchParams.get('flightId');

  // Role-based access control - only USER can access this page
  useRoleAccess('USER');


  const handleQuantityChange = (count: number) => {
    if (!selectedFlight) return;
    if (count < 1 || count > selectedFlight.availableSeats) {
      setError(`Please enter a valid number of passengers (1-${selectedFlight.availableSeats})`);
      return;
    }
    setPassengerCount(count);
    // Initialize passengers array
    const initialPassengers: Passenger[] = Array.from({ length: count }, () => ({
      name: '',
      age: 0,
      gender: 'MALE' as const,
    }));
    setPassengers(initialPassengers);
    setError(null);
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string | number) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };
    setPassengers(updatedPassengers);
  };

  const handlePassengersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.name.trim()) {
        setError(`Passenger ${i + 1}: Name is required`);
        return;
      }
      if (passenger.age < 1 || passenger.age > 120) {
        setError(`Passenger ${i + 1}: Age must be between 1 and 120`);
        return;
      }
    }

    setStep(3);
    setError(null);
  };

  const handleBookingConfirm = async () => {
    if (!selectedFlight) return;

    setBookingLoading(true);
    setError(null);

    try {
      const bookingData = {
        flightId: selectedFlight.id,
        passengers: passengers,
      };

      const bookingResponse = await createBooking(bookingData);
      setBookingId(bookingResponse.id);
      setBookingSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setError(null);
    try {
      const params = {
        fromCity: searchFromCity,
        toCity: searchToCity,
        departureTime: searchDepartureDate ? new Date(searchDepartureDate).toISOString().split('T')[0] : undefined,
      };
      const results = await searchFlights(params);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search flights');
    } finally {
      setSearchLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedFlight) return 0;
    return passengerCount * selectedFlight.price;
  };


  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Flight Summary */}
          {selectedFlight && step > 1 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Flight Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Flight</p>
                  <p className="font-semibold">{selectedFlight.flightNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-semibold">{selectedFlight.fromCity} → {selectedFlight.toCity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="font-semibold">
                    {new Date(selectedFlight.departureTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          {!bookingSuccess && (
            <div className="flex items-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                1
              </div>
              <span className="ml-2">Search</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                2
              </div>
              <span className="ml-2">Passengers</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                3
              </div>
              <span className="ml-2">Confirm</span>
            </div>
          </div>
          )}

          {/* Success Message */}
          {bookingSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    🎉 Booking Successful!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your booking has been created successfully! Booking ID: <span className="font-semibold">#{bookingId}</span>
                    </p>
                    <p className="mt-1">
                      Your booking is currently pending approval. You will receive a confirmation once it's approved by our team.
                    </p>
                    <p className="mt-1 text-xs">
                      Redirecting to your dashboard in a few seconds...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Search Flights */}
          {step === 1 && !bookingSuccess && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Search Flights</h3>
              <form onSubmit={handleSearch} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From City
                    </label>
                    <select
                      value={searchFromCity}
                      onChange={(e) => setSearchFromCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select departure city</option>
                      {popularCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To City
                    </label>
                    <select
                      value={searchToCity}
                      onChange={(e) => setSearchToCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select destination city</option>
                      {popularCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={searchDepartureDate}
                      onChange={(e) => setSearchDepartureDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search Flights'}
                </button>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-4">Available Flights</h4>
                  <div className="space-y-4">
                    {searchResults.map((flight) => (
                      <div key={flight.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-sm text-gray-600">Flight</p>
                            <p className="font-semibold">{flight.flightNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Route</p>
                            <p className="font-semibold">{flight.fromCity} → {flight.toCity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Departure</p>
                            <p className="font-semibold">
                              {new Date(flight.departureTime).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-semibold">₹{flight.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Available seats: {flight.availableSeats}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedFlight(flight);
                              setStep(2);
                              handleQuantityChange(1); // Initialize with 1 passenger
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Book Flight
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Passenger Quantity and Details */}
          {step === 2 && selectedFlight && !bookingSuccess && (
            <form onSubmit={handlePassengersSubmit}>
              <h3 className="text-lg font-semibold mb-4">Passenger Information</h3>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(Math.max(1, passengerCount - 1))}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold">{passengerCount}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(Math.min(selectedFlight.availableSeats, passengerCount + 1))}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Available seats: {selectedFlight.availableSeats}
                </p>
              </div>

              {/* Passenger Details */}
              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-3">Passenger {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={passenger.age || ''}
                          onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedFlight(null);
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedFlight && !bookingSuccess && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Confirmation</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Flight</p>
                    <p className="font-semibold">{selectedFlight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passengers</p>
                    <p className="font-semibold">{passengerCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price per ticket</p>
                    <p className="font-semibold">₹{selectedFlight.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-lg">₹{calculateTotal().toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Passengers:</h4>
                  <ul className="space-y-1">
                    {passengers.map((passenger, index) => (
                      <li key={index} className="text-sm">
                        {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={bookingLoading}
                >
                  Back
                </button>
                <button
                  onClick={handleBookingConfirm}
                  disabled={bookingLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}