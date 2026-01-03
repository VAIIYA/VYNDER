"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  age?: number;
  gender?: string;
  interestedIn?: string[];
  location?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  tags?: string[];
  photos: string[];
  profileCompletionPercentage: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    age: "",
    gender: "",
    interestedIn: [] as string[],
    location: "",
    city: "",
    country: "",
    tags: "" as string, // Comma-separated tags string
    photos: [] as string[],
  });
  const [locationStatus, setLocationStatus] = useState<"idle" | "getting" | "success" | "error">("idle");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadProfile();
    }
  }, [status]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setFormData({
          username: data.user.username || "",
          bio: data.user.bio || "",
          age: data.user.age?.toString() || "",
          gender: data.user.gender || "",
          interestedIn: data.user.interestedIn || [],
          location: data.user.location || "",
          city: data.user.city || "",
          country: data.user.country || "",
          tags: (data.user.tags || []).join(", "), // Convert array to comma-separated string
          photos: data.user.photos || [],
        });
      } else {
        toast.error(data.error || "Failed to load profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("getting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get city/country (using a free API)
          const geoResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const geoData = await geoResponse.json();

          // Update form data with coordinates and location
          setFormData((prev) => ({
            ...prev,
            coordinates: { latitude, longitude },
            city: geoData.city || geoData.locality || "",
            country: geoData.countryName || "",
            location: `${geoData.city || geoData.locality || ""}, ${geoData.countryName || ""}`.trim(),
          }));

          setLocationStatus("success");
          toast.success("Location captured successfully!");
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationStatus("error");
          toast.error("Failed to get location details");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("error");
        toast.error("Failed to get your location. Please allow location access.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSave = async () => {
    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim().replace(/^#+/, ""))
        .filter((tag) => tag.length > 0)
        .map((tag) => `#${tag.toLowerCase()}`)
        .slice(0, 20); // Max 20 tags

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
          tags: tagsArray,
          // Include coordinates if available
          coordinates: formData.coordinates || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setEditing(false);
        toast.success("Profile updated!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a real app, you'd upload to a service like Cloudinary, AWS S3, etc.
    // For now, we'll just show a message
    toast.error("Photo upload not implemented. Use image URLs for now.");
    
    // Example: You would do something like:
    // const formData = new FormData();
    // formData.append('photo', files[0]);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    // const data = await response.json();
    // setFormData({ ...formData, photos: [...formData.photos, data.url] });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-600 dark:text-primary-400 font-semibold"
              >
                Edit
              </button>
            )}
          </div>

          {/* Profile Completion */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Profile Completion
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {profile.profileCompletionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${profile.profileCompletionPercentage}%` }}
              />
            </div>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos ({formData.photos.length}/6)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {editing && (
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          photos: formData.photos.filter((_, i) => i !== index),
                        });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {editing && formData.photos.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-2xl text-gray-400">+</span>
                </label>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {profile.bio || "No bio yet"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    min={18}
                    max={100}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile.age || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                {editing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white capitalize">
                    {profile.gender || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interested In
              </label>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {["male", "female", "non-binary", "all"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interestedIn.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              interestedIn: [...formData.interestedIn, option],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              interestedIn: formData.interestedIn.filter(
                                (i) => i !== option
                              ),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {profile.interestedIn && profile.interestedIn.length > 0
                    ? profile.interestedIn.join(", ")
                    : "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              {editing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="City, State"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationStatus === "getting"}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {locationStatus === "getting" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Getting...
                        </>
                      ) : (
                        <>
                          📍 Get GPS Location
                        </>
                      )}
                    </button>
                  </div>
                  {formData.city && formData.country && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.city}, {formData.country}
                    </p>
                  )}
                  {profile.coordinates && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Coordinates: {profile.coordinates.latitude.toFixed(4)}, {profile.coordinates.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-900 dark:text-white">
                    {profile.location || profile.city || "Not set"}
                  </p>
                  {profile.coordinates && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      GPS: {profile.coordinates.latitude.toFixed(4)}, {profile.coordinates.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags / Interests (comma-separated)
              </label>
              {editing ? (
                <div>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="#movies, #travel, #fitness, #cooking"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter tags separated by commas. Use hashtags like #movies, #travel, etc. (Max 20 tags)
                  </p>
                  {formData.tags && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0)
                        .slice(0, 20)
                        .map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs"
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {profile.tags && profile.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No tags yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}




