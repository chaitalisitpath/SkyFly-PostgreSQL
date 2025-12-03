"use client";

import React, { useState, useEffect } from "react";
import { updateFlight, Flight } from "@/services/flight.service";

interface EditFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  flight: Flight | null;
}

const indianCities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

const cityAirports: { [key: string]: string[] } = {
  Delhi: ["Indira Gandhi International Airport (DEL)", "Delhi Airport (DEL)"],
  Mumbai: ["Chhatrapati Shivaji Maharaj International Airport (BOM)", "Juhu Airport (BOM)"],
  Bangalore: ["Kempegowda International Airport (BLR)", "HAL Airport (BLR)"],
  Chennai: ["Chennai International Airport (MAA)", "Tambaram Air Force Station (MAA)"],
  Kolkata: ["Netaji Subhas Chandra Bose International Airport (CCU)", "Kolkata Airport (CCU)"],
  Hyderabad: ["Rajiv Gandhi International Airport (HYD)", "Hyderabad Airport (HYD)"],
  Pune: ["Pune International Airport (PNQ)", "Lohegaon Air Force Station (PNQ)"],
  Ahmedabad: ["Sardar Vallabhbhai Patel International Airport (AMD)", "Ahmedabad Airport (AMD)"],
  Jaipur: ["Jaipur International Airport (JAI)", "Jaipur Airport (JAI)"],
  Lucknow: ["Chaudhary Charan Singh International Airport (LKO)", "Lucknow Airport (LKO)"],
};

const terminals = [1, 2, 3, 4];

const flightStatuses = ["ON_TIME", "DELAYED", "CANCELLED"];

export default function EditFlightModal({ isOpen, onClose, onSuccess, flight }: EditFlightModalProps) {
  const [formData, setFormData] = useState({
    flightNumber: "",
    status: "ON_TIME",
    fromCity: "",
    toCity: "",
    departureAirport: "",
    arrivalAirport: "",
    departureAirportTerminal: "",
    arrivalAirportTerminal: "",
    departureTime: "",
    arrivalTime: "",
    totalSeats: "",
    ticketPrice: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (flight) {
      setFormData({
        flightNumber: flight.flightNumber,
        status: flight.status,
        fromCity: flight.fromCity,
        toCity: flight.toCity,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureAirportTerminal: flight.departureAirportTerminal.toString(),
        arrivalAirportTerminal: flight.arrivalAirportTerminal.toString(),
        departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
        arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
        totalSeats: flight.totalSeats.toString(),
        ticketPrice: flight.price.toString()
      });
    }
  }, [flight]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.flightNumber) {
      newErrors.flightNumber = "Flight number is required";
    } else if (!/^[A-Z]{2}\d{2,4}$/.test(formData.flightNumber)) {
      newErrors.flightNumber = "Flight number must be in format like AI202";
    }

    if (!formData.fromCity) newErrors.fromCity = "From city is required";
    if (!formData.toCity) newErrors.toCity = "To city is required";
    if (!formData.departureAirport) newErrors.departureAirport = "Departure airport is required";
    if (!formData.arrivalAirport) newErrors.arrivalAirport = "Arrival airport is required";
    if (!formData.departureAirportTerminal) newErrors.departureAirportTerminal = "Departure terminal is required";
    if (!formData.arrivalAirportTerminal) newErrors.arrivalAirportTerminal = "Arrival terminal is required";
    if (!formData.departureTime) newErrors.departureTime = "Departure date & time is required";
    if (!formData.arrivalTime) newErrors.arrivalTime = "Arrival date & time is required";
    if (!formData.totalSeats) newErrors.totalSeats = "Total seats is required";
    if (!formData.ticketPrice) newErrors.ticketPrice = "Ticket price is required";

    if (formData.departureTime && formData.arrivalTime) {
      const depTime = new Date(formData.departureTime);
      const arrTime = new Date(formData.arrivalTime);
      if (arrTime <= depTime) {
        newErrors.arrivalTime = "Arrival time must be after departure time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !flight) return;

    setGeneralError("");
    setLoading(true);
    try {
      const flightData = {
        flightNumber: formData.flightNumber,
        departureAirport: formData.departureAirport,
        arrivalAirport: formData.arrivalAirport,
        fromCity: formData.fromCity,
        toCity: formData.toCity,
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        totalSeats: parseInt(formData.totalSeats),
        departureAirportTerminal: parseInt(formData.departureAirportTerminal),
        arrivalAirportTerminal: parseInt(formData.arrivalAirportTerminal),
        price: parseFloat(formData.ticketPrice),
        status: formData.status,
      };

      await updateFlight(flight.id, flightData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating flight:", error);
      setGeneralError(error.response?.data?.message || "An error occurred while updating the flight");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !flight) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">✏️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Edit Flight</h2>
              <p className="text-slate-600 mt-1">Update flight details and schedule</p>
            </div>
          </div>

          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-sm font-medium">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flight Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Flight Number *
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., AI202"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                />
                {errors.flightNumber && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.flightNumber}</span></p>}
              </div>

              {/* Flight Status */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Flight Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  {flightStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* From City */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  From City *
                </label>
                <select
                  name="fromCity"
                  value={formData.fromCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select city</option>
                  {indianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.fromCity && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.fromCity}</span></p>}
              </div>

              {/* To City */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  To City *
                </label>
                <select
                  name="toCity"
                  value={formData.toCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select city</option>
                  {indianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.toCity && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.toCity}</span></p>}
              </div>

              {/* Departure Airport */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Departure Airport *
                </label>
                <select
                  name="departureAirport"
                  value={formData.departureAirport}
                  onChange={handleInputChange}
                  disabled={!formData.fromCity}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Select airport</option>
                  {formData.fromCity &&
                    cityAirports[formData.fromCity]?.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                </select>
                {errors.departureAirport && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.departureAirport}</span></p>}
              </div>

              {/* Arrival Airport */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Arrival Airport *
                </label>
                <select
                  name="arrivalAirport"
                  value={formData.arrivalAirport}
                  onChange={handleInputChange}
                  disabled={!formData.toCity}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Select airport</option>
                  {formData.toCity &&
                    cityAirports[formData.toCity]?.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                </select>
                {errors.arrivalAirport && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.arrivalAirport}</span></p>}
              </div>

              {/* Departure Terminal */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Departure Terminal *
                </label>
                <select
                  name="departureAirportTerminal"
                  value={formData.departureAirportTerminal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select terminal</option>
                  {terminals.map((terminal) => (
                    <option key={terminal} value={terminal}>
                      Terminal {terminal}
                    </option>
                  ))}
                </select>
                {errors.departureAirportTerminal && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.departureAirportTerminal}</span></p>}
              </div>

              {/* Arrival Terminal */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Arrival Terminal *
                </label>
                <select
                  name="arrivalAirportTerminal"
                  value={formData.arrivalAirportTerminal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select terminal</option>
                  {terminals.map((terminal) => (
                    <option key={terminal} value={terminal}>
                      Terminal {terminal}
                    </option>
                  ))}
                </select>
                {errors.arrivalAirportTerminal && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.arrivalAirportTerminal}</span></p>}
              </div>

              {/* Departure Date & Time */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Departure Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                />
                {errors.departureTime && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.departureTime}</span></p>}
              </div>

              {/* Arrival Date & Time */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Arrival Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                />
                {errors.arrivalTime && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.arrivalTime}</span></p>}
              </div>

              {/* Total Seats */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                />
                {errors.totalSeats && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.totalSeats}</span></p>}
              </div>

              {/* Ticket Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Ticket Price (₹) *
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                />
                {errors.ticketPrice && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><span>⚠️</span><span>{errors.ticketPrice}</span></p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                   <span>Update Flight</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}