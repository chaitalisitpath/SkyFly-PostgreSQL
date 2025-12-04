"use client";
import Navbar from "@/components/Navbar";
import { getFlightById, Flight } from "@/services/flight.service";
import { createBooking, Passenger } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookFlight() {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: quantity, 2: passengers, 3: confirmation
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const flightId = searchParams.get('flightId');

  // Role-based access control - only USER can access this page
  useRoleAccess('USER');

  useEffect(() => {
    const fetchFlight = async () => {
      if (!flightId) {
        setError('Flight ID is required');
        setLoading(false);
        return;
      }

      try {
        const flightData = await getFlightById(parseInt(flightId));
        setFlight(flightData);
      } catch (err) {
        console.error('Failed to fetch flight:', err);
        setError('Failed to load flight details');
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  const handleQuantitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengerCount < 1 || passengerCount > flight!.availableSeats) {
      setError(`Please enter a valid number of passengers (1-${flight!.availableSeats})`);
      return;
    }

    // Initialize passengers array
    const initialPassengers: Passenger[] = Array.from({ length: passengerCount }, () => ({
      name: '',
      age: 0,
      gender: 'MALE' as const,
    }));

    setPassengers(initialPassengers);
    setStep(2);
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
    if (!flight) return;

    setBookingLoading(true);
    setError(null);

    try {
      const bookingData = {
        flightId: flight.id,
        passengers: passengers,
      };

      await createBooking(bookingData);
      router.push('/dashboard'); // Redirect to dashboard or success page
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!flight) return 0;
    return passengerCount * flight.price;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <div className="text-center">Loading flight details...</div>
        </div>
      </>
    );
  }

  if (error && step === 1) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Flight Summary */}
          {flight && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Flight Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                1
              </div>
              <span className="ml-2">Passengers</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                2
              </div>
              <span className="ml-2">Details</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                3
              </div>
              <span className="ml-2">Confirm</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Passenger Quantity */}
          {step === 1 && flight && (
            <form onSubmit={handleQuantitySubmit}>
              <h3 className="text-lg font-semibold mb-4">How many passengers?</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  min="1"
                  max={flight.availableSeats}
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Available seats: {flight.availableSeats}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
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

          {/* Step 2: Passenger Details */}
          {step === 2 && (
            <form onSubmit={handlePassengersSubmit}>
              <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>
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
                  onClick={() => setStep(1)}
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
          {step === 3 && flight && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Confirmation</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Flight</p>
                    <p className="font-semibold">{flight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passengers</p>
                    <p className="font-semibold">{passengerCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price per ticket</p>
                    <p className="font-semibold">₹{flight.price.toLocaleString()}</p>
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