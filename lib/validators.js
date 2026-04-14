export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== "";
};

export const validateMinLength = (value, min) => {
  return value && value.trim().length >= min;
};

export const validateMaxLength = (value, max) => {
  return !value || value.trim().length <= max;
};

export const validateSlug = (slug) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

export const validateCategoryForm = (data) => {
  const errors = {};
  if (!validateRequired(data.name)) errors.name = "Category name is required";
  if (data.name && !validateMinLength(data.name, 2)) errors.name = "Name must be at least 2 characters";
  if (data.name && !validateMaxLength(data.name, 80)) errors.name = "Name must be less than 80 characters";
  if (data.slug && !validateSlug(data.slug)) errors.slug = "Slug must be lowercase letters, numbers, and hyphens only";
  if (data.description && !validateMaxLength(data.description, 500)) errors.description = "Description must be less than 500 characters";
  return errors;
};