"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/Logout";
import AddFlightModal from "@/components/AddFlightModal";
import EditFlightModal from "@/components/EditFlightModal";
import AddAircraftModal from "@/components/AddAircraftModal";
import EditAircraftModal from "@/components/EditAircraftModal";
import { getFlights, deleteFlight, Flight, searchFlightsAdmin, SearchFlightsParams, SearchFlightsResponse } from "@/services/flight.service";
import { getStats, Stats } from "@/services/stats.service";

const availableCities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow"
];
import { getAircraft, deleteAircraft, Aircraft } from "@/services/aircraft.service";
import { getAllBookings, updateBookingStatus, Booking } from "@/services/booking.service";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  ChartBarIcon,
  PaperAirplaneIcon,
  TicketIcon,
  UsersIcon,
  ChartBarSquareIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RocketLaunchIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

type TabType = 'overview' | 'flights' | 'aircraft' | 'bookings';

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
        { id: 'overview' as TabType, label: 'Overview', icon: ChartBarIcon },
        { id: 'flights' as TabType, label: 'Flight Management', icon: PaperAirplaneIcon },
        { id: 'aircraft' as TabType, label: 'Aircraft Management', icon: RocketLaunchIcon },
        { id: 'bookings' as TabType, label: 'Booking Management', icon: TicketIcon }
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="shadow-xl border-b">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">SF</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">SkyFly Admin</h1>
                                <p className="text-xs">Management Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-xs text-black">Administrator</p>
                                <p className="text-sm font-semibold text-black">Admin User</p>
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
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {activeTab === 'overview' && <AdminOverviewTab />}
                    {activeTab === 'flights' && <FlightsManagementTab />}
                    {activeTab === 'aircraft' && <AircraftManagementTab />}
                    {activeTab === 'bookings' && <BookingsManagementTab />}
                </div>
            </div>
        </div>
    );
}

// Admin Overview Tab
function AdminOverviewTab() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

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
                            <p className="text-4xl font-bold mt-2">
                                {statsLoading ? "..." : (stats?.totalFlights ?? 0)}
                            </p>
                            <p className="text-blue-200 text-xs mt-1">Active routes</p>
                        </div>
                        <PaperAirplaneIcon className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Users</p>
                            <p className="text-4xl font-bold mt-2">
                                {statsLoading ? "..." : (stats?.totalUsers ?? 0)}
                            </p>
                            <p className="text-emerald-200 text-xs mt-1">Registered accounts</p>
                        </div>
                        <UsersIcon className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">Total Bookings</p>
                            <p className="text-4xl font-bold mt-2">
                                {statsLoading ? "..." : (stats?.totalBookings ?? 0)}
                            </p>
                            <p className="text-amber-200 text-xs mt-1">This month</p>
                        </div>
                        <TicketIcon className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Total Aircrafts</p>
                            <p className="text-4xl font-bold mt-2">
                                {statsLoading ? "..." : (stats?.totalAircrafts ?? 0)}
                            </p>
                            <p className="text-purple-200 text-xs mt-1">Fleet size</p>
                        </div>
                        <RocketLaunchIcon className="w-12 h-12 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Bookings</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <PaperAirplaneIcon className="w-4 h-4 text-blue-600" />
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
                                    <PaperAirplaneIcon className="w-4 h-4 text-emerald-600" />
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
                                    <PaperAirplaneIcon className="w-4 h-4 text-purple-600" />
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
                            <CogIcon className="w-5 h-5 text-white" />
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
    const [searchParams, setSearchParams] = useState<SearchFlightsParams>({});
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [isSearchMode, setIsSearchMode] = useState(false);

    const fetchFlights = async () => {
        try {
            if (isSearchMode) {
                const params = { ...searchParams, page: pagination.page, limit: pagination.limit };
                const response: SearchFlightsResponse = await searchFlightsAdmin(params);
                setFlights(response.data);
                setPagination(response.pagination);
            } else {
                // For non-search mode, use search API with empty params to get paginated results
                const params = { page: pagination.page, limit: pagination.limit };
                const response: SearchFlightsResponse = await searchFlightsAdmin(params);
                setFlights(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error("Error fetching flights:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, [isSearchMode, searchParams, pagination.page, pagination.limit]);

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

    const handleSearch = (params: SearchFlightsParams) => {
        setSearchParams(params);
        setPagination(prev => ({ ...prev, page: 1 }));
        setIsSearchMode(true);
    };

    const handleClearSearch = () => {
        setSearchParams({});
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
        setIsSearchMode(false);
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
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
                    <PaperAirplaneIcon className="w-5 h-5" />
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
                        <PaperAirplaneIcon className="w-16 h-16" />
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
                <div className="space-y-6">
                    {/* Search Filters */}
                    <div className="bg-white shadow-xl rounded-2xl p-6 border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Search & Filter Flights</h3>
                            {isSearchMode && (
                                <button
                                    onClick={handleClearSearch}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const params: SearchFlightsParams = {
                                flightNumber: formData.get('flightNumber') as string || undefined,
                                fromCity: formData.get('fromCity') as string || undefined,
                                toCity: formData.get('toCity') as string || undefined,
                                departureTimeFrom: formData.get('departureTimeFrom') as string || undefined,
                                departureTimeTo: formData.get('departureTimeTo') as string || undefined,
                                status: formData.get('status') as string || undefined,
                            };
                            handleSearch(params);
                        }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                name="flightNumber"
                                placeholder="Flight Number"
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <select
                                name="fromCity"
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All From Cities</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="toCity"
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All To Cities</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="status"
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="ON_TIME">On Time</option>
                                <option value="DELAYED">Delayed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <input
                                name="departureTimeFrom"
                                type="datetime-local"
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                name="departureTimeTo"
                                type="datetime-local"
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                                >
                                    Search Flights
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Flights Table */}
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                        <div className="overflow-auto max-h-110">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Flight Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Route
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Aircraft
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
                                        Economy Class
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Business Class
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        First Class
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
                                                    <PaperAirplaneIcon className="w-4 h-4 text-blue-600" />
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
                                            <div className="text-sm font-semibold text-slate-900">{flight.aircraft?.model ?? 'Unknown aircraft'}</div>
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
                                            <div className="text-lg font-bold text-emerald-600">₹{flight.economyPrice}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-emerald-600">₹{flight.businessPrice}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-emerald-600">₹{flight.firstPrice}</div>
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
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFlight(flight.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
                        <div className="text-sm text-slate-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} flights
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-slate-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
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

// Bookings Management Tab
function BookingsManagementTab() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPassengerModal, setShowPassengerModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        try {
            const data = await getAllBookings();
            setBookings(data);
        } catch (err: any) {
            console.error("Error fetching bookings:", err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (bookingId: number, status: 'CONFIRMED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this booking?`)) {
            return;
        }

        try {
            await updateBookingStatus(bookingId, status);
            alert(`Booking ${status.toLowerCase()} successfully!`);
            fetchBookings(); // Refresh the list
        } catch (error) {
            console.error("Error updating booking status:", error);
            alert("Error updating booking status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "BOOKED": return "bg-blue-100 text-blue-800";
            case "CONFIRMED": return "bg-green-100 text-green-800";
            case "REJECTED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-lg font-medium">Loading bookings...</p>
                    <p className="text-slate-400 text-sm">Please wait while we fetch booking data</p>
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
                    <h2 className="text-3xl font-bold text-slate-900">Booking Management</h2>
                    <p className="text-slate-600 mt-1">Review and manage flight bookings, approve or reject requests</p>
                </div>
                <div className="flex space-x-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <span className="text-blue-700 font-semibold">{bookings.filter(b => b.status === 'BOOKED').length}</span>
                        <span className="text-blue-600 text-sm ml-1">Pending</span>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <span className="text-green-700 font-semibold">{bookings.filter(b => b.status === 'CONFIRMED').length}</span>
                        <span className="text-green-600 text-sm ml-1">Confirmed</span>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-lg">
                        <span className="text-red-700 font-semibold">{bookings.filter(b => b.status === 'REJECTED').length}</span>
                        <span className="text-red-600 text-sm ml-1">Rejected</span>
                    </div>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <TicketIcon className="w-16 h-16" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No Bookings Found</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">There are no bookings in the system yet. Bookings will appear here once users start making flight reservations.</p>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto max-h-110">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Flight
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Passengers
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">#{booking.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{booking.user.name}</div>
                                            <div className="text-xs text-slate-500">{booking.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-900">{booking.flight.flightNumber}</div>
                                            <div className="text-xs text-slate-500">{booking.flight.fromCity} → {booking.flight.toCity}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{booking.passengerCount}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-md font-bold text-black">₹{booking.totalAmount.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{formatDateTime(booking.createdAt)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowPassengerModal(true);
                                                    }}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span>Passenger Details</span>
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

            {/* Passenger Details Modal */}
            {showPassengerModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Passenger Details</h3>
                            <button
                                onClick={() => setShowPassengerModal(false)}
                                className="text-white hover:text-slate-200 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-slate-900 mb-2">Booking Information</h4>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-slate-500">Booking ID:</span>
                                            <p className="font-semibold text-slate-900">#{selectedBooking.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-500">Flight:</span>
                                            <p className="font-semibold text-slate-900">{selectedBooking.flight.flightNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-500">Route:</span>
                                            <p className="font-semibold text-slate-900">{selectedBooking.flight.fromCity} → {selectedBooking.flight.toCity}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-500">Customer:</span>
                                            <p className="font-semibold text-slate-900">{selectedBooking.user.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-4">Passengers ({selectedBooking.passengers.length})</h4>
                                <div className="space-y-4">
                                    {selectedBooking.passengers.map((passenger, index) => (
                                        <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-slate-900 text-lg">{passenger.name}</h5>
                                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-sm text-slate-500">Age:</span>
                                                            <p className="font-medium text-slate-900">{passenger.age} years</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-slate-500">Gender:</span>
                                                            <p className="font-medium text-slate-900">{passenger.gender}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-slate-500">Class:</span>
                                                            <p className="font-medium text-slate-900">{passenger.seatClass || 'Not assigned'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-slate-500">Seat Number:</span>
                                                            <p className="font-bold text-blue-600 text-lg">{passenger.seatNumber || 'Not assigned'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Aircraft Management Tab
function AircraftManagementTab() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [aircraft, setAircraft] = useState<Aircraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

    const fetchAircraft = async () => {
        try {
            const data = await getAircraft();
            setAircraft(data);
        } catch (error) {
            console.error("Error fetching aircraft:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAircraft();
    }, []);

    const handleAddAircraftSuccess = () => {
        alert("Aircraft added successfully!");
        fetchAircraft();
    };

    const handleEditAircraftSuccess = () => {
        alert("Aircraft updated successfully!");
        fetchAircraft();
    };

    const handleDeleteAircraft = async (aircraftId: number) => {
        if (confirm("Are you sure you want to delete this aircraft?")) {
            try {
                await deleteAircraft(aircraftId);
                alert("Aircraft deleted successfully!");
                fetchAircraft();
            } catch (error) {
                console.error("Error deleting aircraft:", error);
                alert("Error deleting aircraft");
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Aircraft Management</h2>
                    <p className="text-slate-600 mt-1">Manage your aircraft fleet, models, and configurations</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                    <RocketLaunchIcon className="w-5 h-5" />
                    <span>Add New Aircraft</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 text-lg font-medium">Loading aircraft...</p>
                        <p className="text-slate-400 text-sm">Please wait while we fetch your data</p>
                    </div>
                </div>
            ) : aircraft.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <RocketLaunchIcon className="w-16 h-16" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No Aircraft Found</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">Start building your aircraft fleet by adding your first aircraft. Configure models, seat layouts, and manage your aviation assets.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Add Your First Aircraft
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                    <div className="overflow-auto max-h-110">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Aircraft Model
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Economy Seats
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Business Seats
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        First Class Seats
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Total Seats
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {aircraft.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                    <RocketLaunchIcon className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">{item.model}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{item.economySeatCount || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{item.businessSeatCount || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{item.firstSeatCount || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-slate-900">
                                                {(item.economySeatCount || 0) + (item.businessSeatCount || 0) + (item.firstSeatCount || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAircraft(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAircraft(item.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-1"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
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

            <AddAircraftModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddAircraftSuccess}
            />

            <EditAircraftModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditAircraftSuccess}
                aircraft={selectedAircraft}
            />
        </div>
    );
}


