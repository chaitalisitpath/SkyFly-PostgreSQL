"use client";
import Navbar from "@/components/Navbar";
import { getFlightById, Flight } from "@/services/flight.service";
import { createBooking, Passenger } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";


export default function BookFlight() {
  const [step, setStep] = useState(1); // 1: search, 2: passengers, 3: confirmation
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const flightId = searchParams.get('flightId');

  // Role-based access control - only USER can access this page
  useRoleAccess('USER');

  // Fetch flight if flightId is present
  useEffect(() => {
    if (flightId) {
      const fetchFlight = async () => {
        try {
          const flight = await getFlightById(parseInt(flightId));
          setSelectedFlight(flight);
          setPassengerCount(1);
          // Initialize passengers array
          const initialPassengers: Passenger[] = [{
            name: '',
            age: 0,
            gender: 'MALE' as const,
          }];
          setPassengers(initialPassengers);
          setStep(1);
        } catch (err) {
          console.error('Failed to fetch flight:', err);
          setError('Failed to load flight details');
        }
      };
      fetchFlight();
    }
  }, [flightId]);


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

  const handleAddPassenger = () => {
    if (!selectedFlight) return;
    if (passengers.length >= selectedFlight.availableSeats) {
      setError(`Maximum ${selectedFlight.availableSeats} passengers allowed`);
      return;
    }
    setPassengers([...passengers, { name: '', age: 0, gender: 'MALE' as const }]);
    setPassengerCount(passengers.length + 1);
    setError(null);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) {
      setError('At least one passenger is required');
      return;
    }
    const updatedPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(updatedPassengers);
    setPassengerCount(updatedPassengers.length);
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

    setStep(2);
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
          {selectedFlight && step >= 1 && (
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
                    {new Date(selectedFlight.departureTime).toLocaleString("en-GB", {
                      timeZone: "UTC",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })

                    } IST
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
                <span className="ml-2">Passengers</span>
              </div>
              <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                  2
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


          {/* Step 1: Passenger Quantity and Details */}
          {step === 1 && selectedFlight && !bookingSuccess && (
            <form onSubmit={handlePassengersSubmit}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Passenger Information</h3>
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  disabled={passengers.length >= selectedFlight.availableSeats}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Add Passenger</span>
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Available seats: {selectedFlight.availableSeats} | Passengers: {passengers.length}
              </p>

              {/* Passenger Details */}
              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Passenger {index + 1}</h4>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(index)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 flex items-center space-x-1"
                        >
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
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
              <div className="flex justify-end items-center mt-6">
                <button
                  type="submit"
                  disabled={!passengers.every(p => p.name.trim() && p.age >= 1 && p.age <= 120)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && selectedFlight && !bookingSuccess && (
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
                  onClick={() => setStep(1)}
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