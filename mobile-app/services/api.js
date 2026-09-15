import { API_URL, API_BASE } from '../config/constants';

/**
 * Submits a pole record (location + photo + metadata) to the backend.
 * Requires a logged-in user's access token.
 */
export async function submitPole({ location, photo, poleCode, condition, token }) {
  const formData = new FormData();
  formData.append('lat', location.latitude.toString());
  formData.append('lon', location.longitude.toString());
  formData.append('accuracy_m', location.accuracy.toString());
  formData.append('pole_code', poleCode);
  formData.append('condition', condition);
  formData.append('device_timestamp', new Date().toISOString());
  formData.append('photo', {
    uri: photo.uri,
    name: 'pole.jpg',
    type: 'image/jpeg',
  });

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * Submits a farm/land area boundary as a polygon.
 * `points` is an ordered array of {lat, lon}.
 */
export async function submitArea({ areaName, description, points, token }) {
  const formData = new FormData();
  formData.append('area_name', areaName);
  formData.append('description', description || '');
  formData.append('points', JSON.stringify(points));

  const response = await fetch(`${API_BASE}/upload-area`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * Submits a cable/fiber route as a line.
 * `points` is an ordered array of {lat, lon}.
 */
export async function submitLine({ lineName, lineType, description, points, token }) {
  const formData = new FormData();
  formData.append('line_name', lineName);
  formData.append('line_type', lineType);
  formData.append('description', description || '');
  formData.append('points', JSON.stringify(points));

  const response = await fetch(`${API_BASE}/upload-line`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errText}`);
  }

  return response.json();
}

/** Fetches the logged-in user's combined submission history. */
export async function fetchMySubmissions(token) {
  const response = await fetch(`${API_BASE}/my-submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to load history (${response.status}): ${errText}`);
  }

  return response.json();
}
