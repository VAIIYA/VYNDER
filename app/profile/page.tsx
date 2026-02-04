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
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-[#E9EDF6] z-10 sticky top-0">
        <div>
          <h1 className="text-4xl font-serif text-vaiiya-purple font-bold">Your Profile</h1>
          <p className="text-vaiiya-gray/60 font-medium">Manage your identity & connections</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-vaiiya-primary text-sm px-6 py-2.5 shadow-md"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              className="px-6 py-2.5 rounded-full text-vaiiya-gray font-bold text-sm hover:bg-[#F7F9FC] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-vaiiya-primary text-sm px-6 py-2.5 shadow-md"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
        {/* Profile Completion */}
        <div className="vaiiya-card p-8 bg-[#F7F9FC]/50">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-vaiiya-purple font-serif text-xl font-bold">Profile Strength</h3>
              <p className="text-vaiiya-gray/50 text-sm font-medium">Add more info to find better matches</p>
            </div>
            <span className="text-2xl font-bold text-vaiiya-orange">{profile.profileCompletionPercentage}%</span>
          </div>
          <div className="w-full bg-[#E9EDF6] rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-vaiiya-orange transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,92,22,0.2)]"
              style={{ width: `${profile.profileCompletionPercentage}%` }}
            />
          </div>
        </div>

        {/* Photos Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-vaiiya-purple font-serif text-2xl font-bold">Photos</h3>
            <span className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest">{formData.photos.length} / 6 Photos</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative aspect-[3/4] rounded-3xl overflow-hidden vaiiya-card border-none shadow-md group">
                <Image
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md text-vaiiya-purple rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {editing && formData.photos.length < 6 && (
              <label className="aspect-[3/4] rounded-3xl border-2 border-dashed border-[#E9EDF6] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F7F9FC] hover:border-vaiiya-orange/50 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="text-4xl text-vaiiya-orange/40 group-hover:text-vaiiya-orange transition-colors">+</span>
                <span className="text-xs font-bold text-vaiiya-gray/40 mt-2 uppercase tracking-widest">Add Photo</span>
              </label>
            )}
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Info */}
          <section className="vaiiya-card p-10 space-y-8">
            <h3 className="text-vaiiya-purple font-serif text-2xl font-bold border-b border-[#E9EDF6] pb-4">Basic Information</h3>

            <div className="space-y-6">
              <div className="group">
                <label className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-2 block">Username</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-2xl focus:outline-none focus:border-vaiiya-orange transition-colors font-medium"
                  />
                ) : (
                  <p className="text-xl font-bold text-vaiiya-purple">{profile.username}</p>
                )}
              </div>

              <div className="group">
                <label className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-2 block">Bio</label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-2xl focus:outline-none focus:border-vaiiya-orange transition-colors font-medium resize-none"
                    placeholder="Describe yourself..."
                  />
                ) : (
                  <p className="text-lg text-vaiiya-gray leading-relaxed font-medium">
                    {profile.bio || <span className="opacity-40 italic">No bio yet</span>}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-2 block">Age</label>
                  {editing ? (
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-2xl focus:outline-none focus:border-vaiiya-orange transition-colors font-medium"
                    />
                  ) : (
                    <p className="text-xl font-bold text-vaiiya-purple">{profile.age || "--"}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-2 block">Gender</label>
                  {editing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-2xl focus:outline-none focus:border-vaiiya-orange transition-colors font-medium appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-xl font-bold text-vaiiya-purple capitalize">{profile.gender || "--"}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Location & Tags */}
          <div className="space-y-8">
            <section className="vaiiya-card p-10 space-y-6">
              <h3 className="text-vaiiya-purple font-serif text-2xl font-bold border-b border-[#E9EDF6] pb-4">Location</h3>
              <div>
                <label className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-2 block">Primary Residence</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    {editing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-2xl focus:outline-none focus:border-vaiiya-orange transition-colors font-medium"
                        placeholder="Amsterdam, NL"
                      />
                    ) : (
                      <p className="text-xl font-bold text-vaiiya-purple flex items-center gap-2">
                        <span>📍</span> {profile.location || "Not set"}
                      </p>
                    )}
                  </div>
                  {editing && (
                    <button
                      onClick={handleGetLocation}
                      disabled={locationStatus === "getting"}
                      className="p-4 bg-vaiiya-orange/10 text-vaiiya-orange rounded-2xl hover:bg-vaiiya-orange/20 transition-all shadow-sm"
                    >
                      {locationStatus === "getting" ? "..." : "📡"}
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="vaiiya-card p-10 space-y-6">
              <h3 className="text-vaiiya-purple font-serif text-2xl font-bold border-b border-[#E9EDF6] pb-4">Social Tags</h3>
              <div>
                <label className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-4 block">Interests & Hobbies</label>
                {editing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-2xl focus:outline-none focus:border-vaiiya-orange transition-colors font-medium"
                      placeholder="Enter tags separated by commas..."
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.tags && profile.tags.length > 0 ? (
                      profile.tags.map((tag, i) => (
                        <span key={i} className="px-4 py-2 bg-[#F7F9FC] text-vaiiya-purple rounded-full text-sm font-bold border border-[#E9EDF6] shadow-sm">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="opacity-40 italic font-medium">No tags added yet</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Global Actions */}
        <section className="pt-8 border-t border-[#E9EDF6] flex flex-col items-center">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/wallet" })}
            className="text-red-500 font-bold hover:text-red-600 transition-colors py-4 px-12 rounded-full border border-red-100 hover:bg-red-50 flex items-center gap-2"
          >
            <span>Logout Session</span>
            <span className="opacity-50 text-xs">→</span>
          </button>
        </section>
      </div>

      <Navigation />
    </div>
  );
}




