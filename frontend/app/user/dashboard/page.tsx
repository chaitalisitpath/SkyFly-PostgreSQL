"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/Logout";
import { getUserBookings } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";

type TabType = 'dashboard' | 'bookings' | 'profile';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Role-based access control - only USER can access this page
    useRoleAccess('USER');

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");


        if (!token) {
            router.push("/login");
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
        { id: 'bookings' as TabType, label: 'My Bookings', icon: '🎫' },
        { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">SkyFly Airlines</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Welcome back!</p>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            </div>
                            <Logout />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'bookings' && <BookingsTab />}
                    {activeTab === 'profile' && <ProfileTab />}
                </div>
            </div>
        </div>
    );
}

// Dashboard Overview Tab
function DashboardTab() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                            <p className="text-3xl font-bold">12</p>
                        </div>
                        <div className="text-4xl">🎫</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Upcoming Flights</p>
                            <p className="text-3xl font-bold">3</p>
                        </div>
                        <div className="text-4xl">✈️</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Miles Earned</p>
                            <p className="text-3xl font-bold">2,450</p>
                        </div>
                        <div className="text-4xl">🏆</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Flight booked to Mumbai</p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Check-in completed for flight SF-202</p>
                            <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Loyalty points earned</p>
                            <p className="text-xs text-gray-500">2 weeks ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// My Bookings Tab
function BookingsTab() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const userBookings = await getUserBookings();
                setBookings(userBookings);
            } catch (err: any) {
                console.error('Failed to fetch bookings:', err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">⚠️ {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    Book New Flight
                </button>
            </div>

            <div className="space-y-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{booking.flight.flightNumber}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        booking.status === 'CONFIRMED'
                                            ? 'bg-green-100 text-green-800'
                                            : booking.status === 'BOOKED'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span>📍</span>
                                        <span>{booking.flight.fromCity} → {booking.flight.toCity}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>📅</span>
                                        <span>{new Date(booking.flight.departureTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>🕐</span>
                                        <span>{new Date(booking.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Passengers:</span> {booking.passengerCount}
                                    {booking.passengers && booking.passengers.length > 0 && (
                                        <span className="ml-2">
                                            ({booking.passengers.map((p: any) => p.name).join(', ')})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
                                <div className="flex space-x-2 mt-2">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View Details
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {bookings.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎫</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-4">Start your journey by booking your first flight</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                        Browse Flights
                    </button>
                </div>
            )}
        </div>
    );
}

// Profile Tab
function ProfileTab() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                defaultValue="John Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                defaultValue="john.doe@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                defaultValue="+91 9876543210"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                defaultValue="1990-01-01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Spanish</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>INR (₹)</option>
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="notifications"
                                defaultChecked
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                                Email notifications for flight updates
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="promotions"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="promotions" className="ml-2 block text-sm text-gray-700">
                                Promotional emails and offers
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
