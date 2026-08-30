import { notFound } from "next/navigation";
import { getPageBySlug, rewriteContentImages } from "@/lib/wp";

function stripSrcset(html: string): string {
  return html.replace(/\ssrcset="[^"]*"/g, "");
}

export default async function StaticPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  const safeContent = stripSrcset(rewriteContentImages(page.content.rendered));

  return (
    <div className="container">
      <article className="article">
        <h1>{page.title.rendered}</h1>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </article>
    </div>
  );
}
