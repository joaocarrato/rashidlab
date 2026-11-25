/** Aparece na hora ao trocar de aba, enquanto o servidor busca os dados. */
export default function Loading() {
  return (
    <div className="skel" role="status" aria-label="Carregando">
      <div className="sk sk-title" />
      <div className="grid">
        <div className="sk sk-card" />
        <div className="sk sk-card" />
        <div className="sk sk-card" />
      </div>
    </div>
  );
}
