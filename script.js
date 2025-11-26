let foodData = [];
let itemA, itemB;
let streak = 0;
let gameActive = true; // <-- new flag
let lastWinner = null; 
let winnerStreak = 0;

async function loadData() {
  const res = await fetch("data/foodData.json");
  foodData = await res.json();
  newRound();
}

function loadNewFoodPair() {
  let nextA, nextB;

  // ---- CASE 1: FIRST ROUND OR NO PRIOR WINNER ----
  if (!lastWinner) {
    // pick two random different foods
    const idxA = Math.floor(Math.random() * foodData.length);
    let idxB = Math.floor(Math.random() * foodData.length);
    while (idxB === idxA) idxB = Math.floor(Math.random() * foodData.length);

    nextA = foodData[idxA];
    nextB = foodData[idxB];
  }

  // ---- CASE 2: WINNER STREAK < 2 → NORMAL MODE ----
  else if (winnerStreak < 2) {
    // Winner stays as side A
    nextA = lastWinner;

    // pick challenger
    do {
      nextB = foodData[Math.floor(Math.random() * foodData.length)];
    } while (nextB === nextA);
  }

  // ---- CASE 3: WINNER STREAK >= 2 → FORCED ROTATION ----
  else {
    // We want: last two challengers fighting OR two new foods
    // So we simply pick two new distinct foods NOT including lastWinner

    do {
      nextA = foodData[Math.floor(Math.random() * foodData.length)];
    } while (nextA === lastWinner);

    do {
      nextB = foodData[Math.floor(Math.random() * foodData.length)];
    } while (nextB === lastWinner || nextB === nextA);

    // Reset winner streak so the new foods get a fair chance
    lastWinner = null;
    winnerStreak = 0;
  }

  // Finalize new items
  itemA = nextA;
  itemB = nextB;

  // Load images + captions
  document.getElementById("foodA").src = itemA.image;
  document.getElementById("foodB").src = itemB.image;
  document.getElementById("captionA").textContent = itemA.name;
  document.getElementById("captionB").textContent = itemB.name;
}


function newRound() {
  gameActive = true;

  // Clear overlays
  document.getElementById("overlayA").style.visibility = "hidden";
  document.getElementById("overlayB").style.visibility = "hidden";

  const cardA = document.getElementById("choiceA");
  const cardB = document.getElementById("choiceB");

  // Remove old fade classes (in case previous round left them)
  cardA.classList.remove("fade-out", "fade-in");
  cardB.classList.remove("fade-out", "fade-in");

  // ---- LOAD NEW FOOD PAIR ----
  loadNewFoodPair();

  // ---- APPLY FADE-IN + SCALE ----
  // tiny timeout triggers CSS transition correctly
  setTimeout(() => {
    cardA.classList.add("fade-in");
    cardB.classList.add("fade-in");

    // Your existing scale-in animation
    cardA.classList.remove("scale-in");
    cardB.classList.remove("scale-in");

    // force reflow so scale-in restarts cleanly
    void cardA.offsetWidth;
    void cardB.offsetWidth;

    cardA.classList.add("scale-in");
    cardB.classList.add("scale-in");
  }, 20);

  // Update streak display
  document.getElementById("score").textContent = "Streak: " + streak;
}

function handleChoice(choice) {
  if (!gameActive) return; // ignore clicks if game is over

  const A = itemA.calories;
  const B = itemB.calories;

  const correctChoice = A >= B ? "A" : "B";
  const correct = choice === correctChoice;

  let winner = (correctChoice === "A") ? itemA : itemB;

  if (winner === lastWinner) {
    winnerStreak++;
  } else {
    lastWinner = winner;
    winnerStreak = 1;
  }

  const overlayA = document.getElementById("overlayA");
  const overlayB = document.getElementById("overlayB");
  const cardA = document.getElementById("choiceA");
  const cardB = document.getElementById("choiceB");

  // Show overlays
  overlayA.textContent = `${A} cal`;
  overlayB.textContent = `${B} cal`;
  overlayA.style.visibility = "visible";
  overlayB.style.visibility = "visible";

  overlayA.classList.remove("correct", "wrong");
  overlayB.classList.remove("correct", "wrong");

  if (correctChoice === "A") overlayA.classList.add("correct");
  else overlayA.classList.add("wrong");

  if (correctChoice === "B") overlayB.classList.add("correct");
  else overlayB.classList.add("wrong");

  if (correct) {
    if (choice === "A") {
      document.getElementById("foodA").classList.add("correct-pulse");
    } else {
      document.getElementById("foodB").classList.add("correct-pulse");
    }

    // Remove after animation finishes
    setTimeout(() => {
      document.getElementById("foodA").classList.remove("correct-pulse", "wrong-pulse");
      document.getElementById("foodB").classList.remove("correct-pulse", "wrong-pulse");
    }, 500);

    streak++;
    document.getElementById("score").textContent = "Streak: " + streak;
    cardA.classList.add("fade-out");
    cardB.classList.add("fade-out");
    setTimeout(newRound, 1500);
  } else {
    gameActive = false;

    // 🎯 Apply pulse animation to the wrong choice
    if (choice === "A") {
      document.getElementById("foodA").classList.add("wrong-pulse");
    } else {
      document.getElementById("foodB").classList.add("wrong-pulse");
    }

    // Remove the pulse class after the animation ends
    setTimeout(() => {
      cardA.classList.remove("wrong-pulse");
      cardB.classList.remove("wrong-pulse");
    }, 500);

    document.getElementById("streakText").textContent =
      `Streak ended! Your streak was ${streak}.`;
    document.getElementById("streakMessage").style.display = "block";

    streak = 0;
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

