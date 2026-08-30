import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <article className="article" style={{ textAlign: "center" }}>
        <h1>Page not found</h1>
        <p>The page you are looking for could not be found.</p>
        <Link className="btn" href="/">
          Back to home
        </Link>
      </article>
    </div>
  );
}
