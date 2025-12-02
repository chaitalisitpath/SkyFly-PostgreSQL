"use client";

import React, { useState } from "react";
import { createFlight } from "@/services/flight.service";

interface AddFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddFlightModal({ isOpen, onClose, onSuccess }: AddFlightModalProps) {
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
    if (!formData.departureAirport) newErrors.departureAirportTerminal = "Departure airport is required";
    if (!formData.arrivalAirport) newErrors.arrivalAirportTerminal = "Arrival airport is required";
    if (!formData.departureAirportTerminal) newErrors.departureTerminal = "Departure terminal is required";
    if (!formData.arrivalAirportTerminal) newErrors.arrivalTerminal = "Arrival terminal is required";
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
    if (!validateForm()) return;

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

      await createFlight(flightData);
      onSuccess();
      onClose();
      setFormData({
        flightNumber: "",
        fromCity: "",
        toCity: "",
        departureAirport: "",
        arrivalAirport: "",
        departureAirportTerminal: "",
        arrivalAirportTerminal: "",
        departureTime: "",
        arrivalTime: "",
        totalSeats: "",
        ticketPrice: "",
        status: "ON_TIME",
      });
    } catch (error) {
      console.error("Error creating flight:", error);
      // Handle error, maybe show a toast
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Flight</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flight Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Number *
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., AI202"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.flightNumber && <p className="text-red-500 text-sm mt-1">{errors.flightNumber}</p>}
              </div>
            {/* Flight Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {flightStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              {/* From City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From City *
                </label>
                <select
                  name="fromCity"
                  value={formData.fromCity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select city</option>
                  {indianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.fromCity && <p className="text-red-500 text-sm mt-1">{errors.fromCity}</p>}
              </div>

              {/* To City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To City *
                </label>
                <select
                  name="toCity"
                  value={formData.toCity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select city</option>
                  {indianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.toCity && <p className="text-red-500 text-sm mt-1">{errors.toCity}</p>}
              </div>

              {/* Departure Airport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Airport *
                </label>
                <select
                  name="departureAirport"
                  value={formData.departureAirport}
                  onChange={handleInputChange}
                  disabled={!formData.fromCity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                >
                  <option value="">Select airport</option>
                  {formData.fromCity &&
                    cityAirports[formData.fromCity]?.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                </select>
                {errors.departureAirport && <p className="text-red-500 text-sm mt-1">{errors.departureAirport}</p>}
              </div>

              {/* Arrival Airport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Airport *
                </label>
                <select
                  name="arrivalAirport"
                  value={formData.arrivalAirport}
                  onChange={handleInputChange}
                  disabled={!formData.toCity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                >
                  <option value="">Select airport</option>
                  {formData.toCity &&
                    cityAirports[formData.toCity]?.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                </select>
                {errors.arrivalAirport && <p className="text-red-500 text-sm mt-1">{errors.arrivalAirport}</p>}
              </div>

              {/* Departure Terminal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Terminal *
                </label>
                <select
                  name="departureAirportTerminal"
                  value={formData.departureAirportTerminal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select terminal</option>
                  {terminals.map((terminal) => (
                    <option key={terminal} value={terminal}>
                      {terminal}
                    </option>
                  ))}
                </select>
                {errors.departureAirportTerminal && <p className="text-red-500 text-sm mt-1">{errors.departureAirportTerminal}</p>}
              </div>

              {/* Arrival Terminal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Terminal *
                </label>
                <select
                  name="arrivalAirportTerminal"
                  value={formData.arrivalAirportTerminal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select terminal</option>
                  {terminals.map((terminal) => (
                    <option key={terminal} value={terminal}>
                      {terminal}
                    </option>
                  ))}
                </select>
                {errors.arrivalAirportTerminal && <p className="text-red-500 text-sm mt-1">{errors.arrivalAirportTerminal}</p>}
              </div>

              {/* Departure Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>}
              </div>

              {/* Arrival Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.arrivalTime && <p className="text-red-500 text-sm mt-1">{errors.arrivalTime}</p>}
              </div>

              {/* Total Seats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.totalSeats && <p className="text-red-500 text-sm mt-1">{errors.totalSeats}</p>}
              </div>

              {/* Ticket Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price (₹) *
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.ticketPrice && <p className="text-red-500 text-sm mt-1">{errors.ticketPrice}</p>}
              </div>

              
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Flight"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}