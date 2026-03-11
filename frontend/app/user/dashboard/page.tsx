"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Logout from "@/components/Logout";
import { getUserBookings } from "@/services/booking.service";
import { updateUser } from "@/services/user.service";
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
    CogIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon,
    PencilIcon ,
    EyeIcon 
} from "@heroicons/react/24/outline";
import Navbar from "@/layout/Navbar";
import WriteReviewModal from "@/components/WriteReviewModal";
import { deleteReview, getMyReviews, updateReview } from "@/services/review.service";

type TabType = 'bookings' | 'profile';
type BookingTabType = 'upcoming' | 'archive';
type UserReview = {
    id: number;
    passengerId: number;
    flightId: number;
    stars: number;
    content: string;
    passenger?: { name?: string };
};

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('bookings');
    const [user, setUser] = useState<any>({});

    // Role-based access control - only USER can access this page
    useRoleAccess('USER');

    useEffect(() => {
        // Check if user is logged in and load user data
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
            router.push("/login");
        } else {
            if (userData) {
                setUser(JSON.parse(userData));
            }
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
        { id: 'bookings' as TabType, label: 'My Bookings', icon: TicketIcon },
        { id: 'profile' as TabType, label: 'Profile', icon: UserIcon },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <Navbar />
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <nav className="flex space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-3 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === tab.id
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
                    {activeTab === 'bookings' && <BookingsTab />}
                    {activeTab === 'profile' && <ProfileTab user={user} />}
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
    const [bookingTab, setBookingTab] = useState<BookingTabType>('upcoming');
    const [reviewedPassengerIds, setReviewedPassengerIds] = useState<Set<number>>(new Set());
    const [myReviews, setMyReviews] = useState<UserReview[]>([]);
    const [reviewModal, setReviewModal] = useState<{ booking: any } | null>(null);
    const [viewReviewModal, setViewReviewModal] = useState<{ booking: any } | null>(null);
    const router = useRouter();

    // Separate bookings into upcoming and archived
    const upcomingBookings = bookings.filter(booking => new Date(booking.flight.departureTime) >= new Date());
    const archivedBookings = bookings.filter(booking => new Date(booking.flight.departureTime) < new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userBookings = await getUserBookings();
                setBookings(userBookings);
            } catch (err: any) {
                console.error('Failed to fetch bookings:', err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }

            // Load reviews separately — failure here won't block booking display
            try {
                const myReviews = await getMyReviews();
                setMyReviews(myReviews);
                const reviewedIds = new Set<number>(myReviews.map((r: any) => r.passengerId));
                setReviewedPassengerIds(reviewedIds);
            } catch {
                // Reviews not critical — silently ignore
            }
        };

        fetchData();
    }, []);

    const isBookingReviewed = (booking: any) =>
        booking.passengers?.every((p: any) => reviewedPassengerIds.has(p.id));

    const handleReviewSuccess = (passengerId: number) => {
        setReviewedPassengerIds(prev => new Set(prev).add(passengerId));
        // Reload reviews so user can view/edit immediately after writing.
        getMyReviews()
            .then((reviews) => setMyReviews(reviews))
            .catch(() => undefined);
    };

    const getReviewsForBooking = (booking: any) => {
        const passengerIds = new Set<number>((booking.passengers ?? []).map((p: any) => p.id));
        return myReviews.filter((review) => passengerIds.has(review.passengerId));
    };

    const handleReviewUpdated = (updatedReview: UserReview) => {
        setMyReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
    };

    const handleReviewDeleted = (deletedReview: UserReview) => {
        setMyReviews((prev) => prev.filter((r) => r.id !== deletedReview.id));
        setReviewedPassengerIds((prev) => {
            const next = new Set(prev);
            next.delete(deletedReview.passengerId);
            return next;
        });
    };

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
            {reviewModal && (
                <WriteReviewModal
                    flightId={reviewModal.booking.flight.id}
                    flightNumber={reviewModal.booking.flight.flightNumber}
                    fromCity={reviewModal.booking.flight.fromCity}
                    toCity={reviewModal.booking.flight.toCity}
                    passengers={reviewModal.booking.passengers ?? []}
                    onClose={() => setReviewModal(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}
            {viewReviewModal && (
                <ViewReviewModal
                    booking={viewReviewModal.booking}
                    reviews={getReviewsForBooking(viewReviewModal.booking)}
                    onClose={() => setViewReviewModal(null)}
                    onUpdated={handleReviewUpdated}
                    onDeleted={handleReviewDeleted}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
                    <p className="text-gray-600 mt-1">Manage your flight reservations and travel plans</p>
                </div>
                {bookings.length > 0 && (
                    <div className="flex space-x-2 bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setBookingTab('upcoming')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${bookingTab === 'upcoming' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Upcoming ({upcomingBookings.length})
                        </button>
                        <button
                            onClick={() => setBookingTab('archive')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${bookingTab === 'archive' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Archive ({archivedBookings.length})
                        </button>
                    </div>
                )}
                <button
                    onClick={() => router.push('/')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Book New Flight</span>
                </button>
            </div>

            <div className="space-y-6">
                {(bookingTab === 'upcoming' ? upcomingBookings : archivedBookings).map((booking) => (
                    <div key={booking.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <TicketIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{booking.flight.flightNumber}</h3>
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
                                        <span>{new Date(booking.flight.departureTime).toLocaleString("en-GB", {
                                            timeZone: "UTC",
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        })
                                        } IST</span>
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
                                        className="bg-blue-200 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1"
                                    >
                                        <span>View Booking Details</span>
                                    </button>
                                    {bookingTab === 'archive' && (
                                        isBookingReviewed(booking) ? (
                                            <button
                                                onClick={() => setViewReviewModal({ booking })}
                                                className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1"
                                            ><EyeIcon className="w-4 h-4 text-green" />
                                                <span>View Review</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setReviewModal({ booking })}
                                                className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1"
                                            ><PencilIcon className="w-4 h-4 text-red" />
                                                <span>Write a Review</span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(bookingTab === 'upcoming' ? upcomingBookings : archivedBookings).length === 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <TicketIcon className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{bookingTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Archived Bookings'}</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{bookingTab === 'upcoming' ? 'Start your journey by booking your first flight. Discover amazing destinations and create unforgettable memories.' : 'Your completed flights will appear here.'}</p>
                    <button
                        onClick={() => bookingTab === 'upcoming' ? router.push('/') : setBookingTab('upcoming')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2 mx-auto"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>{bookingTab === 'upcoming' ? 'Browse Flights' : 'View Upcoming Bookings'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function ViewReviewModal({
    booking,
    reviews,
    onClose,
    onUpdated,
    onDeleted,
}: {
    booking: any;
    reviews: UserReview[];
    onClose: () => void;
    onUpdated: (review: UserReview) => void;
    onDeleted: (review: UserReview) => void;
}) {
    const [mounted, setMounted] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editStars, setEditStars] = useState(0);
    const [editContent, setEditContent] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const beginEdit = (review: UserReview) => {
        setEditingId(review.id);
        setEditStars(review.stars);
        setEditContent(review.content);
        setActionError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditStars(0);
        setEditContent("");
        setActionError(null);
    };

    const submitEdit = async (review: UserReview) => {
        if (editStars < 1 || editStars > 5) {
            setActionError("Please select a rating between 1 and 5.");
            return;
        }
        if (editContent.trim().length < 10) {
            setActionError("Review must be at least 10 characters.");
            return;
        }

        setActionLoading(review.id);
        setActionError(null);
        try {
            const updated = await updateReview(review.id, {
                stars: editStars,
                content: editContent.trim(),
            });
            onUpdated(updated as UserReview);
            cancelEdit();
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Failed to update review.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (review: UserReview) => {
        setActionLoading(review.id);
        setActionError(null);
        try {
            await deleteReview(review.id);
            onDeleted(review);
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Failed to delete review.");
        } finally {
            setActionLoading(null);
        }
    };

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Your Reviews</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {booking.flight.flightNumber} · {booking.flight.fromCity} → {booking.flight.toCity}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {actionError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}

                    {reviews.length === 0 ? (
                        <p className="text-gray-600">No reviews found for this booking.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-semibold text-gray-900">
                                        {review.passenger?.name || "Passenger"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => beginEdit(review)}
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Edit review"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Delete review"
                                            disabled={actionLoading === review.id}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {editingId === review.id ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setEditStars(star)}
                                                    className="text-xl"
                                                >
                                                    {star <= editStars ? "★" : "☆"}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => submitEdit(review)}
                                                disabled={actionLoading === review.id}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-amber-500 mb-2">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</p>
                                        <p className="text-gray-700">{review.content}</p>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// Profile Tab
function ProfileTab({ user }: { user: any }) {

    // Format date to YYYY-MM-DD for date input
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: formatDateForInput(user.dob)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccess(false); // Clear success message when user makes changes
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Convert date format back to ISO DateTime if provided
            const dataToSend = { ...formData };
            if (formData.dob) {
                dataToSend.dob = new Date(formData.dob).toISOString();
            }
            
            const updatedUser = await updateUser(user.id, dataToSend);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setSuccess(true);
            
            // Update form data with the response
            setFormData({
                name: updatedUser.name || "",
                email: updatedUser.email || "",
                phone: updatedUser.phone || "",
                dob: formatDateForInput(updatedUser.dob)
            });
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error('Failed to update user:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            dob: formatDateForInput(user.dob)
        });
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                <p className="text-gray-600">Manage your personal information and account preferences</p>
            </div>

            {!user.isProfileComplete && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-yellow-700">Please complete your profile by entering your phone number and date of birth.</span>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                    <TrophyIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-green-700">Profile updated successfully!</span>
                </div>
            )}

            {/* Personal Information */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
                <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-150"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
        </div>
    );
}
