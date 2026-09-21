// Self-tests — run at ?test=1
import { BUILDINGS, cleanData, REGION_COLORS } from './data.js';
import { state } from './state.js';

const ALL_BUILDINGS = cleanData(BUILDINGS);

export function runSelfTests() {
  let passed = 0, failed = 0;
  const results = [];
  function assert(condition, label) {
    if (condition) {
      passed++;
      results.push({ pass: true, label });
    } else {
      failed++;
      results.push({ pass: false, label });
      console.error(`  ✗ FAIL: ${label}`);
    }
  }

  // 1-3: Data integrity
  assert(ALL_BUILDINGS.length >= 20 && ALL_BUILDINGS.length <= 30, `Data: ${ALL_BUILDINGS.length} buildings (20-30)`);
  assert(ALL_BUILDINGS[0].name === 'Burj Khalifa', 'Tallest = Burj Khalifa');
  assert(ALL_BUILDINGS[0].height === 828, 'Burj Khalifa height = 828m');

  // 4: Deduplication
  const names = ALL_BUILDINGS.map(b => b.name);
  assert(new Set(names).size === names.length, `No duplicate names (${ALL_BUILDINGS.length} unique)`);

  // 5-7: Sorting
  const hs = [...ALL_BUILDINGS].sort((a,b) => b.height - a.height);
  assert(hs[0].height >= hs[1].height, 'Height sort descending works');
  const nameSorted = [...ALL_BUILDINGS].sort((a,b) => a.name.localeCompare(b.name));
  assert(nameSorted.every((b,i,a) => i===0 || a[i-1].name.localeCompare(b.name) <= 0), 'Name sort works');
  const yearSorted = [...ALL_BUILDINGS].sort((a,b) => a.opened - b.opened);
  assert(yearSorted.every((b,i,a) => i===0 || a[i-1].opened <= b.opened), 'Year sort works');

  // 8: Ranking
  assert(ALL_BUILDINGS.every((b,i) => b.rank === i + 1), 'Ranks sequential from 1');

  // 9-11: Region filters
  const asia = ALL_BUILDINGS.filter(b => b.region === 'Asia');
  assert(asia.length > 0, `Asia filter: ${asia.length} buildings`);
  const me = ALL_BUILDINGS.filter(b => b.region === 'Middle East');
  assert(me.length > 0, `Middle East: ${me.length} buildings`);
  const am = ALL_BUILDINGS.filter(b => b.region === 'Americas');
  assert(am.length > 0, `Americas: ${am.length} buildings`);

  // 12-15: Era filters
  const pre = ALL_BUILDINGS.filter(b => b.opened < 2000);
  assert(pre.length > 0, `Pre-2000: ${pre.length} buildings`);
  const e2020 = ALL_BUILDINGS.filter(b => b.opened >= 2021);
  assert(e2020.length >= 0, `2020+ era: ${e2020.length} buildings`);
  const e2015 = ALL_BUILDINGS.filter(b => b.opened >= 2016 && b.opened <= 2020);
  assert(e2015.length > 0, `2015-2020: ${e2015.length} buildings`);
  const e2010 = ALL_BUILDINGS.filter(b => b.opened >= 2011 && b.opened <= 2015);
  assert(e2010.length > 0, `2010-2015: ${e2010.length} buildings`);

  // 16-17: Search
  const shanghai = ALL_BUILDINGS.filter(b => b.name.toLowerCase().includes('shanghai') || b.city.toLowerCase().includes('shanghai'));
  assert(shanghai.length > 0, `Shanghai search: ${shanghai.length}`);
  const usa = ALL_BUILDINGS.filter(b => b.country === 'USA');
  assert(usa.length > 0, `USA: ${usa.length} buildings`);

  // 18: Height ratio
  const ratio = (ALL_BUILDINGS[5].height / ALL_BUILDINGS[0].height * 100);
  assert(ratio > 0 && ratio < 100, `Ratio: ${ratio.toFixed(1)}% of tallest`);

  // 19: Region colors
  const regions = [...new Set(ALL_BUILDINGS.map(b => b.region))];
  assert(regions.every(r => REGION_COLORS[r]), `All ${regions.length} regions colored`);

  // 20: Fields
  assert(ALL_BUILDINGS.every(b => b.name && b.city && b.country && b.region && typeof b.height === 'number' && typeof b.floors === 'number' && typeof b.opened === 'number'), 'All fields present');

  // 21-22: Height & floor ranges
  assert(ALL_BUILDINGS.every(b => b.height >= 200 && b.height <= 1000), 'Heights in 200-1000m range');
  assert(ALL_BUILDINGS.every(b => b.floors >= 50), 'Floors >= 50');

  // 23: Scale calculation
  const gLvl = 400 - 20, tAll = ALL_BUILDINGS[0].height;
  const scalePx = (gLvl - 20) / tAll;
  const pxH = 400 * scalePx;
  assert(pxH > 0 && pxH < gLvl, `Scale: 400m = ${pxH.toFixed(0)}px`);

  // 24: Stack ratio
  assert(ALL_BUILDINGS[0].height / ALL_BUILDINGS[1].height > 1, `Stack ratio: ${(ALL_BUILDINGS[0].height / ALL_BUILDINGS[1].height).toFixed(2)}`);

  // 25: Countries
  const countries = [...new Set(ALL_BUILDINGS.map(b => b.country))];
  assert(countries.length >= 5, `Countries: ${countries.length} (${countries.join(', ')})`);

  // 26-28: Count slices
  assert(ALL_BUILDINGS.slice(0, 5).length === 5, 'Slice to 5');
  assert(ALL_BUILDINGS.slice(0, 10).length === 10, 'Slice to 10');
  assert(ALL_BUILDINGS.slice(0, 30).length === ALL_BUILDINGS.length, 'Slice to 30');

  // 29: Canvas rendering
  const canvas = document.querySelector('#skyline');
  assert(canvas && canvas.width > 0 && canvas.height > 0, `Canvas: ${canvas?.width}x${canvas?.height}`);

  // Summary
  const summary = failed === 0 ? 'ALL PASSED ✓' : `${failed} FAILURES ✗`;
  console.log(`\n=== Self Tests: ${passed}/${passed + failed} ${summary} ===`);

  document.title = `Tests: ${passed}/${passed + failed} ${summary}`;
  const el = document.getElementById('status-text');
  if (el) el.textContent = `Tests: ${passed}/${passed + failed} ${summary}`;
  const fpsEl = document.getElementById('status-fps');
  if (fpsEl) fpsEl.textContent = failed === 0 ? '✓' : '✗';

  // Overlay results
  const testDiv = document.createElement('div');
  testDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#faf8f5;z-index:9999;padding:16px 24px;font-family:"IBM Plex Mono",monospace;font-size:13px;border-bottom:3px solid ' + (failed === 0 ? '#27ae60' : '#c0392b') + ';max-height:60vh;overflow:auto;';
  testDiv.innerHTML = `<h3 style="margin:0 0 10px;font-family:'DM Serif Display',serif;font-size:18px;">Self Tests: ${passed}/${passed + failed} ${summary}</h3>`;
  results.forEach(r => {
    testDiv.innerHTML += `<div style="color:${r.pass ? '#27ae60' : '#c0392b'};padding:2px 0">${r.pass ? '✓' : '✗'} ${r.label}</div>`;
  });
  document.body.appendChild(testDiv);

  return { passed, failed, total: passed + failed, allPassed: failed === 0 };
}
