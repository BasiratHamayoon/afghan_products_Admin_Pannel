"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TradeShowForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const safe =
    initialData && typeof initialData === "object" ? initialData : {};

  const [title, setTitle] = useState(safe.title || "");
  const [description, setDescription] = useState(
    safe.description || ""
  );
  const [country, setCountry] = useState(safe.country || "");
  const [city, setCity] = useState(safe.city || "");
  const [venue, setVenue] = useState(safe.venue || "");
  const [address, setAddress] = useState(safe.address || "");
  const [startDate, setStartDate] = useState(
    safe.startDate
      ? new Date(safe.startDate).toISOString().split("T")[0]
      : ""
  );
  const [endDate, setEndDate] = useState(
    safe.endDate
      ? new Date(safe.endDate).toISOString().split("T")[0]
      : ""
  );
  const [organizer, setOrganizer] = useState(safe.organizer || "");
  const [organizerEmail, setOrganizerEmail] = useState(
    safe.organizerEmail || ""
  );
  const [organizerPhone, setOrganizerPhone] = useState(
    safe.organizerPhone || ""
  );
  const [website, setWebsite] = useState(safe.website || "");
  const [category, setCategory] = useState(safe.category || "");
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(safe.tags) ? safe.tags.join(", ") : ""
  );
  const [isFeatured, setIsFeatured] = useState(
    safe.isFeatured ?? false
  );
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [errors, setErrors] = useState({});

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!country.trim()) errs.country = "Country is required";
    if (!city.trim()) errs.city = "City is required";
    if (!startDate) errs.startDate = "Start date is required";
    if (!endDate) errs.endDate = "End date is required";
    if (
      startDate &&
      endDate &&
      new Date(startDate) > new Date(endDate)
    ) {
      errs.endDate = "End date must be after start date";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Send as JSON — backend uses validateBody(tradeShowSchema)
    const payload = {
      title: title.trim(),
      description: description.trim(),
      country: country.trim(),
      city: city.trim(),
      venue: venue.trim(),
      address: address.trim(),
      startDate,
      endDate,
      organizer: organizer.trim(),
      organizerEmail: organizerEmail.trim(),
      organizerPhone: organizerPhone.trim(),
      website: website.trim(),
      category: category.trim(),
      tags,
      isFeatured,
      isActive,
    };

    onSubmit(payload);
  };

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err
        ? "border-red-400"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* ─── Basic Info ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearErr("title");
              }}
              placeholder="e.g. Afghan International Trade Fair 2025"
              disabled={isLoading}
              className={inputClass(errors.title)}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology, Agriculture"
              disabled={isLoading}
              className={inputClass()}
            />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this trade show..."
              rows={4}
              disabled={isLoading}
              className={cn(inputClass(), "resize-none")}
            />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. export, import, textile (comma separated)"
              disabled={isLoading}
              className={inputClass()}
            />
            <p className="text-[10px] text-muted-foreground font-medium">
              Separate tags with commas
            </p>
          </div>
        </div>
      </div>

      {/* ─── Location ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Location
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                clearErr("country");
              }}
              placeholder="e.g. Afghanistan"
              disabled={isLoading}
              className={inputClass(errors.country)}
            />
            {errors.country && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.country}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                clearErr("city");
              }}
              placeholder="e.g. Kabul"
              disabled={isLoading}
              className={inputClass(errors.city)}
            />
            {errors.city && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.city}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Kabul Exhibition Center"
              disabled={isLoading}
              className={inputClass()}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
        </div>
      </div>

      {/* ─── Dates ───────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Dates
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                clearErr("startDate");
              }}
              disabled={isLoading}
              className={inputClass(errors.startDate)}
            />
            {errors.startDate && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                clearErr("endDate");
              }}
              disabled={isLoading}
              className={inputClass(errors.endDate)}
            />
            {errors.endDate && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.endDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Organizer ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          Organizer Details
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Organizer Name
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Organizer name"
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Organizer Email
            </label>
            <input
              type="email"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
              placeholder="organizer@example.com"
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Organizer Phone
            </label>
            <input
              type="text"
              value={organizerPhone}
              onChange={(e) => setOrganizerPhone(e.target.value)}
              placeholder="+93 700 000 000"
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Website
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
        </div>
      </div>

      {/* ─── Settings ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Settings
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              disabled={isLoading}
              className={cn(
                "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                isActive
                  ? "bg-emerald-500"
                  : "bg-gray-300 dark:bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  isActive ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">
                Active
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isActive
                  ? "Visible to users"
                  : "Hidden from users"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              disabled={isLoading}
              className={cn(
                "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                isFeatured
                  ? "bg-amber-500"
                  : "bg-gray-300 dark:bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  isFeatured ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">
                Featured
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isFeatured
                  ? "Highlighted on homepage"
                  : "Normal listing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {safe.id || safe._id ? "Update" : "Create"}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}