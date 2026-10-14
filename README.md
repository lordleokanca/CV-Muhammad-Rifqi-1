# CV Web — Muhammad Rifqi

Next.js 16 + shadcn/ui + Tailwind CSS 4 + TypeScript.
Timeline gulir horizontal (GSAP) dan tombol **Download CV** yang membuat PDF langsung di browser, dalam Bahasa Inggris atau Indonesia.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev      # buka http://localhost:3000
```

Build produksi:

```bash
npm run build
npm start
```

## Mengubah isi CV

Semua teks ada di **`lib/cv-data.json`**, bagian `en` dan `id`.
Ubah file itu saja: halaman web **dan** PDF yang diunduh ikut berubah.

- Foto: ganti `public/photo.jpg` (rasio ± 345×491).
- Timeline: array `timeline` → `[id, "top"|"bottom", label tanggal, teks]`, urut kronologis. Selang-seling top/bottom agar rapi.
- Nomor HP hanya muncul di PDF, tidak tampil di halaman web.

## Struktur

```
app/
  layout.tsx          font + metadata
  page.tsx            render <CvPage />
  globals.css         token warna shadcn (terang & gelap)
components/
  ui/timeline.tsx     komponen Hyperiux, diadaptasi: data lewat props
  ui/button.tsx       shadcn Button
  cv/cv-page.tsx      halaman CV + pilihan bahasa
  cv/download-cv.tsx  tombol unduh (membuat PDF saat diklik)
  cv/cv-pdf.tsx       layout PDF A4 satu halaman (@react-pdf/renderer)
lib/
  cv-data.json        ISI CV
  cv.ts               tipe data + helper
  utils.ts            cn() dari shadcn
```

Kenapa `components/ui`? Itu folder default shadcn (lihat `components.json`).
Perintah `npx shadcn add <komponen>` akan menaruh komponen baru di sana, jadi timeline dan button disimpan di tempat yang sama.

## Deploy ke GitHub Pages (otomatis)

GitHub Pages tidak bisa menjalankan `npm run build` sendiri. Kalau repo hanya berisi kode, yang tampil cuma README ini.
Workflow `.github/workflows/deploy.yml` yang mengurus build dan publish:

1. Push semua file (termasuk folder `.github`) ke branch `main`.
2. Di repo: **Settings → Pages → Build and deployment → Source: GitHub Actions** (sekali saja).
3. Tunggu tab **Actions** selesai (± 2 menit). Situs ada di `https://<username>.github.io/<nama-repo>/`.

Setiap push berikutnya ke `main` otomatis mem-build ulang situsnya.

## Deploy gratis ke Vercel (alternatif)

1. Upload folder ini ke repository GitHub.
2. Buka vercel.com → **Add New Project** → pilih repository → **Deploy**. Tidak perlu pengaturan tambahan.
3. Hasilnya alamat seperti `cv-rifqi.vercel.app`, bisa diganti domain sendiri di menu **Domains**.
