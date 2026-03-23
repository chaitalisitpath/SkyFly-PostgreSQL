"use client";
import Navbar from "@/layout/Navbar";
import { getFlightById, Flight } from "@/services/flight.service";
import { createBooking, Passenger } from "@/services/booking.service";
import { getSeatMap, SeatMap } from "@/services/aircraft.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SeatSelectionProps {
  flight: Flight;
  passengerCount: number;
  passengers: Passenger[];
  selectedSeats: string[];
  onSeatsSelected: (seats: string[], passengers: Passenger[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

function SeatSelection({ flight, passengerCount, passengers, selectedSeats, onSeatsSelected, onContinue, onBack }: SeatSelectionProps) {
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const occupiedSeats = flight.passengers ? flight.passengers.map(p => p.seatNumber) : [];

  useEffect(() => {
    const fetchSeatMap = async () => {
      try {
        const map = await getSeatMap(flight.aircraftId);
        setSeatMap(map);
      } catch (err) {
        console.error('Failed to fetch seat map:', err);
        setError('Failed to load seat map');
      } finally {
        setLoading(false);
      }
    };
    fetchSeatMap();
  }, [flight.aircraftId]);

  const getSeatClass = (seat: string): 'ECONOMY' | 'BUSINESS' | 'FIRST' => {
    if (seat.endsWith('E')) return 'ECONOMY';
    if (seat.endsWith('B')) return 'BUSINESS';
    if (seat.endsWith('F')) return 'FIRST';
    return 'ECONOMY';
  };

  const getSeatPrice = (seat: string) => {
    if (seat.endsWith('E')) return flight.economyPrice ? parseFloat(flight.economyPrice.toString()) : 0;
    if (seat.endsWith('B')) return flight.businessPrice ? parseFloat(flight.businessPrice.toString()) : 0;
    if (seat.endsWith('F')) return flight.firstPrice ? parseFloat(flight.firstPrice.toString()) : 0;
    return 0;
  };

  const toggleSeat = (seat: string) => {
    if (occupiedSeats.includes(seat)) return; // Cannot select occupied seats
    let newSelectedSeats = [...selectedSeats];
    if (selectedSeats.includes(seat)) {
      // Deselect if already selected
      newSelectedSeats = selectedSeats.filter(s => s !== seat);
    } else if (selectedSeats.length < passengerCount) {
      // Add seat if haven't reached passenger count
      newSelectedSeats = [...selectedSeats, seat];
    } else {
      // If at capacity, replace the first selected seat with the new one
      newSelectedSeats = [...selectedSeats.slice(0, -1), seat];
    }

    // Assign seats to passengers
    const updatedPassengers = passengers.map((passenger, index) => ({
      ...passenger,
      seatClass: newSelectedSeats[index] ? getSeatClass(newSelectedSeats[index]) : undefined,
      seatNumber: newSelectedSeats[index] || undefined,
    }));

    onSeatsSelected(newSelectedSeats, updatedPassengers);
  };

  const getSeatGroups = (seats: string[], className: string) => {
    if (className === 'economy') return [seats.slice(0, 3), seats.slice(3)];
    if (className === 'business') return [seats.slice(0, 2), seats.slice(2)];
    if (className === 'first') return [seats.slice(0, 1), seats.slice(1)];
    return [seats];
  };

  const renderSeats = (seats: string[], className: string) => {
    // Group seats by row number
    const rows: { [key: string]: string[] } = {};
    seats.forEach(seat => {
      const row = seat.slice(0, -2); // Remove last 2 chars (letter + class)
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    // Sort rows numerically (front to back of aircraft)
    const sortedRows = Object.entries(rows).sort(([a], [b]) => parseInt(a) - parseInt(b));

    // Group seats by letter for vertical arrangement
    const seatsByLetter: { [key: string]: string[] } = {};
    seats.forEach(seat => {
      const letter = seat.slice(-2, -1); // Get seat letter
      if (!seatsByLetter[letter]) seatsByLetter[letter] = [];
      seatsByLetter[letter].push(seat);
    });

    // Sort letters alphabetically (A, B, C, D, E, F)
    const sortedLetters = Object.entries(seatsByLetter).sort(([a], [b]) => a.localeCompare(b));

    // Define partition gaps between seat letters (rows) for each class
    const getGapAfterLetter = (classType: string) => {
      if (classType === 'economy') return 'C'; // Gap between C and D
      if (classType === 'business') return 'B'; // Gap between B and C
      if (classType === 'first') return 'A'; // Gap between A and B
      return null;
    };

    const gapAfterLetter = getGapAfterLetter(className);

    return (
      <div className="flex flex-col space-y-1">
        {/* Seat arrangement - letters vertically, rows horizontally */}
        {sortedLetters.map(([letter, letterSeats], idx) => (
          <div key={letter}>
            <div className="flex items-center space-x-1">
              {/* Seat letter label */}
              <div className="w-8 md:w-6 text-center">
                <span className="text-xs font-bold text-gray-600">{letter}</span>
              </div>

              {/* Seats in this row going horizontally (front to back) */}
              {sortedRows.map(([rowNumber]) => {
                const seatInThisPosition = letterSeats.find(seat => seat.startsWith(rowNumber));
                return (
                  <div key={`${letter}-${rowNumber}`} className="flex justify-center">
                    {seatInThisPosition ? (
                      <button
                        className={`w-8 h-8 md:w-7 md:h-7 text-xs font-bold rounded border-2 transition-all duration-200 ${occupiedSeats.includes(seatInThisPosition)
                            ? 'bg-red-500 text-white border-red-600 cursor-not-allowed'
                            : selectedSeats.includes(seatInThisPosition)
                              ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md'
                          }`}
                        onClick={() => toggleSeat(seatInThisPosition)}
                        title={`Seat ${seatInThisPosition} - ₹${getSeatPrice(seatInThisPosition).toLocaleString()}`}
                      >
                        {rowNumber}
                      </button>
                    ) : (
                      <div className="w-8 h-8 md:w-7 md:h-7"></div> // Empty space for missing seats
                    )}
                  </div>
                );
              })}
            </div>
            {/* Gap between seat rows */}
            {letter === gapAfterLetter && idx < sortedLetters.length - 1 && (
              <div className="h-3 bg-gray-200 rounded my-1"></div>
            )}
          </div>
        ))}

      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Loading seat map...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!seatMap) return <div className="text-center py-8">No seat map available</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center">Select Seats</h3>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Selected {selectedSeats.length} of {passengerCount} seats
      </p>

      {/* Aircraft Layout - Full width single row */}
      <div
        className="p-4 md:p-8 relative overflow-hidden 
             rounded-l-full"
        style={{ background: "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)" }}
      >        {/* Aircraft Nose (Left) */}
        <div className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2">
          <div className="w-6 h-12 md:w-8 md:h-16 bg-gray-300 rounded-l-full border-2 border-gray-400"></div>
        </div>

        {/* Main Aircraft Body - Single row, no wrap */}
        <div className="flex items-center justify-center gap-4 md:gap-8 px-2 md:px-6 w-full flex-nowrap">
          {/* First Class Section */}
          {seatMap.first.length > 0 && (
            <div className="flex flex-col items-center shrink justify-center">
              <div className="mb-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  First Class
                </span>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-200 min-w-fit">
                {renderSeats(seatMap.first, 'first')}
              </div>
              <div className="mt-1 text-xs text-center">
                <span className="text-yellow-800 font-medium">₹{(flight.firstPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Section Divider */}
          {seatMap.first.length > 0 && seatMap.business.length > 0 && (
            <div className="hidden md:block w-px h-32 bg-gray-300"></div>
          )}

          {/* Business Class Section */}
          {seatMap.business.length > 0 && (
            <div className="flex flex-col items-center shrink justify-center">
              <div className="mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Business Class
                </span>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 min-w-fit">
                {renderSeats(seatMap.business, 'business')}
              </div>
              <div className="mt-1 text-xs text-center">
                <span className="text-blue-800 font-medium">₹{(flight.businessPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Section Divider */}
          {(seatMap.first.length > 0 || seatMap.business.length > 0) && seatMap.economy.length > 0 && (
            <div className="hidden md:block w-px h-32 bg-gray-300"></div>
          )}

          {/* Economy Class Section */}
          {seatMap.economy.length > 0 && (
            <div className="flex flex-col items-center shrink justify-center">
              <div className="mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Economy Class
                </span>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200 min-w-fit">
                {renderSeats(seatMap.economy, 'economy')}
              </div>
              <div className="mt-1 text-xs text-center">
                <span className="text-green-800 font-medium">₹{(flight.economyPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Aircraft Tail (Right) */}
        <div className="absolute right-4 md:right-2 top-1/2 transform -translate-y-1/2 hidden md:block">
          <div className="w-4 h-8 md:w-6 md:h-12 bg-gray-300 rounded-r-lg border-2 border-gray-400"></div>
        </div>
      </div>

      {/* Seat Legend */}
      <div className="mt-6 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 border border-gray-300 rounded"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 border border-blue-600 rounded"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-600 border border-red-600 rounded"></div>
          <span className="text-sm">Booked</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={selectedSeats.length !== passengerCount}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}


export default function BookFlight() {
  const [step, setStep] = useState(1); // 1: passengers, 2: seats, 3: confirmation
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
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
        passengerCount: passengerCount,
        passengers: passengers,
        totalAmount: calculateTotal(),
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
    if (!selectedFlight || !passengers.length) return 0;
    return passengers.reduce((total, passenger) => {
      let price = 0;
      if (passenger.seatClass === 'ECONOMY') {
        price = selectedFlight.economyPrice ? parseFloat(selectedFlight.economyPrice.toString()) : 0;
      } else if (passenger.seatClass === 'BUSINESS') {
        price = selectedFlight.businessPrice ? parseFloat(selectedFlight.businessPrice.toString()) : 0;
      } else if (passenger.seatClass === 'FIRST') {
        price = selectedFlight.firstPrice ? parseFloat(selectedFlight.firstPrice.toString()) : 0;
      } else {
        price = selectedFlight.economyPrice ? parseFloat(selectedFlight.economyPrice.toString()) : 0;
      }
      return total + price;
    }, 0);
  };


  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-8 px-4">
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
                    {new Date(selectedFlight.departureTime).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })

                    }
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
                <span className="ml-2">Seat Selection</span>
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

          {/* Step 2: Seat Selection (moved to full-width section below) */}

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
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-lg">₹{calculateTotal().toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Passengers:</h4>
                  <ul className="space-y-1">
                    {passengers.map((passenger, index) => (
                      <li key={index} className="text-sm">
                        {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender}, Seat: {selectedSeats[index] || 'Not assigned'})
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

      {/* Full-width Seat Selection section */}
      {step === 2 && selectedFlight && !bookingSuccess && (
        <div className="w-full mt-8 px-4">
          <SeatSelection
            flight={selectedFlight}
            passengerCount={passengerCount}
            passengers={passengers}
            selectedSeats={selectedSeats}
            onSeatsSelected={(seats, updatedPassengers) => {
              setSelectedSeats(seats);
              setPassengers(updatedPassengers);
            }}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        </div>
      )}
    </>
  );
}