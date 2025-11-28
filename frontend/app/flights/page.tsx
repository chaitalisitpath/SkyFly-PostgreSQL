"use client"; 
import Navbar from "@/components/Navbar";
import { getFlights, Flight } from "@/services/flight.service";
import React, { useEffect, useState } from "react";

export default function Flights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  useEffect(() => {
    getFlights()
      .then(setFlights)
      .catch((err) => console.error("Failed to fetch flights:", err));
  }, []);

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
      <div className="max-w-6xl mx-auto mt-10 space-y-4 px-4">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col md:flex-row items-center md:justify-between gap-6 hover:scale-105"
          >
            {/* Flight Info */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Airline */}
              <div className="flex items-center gap-3 md:w-32">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                  ✈️
                </div>
                <div>
                  <p className="font-bold text-gray-800">{flight.flightNumber}</p>
                  {/* <p className="text-sm text-gray-500">{flight.flightNumber.slice(0, 2)} Airlines</p> */}
                </div>
              </div>
          </div>
          <div className="flex">
              {/* From */}
              <div className="flex flex-col text-center md:text-left gap-2 md:w-40">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-2xl"></span>
                  <p className="text-2xl font-bold text-gray-800">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="text-sm font-medium text-gray-600 text-center">{flight.fromCity}</p>
              </div>

              {/* Duration */}
              <div className="flex flex-col items-center gap-2 md:w-32">
                <p className="text-sm font-semibold text-gray-700 mb-2">{getDuration(flight.departureTime, flight.arrivalTime)}</p>
                <div className="relative flex items-center">
                  <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-blue-400 rounded"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-white border-2 border-blue-400 rounded-full p-1">
                    <span className="text-sm">✈️</span>
                  </div>
                </div>
              </div>

              {/* To */}
              <div className="flex flex-col text-center md:text-left gap-2 md:w-40">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-2xl"></span>
                  <p className="text-2xl font-bold text-gray-800">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="text-sm font-medium text-gray-600 text-center">{flight.toCity}</p>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-3xl font-bold text-blue-600">₹{flight.price.toLocaleString()}</p>
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedFlight(flight)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Flight Details Modal */}
      {selectedFlight && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Blurred semi-transparent background */}
    <div
      className="absolute inset-0 bg-white/30 backdrop-blur-sm"
      onClick={() => setSelectedFlight(null)}
    ></div>

    {/* Modal card */}
    <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10 border border-gray-200">
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg font-bold"
        onClick={() => setSelectedFlight(null)}
      >
        ✕
      </button>

      {/* Modal title */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {selectedFlight.flightNumber} Details
      </h2>

      {/* Flight details */}
      <div className="space-y-3 text-gray-700 text-sm">
        <p>
          <strong>Departure:</strong> {selectedFlight.fromCity} -{" "}
          {new Date(selectedFlight.departureTime).toLocaleString()}
        </p>
        <p>
          <strong>Arrival:</strong> {selectedFlight.toCity} -{" "}
          {new Date(selectedFlight.arrivalTime).toLocaleString()}
        </p>
        <p>
          <strong>Departure Airport Terminal:</strong> {selectedFlight.departureAirportTerminal}
        </p>
        <p>
          <strong>Arrival Airport Terminal:</strong> {selectedFlight.arrivalAirportTerminal}
        </p>
        <p>
          <strong>Total Seats:</strong> {selectedFlight.totalSeats}
        </p>
        <p>
          <strong>Available Seats:</strong> {selectedFlight.availableSeats}
        </p>
        <p>
          <strong>Status:</strong> {selectedFlight.status}
        </p>
        <p>
          <strong>Ticket Price:</strong> ₹{selectedFlight.price.toLocaleString()}
        </p>
        <p>
          <strong>Duration:</strong>{" "}
          {getDuration(selectedFlight.departureTime, selectedFlight.arrivalTime)}
        </p>
      </div>

      {/* Book button */}
      <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition">
        Book Flight
      </button>
    </div>
  </div>
)}

    </>
  );
}
