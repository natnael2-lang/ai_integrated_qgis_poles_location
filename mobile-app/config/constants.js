// Point this at your deployed backend.
export const API_BASE = 'https://ai-integrated-qgis-poles-location.onrender.com';
export const API_URL = `${API_BASE}/upload-pole`;

// Reject/flag locally before even submitting if accuracy is worse than this (meters)
export const MAX_ACCEPTABLE_ACCURACY = 50;

export const CONDITION_OPTIONS = [
  { label: 'Good', value: 'good' },
  { label: 'Leaning', value: 'leaning' },
  { label: 'Damaged', value: 'damaged' },
  { label: 'Vegetation encroachment', value: 'vegetation encroachment' },
];
