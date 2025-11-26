let foodData = [];
let itemA, itemB;
let streak = 0;
let gameActive = true; // <-- new flag

async function loadData() {
  const res = await fetch("data/foodData.json");
  foodData = await res.json();
  newRound();
}

function newRound() {
  gameActive = true; // re-enable clicking

  // Clear overlays
  document.getElementById("overlayA").style.visibility = "hidden";
  document.getElementById("overlayB").style.visibility = "hidden";

  const idxA = Math.floor(Math.random() * foodData.length);
  let idxB = Math.floor(Math.random() * foodData.length);
  while (idxB === idxA) idxB = Math.floor(Math.random() * foodData.length);

  itemA = foodData[idxA];
  itemB = foodData[idxB];

  // Load images
  document.getElementById("foodA").src = itemA.image;
  document.getElementById("foodB").src = itemB.image;

  // Load captions (names)
  document.getElementById("captionA").textContent = itemA.name;
  document.getElementById("captionB").textContent = itemB.name;

  // Update streak
  document.getElementById("score").textContent = "Streak: " + streak;
}

function handleChoice(choice) {
  if (!gameActive) return; // ignore clicks if game is over

  const A = itemA.calories;
  const B = itemB.calories;

  const correctChoice = A >= B ? "A" : "B";
  const correct = choice === correctChoice;

  // Show overlays with calorie info
  const overlayA = document.getElementById("overlayA");
  const overlayB = document.getElementById("overlayB");

  overlayA.textContent = `${A} cal`;
  overlayB.textContent = `${B} cal`;
  overlayA.style.visibility = "visible";
  overlayB.style.visibility = "visible";

  // Reset classes
  overlayA.classList.remove("correct", "wrong");
  overlayB.classList.remove("correct", "wrong");

  // Add visual cues
  if (correctChoice === "A") overlayA.classList.add("correct");
  else overlayA.classList.add("wrong");

  if (correctChoice === "B") overlayB.classList.add("correct");
  else overlayB.classList.add("wrong");

  if (correct) {
    streak++;
    document.getElementById("score").textContent = "Streak: " + streak;

    // Continue to next round after delay
    setTimeout(newRound, 1500);
  } else {
    gameActive = false; // disable further clicks

    document.getElementById("streakText").textContent =
      `Streak ended! Your streak was ${streak}.`;
    document.getElementById("streakMessage").style.display = "block";

    streak = 0; // reset streak
    document.getElementById("score").textContent = "Streak: " + streak;
  }
}


window.onload = function () {
  loadData();

  document.getElementById("choiceA").onclick = () => handleChoice("A");
  document.getElementById("choiceB").onclick = () => handleChoice("B");
  document.getElementById("playAgainBtn").onclick = () => {
    document.getElementById("streakMessage").style.display = "none"; // hide message/button
    newRound(); // start a new round
  };
};

