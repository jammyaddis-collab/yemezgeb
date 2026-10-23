// app.js — shared API + auth helpers for YeMezgeb frontend
var YM = {
  token: localStorage.getItem('ym_token') || null,
  user: JSON.parse(localStorage.getItem('ym_user') || 'null')
};
function ymPersist(){ localStorage.setItem('ym_token', YM.token || ''); localStorage.setItem('ym_user', JSON.stringify(YM.user || null)); }
async function ymApi(path, opts){
  opts = opts || {};
  var h = { 'Content-Type': 'application/json' };
  if (YM.token) h['Authorization'] = 'Bearer ' + YM.token;
  opts.headers = Object.assign(h, opts.headers || {});
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  var r = await fetch(path, opts);
  var d = await r.json().catch(function(){ return {}; });
  if (!r.ok) { if (r.status === 401 && YM.token) ymLogout(); throw new Error(d.error || ('HTTP ' + r.status)); }
  return d;
}
async function ymLogin(email, pass){
  var d = await ymApi('/api/auth/login', { method: 'POST', body: { email: email, password: pass } });
  YM.token = d.token; YM.user = d.user; ymPersist(); ymAuthUI(); return d.user;
}
async function ymRegister(payload){
  var d = await ymApi('/api/auth/register', { method: 'POST', body: payload });
  YM.token = d.token; YM.user = d.user; ymPersist(); ymAuthUI(); return d.user;
}
function ymLogout(){ YM.token = null; YM.user = null; ymPersist(); ymAuthUI(); }
function ymAuthUI(){
  var cta = document.querySelector('.nav-cta');
  if (!cta) return;
  if (YM.user) {
    cta.textContent = '👤 ' + YM.user.name;
    cta.href = '#';
    cta.onclick = function(e){ e.preventDefault(); if (confirm('Log out (' + YM.user.name + ')?')) ymLogout(); };
  } else {
    cta.textContent = 'Join Free'; cta.href = 'marketplace.html#join'; cta.onclick = null;
  }
}
document.addEventListener('DOMContentLoaded', ymAuthUI);
