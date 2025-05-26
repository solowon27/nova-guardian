const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '../cache/aiCache.json');

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("❌ Failed to load AI cache:", err.message);
  }
  return null;
}

function saveCache(data) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("❌ Failed to save AI cache:", err.message);
  }
}

module.exports = { loadCache, saveCache };
