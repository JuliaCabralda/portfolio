'use strict';

const root = document.body;
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
  const restoreFocus = navigation.classList.contains('open') && navigation.contains(document.activeElement) && window.matchMedia('(max-width: 760px)').matches;
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  menuButton.querySelector('span').textContent = '☰';
  if (restoreFocus) menuButton.focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuButton.querySelector('span').textContent = open ? '×' : '☰';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  const wasOpen = navigation.classList.contains('open');
  closeMenu();
  const destination = new URL(link.href);
  if (!wasOpen || destination.pathname !== window.location.pathname || !destination.hash) return;
  const target = document.getElementById(destination.hash.slice(1));
  if (!target) return;
  const temporaryTabIndex = !target.hasAttribute('tabindex');
  if (temporaryTabIndex) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  if (temporaryTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.nav-wrap')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const contactsToggle = document.querySelector('.profile-contacts-toggle');
const contactsPanel = document.querySelector('#profile-contacts');
if (contactsToggle && contactsPanel) {
const contactsLabel = contactsToggle.querySelector('.contacts-toggle-label');
contactsToggle.addEventListener('click', () => {
  const open = contactsToggle.getAttribute('aria-expanded') !== 'true';
  contactsToggle.setAttribute('aria-expanded', String(open));
  contactsLabel.textContent = open ? 'Contact' : 'Contacts';
  contactsPanel.classList.toggle('is-open', open);
  contactsPanel.setAttribute('aria-hidden', String(!open));
  contactsPanel.inert = !open;
});

}

document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  root.classList.add('js');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  const navigationRegions = [...document.querySelectorAll('[data-navigation-section]')];
  function updateActiveNavigation() {
    if (!navigationRegions.length) return;
    const marker = document.querySelector('.header').getBoundingClientRect().bottom + 32;
    let current = navigationRegions[0];
    navigationRegions.forEach(region => {
      if (region.getBoundingClientRect().top <= marker) current = region;
    });
    navigation.querySelectorAll('a').forEach(link => {
      const active = link.hash === `#${current.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  let navigationUpdatePending = false;
  window.addEventListener('scroll', () => {
    if (navigationUpdatePending) return;
    navigationUpdatePending = true;
    requestAnimationFrame(() => {
      updateActiveNavigation();
      navigationUpdatePending = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActiveNavigation);
  updateActiveNavigation();
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) contactForm.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#contact-form-status').textContent = 'No message was sent. Message delivery is not connected yet.';
});

const portfolioTabs = [...document.querySelectorAll('.portfolio-tab')];
function selectPortfolioTab(selectedTab, moveFocus = false) {
  portfolioTabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
  if (moveFocus) selectedTab.focus();
}
portfolioTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPortfolioTab(tab));
  tab.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % portfolioTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + portfolioTabs.length) % portfolioTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = portfolioTabs.length - 1;
    else return;
    event.preventDefault();
    selectPortfolioTab(portfolioTabs[nextIndex], true);
  });
});
