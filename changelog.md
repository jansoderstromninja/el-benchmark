CHANGELOG
Uppdateringslogg: El-benchmark v1.0 (2026-07-21)

Ny datakälla (Backend): Integrerade Fingrids Dataset 166 för att hämta den nationella elkonsumtionsprognosen (MW).

Optimerad datahämtning: Använder nu Promise.all för att hämta både vind- och konsumtionsprognoser parallellt varannan timme, vilket minimerar serverns exekveringstid och maximerar prestandan.

Infrastruktur & Säkerhet (Frontend): Åtgärdade saknad projectId i Firebase-konfigurationen för att säkerställa en stabil och säker anslutning mellan webbklienten och Firestore-databasen.

Visuellt färdigställande (Frontend v1.0): Implementerade en tredje kurva (röd streckad) för konsumtionsprognos som delar den högra Y-axeln med vindkraften. Uppdaterade även X-axeln till ett mer användarvänligt datumformat (t.ex. "21 jul 15:00") för snabbare avläsning.
