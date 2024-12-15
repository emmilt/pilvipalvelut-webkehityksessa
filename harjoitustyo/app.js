import { getAuth, signInWithEmailAndPassword } from ".../firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCxQkJ9T7UZshu-o8KNBhdMA2AfIBY-YUM",
    authDomain: "pilvi-react-59c31.firebaseapp.com",
    projectId: "pilvi-react-59c31",
    storageBucket: "pilvi-react-59c31.firebasestorage.app",
    messagingSenderId: "485543190012",
    appId: "1:485543190012:web:22c3225d4ad02e7b40e679"
};

// Firebase-sovelluksen alustaminen
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Kirjautumislomake
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Onnistunut kirjautuminen
      const user = userCredential.user;
      alert("Tervetuloa, " + user.email);
      window.location.href = "saved-events.html";
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert("Kirjautumisvirhe: " + errorMessage);
    });
});

// Tapahtuman lisääminen Firestoreen
async function addEvent(eventName, eventDate, eventLocation) {
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = await addDoc(collection(db, "events"), {
        name: eventName,
        date: eventDate,
        location: eventLocation,
        userId: user.uid
      });
      console.log("Tapahtuma lisätty: ", docRef.id);
      alert("Tapahtuma lisätty!");
      window.location.href = "saved-events.html";
    } catch (e) {
      console.error("Virhe tapahtuman tallentamisessa: ", e);
      alert("Virhe tapahtuman tallentamisessa.");
    }
  } else {
    alert("Et ole kirjautunut sisään.");
    window.location.href = "login.html";
  }
}

fetch('https://www.eventbriteapi.com/v3/events/search/?location.address=Helsinki&token=JKWYMCEBH44ICM6IN5U7')
  .then(response => response.json())
  .then(data => {
    setEvents(data.events);
  })
  .catch(error => {
    console.error('Virhe API:ssa', error);
  });

const savedEventsSection = document.getElementById("savedEvents");

const fetchSavedEvents = async () => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const q = query(collection(db, "events"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      // Luodaan tapahtumat listaksi
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        const eventElement = document.createElement("div");
        eventElement.innerHTML = `
          <h3>${eventData.name}</h3>
          <p>${eventData.date}</p>
          <p>${eventData.location}</p>
        `;
        savedEventsSection.appendChild(eventElement);
      });
    } else {
      alert("Et ole kirjautunut sisään");
      window.location.href = "login.html";
    }
  });
};

fetchSavedEvents();

// Tapahtuman lisäys lomakkeen kautta
document.getElementById("addEventForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = auth.currentUser;
  if (user) {
      const eventName = document.getElementById("eventName").value;
      const eventDate = document.getElementById("eventDate").value;
      const eventLocation = document.getElementById("eventLocation").value;

      try {
          await addEvent(eventName, eventDate, eventLocation); // Lisää tapahtuma Firestoreen
      } catch (e) {
          console.error("Virhe tapahtuman tallentamisessa: ", e);
          alert("Virhe tapahtuman tallentamisessa.");
      }
  } else {
      alert("Et ole kirjautunut sisään.");
  }
});
