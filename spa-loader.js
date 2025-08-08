// spa-loader.js

function loadView(viewName) {
  const content = document.getElementById('content');
  content.innerHTML = '<p>Ładowanie...</p>';

  fetch(`partials/${viewName}.html`)
    .then(res => {
      if (!res.ok) throw new Error('Nie znaleziono widoku');
      return res.text();
    })
    .then(html => {
      content.innerHTML = html;
    })
    .catch(err => {
      content.innerHTML = `<p style="color:red">Błąd: ${err.message}</p>`;
    });
}

function handleRouteChange() {
  const hash = location.hash.slice(1) || 'home';
  loadView(hash);
}

window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('load', handleRouteChange);
