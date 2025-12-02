"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/Logout";
import AddFlightModal from "@/components/AddFlightModal";
import EditFlightModal from "@/components/EditFlightModal";
import { getFlights, deleteFlight, Flight } from "@/services/flight.service";

type TabType = 'overview' | 'flights' | 'users' | 'analytics';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-red-600 shadow-sm">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-white">SkyFly Admin</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-xs text-red-100">Administrator</p>
                                <p className="text-sm font-medium text-white">Admin User</p>
                            </div>
                            <Logout />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-red-500 text-red-600'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Total Flights</p>
                            <p className="text-3xl font-bold">24</p>
                        </div>
                        <div className="text-4xl">✈️</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold">1,247</p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Bookings</p>
                            <p className="text-3xl font-bold">3,492</p>
                        </div>
                        <div className="text-4xl">🎫</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Revenue</p>
                            <p className="text-3xl font-bold">₹2.4M</p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">SF-202: Delhi → Mumbai</p>
                                <p className="text-xs text-gray-500">John Doe • 2 hours ago</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">₹8,500</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">SF-305: Mumbai → Bangalore</p>
                                <p className="text-xs text-gray-500">Jane Smith • 4 hours ago</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">₹6,200</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">SF-156: Delhi → Chennai</p>
                                <p className="text-xs text-gray-500">Mike Johnson • 6 hours ago</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">₹9,500</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Flight API</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Booking System</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Payment Gateway</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Maintenance</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Database</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Flight Management</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    Add New Flight
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <span className="ml-3 text-gray-600">Loading flights...</span>
                </div>
            ) : flights.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Flights Found</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first flight</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Flight Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Route
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Departure
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Arrival
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Seats
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {flights.map((flight) => (
                                    <tr key={flight.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{flight.flightNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{flight.fromCity} → {flight.toCity}</div>
                                            <div className="text-xs text-gray-500">
                                                T{flight.departureAirportTerminal} → T{flight.arrivalAirportTerminal}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDateTime(flight.departureTime)}</div>
                                            <div className="text-xs text-gray-500">{flight.departureAirport.split('(')[0].trim()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDateTime(flight.arrivalTime)}</div>
                                            <div className="text-xs text-gray-500">{flight.arrivalAirport.split('(')[0].trim()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(flight.status)}`}>
                                                {flight.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {flight.availableSeats}/{flight.totalSeats}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{flight.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedFlight(flight);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFlight(flight.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Add New User
                </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Management System</h3>
                <p className="text-gray-500 mb-4">Manage user accounts, permissions, and access</p>
                <p className="text-sm text-gray-400">Feature coming soon...</p>
            </div>
        </div>
    );
}

// Analytics Tab
function AnalyticsTab() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-500 mb-4">View detailed reports, charts, and insights</p>
                <p className="text-sm text-gray-400">Feature coming soon...</p>
            </div>
        </div>
    );
}
