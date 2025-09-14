/* ========= Stałe selektory ========= */
const optArticleSelector = '.post';
const optTitleSelector = '.post-title';
const optTitleListSelector = '.titles';

const optArticleTagsSelector = '.post-tags .list';
const optTagsListSelector = '.list.tags';

const optArticleAuthorSelector = '.post-author';
const optAuthorsListSelector = '.list.authors';

/* ========= Helpery ========= */
function normalizeToId(txt) {
  return txt.trim().toLowerCase().replace(/\s+/g, '-');
}

/* ========= Generowanie listy tytułów (z filtrem) ========= */
function generateTitleLinks(customSelector = '') {
  const titleList = document.querySelector(`.${optTitleListSelector.split('.').pop()}`);
  titleList.innerHTML = '';

  const articles = document.querySelectorAll(optArticleSelector + customSelector);

  let html = '';
  for (let article of articles) {
    const articleId = article.getAttribute('id');
    const title = article.querySelector(optTitleSelector)?.innerHTML || 'Bez tytułu';
    html += `<li><a href="#${articleId}"><span>${title}</span></a></li>`;
  }

  titleList.innerHTML = html;

  const links = titleList.querySelectorAll('a');
  for (let link of links) link.addEventListener('click', titleClickHandler);

  // Jeżeli filtr zwrócił wyniki – pokaż pierwszy artykuł z listy
  if (links.length) {
    links[0].classList.add('active');
    const firstHref = links[0].getAttribute('href');
    document.querySelectorAll(optArticleSelector).forEach(a => a.classList.remove('active'));
    const firstArticle = document.querySelector(firstHref);
    if (firstArticle) firstArticle.classList.add('active');
  } else {
    // Brak wyników – ukryj wszystkie artykuły
    document.querySelectorAll(optArticleSelector).forEach(a => a.classList.remove('active'));
  }
}

/* ========= Kliknięcie w tytuł ========= */
function titleClickHandler(event) {
  event.preventDefault();
  const clicked = this;

  document.querySelectorAll('.titles a.active').forEach(a => a.classList.remove('active'));
  clicked.classList.add('active');

  document.querySelectorAll('.post.active').forEach(a => a.classList.remove('active'));
  const href = clicked.getAttribute('href');
  const target = document.querySelector(href);
  if (target) target.classList.add('active');
}

/* ========= TAGI ========= */
function generateTags() {
  const allTags = {}; // { 'js': 3, 'dom': 1, ... }

  const articles = document.querySelectorAll(optArticleSelector);
  for (let article of articles) {
    const wrapper = article.querySelector(optArticleTagsSelector);
    wrapper.innerHTML = '';

    const tagsAttr = article.getAttribute('data-tags') || '';
    const tags = tagsAttr.split(',').map(t => t.trim()).filter(Boolean);

    const links = [];
    for (let tag of tags) {
      const id = normalizeToId(tag);
      links.push(`<li><a href="#tag-${id}">${tag}</a></li>`);
      allTags[id] = (allTags[id] || 0) + 1;
    }
    wrapper.innerHTML = links.join('');
  }

  // sidebar
  const list = document.querySelector(optTagsListSelector);
  const items = Object.entries(allTags)
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([id,count]) => `<li><a href="#tag-${id}">${id.replace(/-/g,' ')} (${count})</a></li>`);
  list.innerHTML = items.join('');
}

function tagClickHandler(event) {
  event.preventDefault();
  const href = this.getAttribute('href'); // "#tag-js"
  const tagId = href.replace('#tag-','');

  // active dla tagów
  document.querySelectorAll('a[href^="#tag-"].active').forEach(a => a.classList.remove('active'));
  document.querySelectorAll(`a[href="${href}"]`).forEach(a => a.classList.add('active'));

  // filtr artykułów po tagu (szukamy w data-tags po słowie)
  // uproszczenie: dopasowujemy przez zawartość atrybutu (case-insensitive)
  generateTitleLinks(
    Array.from(document.querySelectorAll(optArticleSelector))
      .filter(a => (a.getAttribute('data-tags') || '').toLowerCase().split(',')
        .map(s => s.trim().replace(/\s+/g,'-'))
        .includes(tagId))
      .length ? '' : '' // generateTitleLinks i tak przeładuje listę; filtr zrobimy niżej
  );

  // zamiast kombinacji z selektorami CSS, wykonamy własny filtr:
  const all = document.querySelectorAll(optArticleSelector);
  let firstShown = null;
  all.forEach(a => {
    const has = (a.getAttribute('data-tags') || '').toLowerCase().split(',').map(s=>s.trim().replace(/\s+/g,'-')).includes(tagId);
    a.classList.toggle('active', has);
    if (has && !firstShown) firstShown = a;
  });

  // odśwież listę tytułów tak, by zawierała tylko te z dopasowaniem
  const visibleIds = Array.from(all).filter(a => a.classList.contains('active')).map(a => `#${a.id}`);
  const titleList = document.querySelector(optTitleListSelector);
  titleList.innerHTML = '';
  visibleIds.forEach(id => {
    const t = document.querySelector(`${id} ${optTitleSelector}`)?.innerHTML || 'Bez tytułu';
    titleList.innerHTML += `<li><a href="${id}"><span>${t}</span></a></li>`;
  });
  titleList.querySelectorAll('a').forEach(a => a.addEventListener('click', titleClickHandler));

  // zaznacz pierwszy
  if (firstShown) {
    document.querySelectorAll('.titles a').forEach(a => a.classList.remove('active'));
    const firstLink = document.querySelector(`.titles a[href="#${firstShown.id}"]`);
    if (firstLink) firstLink.classList.add('active');
  }
}

function addClickListenersToTags() {
  document.querySelectorAll('a[href^="#tag-"]').forEach(a => a.addEventListener('click', tagClickHandler));
}

/* ========= AUTORZY ========= */
function generateAuthors() {
  const counts = {}; // {"jan-kowalski": 2, ...}

  const articles = document.querySelectorAll(optArticleSelector);
  for (let article of articles) {
    const author = article.getAttribute('data-author');
    if (!author) continue;
    const id = normalizeToId(author);

    // w artykule
    const spot = article.querySelector(optArticleAuthorSelector);
    spot.innerHTML = `Autor: <a href="#author-${id}">${author}</a>`;

    counts[id] = (counts[id] || 0) + 1;
  }

  // sidebar
  const list = document.querySelector(optAuthorsListSelector);
  list.innerHTML = Object.entries(counts)
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([id,count]) => `<li><a href="#author-${id}">${id.replace(/-/g,' ')} (${count})</a></li>`)
    .join('');
}

function authorClickHandler(event) {
  event.preventDefault();
  const href = this.getAttribute('href'); // "#author-jan-kowalski"
  const authorId = href.replace('#author-',''); // "jan-kowalski"

  // active dla autorów (w artykule i w sidebarze)
  document.querySelectorAll('a[href^="#author-"].active').forEach(a => a.classList.remove('active'));
  document.querySelectorAll(`a[href="${href}"]`).forEach(a => a.classList.add('active'));

  // pokaż tylko artykuły tego autora
  const all = document.querySelectorAll(optArticleSelector);
  let firstShown = null;
  all.forEach(a => {
    const id = normalizeToId(a.getAttribute('data-author') || '');
    const match = id === authorId;
    a.classList.toggle('active', match);
    if (match && !firstShown) firstShown = a;
  });

  // odśwież listę tytułów do widocznych
  const titleList = document.querySelector(optTitleListSelector);
  titleList.innerHTML = '';
  document.querySelectorAll('.post.active').forEach(article => {
    const t = article.querySelector(optTitleSelector)?.innerHTML || 'Bez tytułu';
    titleList.innerHTML += `<li><a href="#${article.id}"><span>${t}</span></a></li>`;
  });
  titleList.querySelectorAll('a').forEach(a => a.addEventListener('click', titleClickHandler));

  // zaznacz pierwszy
  if (firstShown) {
    const firstLink = document.querySelector(`.titles a[href="#${firstShown.id}"]`);
    if (firstLink) firstLink.classList.add('active');
  }
}

function addClickListenersToAuthors() {
  document.querySelectorAll('a[href^="#author-"]').forEach(a => a.addEventListener('click', authorClickHandler));
}

/* ========= Start ========= */
generateTitleLinks();        // lista tytułów
generateTags();              // lista tagów + tagi w artykułach
addClickListenersToTags();   // kliknięcia tagów
generateAuthors();           // autor w artykule + lista autorów
addClickListenersToAuthors();// kliknięcia autorów
