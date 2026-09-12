import { API_URL } from '../config/constants';

/**
 * Submits a pole record (location + photo + metadata) to the backend.
 *
 * @param {Object} params
 * @param {{latitude: number, longitude: number, accuracy: number}} params.location
 * @param {{uri: string}} params.photo - result asset from expo-image-picker
 * @param {string} params.poleCode
 * @param {string} params.condition
 * @returns {Promise<Object>} parsed JSON response from the backend
 */
export async function submitPole({ location, photo, poleCode, condition }) {
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
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errText}`);
  }

  return response.json();
}
