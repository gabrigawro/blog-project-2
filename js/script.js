/* ========= Selektory i parametry ========= */
const opt = {
  articleSelector: '.post',
  titleSelector: '.post-title',
  titleList: '.titles',
  articleTags: '.post-tags .list',
  tagsList: '.list.tags',
  articleAuthor: '.post-author',
  authorsList: '.list.authors',
  tagCloud: { classPrefix: 'tag-size-', levels: 5 },
  authorCloud: { classPrefix: 'author-size-', levels: 5 },
};

/* ========= Szablony Handlebars ========= */
const templates = {
  articleLink: Handlebars.compile(document.querySelector('#template-article-link').innerHTML),
  tagLink: Handlebars.compile(document.querySelector('#template-tag-link').innerHTML),
  tagCloud: Handlebars.compile(document.querySelector('#template-tag-cloud-link').innerHTML),
  authorLink: Handlebars.compile(document.querySelector('#template-author-link').innerHTML),
  authorCloud: Handlebars.compile(document.querySelector('#template-author-cloud-link').innerHTML),
};

/* ========= Helpery ========= */
const toId = (txt) => txt.trim().toLowerCase().replace(/\s+/g, '-');

function calcClass(count, {min, max}, {classPrefix, levels}) {
  if (min === max) return classPrefix + Math.ceil(levels / 2);
  const normalized = (count - min) / (max - min);
  const level = 1 + Math.floor(normalized * (levels - 1));
  return classPrefix + level;
}

/* ========= Lista tytułów (z filtrem) ========= */
function generateTitleLinks(filterFn = null) {
  const titleList = document.querySelector(opt.titleList);
  titleList.innerHTML = '';

  const allArticles = Array.from(document.querySelectorAll(opt.articleSelector));
  const articles = filterFn ? allArticles.filter(filterFn) : allArticles;

  let html = '';
  for (const article of articles) {
    const id = article.getAttribute('id');
    const title = article.querySelector(opt.titleSelector)?.innerHTML || 'Bez tytułu';
    html += templates.articleLink({ id, title });
  }
  titleList.innerHTML = html;

  // aktywuj pierwszy i pokaż jego artykuł
  document.querySelectorAll('.post').forEach(p => p.classList.remove('active'));
  const firstLink = titleList.querySelector('a');
  if (firstLink) {
    firstLink.classList.add('active');
    const firstArticle = document.querySelector(firstLink.getAttribute('href'));
    if (firstArticle) firstArticle.classList.add('active');
  }

  titleList.querySelectorAll('a').forEach(a => a.addEventListener('click', titleClickHandler));
}

function titleClickHandler(e) {
  e.preventDefault();
  const link = this;

  document.querySelectorAll(`${opt.titleList} a.active`).forEach(a => a.classList.remove('active'));
  link.classList.add('active');

  document.querySelectorAll('.post.active').forEach(a => a.classList.remove('active'));
  const target = document.querySelector(link.getAttribute('href'));
  if (target) target.classList.add('active');
}

/* ========= TAGI ========= */
function generateTags() {
  const allCounts = {}; // { 'js': 3, ... }

  document.querySelectorAll(opt.articleSelector).forEach(article => {
    const wrapper = article.querySelector(opt.articleTags);
    wrapper.innerHTML = '';

    const tags = (article.getAttribute('data-tags') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const links = tags.map(tag => {
      const id = toId(tag);
      allCounts[id] = (allCounts[id] || 0) + 1;
      return templates.tagLink({ id, name: tag });
    });

    wrapper.innerHTML = links.join('');
  });

  // chmura tagów w sidebarze
  const counts = Object.values(allCounts);
  const range = { min: Math.min(...counts), max: Math.max(...counts) };
  const data = {
    tags: Object.entries(allCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([id, count]) => ({
        id,
        count,
        className: calcClass(count, range, opt.tagCloud),
        label: id.replace(/-/g, ' ')
      })),
  };
  document.querySelector(opt.tagsList).innerHTML = templates.tagCloud(data);
}

function tagClickHandler(e) {
  e.preventDefault();
  const href = this.getAttribute('href');      // "#tag-something"
  const tagId = href.replace('#tag-', '');

  // active dla tagów
  document.querySelectorAll('a[href^="#tag-"].active').forEach(a => a.classList.remove('active'));
  document.querySelectorAll(`a[href="${href}"]`).forEach(a => a.classList.add('active'));

  // filtruj artykuły po tagu (na podstawie data-tags)
  generateTitleLinks(article => {
    const tags = (article.getAttribute('data-tags') || '')
      .toLowerCase()
      .split(',')
      .map(s => s.trim().replace(/\s+/g, '-'));
    return tags.includes(tagId);
  });

  // po odświeżeniu listy musimy znów podpiąć listenery tagów (są nowe elementy)
  addClickListenersToTags();
  addClickListenersToAuthors(); // i autorów, bo lista tytułów się zmieniła
}

function addClickListenersToTags() {
  document.querySelectorAll('a[href^="#tag-"]').forEach(a => a.addEventListener('click', tagClickHandler));
}

/* ========= AUTORZY ========= */
function generateAuthors() {
  const allCounts = {}; // { 'jan-kowalski': 2, ... }

  document.querySelectorAll(opt.articleSelector).forEach(article => {
    const name = article.getAttribute('data-author') || '';
    const id = toId(name);
    allCounts[id] = (allCounts[id] || 0) + 1;

    const place = article.querySelector(opt.articleAuthor);
    place.innerHTML = templates.authorLink({ id, name });
  });

  // chmura autorów
  const counts = Object.values(allCounts);
  const range = { min: Math.min(...counts), max: Math.max(...counts) };
  const data = {
    authors: Object.entries(allCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([id, count]) => ({
        id,
        count,
        className: calcClass(count, range, opt.authorCloud),
        label: id.replace(/-/g, ' ')
      })),
  };
  document.querySelector(opt.authorsList).innerHTML = templates.authorCloud(data);
}

function authorClickHandler(e) {
  e.preventDefault();
  const href = this.getAttribute('href');     // "#author-jan-kowalski"
  const authorId = href.replace('#author-', '');

  // active dla autorów
  document.querySelectorAll('a[href^="#author-"].active').forEach(a => a.classList.remove('active'));
  document.querySelectorAll(`a[href="${href}"]`).forEach(a => a.classList.add('active'));

  generateTitleLinks(article => toId(article.getAttribute('data-author') || '') === authorId);

  addClickListenersToTags();
  addClickListenersToAuthors();
}

function addClickListenersToAuthors() {
  document.querySelectorAll('a[href^="#author-"]').forEach(a => a.addEventListener('click', authorClickHandler));
}

/* ========= Start ========= */
generateTitleLinks();      // lista tytułów
generateTags();            // tagi w artykułach + chmura tagów
generateAuthors();         // autor w artykule + chmura autorów
addClickListenersToTags();
addClickListenersToAuthors();
