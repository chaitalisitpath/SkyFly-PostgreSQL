"use client";

import React, { useState } from "react";
import { createAircraft } from "@/services/aircraft.service";
import { RocketLaunchIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface AddAircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAircraftModal({ isOpen, onClose, onSuccess }: AddAircraftModalProps) {
  const [formData, setFormData] = useState({
    model: "",
    economySeatCount: "",
    businessSeatCount: "",
    firstSeatCount: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.model.trim()) {
      newErrors.model = "Aircraft model is required";
    }

    if (formData.economySeatCount && (isNaN(Number(formData.economySeatCount)) || Number(formData.economySeatCount) < 0)) {
      newErrors.economySeatCount = "Economy seat count must be a non-negative number";
    }

    if (formData.businessSeatCount && (isNaN(Number(formData.businessSeatCount)) || Number(formData.businessSeatCount) < 0)) {
      newErrors.businessSeatCount = "Business seat count must be a non-negative number";
    }

    if (formData.firstSeatCount && (isNaN(Number(formData.firstSeatCount)) || Number(formData.firstSeatCount) < 0)) {
      newErrors.firstSeatCount = "First class seat count must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setGeneralError("");
    setLoading(true);
    try {
      const aircraftData = {
        model: formData.model.trim(),
        ...(formData.economySeatCount && { economySeatCount: parseInt(formData.economySeatCount) }),
        ...(formData.businessSeatCount && { businessSeatCount: parseInt(formData.businessSeatCount) }),
        ...(formData.firstSeatCount && { firstSeatCount: parseInt(formData.firstSeatCount) })
      };

      await createAircraft(aircraftData);
      onSuccess();
      onClose();
      setFormData({
        model: "",
        economySeatCount: "",
        businessSeatCount: "",
        firstSeatCount: ""
      });
    } catch (error: any) {
      console.error("Error creating aircraft:", error);
      setGeneralError(error.response?.data?.message || "An error occurred while creating the aircraft");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        <div className="p-8 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add New Aircraft</h2>
              <p className="text-slate-600 mt-1">Configure a new aircraft model and seating arrangement</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="addAircraftForm">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Aircraft Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Boeing 737-800"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
              />
              {errors.model && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><ExclamationTriangleIcon className="w-4 h-4" /><span>{errors.model}</span></p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Economy Seats
                </label>
                <input
                  type="number"
                  name="economySeatCount"
                  value={formData.economySeatCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                />
                {errors.economySeatCount && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><ExclamationTriangleIcon className="w-4 h-4" /><span>{errors.economySeatCount}</span></p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Business Seats
                </label>
                <input
                  type="number"
                  name="businessSeatCount"
                  value={formData.businessSeatCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                />
                {errors.businessSeatCount && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><ExclamationTriangleIcon className="w-4 h-4" /><span>{errors.businessSeatCount}</span></p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  First Class Seats
                </label>
                <input
                  type="number"
                  name="firstSeatCount"
                  value={formData.firstSeatCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                />
                {errors.firstSeatCount && <p className="text-red-600 text-sm mt-2 flex items-center space-x-1"><ExclamationTriangleIcon className="w-4 h-4" /><span>{errors.firstSeatCount}</span></p>}
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-200 flex-shrink-0">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addAircraftForm"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>Add Aircraft</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}