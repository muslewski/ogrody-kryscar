// src/components/ProjectCard.tsx
import Link from "next/link";
import { BlurImage } from "@/components/BlurImage";
import { CATEGORY_LABELS, type Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  const cover = project.pairs[0]?.after;
  return (
    <Link
      href={`/realizacje/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-colors hover:border-emerald-700"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {cover && (
          <BlurImage
            src={cover}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur">
          {CATEGORY_LABELS[project.category] ?? "Realizacja"}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Przed / Po
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-emerald-700">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{project.excerpt}</p>
        <span className="mt-4 text-xs uppercase tracking-wider text-neutral-500">
          {project.location} · {project.year}
        </span>
      </div>
    </Link>
  );
}
