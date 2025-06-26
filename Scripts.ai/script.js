// Firebase config (apna project settings se ye copy kar)
const firebaseConfig = {
    apiKey: "AIzaSyAVcmOkOgh3yhI0K5SwF2wF0vcODxaX9xs",
    authDomain: "healthcarebookingapp-bf56b.firebaseapp.com",
    projectId: "healthcarebookingapp-bf56b",
    storageBucket: "healthcarebookingapp-bf56b.firebasestorage.app",
    messagingSenderId: "572904226489",
    appId: "1:572904226489:web:7a62b3c5fe5dda285e2568",
    measurementId: "G-T9D80FW11T"
  };
// Firebase app initialize karte hain
const app = firebase.initializeApp(firebaseConfig);

// Firestore database initialize karte hain
const db = firebase.firestore();

// Google NLP API key
const apiKey = "AIzaSyAs6OBCykBf36UDrigmNQqztDgwyYPdHYo";

// Symptoms analyze karne ke liye Google NLP API call
async function analyzeSymptomsWithAI(text) {
  const url = `https://language.googleapis.com/v1/documents:analyzeEntities?key=${apiKey}`;

  const body = {
    document: {
      type: "PLAIN_TEXT",
      content: text
    },
    encodingType: "UTF8"
  };

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const result = await response.json();
  return result.entities ? result.entities.map(entity => entity.name.toLowerCase()) : [];
}

// Symptoms ke basis pe urgency detect karna
async function detectUrgencyWithAI(text) {
  const entities = await analyzeSymptomsWithAI(text);
  console.log("Entities from AI:", entities);

  const highRisk = ["chest pain", "shortness of breath", "stroke", "seizure"];
  const mediumRisk = ["fever", "headache", "fatigue", "dizziness"];

  for (const keyword of highRisk) {
    if (entities.includes(keyword)) return "high";
  }
  for (const keyword of mediumRisk) {
    if (entities.includes(keyword)) return "medium";
  }
  return "low";
}

// Form submit event listener
document.getElementById("appointmentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const city = document.getElementById("city").value.trim().toLowerCase();
  const symptoms = document.getElementById("symptoms").value.trim().toLowerCase();

  if (!name || !city || !symptoms) {
    alert("Please fill all fields before submitting.");
    return;
  }

  // AI se urgency detect kar lo
  const urgency = await detectUrgencyWithAI(symptoms);
  console.log("Predicted urgency:", urgency);

  // Clinics ki JSON file fetch karo
  const clinics = await fetch("clinics.json").then(res => res.json());

  // Clinics filter karo urgency + city dono basis pe (partial city match)
  let matchedClinics = clinics.filter(c =>
    c.urgency_level.toLowerCase() === urgency &&
    c.city.toLowerCase().includes(city)
  );

  // Agar city match nahi mila to urgency basis pe clinics dikhayenge
  if (matchedClinics.length === 0) {
    matchedClinics = clinics.filter(c => c.urgency_level.toLowerCase() === urgency);
  }

  const resultDiv = document.getElementById("result");
  if (matchedClinics.length === 0) {
    resultDiv.innerHTML = `<p>No clinic found for your city and urgency. Try again with different symptoms or city.</p>`;
    return;
  }

  // Clinics ko HTML me render karo
  let html = `<h3>Suggested Clinics:</h3>`;
  matchedClinics.forEach(clinic => {
    html += `
      <div class="clinic-card" style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
        <p><strong>Clinic:</strong> ${clinic.clinic}</p>
        <p><strong>City:</strong> ${clinic.city}</p>
        <p><strong>Specialist:</strong> ${clinic.specialist}</p>
        <p><strong>Available Date:</strong> ${clinic.available_date}</p>
        <p><strong>Urgency Level:</strong> ${clinic.urgency_level}</p>
        <button onclick="bookAppointment('${clinic.clinic}')">Book Now</button>
        <div id="map-${clinic.clinic.replace(/\s+/g, '')}" style="width:100%;height:150px;margin-top:10px;"></div>
      </div>
    `;
  });

  resultDiv.innerHTML = html;

  // Sab clinics ke liye Google Maps initialize karo
  matchedClinics.forEach(clinic => {
    initMap(clinic.city, `map-${clinic.clinic.replace(/\s+/g, '')}`);
  });
});

// Booking button pe click hone par Firestore me save karo
function bookAppointment(clinicName) {
  const bookingData = {
    clinic: clinicName,
    patientName: document.getElementById("name").value.trim(),
    city: document.getElementById("city").value.trim(),
    symptoms: document.getElementById("symptoms").value.trim(),
    bookedAt: new Date()
  };

  saveBooking(bookingData);
  alert(`Appointment booked at ${clinicName}!`);
}

// Firestore me booking save karne wali function
async function saveBooking(bookingData) {
  try {
    const docRef = await db.collection("bookings").add(bookingData);
    console.log("Booking saved with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding booking: ", e);
  }
}

// Google Maps initialize karne wali function (city ke coordinates se map banega)
function initMap(cityName, mapDivId) {
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: cityName }, function(results, status) {
    if (status === "OK") {
      const map = new google.maps.Map(document.getElementById(mapDivId), {
        zoom: 12,
        center: results[0].geometry.location
      });

      new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
    } else {
      console.error("Geocode failed: " + status);
      document.getElementById(mapDivId).innerHTML = "<p>Map not available</p>";
    }
  });
}
