"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/Logout";
import { getUserBookings } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  ChartBarIcon,
  TicketIcon,
  UserIcon,
  TrophyIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  CogIcon
} from "@heroicons/react/24/outline";

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
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: ChartBarIcon },
        { id: 'bookings' as TabType, label: 'My Bookings', icon: TicketIcon },
        { id: 'profile' as TabType, label: 'Profile', icon: UserIcon },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-black/80 backdrop-blur-lg shadow-lg border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">SF</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">SkyFly Airlines</h1>
                                <p className="text-xs text-white">Your Travel Companion</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-sm text-white">Welcome back!</p>
                                <p className="text-lg font-semibold text-white">{user.name}</p>
                            </div>
                            {/* <div className="w-px h-8 bg-white"></div> */}
                            <Logout />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <nav className="flex space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-3 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
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
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Track your travel activity and manage your bookings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Bookings</p>
                            <p className="text-4xl font-bold mt-2">12</p>
                            <p className="text-blue-200 text-xs mt-1">This year</p>
                        </div>
                        <TicketIcon className="w-12 h-12 opacity-90" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Upcoming Flights</p>
                            <p className="text-4xl font-bold mt-2">3</p>
                            <p className="text-emerald-200 text-xs mt-1">Next 30 days</p>
                        </div>
                        <PaperAirplaneIcon className="w-12 h-12 opacity-90" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Miles Earned</p>
                            <p className="text-4xl font-bold mt-2">2,450</p>
                            <p className="text-purple-200 text-xs mt-1">Loyalty points</p>
                        </div>
                        <TrophyIcon className="w-12 h-12 opacity-90" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Flight booked to Mumbai</p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Check-in completed for flight SF-202</p>
                            <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Loyalty points earned</p>
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
                    <div className="text-red-600 mb-4 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2" />{error}</div>
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
                    <p className="text-gray-600 mt-1">Manage your flight reservations and travel plans</p>
                </div>
                <button
                    onClick={() => router.push('/user/book')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Book New Flight</span>
                </button>
            </div>

            <div className="space-y-6">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <TicketIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{booking.flight.flightNumber}</h3>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                            booking.status === 'CONFIRMED'
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === 'BOOKED'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="w-5 h-5 text-blue-500" />
                                        <span className="font-medium">{booking.flight.fromCity} → {booking.flight.toCity}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CalendarDaysIcon className="w-5 h-5 text-green-500" />
                                        <span>{new Date(booking.flight.departureTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="w-5 h-5 text-purple-500" />
                                        <span>{new Date(booking.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Passengers:</span> {booking.passengerCount}
                                    {booking.passengers && booking.passengers.length > 0 && (
                                        <span className="ml-2 text-gray-500">
                                            ({booking.passengers.map((p: any) => p.name).join(', ')})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right ml-6">
                                <p className="text-2xl font-bold text-emerald-600 mb-4">₹{booking.totalAmount.toLocaleString()}</p>
                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => router.push(`/user/booking/${booking.id}`)}
                                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1"
                                    >
                                        <span>View Details</span>
                                    </button>
                                    <button className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1">
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {bookings.length === 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <TicketIcon className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Start your journey by booking your first flight. Discover amazing destinations and create unforgettable memories.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2 mx-auto"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>Browse Flights</span>
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
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                <p className="text-gray-600">Manage your personal information and account preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                defaultValue="John Doe"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                defaultValue="john.doe@example.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                defaultValue="+91 9876543210"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                defaultValue="1990-01-01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <CogIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Language</label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white">
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Spanish</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white">
                                <option>INR (₹)</option>
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center p-4 bg-white rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="notifications"
                                    defaultChecked
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="notifications" className="ml-3 block text-sm font-medium text-gray-700">
                                    Email notifications for flight updates
                                </label>
                            </div>

                            <div className="flex items-center p-4 bg-white rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="promotions"
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="promotions" className="ml-3 block text-sm font-medium text-gray-700">
                                    Promotional emails and offers
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
                <button className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-150">
                    Cancel
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
