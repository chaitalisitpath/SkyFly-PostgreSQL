"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { createReview } from "@/services/review.service";

interface Passenger {
  id: number;
  name: string;
}

interface WriteReviewModalProps {
  flightId: number;
  flightNumber: string;
  fromCity: string;
  toCity: string;
  passengers: Passenger[];
  onClose: () => void;
  onSuccess: (passengerId: number) => void;
}

export default function WriteReviewModal({
  flightId,
  flightNumber,
  fromCity,
  toCity,
  passengers,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [content, setContent] = useState("");
  const [selectedPassengerId, setSelectedPassengerId] = useState<number>(
    passengers[0]?.id ?? 0
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const starLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (stars === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }
    if(content.trim().length > 500) {
      setError("Review cannot exceed 500 characters.");
      return;
    }
    
    setLoading(true);
    try {
      await createReview({
        passengerId: selectedPassengerId,
        flightId,
        stars,
        content: content.trim(),
      });
      onSuccess(selectedPassengerId);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {flightNumber} · {fromCity} → {toCity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Passenger selector (only shown when multiple passengers) */}
          {passengers.length > 1 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reviewing as
              </label>
              <select
                value={selectedPassengerId}
                onChange={(e) => setSelectedPassengerId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              >
                {passengers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Overall Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  {star <= (hoveredStar || stars) ? (
                    <StarSolidIcon className="w-9 h-9 text-amber-400" />
                  ) : (
                    <StarIcon className="w-9 h-9 text-gray-300" />
                  )}
                </button>
              ))}
              {(hoveredStar || stars) > 0 && (
                <span className="ml-3 text-sm font-medium text-amber-600">
                  {starLabels[hoveredStar || stars]}
                </span>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Experience
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Share details about your flight experience... (min. 10 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {content.length} characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              <span>{loading ? "Submitting..." : "Submit Review"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
