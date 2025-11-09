async function checkVersion() {
  const fs = require('fs');
  const { shell } = require('electron');

  // 1. Leer versión local
  const localVersionPath = 'version.txt';
  let localVersion = '0.0.0';
  if (fs.existsSync(localVersionPath)) {
    localVersion = fs.readFileSync(localVersionPath, 'utf8').trim();
  }

  // 2. Obtener versión online
  try {
    const response = await fetch('https://raw.githubusercontent.com/acierto-incomodo/Data-Exporter/main/version-github.txt');
    const remoteVersion = (await response.text()).trim();

    // 3. Comparar versiones
    if (localVersion !== remoteVersion) {
      // Abrir página de la release más reciente
      const confirmUpdate = confirm(`Hay una nueva versión disponible: ${remoteVersion}\nTu versión: ${localVersion}\n¿Quieres ir a la página de descargas?`);
      if (confirmUpdate) {
        shell.openExternal('https://github.com/acierto-incomodo/Data-Exporter/releases/latest');
      }
    }
  } catch (err) {
    console.error('No se pudo verificar la versión online:', err);
  }
}

// Ejecutar al iniciar
checkVersion();

let langData = {};

async function loadLanguage() {
  // Detectar idioma del sistema (si empieza con 'es', usa español)
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
