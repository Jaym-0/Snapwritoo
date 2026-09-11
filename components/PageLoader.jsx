import Nav from "@/components/Nav";

export default function PageLoader({ label = "loading" }) {
  return (
    <>
      <Nav />
      <div className="page-loader" role="status" aria-live="polite">
        <span className="page-loader-ring" aria-hidden="true" />
        <span className="page-loader-text">{label}</span>
      </div>
    </>
  );
}
