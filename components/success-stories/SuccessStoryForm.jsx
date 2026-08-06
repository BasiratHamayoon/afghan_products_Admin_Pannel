"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Star, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const BACKEND_SUPPORTS_FILE_UPLOAD = true;

export default function SuccessStoryForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [fullName, setFullName] = useState(safe.fullName || "");
  const [companyName, setCompanyName] = useState(safe.companyName || "");
  const [profilePicture, setProfilePicture] = useState(safe.profilePicture || "");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(safe.profilePicture || "");
  const [rating, setRating] = useState(safe.rating ?? 5);
  const [story, setStory] = useState(safe.story || "");
  const [location, setLocation] = useState(safe.location || "");
  const [storyDate, setStoryDate] = useState(
    safe.storyDate
      ? new Date(safe.storyDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [displayOrder, setDisplayOrder] = useState(safe.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [errors, setErrors] = useState({});

  const profilePictureRef = useRef(null);

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleProfilePictureFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
    setProfilePicture("");
    clearErr("profilePicture");
    e.target.value = "";
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture("");
    setProfilePictureFile(null);
    setProfilePicturePreview("");
    if (profilePictureRef.current) profilePictureRef.current.value = "";
  };

  const buildFormData = (fields) => {
    const formData = new FormData();
    formData.append("fullName", fields.fullName);
    formData.append("companyName", fields.companyName);
    formData.append("rating", String(fields.rating));
    formData.append("story", fields.story);
    formData.append("location", fields.location);
    formData.append("storyDate", fields.storyDate);
    formData.append("displayOrder", String(fields.displayOrder));
    formData.append("isActive", String(fields.isActive));

    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile, profilePictureFile.name);
    } else if (profilePicture && !profilePicture.startsWith("blob:")) {
      formData.append("profilePicture", profilePicture);
    }

    return formData;
  };

  const buildJsonPayload = (fields) => {
    return {
      fullName: fields.fullName,
      companyName: fields.companyName,
      profilePicture: profilePicture.trim() || null,
      rating: fields.rating,
      story: fields.story,
      location: fields.location,
      storyDate: fields.storyDate,
      displayOrder: fields.displayOrder,
      isActive: fields.isActive,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!fullName.trim()) errs.fullName = t("successStories.fullNameRequired");
    if (!companyName.trim()) errs.companyName = t("successStories.companyNameRequired");
    if (!story.trim()) errs.story = t("successStories.storyRequired");
    if (!location.trim()) errs.location = t("successStories.locationRequired");
    if (!storyDate) errs.storyDate = t("successStories.storyDateRequired");

    if (BACKEND_SUPPORTS_FILE_UPLOAD) {
      if (!profilePictureFile && !profilePicture.trim()) {
        errs.profilePicture = t("successStories.profilePictureRequired");
      }
    } else {
      if (!profilePicture.trim()) {
        errs.profilePicture = t("successStories.profilePictureRequired");
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const fields = {
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      rating,
      story: story.trim(),
      location: location.trim(),
      storyDate,
      displayOrder,
      isActive,
    };

    if (BACKEND_SUPPORTS_FILE_UPLOAD) {
      onSubmit(buildFormData(fields));
    } else {
      onSubmit(buildJsonPayload(fields));
    }
  };

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err
        ? "border-red-400"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const displayImage = profilePicturePreview || profilePicture;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
          {t("successStories.personInformation")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.fullName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearErr("fullName"); }}
              placeholder={t("successStories.fullNamePlaceholder")}
              disabled={isLoading}
              className={inputClass(errors.fullName)}
            />
            {errors.fullName && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.companyName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); clearErr("companyName"); }}
              placeholder={t("successStories.companyNamePlaceholder")}
              disabled={isLoading}
              className={inputClass(errors.companyName)}
            />
            {errors.companyName && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.locationLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => { setLocation(e.target.value); clearErr("location"); }}
              placeholder={t("successStories.locationPlaceholder")}
              disabled={isLoading}
              className={inputClass(errors.location)}
            />
            {errors.location && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.location}</p>
            )}
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.profilePictureUrl")} <span className="text-red-500">*</span>
            </label>

            <input
              ref={profilePictureRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isLoading}
              onChange={handleProfilePictureFileChange}
            />

            {!displayImage ? (
              <button
                type="button"
                onClick={() => profilePictureRef.current?.click()}
                disabled={isLoading}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                  errors.profilePicture
                    ? "border-red-400 bg-red-50/50 dark:bg-red-900/10"
                    : "border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]"
                )}
              >
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                  <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  Click to select profile picture
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
                <div className="shrink-0">
                  <img
                    src={displayImage}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-white dark:border-white/[0.1] shadow-md"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {profilePictureFile?.name || "Current profile image"}
                  </p>
                  {profilePictureFile && (
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {(profilePictureFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => profilePictureRef.current?.click()}
                      disabled={isLoading}
                      className="text-[11px] font-bold text-[#0F69B0] hover:underline cursor-pointer disabled:opacity-60"
                    >
                      Change
                    </button>
                    <span className="text-muted-foreground/30">·</span>
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      disabled={isLoading}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.profilePicture && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.profilePicture}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("successStories.storySection")}
        </h3>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.successStoryLabel")} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={story}
              onChange={(e) => { setStory(e.target.value); clearErr("story"); }}
              rows={5}
              placeholder={t("successStories.successStoryPlaceholder")}
              disabled={isLoading}
              className={cn(inputClass(errors.story), "resize-none")}
            />
            {errors.story && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.story}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("successStories.ratingAndSettings")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.ratingLabel")}
            </label>
            <div className="flex items-center gap-1 p-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  disabled={isLoading}
                  className="p-1 cursor-pointer disabled:opacity-60"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      s <= rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-gray-300 dark:text-white/20"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-foreground">{rating}/5</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.storyDate")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={storyDate}
              onChange={(e) => { setStoryDate(e.target.value); clearErr("storyDate"); }}
              disabled={isLoading}
              className={inputClass(errors.storyDate)}
            />
            {errors.storyDate && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.storyDate}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.displayOrder")}
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              min={0}
              disabled={isLoading}
              className={inputClass()}
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              disabled={isLoading}
              className={cn(
                "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
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
                {t("successStories.activeLabel")}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isActive ? t("successStories.visibleToUsers") : t("successStories.hidden")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            {t("successStories.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("successStories.saving")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {safe.id || safe._id
                ? t("successStories.update")
                : t("successStories.create")}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}