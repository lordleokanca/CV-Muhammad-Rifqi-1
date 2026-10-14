import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { cv, type Lang } from "@/lib/cv";

// One-page, single-column A4 layout: real selectable text so ATS systems can read it.
const ACCENT = "#A3123A";
const MUTED = "#5E5359";
const LINE = "#E2DCE0";
const INK = "#1B1418";

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 28, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 9, lineHeight: 1.35, color: INK },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.15, letterSpacing: 0.5 },
  role: { fontFamily: "Helvetica-Bold", fontSize: 12, lineHeight: 1.3, color: ACCENT, marginTop: 4 },
  muted: { color: MUTED },
  photo: { width: 66, height: 94, objectFit: "cover" },
  h: { fontFamily: "Helvetica-Bold", fontSize: 10, color: ACCENT, marginTop: 10, paddingBottom: 3, marginBottom: 4, borderBottomWidth: 0.6, borderBottomColor: LINE },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Helvetica-Bold" },
  when: { color: MUTED, marginLeft: 12 },
  bullet: { flexDirection: "row", marginTop: 1 },
  dot: { width: 10 },
  skillRow: { flexDirection: "row", marginBottom: 1.5 },
  skillKey: { width: 84, fontFamily: "Helvetica-Bold" },
});

export function CvDocument({ lang, photoSrc }: { lang: Lang; photoSrc: string }) {
  const L = cv[lang];
  const lb = L.labels;
  const c = cv.common;
  const H = ({ children }: { children: string }) => <Text style={s.h}>{children.toUpperCase()}</Text>;

  return (
    <Document title={`CV ${c.name}`} author={c.name} subject={L.role} language={lang}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={s.name}>{c.name.toUpperCase()}</Text>
            <Text style={s.role}>{L.role}</Text>
            <Text style={s.muted}>{L.status}</Text>
            <Text style={{ marginTop: 6 }}>{c.location}</Text>
            <Text>{c.phone} · {c.email}</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={photoSrc} style={s.photo} />
        </View>

        <H>{lb.summaryH}</H>
        <Text>{L.summary}</Text>

        <H>{lb.experience}</H>
        <View wrap={false}>
          <View style={s.row}>
            <Text style={s.bold}>{L.experience.company}</Text>
            <Text style={s.when}>{L.experience.when}</Text>
          </View>
          <Text style={s.muted}>{L.experience.role}</Text>
          {L.experience.bullets.map((b) => (
            <View key={b} style={s.bullet}>
              <Text style={s.dot}>•</Text>
              <Text style={{ flex: 1 }}>{b}</Text>
            </View>
          ))}
        </View>

        <H>{lb.project}</H>
        <View wrap={false}>
          <View style={s.row}>
            <Text style={[s.bold, { flex: 1 }]}>{L.project.title}</Text>
            <Text style={s.when}>{L.project.when}</Text>
          </View>
          {L.project.orig ? <Text style={s.muted}>{L.project.orig}</Text> : null}
          <Text style={s.muted}>{L.project.note}</Text>
        </View>

        <H>{lb.education}</H>
        <View style={s.row}>
          <Text style={s.bold}>{L.education.school}</Text>
          <Text style={s.when}>{L.education.when}</Text>
        </View>
        <Text>{L.education.degree}</Text>
        <Text style={s.muted}>{lb.gpa}: {L.education.gpa} · {L.education.grad}</Text>

        <H>{lb.skills}</H>
        <Text style={[s.muted, { marginBottom: 3 }]}>{lb.skillsNote}</Text>
        {L.skills.map(([k, v]) => (
          <View key={k} style={s.skillRow}>
            <Text style={s.skillKey}>{k}</Text>
            <Text style={{ flex: 1 }}>{v}</Text>
          </View>
        ))}

        <H>{lb.courses}</H>
        {L.courses.map(([title, org, date]) => (
          <View key={title} style={s.row}>
            <Text style={{ flex: 1 }}>
              <Text style={s.bold}>{title}</Text>
              <Text style={s.muted}> — {org}</Text>
            </Text>
            <Text style={s.when}>{date}</Text>
          </View>
        ))}

        <H>{lb.org}</H>
        <View style={s.row}>
          <Text>
            <Text style={s.bold}>{L.org.name}</Text>
            <Text style={s.muted}> — {L.org.role}</Text>
          </Text>
          <Text style={s.when}>{L.org.when}</Text>
        </View>
        <Text style={{ marginTop: 3 }}>
          <Text style={s.bold}>{lb.languages}: </Text>
          {L.langs}
        </Text>
        <Text>
          <Text style={s.bold}>{lb.interests}: </Text>
          {L.interests}
        </Text>
      </Page>
    </Document>
  );
}
