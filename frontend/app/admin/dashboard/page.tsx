"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/Logout";
import AddFlightModal from "@/components/AddFlightModal";
import EditFlightModal from "@/components/EditFlightModal";
import { getFlights, deleteFlight, Flight } from "@/services/flight.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";

type TabType = 'overview' | 'flights' | 'users' | 'analytics';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Role-based access control - only ADMIN can access this page
    useRoleAccess('ADMIN');

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <span className="text-white text-2xl font-bold">SF</span>
                    </div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-700 text-xl font-semibold mb-2">Loading SkyFly Admin</p>
                    <p className="text-slate-500">Setting up your dashboard...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
        { id: 'flights' as TabType, label: 'Flight Management', icon: '✈️' },
        { id: 'users' as TabType, label: 'User Management', icon: '👥' },
        { id: 'analytics' as TabType, label: 'Analytics', icon: '📈' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">SF</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">SkyFly Admin</h1>
                                <p className="text-xs text-slate-300">Management Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Administrator</p>
                                <p className="text-sm font-semibold text-white">Admin User</p>
                            </div>
                            <div className="w-px h-8 bg-slate-600"></div>
                            <Logout />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <nav className="flex space-x-2 bg-white rounded-xl p-2 shadow-lg border border-slate-200" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-3 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {activeTab === 'overview' && <AdminOverviewTab />}
                    {activeTab === 'flights' && <FlightsManagementTab />}
                    {activeTab === 'users' && <UsersManagementTab />}
                    {activeTab === 'analytics' && <AnalyticsTab />}
                </div>
            </div>
        </div>
    );
}

// Admin Overview Tab
function AdminOverviewTab() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-600 mt-1">Monitor your flight operations and business metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Flights</p>
                            <p className="text-4xl font-bold mt-2">24</p>
                            <p className="text-blue-200 text-xs mt-1">Active routes</p>
                        </div>
                        <div className="text-5xl opacity-80">✈️</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Users</p>
                            <p className="text-4xl font-bold mt-2">1,247</p>
                            <p className="text-emerald-200 text-xs mt-1">Registered accounts</p>
                        </div>
                        <div className="text-5xl opacity-80">👥</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">Total Bookings</p>
                            <p className="text-4xl font-bold mt-2">3,492</p>
                            <p className="text-amber-200 text-xs mt-1">This month</p>
                        </div>
                        <div className="text-5xl opacity-80">🎫</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Revenue</p>
                            <p className="text-4xl font-bold mt-2">₹2.4M</p>
                            <p className="text-purple-200 text-xs mt-1">Monthly earnings</p>
                        </div>
                        <div className="text-5xl opacity-80">💰</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">📋</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Bookings</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 text-sm">✈️</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">SF-202: Delhi → Mumbai</p>
                                    <p className="text-xs text-slate-500">John Doe • 2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">₹8,500</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <span className="text-emerald-600 text-sm">✈️</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">SF-305: Mumbai → Bangalore</p>
                                    <p className="text-xs text-slate-500">Jane Smith • 4 hours ago</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">₹6,200</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 text-sm">✈️</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">SF-156: Delhi → Chennai</p>
                                    <p className="text-xs text-slate-500">Mike Johnson • 6 hours ago</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">₹9,500</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">⚙️</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">System Status</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-slate-700">Flight API</span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Online</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-slate-700">Booking System</span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Online</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-slate-700">Payment Gateway</span>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Maintenance</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-slate-700">Database</span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Flights Management Tab
function FlightsManagementTab() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

    const fetchFlights = async () => {
        try {
            const data = await getFlights();
            setFlights(data);
        } catch (error) {
            console.error("Error fetching flights:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const handleAddFlightSuccess = () => {
        alert("Flight added successfully!");
        fetchFlights();
    };

    const handleEditFlightSuccess = () => {
        alert("Flight updated successfully!");
        fetchFlights();
    };

    const handleDeleteFlight = async (flightId: number) => {
        if (confirm("Are you sure you want to delete this flight?")) {
            try {
                await deleteFlight(flightId);
                alert("Flight deleted successfully!");
                fetchFlights();
            } catch (error) {
                console.error("Error deleting flight:", error);
                alert("Error deleting flight");
            }
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ON_TIME": return "bg-green-100 text-green-800";
            case "DELAYED": return "bg-yellow-100 text-yellow-800";
            case "CANCELLED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Flight Management</h2>
                    <p className="text-slate-600 mt-1">Manage your flight schedules, routes, and operations</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                    <span>✈️</span>
                    <span>Add New Flight</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 text-lg font-medium">Loading flights...</p>
                        <p className="text-slate-400 text-sm">Please wait while we fetch your data</p>
                    </div>
                </div>
            ) : flights.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✈️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No Flights Found</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">Start building your flight network by adding your first flight. Create routes, set schedules, and manage your aviation operations.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Add Your First Flight
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Flight Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Route
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Departure
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Arrival
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Seats
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {flights.map((flight) => (
                                    <tr key={flight.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <span className="text-blue-600 text-sm font-bold">✈️</span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">{flight.flightNumber}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-900">{flight.fromCity} → {flight.toCity}</div>
                                            <div className="text-xs text-slate-500 flex items-center">
                                                <span className="inline-block w-2 h-2 bg-slate-300 rounded-full mr-2"></span>
                                                T{flight.departureAirportTerminal} → T{flight.arrivalAirportTerminal}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{formatDateTime(flight.departureTime)}</div>
                                            <div className="text-xs text-slate-500">{flight.departureAirport.split('(')[0].trim()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{formatDateTime(flight.arrivalTime)}</div>
                                            <div className="text-xs text-slate-500">{flight.arrivalAirport.split('(')[0].trim()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(flight.status)}`}>
                                                {flight.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-900">{flight.availableSeats}/{flight.totalSeats}</div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full"
                                                    style={{ width: `${(flight.availableSeats / flight.totalSeats) * 100}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-emerald-600">₹{flight.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFlight(flight);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1"
                                                >
                                                    <span>✏️</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFlight(flight.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1"
                                                >
                                                    <span>🗑️</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddFlightModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddFlightSuccess}
            />

            <EditFlightModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditFlightSuccess}
                flight={selectedFlight}
            />
        </div>
    );
}

// Users Management Tab
function UsersManagementTab() {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">User Management</h2>
                    <p className="text-slate-600 mt-1">Manage user accounts, roles, and permissions</p>
                </div>
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2 opacity-60 cursor-not-allowed">
                    <span>👤</span>
                    <span>Add New User</span>
                </button>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">User Management System</h3>
                <p className="text-slate-600 mb-6 max-w-lg mx-auto">A comprehensive user management dashboard is being developed. You'll be able to manage user accounts, assign roles, set permissions, and monitor user activity.</p>
                <div className="flex justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">User Profiles</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Role Management</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Access Control</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 bg-slate-200 px-4 py-2 rounded-lg inline-block">🚀 Feature coming soon...</p>
            </div>
        </div>
    );
}

// Analytics Tab
function AnalyticsTab() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h2>
                <p className="text-slate-600 mt-1">Gain insights with comprehensive data visualization and reporting</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Advanced Analytics Platform</h3>
                <p className="text-slate-600 mb-6 max-w-lg mx-auto">Get powerful insights with interactive charts, real-time dashboards, and detailed reports on flight performance, revenue trends, and customer behavior.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📈</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">Revenue Analytics</h4>
                        <p className="text-sm text-slate-600">Track earnings and financial performance</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">✈️</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">Flight Performance</h4>
                        <p className="text-sm text-slate-600">Monitor flight metrics and efficiency</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">👥</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">Customer Insights</h4>
                        <p className="text-sm text-slate-600">Understand user behavior and preferences</p>
                    </div>
                </div>
                <p className="text-sm text-slate-500 bg-slate-200 px-4 py-2 rounded-lg inline-block">🚀 Feature coming soon...</p>
            </div>
        </div>
    );
}
