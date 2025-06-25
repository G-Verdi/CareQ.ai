// Mock Vertex AI Logic
document.addEventListener('DOMContentLoaded', function() {
  // Patient Form Logic
  const patientForm = document.getElementById('patientForm');
  if (patientForm) {
    patientForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const symptoms = document.getElementById('symptoms').value;
      const urgency = document.getElementById('urgency').value;
      const postalCode = document.getElementById('postalCode').value;

      // Fake AI Processing
      const specialty = getSpecialty(symptoms);
      const recommendations = getClinics(specialty, urgency, postalCode);

      // Display Results
      document.getElementById('recommendation').innerHTML = `
        <h4>Recommended Specialty: ${specialty}</h4>
        <p>Based on your ${urgency} condition</p>
      `;

      let clinicsHTML = '';
      recommendations.forEach(clinic => {
        clinicsHTML += `
          <div class="clinic-card">
            <h5>${clinic.name}</h5>
            <p><strong>Wait time:</strong> ${clinic.waitDays} days</p>
            <p><strong>Available doctors:</strong> ${clinic.doctors.join(', ')}</p>
            <button class="btn btn-sm btn-primary">Book Now</button>
          </div>
        `;
      });

      document.getElementById('clinics').innerHTML = clinicsHTML;
      document.getElementById('results').classList.remove('d-none');
    });
  }

  // Admin Dashboard Logic
  const optimizationTable = document.getElementById('optimizationTable');
  if (optimizationTable) {
    const optimizations = [
      {
        id: '1001',
        symptoms: 'Chest pain',
        original: 'Toronto General',
        suggested: 'Ottawa Heart',
        reduction: '7 days'
      },
      {
        id: '1002',
        symptoms: 'Headache',
        original: 'Vancouver Clinic',
        suggested: 'Calgary Neuro',
        reduction: '5 days'
      }
    ];

    let tableHTML = '';
    optimizations.forEach(opt => {
      tableHTML += `
        <tr>
          <td>${opt.id}</td>
          <td>${opt.symptoms}</td>
          <td>${opt.original}</td>
          <td><strong>${opt.suggested}</strong></td>
          <td><span class="badge bg-primary">${opt.reduction}</span></td>
        </tr>
      `;
    });

    optimizationTable.innerHTML = tableHTML;
  }
});

// Mock AI Functions
function getSpecialty(symptoms) {
  if (symptoms.toLowerCase().includes('chest')) return 'Cardiology';
  if (symptoms.toLowerCase().includes('head')) return 'Neurology';
  return 'General Practice';
}

function getClinics(specialty, urgency, postalCode) {
  // Fake data - in real app this would call Vertex AI
  const clinics = {
    Cardiology: [
      { name: 'Toronto Heart Institute', waitDays: urgency === 'emergency' ? 1 : 5, doctors: ['Dr. Smith', 'Dr. Lee'] },
      { name: 'Ottawa Cardiac Center', waitDays: urgency === 'emergency' ? 2 : 7, doctors: ['Dr. Johnson'] }
    ],
    Neurology: [
      { name: 'Vancouver Neuro', waitDays: urgency === 'emergency' ? 1 : 10, doctors: ['Dr. Patel'] }
    ]
  };

  return clinics[specialty] || [
    { name: 'General Hospital', waitDays: urgency === 'emergency' ? 1 : 14, doctors: ['Dr. Brown'] }
  ];
}