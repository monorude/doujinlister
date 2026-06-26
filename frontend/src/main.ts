import './style.css';
import { renderToday } from './views/today';
import { renderBrowse } from './views/browse';
import { renderRegister } from './views/register';
import { renderEvents } from './views/events';

type RouteName = 'today' | 'browse' | 'register' | 'events';

const routes: Record<RouteName, (el: HTMLElement) => Promise<void>> = {
  today: renderToday,
  browse: renderBrowse,
  register: renderRegister,
  events: renderEvents,
};

const navEl = document.querySelector('nav')!;
const appEl = document.getElementById('app')!;

function currentRoute(): RouteName {
  const hash = location.hash.slice(2) as RouteName;
  return hash in routes ? hash : 'today';
}

function navigate(): void {
  const route = currentRoute();
  navEl.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  appEl.innerHTML = '';
  routes[route](appEl).catch(err => {
    appEl.innerHTML = `<div class="card"><p class="alert alert-error">エラー: ${err.message}</p></div>`;
  });
}

window.addEventListener('hashchange', navigate);
navigate();
