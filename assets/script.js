
async function getRecipes() {
  const res = await fetch('assets/recipes.json');
  return await res.json();
}

function card(r) {
  const tags = [...(r.varieties||[]), r.meal, ...(r.diet||[])].filter(Boolean);
  const badges = tags.map(t => `<span class="badge">${t}</span>`).join('');
  return `
  <a href="recipe.html?id=${encodeURIComponent(r.id)}" class="card">
    <img src="assets/${r.image}" alt="${r.title}"/>
    <div class="pad">
      <strong>${r.title}</strong>
      <div class="badges">${badges}</div>
    </div>
  </a>`;
}

function initSearchRedirect() {
  const q = document.getElementById('q');
  const v = document.getElementById('filterVariety');
  if (!q) return;
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const qs = new URLSearchParams();
      if (q.value) qs.set('q', q.value);
      if (v.value) qs.set('variety', v.value);
      window.location.href = 'recipes.html?' + qs.toString();
    }
  });
  v.addEventListener('change', () => {
    const qs = new URLSearchParams();
    if (q.value) qs.set('q', q.value);
    if (v.value) qs.set('variety', v.value);
    window.location.href = 'recipes.html?' + qs.toString();
  });
}

async function loadFeatured() {
  const list = document.getElementById('featured');
  if (!list) return;
  const data = await getRecipes();
  const picks = data.slice(0, 4);
  list.innerHTML = picks.map(card).join('');
}

function matches(r, q) {
  if (!q) return true;
  const hay = (r.title + ' ' + (r.ingredients||[]).join(' ')).toLowerCase();
  return hay.includes(q.toLowerCase());
}

async function initRecipesPage() {
  const data = await getRecipes();
  const url = new URL(window.location);
  const qStr = url.searchParams.get('q') || '';
  const initialVar = url.searchParams.get('variety') || '';
  const initialMeal = url.searchParams.get('meal') || '';

  const search = document.getElementById('search');
  const variety = document.getElementById('variety');
  const meal = document.getElementById('meal');
  const list = document.getElementById('list');

  search.value = qStr;
  variety.value = initialVar;
  meal.value = initialMeal;

  function render() {
    const q = search.value;
    const v = variety.value;
    const m = meal.value;
    const filtered = data.filter(r => matches(r, q) && (v ? (r.varieties||[]).includes(v) : true) && (m ? r.meal === m : true));
    list.innerHTML = filtered.map(card).join('') || '<p class="small">No recipes found. Try another search.</p>';
  }

  document.getElementById('apply').addEventListener('click', render);
  render();
}

async function initRecipePage() {
  const data = await getRecipes();
  const url = new URL(window.location);
  const id = url.searchParams.get('id');
  const r = data.find(x => x.id === id) || data[0];

  document.title = r.title + ' — TrueLau';
  document.getElementById('title').textContent = r.title;
  document.getElementById('metaVarieties').textContent = (r.varieties||[]).join(', ');
  document.getElementById('metaMeal').textContent = r.meal;
  document.getElementById('metaDiet').textContent = (r.diet||[]).join(' / ');
  document.getElementById('metaTime').textContent = r.time;
  document.getElementById('metaServes').textContent = 'Serves ' + r.serves;
  document.getElementById('image').src = 'assets/' + r.image;

  const ing = document.getElementById('ingredients');
  ing.innerHTML = (r.ingredients||[]).map(i => `<li>${i}</li>`).join('');

  const steps = document.getElementById('steps');
  steps.innerHTML = (r.steps||[]).map(s => `<li>${s}</li>`).join('');

  if (r.notes) {
    document.getElementById('notes').textContent = r.notes;
  }

  document.getElementById('printBtn').addEventListener('click', (e) => {
    e.preventDefault();
    window.print();
  });
  document.getElementById('shareBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    } catch (err) {
      alert('Copy failed, please copy manually.');
    }
  });
}
