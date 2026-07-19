const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Funktion för att formatera datum till Dokument-ID (ÅÅÅÅ-MM-DD_TT:00)
function createDocId(dateString) {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}_${hour}:00`;
}

// Cloud Function som körs automatiskt varje dag kl 15:00 finsk tid
exports.fetchElectricityData = onSchedule({
  schedule: "0 15 * * *",
  timeZone: "Europe/Helsinki" 
}, async (event) => {
  try {
    const batch = db.batch();

    // 1. HÄMTA FACIT (Pörssisähkö API)
    const spotResponse = await fetch("https://api.porssisahko.net/v1/latest-prices.json");
    const spotData = await spotResponse.json();

    spotData.prices.forEach((item) => {
      const docId = createDocId(item.startDate);
      const docRef = db.collection("electricity_points").doc(docId);
      
      batch.set(docRef, {
        timestamp: new Date(item.startDate),
        actual_price: item.price
      }, { merge: true }); // merge: true gör att vi inte skriver över gissningen om den redan finns
    });

    // 2. HÄMTA PROGNOSEN (Sähkovatkain / Nordpool Predict)
    const predictResponse = await fetch("https://raw.githubusercontent.com/jiemakel/nordpool-predict-fi/main/output/prediction.json");
    
    if (predictResponse.ok) {
      const predictData = await predictResponse.json();
      
      predictData.forEach((item) => {
        const docId = createDocId(item.timestamp);
        const docRef = db.collection("electricity_points").doc(docId);
        
        batch.set(docRef, {
          timestamp: new Date(item.timestamp),
          predicted_vatkain: item.price_prediction
        }, { merge: true });
      });
    }

    // Skicka in all data till databasen
    await batch.commit();
    console.log("Databasen uppdaterades med de senaste priserna och prognoserna!");

  } catch (error) {
    console.error("Ett fel uppstod vid hämtning av data:", error);
  }
});