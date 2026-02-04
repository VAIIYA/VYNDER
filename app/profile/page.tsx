"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface UserProfile {
  _id: string;
  walletAddress: string; // Primary identifier - Solana wallet address
  username: string;
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
      router.push("/auth/wallet");
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
    <div className="min-h-screen app-shell pb-24">
      <div className="safe-top px-6 pt-6 pb-4 border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Edit profile</h1>
            <p className="text-xs text-gray-400 mt-1">Make it pop like Tinder, but Web3.</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                className="px-4 py-2 rounded-full border border-white/20 text-white text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-metamask-orange to-metamask-blue text-white text-sm font-bold"
              >
                Save
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span className="text-white font-semibold border-b-2 border-metamask-orange pb-2">Edit</span>
          <span className="opacity-50">Preview</span>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="panel rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Profile strength</p>
              <p className="text-white font-semibold">Complete your profile to get seen.</p>
            </div>
            <span className="text-sm font-bold text-metamask-orange">
              {profile.profileCompletionPercentage}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-metamask-orange to-metamask-blue"
              style={{ width: `${profile.profileCompletionPercentage}%` }}
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Media</h2>
            <span className="text-xs uppercase tracking-widest text-gray-500">
              {formData.photos.length}/6
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative aspect-[3/4] rounded-2xl overflow-hidden panel-strong">
                <Image
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={photo.startsWith("/api/images/")}
                />
                {editing && (
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        photos: formData.photos.filter((_, i) => i !== index),
                      });
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {editing &&
              Array.from({ length: Math.max(0, 6 - formData.photos.length) }).map((_, idx) => (
                <label
                  key={`empty-${idx}`}
                  className="aspect-[3/4] rounded-2xl border border-dashed border-white/20 flex items-center justify-center text-white/60 cursor-pointer hover:border-metamask-orange/60 transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  +
                </label>
              ))}
          </div>
        </section>

        <section className="panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">About Me</h3>
            <span className="text-xs text-metamask-orange font-semibold">Important</span>
          </div>
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-metamask-orange"
              placeholder="Tell people what you are into..."
            />
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed">
              {profile.bio || "Add a bio to stand out."}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-white font-semibold">Basics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="panel rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Username</p>
              {editing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-2 w-full bg-transparent text-white font-semibold focus:outline-none"
                />
              ) : (
                <p className="mt-2 text-white font-semibold">{profile.username}</p>
              )}
            </div>
            <div className="panel rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Age</p>
              {editing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-2 w-full bg-transparent text-white font-semibold focus:outline-none"
                />
              ) : (
                <p className="mt-2 text-white font-semibold">{profile.age || "—"}</p>
              )}
            </div>
            <div className="panel rounded-2xl px-4 py-3 col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Gender</p>
              {editing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-2 w-full bg-transparent text-white font-semibold focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p className="mt-2 text-white font-semibold capitalize">
                  {profile.gender || "—"}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="panel rounded-3xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Looking for</h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {["male", "female", "non-binary", "all"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (formData.interestedIn.includes(option)) {
                      setFormData({
                        ...formData,
                        interestedIn: formData.interestedIn.filter((item) => item !== option),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        interestedIn: [...formData.interestedIn, option],
                      });
                    }
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    formData.interestedIn.includes(option)
                      ? "bg-gradient-to-r from-metamask-orange to-metamask-blue text-white"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interestedIn && profile.interestedIn.length > 0 ? (
                profile.interestedIn.map((option, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                    {option}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Not set</p>
              )}
            </div>
          )}
        </section>

        <section className="panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Location</h3>
            {editing && (
              <button
                onClick={handleGetLocation}
                disabled={locationStatus === "getting"}
                className="text-xs uppercase tracking-widest text-metamask-green"
              >
                {locationStatus === "getting" ? "Getting..." : "Use GPS"}
              </button>
            )}
          </div>
          {editing ? (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-metamask-orange"
              placeholder="City, Country"
            />
          ) : (
            <p className="text-white font-semibold">{profile.location || "Not set"}</p>
          )}
        </section>

        <section className="panel rounded-3xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Interests</h3>
          {editing ? (
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-metamask-orange"
              placeholder="#travel, #fitness, #music"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.tags && profile.tags.length > 0 ? (
                profile.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Add tags to show your vibe.</p>
              )}
            </div>
          )}
        </section>

        <div className="pt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/wallet" })}
            className="w-full py-3 rounded-full border border-white/10 text-sm font-semibold text-gray-300 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
