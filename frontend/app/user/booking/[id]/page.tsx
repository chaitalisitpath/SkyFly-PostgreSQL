"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBookingById, Booking } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentIcon,
    PaperAirplaneIcon,
    UsersIcon,
    ListBulletIcon,
    CreditCardIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    IdentificationIcon,
    UserIcon,
    PhoneIcon
} from "@heroicons/react/24/outline";

export default function BookingDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Role-based access control - USER and ADMIN can access this page
    useRoleAccess(['USER', 'ADMIN']);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const bookingData = await getBookingById(parseInt(bookingId));
                setBooking(bookingData);
            } catch (err: any) {
                console.error('Failed to fetch booking details:', err);
                setError('Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "BOOKED": return "bg-gray-100 text-gray-800 border-gray-200";
            case "CONFIRMED": return "bg-gray-100 text-gray-800 border-gray-200";
            case "REJECTED": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "BOOKED": return <ClockIcon className="w-5 h-5" />;
            case "CONFIRMED": return <CheckCircleIcon className="w-5 h-5" />;
            case "REJECTED": return <XCircleIcon className="w-5 h-5" />;
            default: return <DocumentIcon className="w-5 h-5" />;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl font-medium">Loading booking details...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your booking information</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || "The booking you're looking for doesn't exist or you don't have permission to view it."}</p>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push('/user/dashboard')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            My Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                ← Back
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                                <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm flex items-center space-x-2 ${getStatusColor(booking.status)}`}>
                            <span className="text-lg">{getStatusIcon(booking.status)}</span>
                            <span>{booking.status}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Booking Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Flight Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                    <span>Flight Information</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{booking.flight.flightNumber}</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">From:</span>
                                                <span className="font-medium">{booking.flight.fromCity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">To:</span>
                                                <span className="font-medium">{booking.flight.toCity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Departure:</span>
                                                <span className="font-medium">{formatDateTime(booking.flight.departureTime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Arrival:</span>
                                                <span className="font-medium">{formatDateTime(booking.flight.arrivalTime)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Flight Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Aircraft:</span>
                                                <span className="font-medium">Boeing 737-800</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Class:</span>
                                                <span className="font-medium">Economy</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-medium">2h 30m</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price per seat:</span>
                                                <span className="font-medium">₹{booking.flight.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <UsersIcon className="w-5 h-5" />
                                    <span>Passenger Information</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {booking.passengers.map((passenger, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold">{passenger.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{passenger.name}</p>
                                                    <p className="text-sm text-gray-600">Age: {passenger.age} years • {passenger.gender}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Passenger {index + 1}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Booking Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <ListBulletIcon className="w-5 h-5" />
                                    <span>Booking Timeline</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Booking Created</p>
                                            <p className="text-sm text-gray-600">{formatDateTime(booking.createdAt)}</p>
                                        </div>
                                    </div>
                                    {booking.status === 'CONFIRMED' && (
                                        <div className="flex items-start space-x-4">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Booking Confirmed</p>
                                                <p className="text-sm text-gray-600">Your booking has been approved by our team</p>
                                            </div>
                                        </div>
                                    )}
                                    {booking.status === 'REJECTED' && (
                                        <div className="flex items-start space-x-4">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Booking Rejected</p>
                                                <p className="text-sm text-gray-600">Your booking could not be processed</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-4">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Last Updated</p>
                                            <p className="text-sm text-gray-600">{formatDateTime(booking.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">

                        {/* Booking Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <CreditCardIcon className="w-5 h-5" />
                                    <span>Booking Summary</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Booking ID:</span>
                                        <span className="font-mono font-medium">#{booking.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Passengers:</span>
                                        <span className="font-medium">{booking.passengerCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Fare:</span>
                                        <span className="font-medium">₹{(booking.totalAmount / booking.passengerCount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{booking.passengerCount} ×</span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Amount:</span>
                                            <span className="text-gray-900">₹{booking.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <InformationCircleIcon className="w-5 h-5" />
                                    <span>Important Information</span>
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4 text-sm text-gray-700">
                                    <div className="flex items-start space-x-3">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-gray-500 mt-1" />
                                        <p>Please arrive at the airport 2 hours before domestic flights and 3 hours before international flights.</p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <IdentificationIcon className="w-4 h-4 text-gray-500 mt-1" />
                                        <p>Carry a valid government-issued photo ID for all passengers.</p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <UserIcon className="w-4 h-4 text-gray-500 mt-1" />
                                        <p>Seat selection will be available 24 hours before departure.</p>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <PhoneIcon className="w-4 h-4 text-gray-500 mt-1" />
                                        <p>Flight updates will be sent to your registered mobile number.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/user/dashboard')}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Back to My Bookings
                                </button>
                                {booking.status === 'CONFIRMED' && (
                                    <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                                        Download E-Ticket
                                    </button>
                                )}
                                {booking.status === 'BOOKED' && (
                                    <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                                        Modify Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}