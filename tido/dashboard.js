
/* =========================================
   STUDY PLANNER - DASHBOARD JAVASCRIPT
========================================= */

const KEY_TASKS = 'studyPlannerTasks';

const HARI_SINGKAT = [
    'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'
];


/* =========================================
   1. MENGAMBIL DAN MENYIMPAN DATA
========================================= */

function ambilDataTugas() {
    try {
        const data = JSON.parse(localStorage.getItem(KEY_TASKS));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Gagal mengambil data tugas:', error);
        return [];
    }
}

function simpanDataTugas(data) {
    localStorage.setItem(KEY_TASKS, JSON.stringify(data));
}


/* =========================================
   2. FUNGSI BANTUAN
========================================= */

function amanDashboard(teks) {
    return String(teks ?? '').replace(/[&<>"']/g, k => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[k]);
}

function formatTanggal(tanggal) {
    if (!tanggal) return '-';

    const date = new Date(tanggal + 'T00:00:00');

    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function tanggalLokal(date) {
    const tahun = date.getFullYear();
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const hari = String(date.getDate()).padStart(2, '0');

    return `${tahun}-${bulan}-${hari}`;
}

function selisihHari(tanggal, hariIni) {
    if (!tanggal) return null;

    const date = new Date(tanggal + 'T00:00:00');

    if (isNaN(date.getTime())) return null;

    return Math.round(
        (date.getTime() - hariIni.getTime()) / 86400000
    );
}


/* =========================================
   3. SAPAAN DAN TANGGAL
========================================= */

function tampilkanTambahan(tasks) {
    const sekarang = new Date();

    let nama = '';

    try {
        const user = JSON.parse(
            localStorage.getItem('currentUser')
        );

        nama = user && user.nama ? user.nama : '';

    } catch (error) {
        console.error('Gagal membaca data pengguna:', error);
    }

    const jam = sekarang.getHours();

    const sapaan =
        jam < 11 ? 'Selamat pagi' :
        jam < 15 ? 'Selamat siang' :
        jam < 18 ? 'Selamat sore' :
        'Selamat malam';

    // Sapaan pengguna
    const salam = document.getElementById('salam');

    if (salam) {
        salam.textContent =
            sapaan + (nama ? ', ' + nama : '') + '!';
    }

    // Tanggal pada header
    const tgl = document.getElementById('tanggalHariIni');

    if (tgl) {
        tgl.textContent = sekarang.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Tanggal pada welcome section
    const tanggalWelcome =
        document.getElementById('tanggalWelcome');

    if (tanggalWelcome) {
        tanggalWelcome.textContent =
            'Hari ini, ' +
            sekarang.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) +
            ' · Yuk, tetap produktif!';
    }


    /* =====================================
       4. NOTIFIKASI DEADLINE
    ===================================== */

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const aktif = tasks.filter(t =>
        t &&
        t.status !== 'Completed' &&
        t.deadline
    );

    const terlambat = [];
    const segera = [];

    aktif.forEach(t => {
        const selisih = selisihHari(t.deadline, hariIni);

        if (selisih === null) return;

        if (selisih < 0) {
            terlambat.push(t);
        } else if (selisih <= 3) {
            segera.push(t);
        }
    });

    // Urutkan berdasarkan deadline
    terlambat.sort((a, b) =>
        a.deadline.localeCompare(b.deadline)
    );

    segera.sort((a, b) =>
        a.deadline.localeCompare(b.deadline)
    );

    // Badge notifikasi
    const badge = document.getElementById('badge');

    if (badge) {
        const jumlahNotif = terlambat.length + segera.length;
        badge.textContent = jumlahNotif;
    }

    // Isi notifikasi
    const notifIsi = document.getElementById('notifIsi');

    if (notifIsi) {
        let html = '';

        terlambat.forEach(t => {
            html += `
                <p class="late">
                    Terlambat: ${amanDashboard(t.nama)}
                    <br>
                    <small>Deadline: ${formatTanggal(t.deadline)}</small>
                </p>
            `;
        });

        segera.forEach(t => {
            html += `
                <p>
                    Segera deadline: ${amanDashboard(t.nama)}
                    <br>
                    <small>Deadline: ${formatTanggal(t.deadline)}</small>
                </p>
            `;
        });

        notifIsi.innerHTML = html ||
            '<p>Tidak ada notifikasi. Semua aman!</p>';
    }


    /* =====================================
       5. GRAFIK DEADLINE 7 HARI KE DEPAN
    ===================================== */

    const grafik = document.getElementById('grafikDashboard');

    if (grafik) {
        let html = '';

        for (let i = 0; i < 7; i++) {
            const hari = new Date(hariIni);

            hari.setDate(hariIni.getDate() + i);

            const kunci = tanggalLokal(hari);

            const jumlah = aktif.filter(t =>
                t.deadline === kunci
            ).length;

            const tinggi = jumlah === 0
                ? 3
                : Math.min(jumlah * 28, 110);

            const namaHari = i === 0
                ? 'Hari ini'
                : HARI_SINGKAT[hari.getDay()];

            html += `
                <div>
                    ${jumlah}
                    <i style="height:${tinggi}px"></i>
                    ${namaHari}
                </div>
            `;
        }

        grafik.innerHTML = html;
    }
}


/* =========================================
   6. MENAMPILKAN DASHBOARD
========================================= */

function tampilkanDashboard() {
    const tasks = ambilDataTugas();

    const daftar = document.getElementById(
        'dashboardTaskList'
    );

    if (!daftar) return;

    tampilkanTambahan(tasks);


    /* =====================================
       STATISTIK TUGAS
    ===================================== */

    const total = tasks.length;

    const todo = tasks.filter(t =>
        t.status === 'To Do'
    ).length;

    const progress = tasks.filter(t =>
        t.status === 'In Progress'
    ).length;

    const selesai = tasks.filter(t =>
        t.status === 'Completed'
    ).length;

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const deadline = tasks.filter(t => {
        if (
            !t.deadline ||
            t.status === 'Completed'
        ) {
            return false;
        }

        const selisih = selisihHari(
            t.deadline,
            hariIni
        );

        return selisih !== null &&
            selisih >= 0 &&
            selisih <= 3;
    }).length;


    // Memperbarui angka statistik
    const statistik = {
        totalTugas: total,
        todoTugas: todo,
        progressTugas: progress,
        selesaiTugas: selesai,
        deadlineTugasDashboard: deadline
    };

    Object.entries(statistik).forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);

        if (elemen) {
            elemen.textContent = nilai;
        }
    });


    /* =====================================
       PRODUKTIVITAS
    ===================================== */

    const produktivitas = total === 0
        ? 0
        : Math.round((selesai / total) * 100);

    const label = document.getElementById(
        'labelProduktivitas'
    );

    const bar = document.getElementById(
        'barProduktivitas'
    );

    if (label) {
        label.textContent =
            `Produktivitas ${produktivitas}%`;
    }

    if (bar) {
        bar.style.width = produktivitas + '%';
    }


    /* =====================================
       DAFTAR TUGAS AKTIF
    ===================================== */

    const tugasAktif = tasks
        .map((t, index) => ({
            ...t,
            index
        }))
        .filter(t =>
            t.status !== 'Completed'
        )
        .sort((a, b) => {
            // Tugas tanpa deadline diletakkan terakhir
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;

            return a.deadline.localeCompare(b.deadline);
        })
        .slice(0, 3);


    // Jika tidak ada tugas aktif
    if (tugasAktif.length === 0) {
        daftar.innerHTML = `
            <div style="text-align:center; padding:25px 10px;">
                <h3>Semua tugas selesai!</h3>
                <p class="mut">
                    Tidak ada tugas yang perlu diselesaikan.
                    Pertahankan produktivitasmu!
                </p>
                <a href="tasks.html" class="btn ghost">
                    Lihat daftar tugas
                </a>
            </div>
        `;

        return;
    }


    // Menampilkan daftar tugas
    daftar.innerHTML = tugasAktif.map(t => `
        <div class="item">

            <div>
                <input
                    type="checkbox"
                    style="width:auto"
                    data-dashboard-action="selesai"
                    data-index="${t.index}"
                    aria-label="Tandai tugas selesai"
                >

                <b class="t">
                    ${amanDashboard(t.nama)}
                </b>

                <span class="tag ${amanDashboard(t.prioritas)}">
                    ${amanDashboard(t.prioritas || '-')}
                </span>

                <span class="tag">
                    ${amanDashboard(t.kategori || 'Lainnya')}
                </span>

                <br>

                <small>
                    ${formatTanggal(t.deadline)}
                    ${t.jam ? ' · ' + amanDashboard(t.jam) : ''}
                    · ${amanDashboard(t.status)}
                </small>

            </div>

            <div>

                <button
                    class="btn sm ghost"
                    data-dashboard-action="detail"
                    data-index="${t.index}">
                    Detail
                </button>

                <button
                    class="btn sm ghost"
                    data-dashboard-action="edit"
                    data-index="${t.index}">
                    Edit
                </button>

                <button
                    class="btn sm del"
                    data-dashboard-action="hapus"
                    data-index="${t.index}">
                    Hapus
                </button>

            </div>

        </div>
    `).join('');
}


/* =========================================
   7. AKSI TOMBOL DETAIL, EDIT, HAPUS
========================================= */

document.addEventListener('click', function(e) {
    const tombol = e.target.closest(
        '[data-dashboard-action]'
    );

    if (!tombol) return;

    const index = Number(tombol.dataset.index);
    const aksi = tombol.dataset.dashboardAction;

    const tasks = ambilDataTugas();
    const tugas = tasks[index];

    if (!tugas) return;


    // DETAIL
    if (aksi === 'detail') {
        alert(
            'DETAIL TUGAS\n\n' +
            'Nama: ' + tugas.nama +
            '\nDeskripsi: ' + (tugas.deskripsi || '-') +
            '\nKategori: ' + (tugas.kategori || '-') +
            '\nDeadline: ' + formatTanggal(tugas.deadline) +
            '\nJam: ' + (tugas.jam || '-') +
            '\nPrioritas: ' + (tugas.prioritas || '-') +
            '\nStatus: ' + (tugas.status || '-')
        );
    }


    // EDIT
    else if (aksi === 'edit') {
        window.location.href =
            'tasks.html?edit=' + index;
    }


    // HAPUS
    else if (aksi === 'hapus') {
        const konfirmasi = confirm(
            'Yakin ingin menghapus "' +
            tugas.nama +
            '"?'
        );

        if (konfirmasi) {
            tasks.splice(index, 1);

            simpanDataTugas(tasks);

            tampilkanDashboard();
        }
    }
});


/* =========================================
   8. CHECKBOX SELESAI
========================================= */

document.addEventListener('change', function(e) {
    if (
        !e.target.matches(
            '[data-dashboard-action="selesai"]'
        )
    ) {
        return;
    }

    const index = Number(e.target.dataset.index);

    const tasks = ambilDataTugas();

    if (!tasks[index]) return;

    tasks[index].status = e.target.checked
        ? 'Completed'
        : 'To Do';

    simpanDataTugas(tasks);

    tampilkanDashboard();
});


/* =========================================
   9. SINKRONISASI DATA
========================================= */

// Memperbarui dashboard saat data berubah
window.addEventListener('storage', function(e) {
    if (e.key === KEY_TASKS) {
        tampilkanDashboard();
    }
});

// Memperbarui saat kembali ke halaman dashboard
window.addEventListener('pageshow', function() {
    tampilkanDashboard();
});


/* =========================================
   10. INISIALISASI
========================================= */

if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        tampilkanDashboard
    );
} else {
    tampilkanDashboard();
}
