// Point this at your backend. While testing on the same Wi-Fi as your laptop,
// use your laptop's local network IP (not "localhost" -- the phone is a
// different device). Once deployed, swap in your Render URL.
//
// Find your local IP:
//   Mac/Linux: ifconfig | grep "inet "
//   Windows:   ipconfig

export const API_URL = 'http://10.0.2.2:8000/upload-pole';

// Reject/flag locally before even submitting if accuracy is worse than this (meters)
export const MAX_ACCEPTABLE_ACCURACY = 50;

export const CONDITION_OPTIONS = [
  { label: 'Good', value: 'good' },
  { label: 'Leaning', value: 'leaning' },
  { label: 'Damaged', value: 'damaged' },
  { label: 'Vegetation encroachment', value: 'vegetation encroachment' },
];
