// Function to read names from URL query parameter
function getNamesFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const namesParam = urlParams.get('q');
  if (namesParam) {
    // Split by comma and decode URI components to handle special characters
    return namesParam
      .split(',')
      .map((name) => decodeURIComponent(name.trim()))
      .filter((name) => name.length > 0)
      .join('\n');
  }
  return '';
}

// Function to update URL with current names
function updateURL(names) {
  const namesParam = names
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => encodeURIComponent(name))
    .join(',');

  const newURL = `${window.location.pathname}?q=${namesParam}`;
  window.history.pushState({ path: newURL }, '', newURL);
}

// Function to get a shareable link
function getShareableLink() {
  const names = document.getElementById('names').value.trim();
  if (names) {
    const namesParam = names
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => encodeURIComponent(name))
      .join(',');

    return `${window.location.origin}${window.location.pathname}?q=${namesParam}`;
  }
  return '';
}

function showError() {
  const textarea = document.getElementById('names');
  const errorMessage = document.getElementById('error-message');

  textarea.classList.add('error');
  errorMessage.style.display = 'block';

  setTimeout(() => {
    textarea.classList.remove('error');
  }, 500);
}

// Clear error message when user starts typing
document.getElementById('names').addEventListener('input', function () {
  document.getElementById('error-message').style.display = 'none';
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function distributeExtra(groups, extraMembers) {
  const shuffledExtra = shuffleArray([...extraMembers]);
  let extraIndex = 0;

  // Distribute extra members randomly across groups
  while (extraIndex < shuffledExtra.length) {
    const randomGroupIndex = Math.floor(Math.random() * groups.length);
    groups[randomGroupIndex].push(shuffledExtra[extraIndex]);
    extraIndex++;
  }

  return groups;
}

const quackAudios = [
  'duckChicks.mp3',
  'excitedDucks.mp3',
  'hissingDuck.mp3',
  'quackFly.mp3',
  'quackRepeat.mp3',
  'quietDucks.mp3',
  'shortQuack.mp3',
  'toyQuack.mp3',
];

// Previous functions remain the same until generateGroups...
function createBalancedGroups(names, targetGroupSize) {
  const totalPeople = names.length;
  const minGroups = Math.ceil(totalPeople / targetGroupSize);

  // Calculate how many larger groups we need
  const extraPeople = totalPeople % minGroups;
  const numLargerGroups = extraPeople || minGroups;
  const baseGroupSize = Math.floor(totalPeople / minGroups);

  let groups = [];
  let namesIndex = 0;

  // Create the larger groups first
  for (let i = 0; i < numLargerGroups; i++) {
    groups.push(names.slice(namesIndex, namesIndex + baseGroupSize + 1));
    namesIndex += baseGroupSize + 1;
  }

  // Create the regular-sized groups with remaining people
  while (namesIndex < names.length) {
    groups.push(names.slice(namesIndex, namesIndex + baseGroupSize));
    namesIndex += baseGroupSize;
  }

  return groups;
}

function createBalancedGroupsByFlockCount(names, targetFlockCount) {
  const totalPeople = names.length;

  // Calculate base group size and remainder
  const baseGroupSize = Math.floor(totalPeople / targetFlockCount);
  const remainder = totalPeople % targetFlockCount;

  let groups = [];
  let namesIndex = 0;

  // Distribute names across groups
  for (let i = 0; i < targetFlockCount; i++) {
    // Determine if this group gets an extra person
    const groupSize = baseGroupSize + (i < remainder ? 1 : 0);

    // Slice the group from the names array
    groups.push(names.slice(namesIndex, namesIndex + groupSize));
    namesIndex += groupSize;
  }

  return groups;
}

function generateGroups() {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  const namesText = document.getElementById('names').value.trim();
  const flockCount = parseInt(document.getElementById('flockCount').value);
  const groupingMode = document.getElementById('groupingMode').value;

  if (!namesText) {
    showError();
    return;
  }

  if (flockCount < 1) {
    alert('Number of flocks must be at least 1!');
    return;
  }

  // Update URL with current names
  updateURL(namesText);

  document.querySelector('.loading').style.display = 'block';
  quackAudio = pickRandomQuack();
  // Play quack sounds during loading
  quackAudio.volume = 0.5;
  quackAudio.loop = true;
  quackAudio.play();

  let names = namesText
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  names = shuffleArray(names);

  let groups;
  if (groupingMode === 'flockCount') {
    groups = createBalancedGroupsByFlockCount(names, flockCount);
  } else {
    // Original grouping logic for ducks per flock
    const groupSize = flockCount;
    groups = [];
    for (let i = 0; i < names.length; i += groupSize) {
      groups.push(names.slice(i, i + groupSize));
    }
  }

  setTimeout(() => {
    quackAudio.pause();
    quackAudio.currentTime = 0;

    document.querySelector('.loading').style.display = 'none';

    groups.forEach((group, index) => {
      const flockDiv = document.createElement('div');
      flockDiv.className = 'flock';

      const title = document.createElement('h3');
      title.innerHTML = `🦆 Flock ${index + 1}`;

      const list = document.createElement('ul');
      group.forEach((name) => {
        const item = document.createElement('li');
        item.textContent = name;
        list.appendChild(item);
      });

      flockDiv.appendChild(title);
      flockDiv.appendChild(list);
      resultsDiv.appendChild(flockDiv);

      setTimeout(() => {
        flockDiv.classList.add('visible');
      }, index * 200);
    });

    // Add share button after groups are displayed
    const shareDiv = document.createElement('div');
    shareDiv.className = 'share-section';
    const shareButton = document.createElement('button');
    shareButton.textContent = '🔗 Copy Shareable Link';
    shareButton.onclick = () => {
      navigator.clipboard
        .writeText(getShareableLink())
        .then(() => {
          shareButton.textContent = '✅ Link Copied!';
          setTimeout(() => {
            shareButton.textContent = '🔗 Copy Shareable Link';
          }, 2000);
        })
        .catch(() => {
          shareButton.textContent = '❌ Failed to copy';
          setTimeout(() => {
            shareButton.textContent = '🔗 Copy Shareable Link';
          }, 2000);
        });
    };
    shareDiv.appendChild(shareButton);
    resultsDiv.appendChild(shareDiv);
  }, 3000);
}

function toggleSound() {
  const soundToggle = document.getElementById('soundToggle');
  soundToggle.classList.toggle('sound-off');

  if (soundToggle.classList.contains('sound-off')) {
    soundToggle.textContent = '🔇 Sound Off';
    localStorage.setItem('duckSoundEnabled', 'false');
  } else {
    soundToggle.textContent = '🔊 Sound On';
    localStorage.setItem('duckSoundEnabled', 'true');
  }
}

function pickRandomQuack() {
  const selectedQuack =
    quackAudios[Math.floor(Math.random() * quackAudios.length)];

  console.log(selectedQuack);

  const audioElement = new Audio(selectedQuack);
  return audioElement;
}

// Rest of the code remains the same...

// On page load, check for names in URL
window.addEventListener('load', () => {
  const namesFromURL = getNamesFromURL();
  if (namesFromURL) {
    document.getElementById('names').value = namesFromURL;
  }
});
