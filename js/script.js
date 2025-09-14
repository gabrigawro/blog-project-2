/* ===== Dane ===== */
const data = {
  articles: [
    { id: 'article-1', title: 'Artykuł o JavaScript', tags: ['js', 'programowanie'] },
    { id: 'article-2', title: 'Artykuł o CSS', tags: ['css', 'design'] },
    { id: 'article-3', title: 'Artykuł o Handlebars', tags: ['js', 'handlebars'] },
    { id: 'article-4', title: 'Artykuł o HTML', tags: ['html', 'frontend'] },
  ],
};

/* ===== Kompilacja szablonów ===== */
const templates = {
  articleLink: Handlebars.compile(
    document.querySelector('#template-article-link').innerHTML
  ),
  tagCloud: Handlebars.compile(
    document.querySelector('#template-tag-cloud-link').innerHTML
  ),
};

/* ===== Funkcje ===== */
function generateArticleLinks() {
  const articleList = document.querySelector('#article-list');
  articleList.innerHTML = '';

  for (let article of data.articles) {
    const linkHTML = templates.articleLink(article);
    articleList.insertAdjacentHTML('beforeend', linkHTML);
  }
}

function calculateTags() {
  const allTags = {};

  for (let article of data.articles) {
    for (let tag of article.tags) {
      if (!allTags[tag]) {
        allTags[tag] = 1;
      } else {
        allTags[tag]++;
      }
    }
  }
  return allTags;
}

function generateTagCloud() {
  const allTags = calculateTags();
  const tagCloudData = { tags: [] };

  const counts = Object.values(allTags);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  function calculateClass(count) {
    const normalized = (count - min) / (max - min || 1);
    if (normalized < 0.33) return 'tag-size-1';
    if (normalized < 0.66) return 'tag-size-2';
    return 'tag-size-3';
  }

  for (let tag in allTags) {
    tagCloudData.tags.push({
      tag: tag,
      count: allTags[tag],
      className: calculateClass(allTags[tag]),
    });
  }

  const tagCloud = document.querySelector('#tag-cloud');
  tagCloud.innerHTML = templates.tagCloud(tagCloudData);
}

/* ===== Uruchomienie ===== */
generateArticleLinks();
generateTagCloud();
