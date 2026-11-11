// ==========================================
// STUDY PLANNER - TASK MANAGEMENT
// ==========================================


// 1. PENYIMPANAN DATA
const KEY_TASKS = 'studyPlannerTasks';

const tugasAwal = [
    {
        nama: 'Laporan Praktikum Kimia',
        deskripsi: 'Susun laporan hasil praktikum titrasi asam-basa beserta analisis data.',
        kategori: 'Tugas Sekolah',
        deadline: '2026-11-08',
        jam: '19:00',
        prioritas: 'High',
        status: 'In Progress'
    },
    {
        nama: 'Latihan Soal Matematika Bab 5',
        deskripsi: 'Mengerjakan latihan soal matematika bab 5.',
        kategori: 'Belajar Mandiri',
        deadline: '2026-11-11',
        jam: '16:00',
        prioritas: 'Medium',
        status: 'To Do'
    },
    {
        nama: 'Presentasi Project Akhir',
        deskripsi: 'Mempersiapkan presentasi project akhir.',
        kategori: 'Project',
        deadline: '2026-11-13',
        jam: '10:00',
        prioritas: 'High',
        status: 'In Progress'
    },
    {
        nama: 'Belajar untuk Ujian Fisika',
        deskripsi: 'Belajar materi untuk persiapan ujian fisika.',
        kategori: 'Ujian dan Persiapan',
        deadline: '2026-11-17',
        jam: '20:00',
        prioritas: 'High',
        status: 'To Do'
    },
    {
        nama: 'Rangkum Materi Sejarah',
        deskripsi: 'Membuat rangkuman materi sejarah.',
        kategori: 'Tugas Sekolah',
        deadline: '2026-11-05',
        jam: '',
        prioritas: 'Low',
        status: 'Completed'
    }
];


// Mengambil data dari localStorage
function ambilTasks() {
    try {
        const data = localStorage.getItem(KEY_TASKS);

        if (data === null) {
            return [...tugasAwal];
        }

        const hasil = JSON.parse(data);

        return Array.isArray(hasil) ? hasil : [...tugasAwal];

    } catch (error) {
        console.error('Gagal membaca data tugas:', error);
        return [...tugasAwal];
    }
}

let tasks = ambilTasks();

if (localStorage.getItem(KEY_TASKS) === null) {
    simpanTasks();
}


// 2. MENYIMPAN DATA
function simpanTasks() {
    localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
}


// 3. MENGAMANKAN TEKS HTML
function aman(teks) {
    return String(teks ?? '').replace(/[&<>"']/g, karakter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[karakter]);
}


// 4. MENAMPILKAN DAFTAR TUGAS
function renderTasks() {
    const daftar = document.getElementById('taskList');

    if (!daftar) return;

    if (tasks.length === 0) {
        daftar.innerHTML = `
            <div style="text-align:center; padding:30px">
                <h3>Belum ada tugas</h3>
                <p>Tambahkan tugas pertamamu!</p>
            </div>
        `;
        return;
    }

    daftar.innerHTML = tasks.map((t, i) => `
        <div class="item ${t.status === 'Completed' ? 'done' : ''}">

            <div>
                <input
                    type="checkbox"
                    data-action="selesai"
                    data-index="${i}"
                    ${t.status === 'Completed' ? 'checked' : ''}
                    style="width:auto"
                >

                <b class="t">${aman(t.nama)}</b>

                <span class="tag ${aman(t.prioritas)}">
                    ${aman(t.prioritas)}
                </span>

                <span class="tag">
                    ${aman(t.kategori)}
                </span>

                <br>

                <small>
                    ${aman(t.deadline)}
                    ${t.jam ? ' · ' + aman(t.jam) : ''}
                    · ${aman(t.status)}
                </small>
            </div>

            <div>
                <button
                    class="btn sm ghost"
                    data-action="detail"
                    data-index="${i}">
                    Detail
                </button>

                <button
                    class="btn sm ghost"
                    data-action="edit"
                    data-index="${i}">
                    Edit
                </button>

                <button
                    class="btn sm del"
                    data-action="hapus"
                    data-index="${i}">
                    Hapus
                </button>
            </div>

        </div>
    `).join('');
}


// 5. MEMBUKA FORM TAMBAH DAN EDIT
function bukaForm(index = -1) {
    const form = document.getElementById('taskForm');
    const modal = document.getElementById('form');

    if (!form || !modal) return;

    form.reset();

    document.getElementById('taskIndex').value = index;

    if (index >= 0) {
        const t = tasks[index];

        if (!t) return;

        document.getElementById('namaTugas').value = t.nama || '';
        document.getElementById('deskripsiTugas').value = t.deskripsi || '';
        document.getElementById('kategoriTugas').value = t.kategori || '';
        document.getElementById('deadlineTugas').value = t.deadline || '';
        document.getElementById('jamTugas').value = t.jam || '';
        document.getElementById('prioritasTugas').value = t.prioritas || '';
        document.getElementById('statusTugas').value = t.status || 'To Do';
    }

    modal.style.display = 'flex';
}


// 6. MENUTUP FORM
function tutupForm() {
    const modal = document.getElementById('form');

    if (modal) {
        modal.style.display = 'none';
    }
}


// 7. MENYIMPAN FORM
function simpanForm(e) {
    e.preventDefault();

    const index = Number(document.getElementById('taskIndex').value);

    const data = {
        nama: document.getElementById('namaTugas').value.trim(),
        deskripsi: document.getElementById('deskripsiTugas').value.trim(),
        kategori: document.getElementById('kategoriTugas').value,
        deadline: document.getElementById('deadlineTugas').value,
        jam: document.getElementById('jamTugas').value,
        prioritas: document.getElementById('prioritasTugas').value,
        status: document.getElementById('statusTugas').value
    };

    if (!data.nama) {
        alert('Nama tugas wajib diisi!');
        return;
    }

    if (index >= 0 && index < tasks.length) {
        tasks[index] = data;
        alert('Tugas berhasil diperbarui!');
    } else {
        tasks.push(data);
        alert('Tugas berhasil ditambahkan!');
    }

    simpanTasks();
    renderTasks();
    tutupForm();
}


// 8. MENAMPILKAN DETAIL TUGAS
function bukaDetail(index) {
    const t = tasks[index];
    const isi = document.getElementById('detailIsi');
    const modal = document.getElementById('detail');

    if (!t || !isi || !modal) return;

    isi.innerHTML = `
        <h3>${aman(t.nama)}</h3>

        <p>${aman(t.deskripsi || 'Tidak ada deskripsi.')}</p>

        <p><b>Kategori:</b> ${aman(t.kategori)}</p>

        <p><b>Deadline:</b> ${aman(t.deadline || '-')}</p>

        <p><b>Jam:</b> ${aman(t.jam || '-')}</p>

        <p><b>Prioritas:</b> ${aman(t.prioritas)}</p>

        <p><b>Status:</b> ${aman(t.status)}</p>
    `;

    modal.style.display = 'flex';
}


// 9. MENUTUP DETAIL
function tutupDetail() {
    const modal = document.getElementById('detail');

    if (modal) {
        modal.style.display = 'none';
    }
}


// 10. MENGHAPUS TUGAS
function hapusTask(index) {
    if (index < 0 || index >= tasks.length) return;

    const yakin = confirm(
        `Apakah kamu yakin ingin menghapus tugas "${tasks[index].nama}"?`
    );

    if (!yakin) return;

    tasks.splice(index, 1);

    simpanTasks();
    renderTasks();

    alert('Tugas berhasil dihapus!');
}


// 11. EVENT TOMBOL DETAIL, EDIT, HAPUS
document.addEventListener('click', function(e) {
    const tombol = e.target.closest('[data-action]');

    if (!tombol) return;

    const index = Number(tombol.dataset.index);
    const aksi = tombol.dataset.action;

    if (!Number.isInteger(index)) return;

    if (aksi === 'detail') {
        bukaDetail(index);
    }

    if (aksi === 'edit') {
        bukaForm(index);
    }

    if (aksi === 'hapus') {
        hapusTask(index);
    }
});


// 12. CHECKLIST TUGAS
document.addEventListener('change', function(e) {
    if (e.target.dataset.action !== 'selesai') return;

    const index = Number(e.target.dataset.index);

    if (!Number.isInteger(index) || !tasks[index]) return;

    tasks[index].status = e.target.checked
        ? 'Completed'
        : 'To Do';

    simpanTasks();
    renderTasks();
});


// 13. MENUTUP MODAL JIKA KLIK AREA LUAR
document.addEventListener('click', function(e) {
    if (e.target.id === 'form') {
        tutupForm();
    }

    if (e.target.id === 'detail') {
        tutupDetail();
    }
});


// 14. SINKRONISASI DATA ANTAR TAB
window.addEventListener('storage', function(e) {
    if (e.key !== KEY_TASKS) return;

    tasks = ambilTasks();
    renderTasks();
});


// 15. MEMBUKA FORM EDIT DARI DASHBOARD
function cekEditDariDashboard() {
    const parameter = new URLSearchParams(window.location.search);
    const index = parameter.get('edit');

    if (index === null) return;

    const nomor = Number(index);

    if (
        Number.isInteger(nomor) &&
        nomor >= 0 &&
        nomor < tasks.length
    ) {
        bukaForm(nomor);
    }
}


// 16. MENJALANKAN PROGRAM
function jalankanTasks() {
    renderTasks();
    cekEditDariDashboard();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', jalankanTasks);
} else {
    jalankanTasks();
}