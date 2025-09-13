'use strict';

// Konfiguracja selektorów/klas w jednym miejscu
const opt = {
articleSelector: '.post',
titleSelector: '.post-title',
titleListSelector: '.titles',
linkActiveClass: 'active',
articleActiveClass: 'active',
};

// Handler kliknięcia w tytuł na liście
function titleClickHandler(event){
event.preventDefault();

const clickedElement = this;

/* [DONE] remove class 'active' from all article links */
const activeLinks = document.querySelectorAll(`${opt.titleListSelector} a.${opt.linkActiveClass}`);
for (const link of activeLinks){
link.classList.remove(opt.linkActiveClass);
}

/* [IN PROGRESS] add class 'active' to the clicked link */
clickedElement.classList.add(opt.linkActiveClass);

/* [DONE] remove class 'active' from all articles */
const activeArticles = document.querySelectorAll(`${opt.articleSelector}.${opt.articleActiveClass}`);
for (const article of activeArticles){
article.classList.remove(opt.articleActiveClass);
}

/* [DONE] get 'href' attribute from the clicked link */
const articleSelector = clickedElement.getAttribute('href'); // np. "#article-2"

/* [DONE] find the correct article using the selector */
const targetArticle = document.querySelector(articleSelector);

/* [DONE] add class 'active' to the correct article */
if (targetArticle){
targetArticle.classList.add(opt.articleActiveClass);
}
}

// Generowanie listy linków z tytułów artykułów
function generateTitleLinks(){
const titleList = document.querySelector(opt.titleListSelector);
titleList.innerHTML = '';

const articles = document.querySelectorAll(opt.articleSelector);

for (const article of articles){
// id artykułu do href
const id = article.getAttribute('id');

// tytuł artykułu z h3.post-title
const titleElement = article.querySelector(opt.titleSelector);
const title = titleElement ? titleElement.innerText : id;

// składamy link <li><a href="#id"><span>tytuł</span></a></li>
const linkHTML = `<li><a href="#${id}"><span>${title}</span></a></li>`;
titleList.insertAdjacentHTML('beforeend', linkHTML);
}

// podpinamy nasłuchiwanie kliknięć dla WSZYSTKICH nowo utworzonych linków
const links = document.querySelectorAll(`${opt.titleListSelector} a`);
for (const link of links){
link.addEventListener('click', titleClickHandler);
}

// Upewnij się, że któryś link jest aktywny (np. pierwszy),
// jeśli na starcie masz artykuł z .active
const firstActiveArticle = document.querySelector(`${opt.articleSelector}.${opt.articleActiveClass}`);
if (firstActiveArticle){
const activeId = firstActiveArticle.getAttribute('id');
const activeLink = document.querySelector(`${opt.titleListSelector} a[href="#${activeId}"]`);
if (activeLink) activeLink.classList.add(opt.linkActiveClass);
}
}

// Start
generateTitleLinks();
