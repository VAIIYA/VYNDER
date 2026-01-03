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
    coordinates: undefined as { latitude: number; longitude: number } | undefined,
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
          coordinates: data.user.coordinates || undefined,
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
        // Update formData with the returned user data to reflect any server-side changes
        setFormData({
          username: data.user.username || "",
          bio: data.user.bio || "",
          age: data.user.age?.toString() || "",
          gender: data.user.gender || "",
          interestedIn: data.user.interestedIn || [],
          location: data.user.location || "",
          city: data.user.city || "",
          country: data.user.country || "",
          tags: (data.user.tags || []).join(", "),
          photos: data.user.photos || [],
          coordinates: data.user.coordinates || undefined,
        });
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

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Check if we're at the limit
    if (formData.photos.length >= 6) {
      toast.error("Maximum 6 photos allowed");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("Uploading image...");

      // Create FormData
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      // Upload to MongoDB
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data.fileId) {
        // Add the MongoDB file ID to photos array
        // The image will be served from /api/images/[fileId]
        const imageUrl = `/api/images/${data.fileId}`;
        setFormData({
          ...formData,
          photos: [...formData.photos, imageUrl],
        });
        toast.dismiss(loadingToast);
        toast.success("Image uploaded successfully!");
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("An error occurred while uploading");
      console.error("Upload error:", error);
    }

    // Reset input
    e.target.value = "";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-20" key="profile-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-solana-purple via-solana-blue to-solana-green bg-clip-text text-transparent">
              Profile
            </h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-solana-purple to-solana-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-solana-purple/50 transition-all"
              >
                Edit
              </button>
            )}
          </div>

          {/* Profile Completion Card */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-300">
                Profile Completion
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-solana-green to-solana-blue bg-clip-text text-transparent">
                {profile.profileCompletionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-solana-purple via-solana-blue to-solana-green transition-all duration-500 shadow-lg shadow-solana-purple/50"
                style={{ width: `${profile.profileCompletionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photos & Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos Card */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold text-white">
                  Photos
                </label>
                <span className="px-3 py-1 bg-solana-purple/20 text-solana-purple rounded-full text-sm font-medium border border-solana-purple/30">
                  {formData.photos.length}/6
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={photo.startsWith("/api/images/")}
                  />
                  {editing && (
                    <button
                      onClick={async () => {
                        const photoToRemove = photo;
                        // If it's a MongoDB image (starts with /api/images/), delete it
                        if (photoToRemove.startsWith("/api/images/")) {
                          const fileId = photoToRemove.split("/api/images/")[1];
                          try {
                            await fetch(`/api/images/${fileId}`, {
                              method: "DELETE",
                            });
                          } catch (error) {
                            console.error("Failed to delete image:", error);
                            // Continue with removal from UI even if deletion fails
                          }
                        }
                        // Remove from form data
                        setFormData({
                          ...formData,
                          photos: formData.photos.filter((_, i) => i !== index),
                        });
                      }}
                      className="absolute top-2 right-2 bg-solana-purple/80 hover:bg-solana-purple text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {editing && formData.photos.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-solana-purple/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-solana-purple hover:bg-solana-purple/10 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-3xl text-solana-purple group-hover:scale-110 transition-transform">+</span>
                  <span className="text-xs text-gray-400 mt-1">Add Photo</span>
                </label>
              )}
              </div>
            </div>

            {/* Basic Info Card */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-solana-purple to-solana-blue rounded-full"></span>
                Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <span className="text-solana-blue">👤</span>
                    Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all"
                    />
                  ) : (
                    <p className="text-white text-lg font-medium">{profile.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <span className="text-solana-green">✍️</span>
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      {profile.bio || <span className="text-gray-500 italic">No bio yet</span>}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-solana-blue">🎂</span>
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all"
                      />
                    ) : (
                      <p className="text-white text-lg font-medium">
                        {profile.age || <span className="text-gray-500">Not set</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-solana-green">⚧️</span>
                      Gender
                    </label>
                    {editing ? (
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all"
                      >
                        <option value="" className="bg-gray-800">Select</option>
                        <option value="male" className="bg-gray-800">Male</option>
                        <option value="female" className="bg-gray-800">Female</option>
                        <option value="non-binary" className="bg-gray-800">Non-binary</option>
                        <option value="prefer-not-to-say" className="bg-gray-800">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="text-white text-lg font-medium capitalize">
                        {profile.gender || <span className="text-gray-500">Not set</span>}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <span className="text-solana-purple">💕</span>
                    Interested In
                  </label>
                  {editing ? (
                    <div className="flex flex-wrap gap-2">
                      {["male", "female", "non-binary", "all"].map((option) => (
                        <label
                          key={option}
                          className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.interestedIn.includes(option)
                              ? "border-solana-purple bg-solana-purple/20 text-solana-purple"
                              : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-solana-blue/50"
                          }`}
                        >
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
                            className="hidden"
                          />
                          <span className="text-sm font-medium capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.interestedIn && profile.interestedIn.length > 0 ? (
                        profile.interestedIn.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-solana-purple/20 text-solana-purple rounded-full text-sm font-medium border border-solana-purple/30 capitalize"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Not set</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Location & Tags */}
            <div className="space-y-6">
              {/* Location Card */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-solana-blue to-solana-green rounded-full"></span>
                  Location
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-solana-blue">📍</span>
                      Location
                    </label>
                    {editing ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="City, State"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-solana-blue focus:ring-2 focus:ring-solana-blue/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationStatus === "getting"}
                            className="px-4 py-3 bg-gradient-to-r from-solana-blue to-solana-green text-black rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-solana-blue/50 flex items-center gap-2"
                          >
                            {locationStatus === "getting" ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                Getting...
                              </span>
                            ) : (
                              <span>📍 GPS</span>
                            )}
                          </button>
                        </div>
                        {formData.city && formData.country && (
                          <div className="px-3 py-2 bg-solana-blue/10 border border-solana-blue/30 rounded-lg">
                            <p className="text-sm text-solana-blue">
                              {formData.city}, {formData.country}
                            </p>
                          </div>
                        )}
                        {profile.coordinates && (
                          <p className="text-xs text-gray-400">
                            GPS: {profile.coordinates.latitude.toFixed(4)}, {profile.coordinates.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-white text-lg font-medium">
                          {profile.location || profile.city || <span className="text-gray-500">Not set</span>}
                        </p>
                        {profile.coordinates && (
                          <p className="text-xs text-gray-400 mt-1">
                            GPS: {profile.coordinates.latitude.toFixed(4)}, {profile.coordinates.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags Card */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-solana-purple to-solana-green rounded-full"></span>
                  Tags & Interests
                </h2>
                <div>
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        placeholder="#movies, #travel, #fitness, #cooking"
                        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all"
                      />
                      <p className="text-xs text-gray-400">
                        Enter tags separated by commas. Use hashtags like #movies, #travel, etc. (Max 20 tags)
                      </p>
                      {formData.tags && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.tags
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag.length > 0)
                            .slice(0, 20)
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-solana-purple/20 to-solana-blue/20 text-solana-purple rounded-full text-sm font-medium border border-solana-purple/30"
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
                              className="px-3 py-1.5 bg-gradient-to-r from-solana-purple/20 to-solana-blue/20 text-solana-purple rounded-full text-sm font-medium border border-solana-purple/30 hover:border-solana-purple/50 transition-all"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No tags yet. Add some to find better matches!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
          </div>
        </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-solana-purple to-solana-blue text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-solana-purple/50 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                className="flex-1 bg-gray-800/50 border border-gray-700 text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Sign Out */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-solana-purple/20 border border-gray-700"
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




