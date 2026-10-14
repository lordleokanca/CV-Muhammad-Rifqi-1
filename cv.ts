import raw from "./cv-data.json";

/**
 * Semua isi CV ada di `lib/cv-data.json` (bahasa Inggris dan Indonesia).
 * Ubah file itu saja: halaman web dan PDF yang diunduh ikut berubah.
 */

export type Lang = "en" | "id";

export type TimelineItem = {
  id: string;
  position: "top" | "bottom";
  label: string;
  content: string;
};

type Labels = {
  location: string; phone: string; email: string; copy: string; copied: string;
  download: string; downloadNote: string; downloadFail: string;
  timelineTitle: string; details: string; detailsSub: string;
  skills: string; skillsNote: string; education: string; experience: string; project: string;
  courses: string; org: string; languages: string; interests: string; gpa: string; summaryH: string; certs: string;
};

export type CvLang = {
  eyebrow: string;
  role: string;
  status: string;
  focus: string[];
  summary: string;
  labels: Labels;
  skills: [string, string][];
  education: { school: string; when: string; degree: string; gpa: string; grad: string };
  experience: { company: string; when: string; role: string; bullets: string[] };
  project: { title: string; when: string; orig: string; note: string };
  courses: [string, string, string][];
  org: { name: string; role: string; when: string };
  langs: string;
  interests: string;
  timeline: [string, string, string, string][];
  pdfName: string;
};

export type Cv = {
  common: { name: string; email: string; phone: string; location: string };
  en: CvLang;
  id: CvLang;
};

export const cv = raw as unknown as Cv;

export function timelineItems(lang: Lang): TimelineItem[] {
  return cv[lang].timeline.map(([id, position, label, content]) => ({
    id,
    position: position as TimelineItem["position"],
    label,
    content,
  }));
}
