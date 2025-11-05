import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
        toast.error(data.message || "No bookings found");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error.message);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="p-6 md:px-16 lg:px-32 pt-32">
      <h1 className="text-3xl font-semibold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400 text-lg">You have no bookings yet.</p>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-gray-900 p-5 rounded-lg shadow-lg border border-gray-800"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                {booking.show?.movie?.poster_path && (
                  <img
                    src={image_base_url + booking.show.movie.poster_path}
                    alt={booking.show.movie.title}
                    className="w-32 h-44 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {booking.show?.movie?.title || "Untitled Movie"}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {new Date(booking.show?.showDateTime).toLocaleString()}
                  </p>
                  <p className="mt-2">
                    Seats:{" "}
                    <span className="text-primary">
                      {booking.bookedSeats.join(", ")}
                    </span>
                  </p>
                  <p className="mt-1">
                    Amount: <strong>${booking.amount}</strong>
                  </p>

                  {/* ✅ Hide Pay Now when isPaid = true */}
                  {!booking.isPaid ? (
                    <a
                      href={booking.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-md transition"
                    >
                      Pay Now
                    </a>
                  ) : (
                    <span className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-md">
                      Paid
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
