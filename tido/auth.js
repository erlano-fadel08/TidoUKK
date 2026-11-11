function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('users')) || [];
  } catch (e) {
    return [];
  }
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function registerUser(nama, email, password) {
  email = email.trim().toLowerCase();
  const users = getUsers();

  if (users.some(u => u.email === email)) {
    return { ok: false, pesan: 'Email sudah terdaftar.' };
  }

  users.push({
    nama: nama.trim(),
    email: email,
    password: await hashPassword(password)
  });
  localStorage.setItem('users', JSON.stringify(users));
  return { ok: true };
}

async function loginUser(email, password) {
  email = email.trim().toLowerCase();
  const hash = await hashPassword(password);
  const user = getUsers().find(u => u.email === email && u.password === hash);

  if (!user) {
    return { ok: false, pesan: 'Email atau password salah.' };
  }

  localStorage.setItem('currentUser', JSON.stringify({ nama: user.nama, email: user.email }));
  return { ok: true };
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

function requireLogin() {
  if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
  }
}

// Tombol Menu di semua halaman (selain Dashboard) kembali ke Dashboard
document.addEventListener('DOMContentLoaded', function () {
  var halaman = location.pathname.split('/').pop();
  if (halaman === 'index.html' || halaman === '') return;

  var tombol = document.querySelector('header label[for="nt"]');
  if (!tombol) return;

  var link = document.createElement('a');
  link.href = 'index.html';
  link.className = tombol.className;
  link.style.textDecoration = 'none';
  link.textContent = tombol.textContent;
  tombol.replaceWith(link);
});