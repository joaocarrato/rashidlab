import type { Metadata } from "next";
import Link from "next/link";
import { getData } from "@/lib/data";
import { ROSTER, VTAGS } from "@/lib/constants";
import { deleteVideo, saveVideo, setVideoSeen } from "@/app/actions";
import FormModal, { type Field } from "@/components/FormModal";
import CyclePill from "@/components/CyclePill";

export const metadata: Metadata = { title: "Vídeos" };
export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { k: "url", l: "Link (https)", t: "url" },
  { k: "title", l: "Título" },
  { k: "tag", l: "Tipo", t: "select", o: VTAGS },
  { k: "char", l: "Matchup (opcional)", t: "select", o: ["", ...ROSTER] },
  { k: "ts", l: "Minuto que importa", ph: "Ex.: 3:42" },
  { k: "note", l: "O que tirar desse vídeo", t: "textarea" },
];

export default async function Videos({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const cur = tag && VTAGS.includes(tag) ? tag : "Todos";
  const { videos, main } = await getData(["videos"]);
  const list = videos.filter((v) => cur === "Todos" || v.tag === cur);
  return (
    <>
      <div className="sec-head">
        <h2>Vídeos</h2><span className="muted small">de {main}</span><span className="spacer" />
        <FormModal title="Salvar vídeo" trigger="Salvar vídeo" triggerClass="primary" fields={FIELDS}
          values={{ tag: "Aula" }} onSubmit={saveVideo.bind(null, null)} />
      </div>
      <div className="row" style={{ gap: 6, marginBottom: 18 }}>
        {["Todos", ...VTAGS].map((t) => (
          <Link key={t} className={`chip ${cur === t ? "on" : ""}`} href={`/videos?tag=${encodeURIComponent(t)}`}>{t}</Link>
        ))}
      </div>
      {list.length ? (
        <div className="grid">
          {list.map((v) => (
            <article className="panel" key={v.id}>
              <div className="row" style={{ gap: 8 }}>
                <span className="tag">{v.tag}</span>{v.char && <span className="tag">{v.char}</span>}
                <span className="spacer" />
                <CyclePill labels={["Não visto", "Visto"]} classes={["", "s2"]} value={v.seen ? 1 : 0}
                  onChange={setVideoSeen.bind(null, v.id)} />
              </div>
              <h3 style={{ marginTop: 8 }}>{v.title || v.url}</h3>
              {v.ts && <div className="small mono muted">no minuto {v.ts}</div>}
              {v.note && <div className="small" style={{ marginTop: 4 }}>{v.note}</div>}
              <div className="row" style={{ marginTop: 8 }}>
                <a href={v.url} target="_blank" rel="noopener noreferrer">Abrir vídeo</a><span className="spacer" />
                <FormModal title="Editar vídeo" trigger="Editar" triggerClass="ghost" fields={FIELDS} values={{ ...v }}
                  onSubmit={saveVideo.bind(null, v.id)} onDelete={deleteVideo.bind(null, v.id)} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          Cole o link de aulas, pro plays e seus replays. Anote o minuto exato e o que tirar dele; vídeo sem anotação não vira treino.
        </div>
      )}
    </>
  );
}
