// ===========================
// Comprobar versión online
// ===========================
async function checkVersion() {
  try {
    // Obtener versión local desde package.json
    const appVersion = await window.electronAPI.getAppVersion();

    // Obtener versión online desde GitHub
    const response = await fetch('https://raw.githubusercontent.com/acierto-incomodo/Data-Exporter/main/version-github.txt');
    const remoteVersion = (await response.text()).trim();

    // Comparar versiones
    if (appVersion !== remoteVersion) {
      const confirmUpdate = confirm(
        `A new version is available: ${remoteVersion}\nYour version: ${appVersion}\nDo you want to go to the downloads page?`
      );
      if (confirmUpdate) {
        await window.electronAPI.openExternal('https://github.com/acierto-incomodo/Data-Exporter/releases/latest');
      }
    }
  } catch (err) {
    console.error('No se pudo verificar la versión:', err);
  }
}

checkVersion();

// ===========================
// Multilenguaje
// ===========================
let langData = {};

async function loadLanguage() {
  const systemLang = navigator.language.startsWith('es') ? 'es' : 'en';
  const langFile = `lang/${systemLang}.json`;

  try {
    const res = await fetch(langFile);
    langData = await res.json();
    applyLanguage();
  } catch (err) {
    console.error('Error al cargar idioma:', err);
  }
}

function applyLanguage() {
  const t = langData;
  document.getElementById('title').textContent = t.title;
  document.getElementById('sourcePath').placeholder = t.sourcePlaceholder;
  document.getElementById('targetPath').placeholder = t.targetPlaceholder;
  document.getElementById('browseSource').textContent = t.select;
  document.getElementById('browseTarget').textContent = t.select;
  document.getElementById('copyBtn').textContent = t.copy;
  document.getElementById('footerText').textContent = t.footer;
}

loadLanguage();

// ===========================
// Selección de carpetas y copia
// ===========================
const sourceInput = document.getElementById('sourcePath');
const targetInput = document.getElementById('targetPath');
const statusText = document.getElementById('status');

document.getElementById('browseSource').addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (folder) sourceInput.value = folder;
});

document.getElementById('browseTarget').addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (folder) targetInput.value = folder;
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  const t = langData;
  const src = sourceInput.value;
  const dest = targetInput.value;

  if (!src || !dest) {
    statusText.textContent = t.selectWarning;
    return;
  }

  statusText.textContent = t.copying;
  const result = await window.electronAPI.copyConfig(src, dest);
  if (result.success) statusText.textContent = t.success;
  else statusText.textContent = `${t.error} ${result.error}`;
});
