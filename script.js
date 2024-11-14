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

function generateGroups() {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  const namesText = document.getElementById('names').value.trim();
  const groupSize = parseInt(document.getElementById('groupSize').value);

  if (!namesText) {
    showError();
    return;
  }

  if (groupSize < 1) {
    alert('Flock size must be at least 1!');
    return;
  }

  // Update URL with current names
  updateURL(namesText);

  document.querySelector('.loading').style.display = 'block';

  let names = namesText
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  names = shuffleArray(names);

  const groups = [];
  for (let i = 0; i < names.length; i += groupSize) {
    groups.push(names.slice(i, i + groupSize));
  }

  setTimeout(() => {
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

// On page load, check for names in URL
window.addEventListener('load', () => {
  const namesFromURL = getNamesFromURL();
  if (namesFromURL) {
    document.getElementById('names').value = namesFromURL;
  }
});
