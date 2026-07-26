"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ExternalLink, Send, Star, UserRound } from "lucide-react";
import {
  createLandingReview,
  fetchLandingReviews,
  fetchReviewSummary,
  type CreateReviewPayload,
  type LandingReview,
  type ReviewSummary,
} from "../reviews/reviews.api";

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  "https://www.google.com/search?q=Vertecx+Sistemas+PC+resenas";

const fallbackReviews: LandingReview[] = [
  {
    reviewid: 1,
    name: "Carlos Mendoza",
    role: "Gerente administrativo",
    company: "Operaciones empresariales",
    city: "Bogota",
    rating: 5,
    comment:
      "El equipo resolvio fallas criticas en nuestros equipos y dejo un plan preventivo claro. La atencion fue rapida y muy profesional.",
    source: "website",
    createdat: "2026-07-01T10:00:00.000Z",
  },
  {
    reviewid: 2,
    name: "Laura Rojas",
    role: "Coordinadora TI",
    company: "Servicios corporativos",
    city: "Medellin",
    rating: 5,
    comment:
      "Nos ayudaron con instalacion, redes y soporte. Cumplieron tiempos y explicaron cada ajuste sin vueltas tecnicas innecesarias.",
    source: "website",
    createdat: "2026-06-18T10:00:00.000Z",
  },
  {
    reviewid: 3,
    name: "Andres Felipe",
    role: "Propietario",
    company: "Comercio local",
    city: "Cali",
    rating: 4,
    comment:
      "Buen servicio de mantenimiento. Dejaron los equipos funcionando mejor y con recomendaciones utiles para evitar nuevas paradas.",
    source: "website",
    createdat: "2026-06-03T10:00:00.000Z",
  },
];

const initialForm: CreateReviewPayload = {
  name: "",
  role: "",
  company: "",
  city: "",
  email: "",
  rating: 5,
  comment: "",
};

function Stars({
  value,
  interactive = false,
  onChange,
}: {
  value: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        const className = `h-5 w-5 ${
          active ? "fill-red-600 text-red-600" : "text-gray-300"
        }`;

        if (!interactive) {
          return <Star key={star} className={className} aria-hidden="true" />;
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="p-1 text-gray-300 transition hover:scale-110 hover:text-red-600"
            aria-label={`Calificar con ${star} estrellas`}
          >
            <Star className={className} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function formatPersonInfo(review: LandingReview) {
  return [review.role, review.company, review.city].filter(Boolean).join(" - ");
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<LandingReview[]>(fallbackReviews);
  const [summary, setSummary] = useState<ReviewSummary>({
    count: fallbackReviews.length,
    average: 4.7,
  });
  const [form, setForm] = useState<CreateReviewPayload>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchLandingReviews(8), fetchReviewSummary()])
      .then(([reviewsResponse, summaryResponse]) => {
        if (!mounted) return;
        if (reviewsResponse.length) setReviews(reviewsResponse);
        if (summaryResponse?.count) setSummary(summaryResponse);
      })
      .catch(() => {
        if (mounted) setStatus("idle");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const calculatedSummary = useMemo(() => {
    if (summary.count > 0) return summary;

    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      count: reviews.length,
      average: Number((total / Math.max(reviews.length, 1)).toFixed(1)),
    };
  }, [reviews, summary]);

  const updateField = (field: keyof CreateReviewPayload, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    const payload: CreateReviewPayload = {
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
    };

    const role = form.role?.trim();
    const company = form.company?.trim();
    const city = form.city?.trim();
    const email = form.email?.trim();

    if (role) payload.role = role;
    if (company) payload.company = company;
    if (city) payload.city = city;
    if (email) payload.email = email;

    try {
      const savedReview = await createLandingReview(payload);
      setReviews((current) => [savedReview, ...current].slice(0, 8));
      setSummary((current) => {
        const nextCount = current.count + 1;
        const nextAverage =
          (current.average * current.count + savedReview.rating) / nextCount;

        return { count: nextCount, average: Number(nextAverage.toFixed(1)) };
      });
      setForm(initialForm);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-white px-6 py-24 text-black sm:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="opacity-0 animate-fadeInUp">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-[2px] w-10 origin-left bg-red-600 animate-growWidth"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600">
                Calificaciones
              </span>
            </div>
            <h2 className="text-5xl font-black leading-none tracking-tighter md:text-6xl">
              RESENAS DE <br />
              <span className="text-red-600">CLIENTES.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="border-l-4 border-red-600 bg-black px-8 py-6 text-white">
              <p className="text-5xl font-black leading-none">
                {calculatedSummary.average.toFixed(1)}
              </p>
              <Stars value={Math.round(calculatedSummary.average)} />
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-300">
                {calculatedSummary.count} resenas verificadas
              </p>
            </div>
            <p className="text-base leading-7 text-gray-500">
              Comentarios de clientes que han trabajado con Vertecx en soporte
              tecnico, mantenimiento, redes e instalacion. Al enviar tu opinion,
              quedara visible aqui y podras publicarla tambien en Google.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.78fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((review, index) => (
              <article
                key={review.reviewid}
                className="group border border-gray-100 bg-white p-7 shadow-sm transition hover:border-red-100 hover:bg-gray-50"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center bg-black text-white transition group-hover:bg-red-600">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-black">
                        {review.name}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {formatPersonInfo(review) || "Cliente Vertecx"}
                      </p>
                    </div>
                  </div>
                  <Stars value={review.rating} />
                </div>
                <p className="text-sm leading-7 text-gray-600">"{review.comment}"</p>
                <p className="mt-5 text-xs font-black uppercase tracking-widest text-red-600">
                  {review.source === "google" ? "Google" : "Web Vertecx"}
                </p>
              </article>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t-4 border-red-600 bg-black p-7 text-white shadow-2xl shadow-gray-200"
          >
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Deja tu resena
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Tus datos ayudan a que la resena tenga contexto en la landing.
            </p>

            <div className="mt-7 space-y-4">
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Nombre"
                className="w-full border border-white/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-red-600"
                maxLength={90}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  placeholder="Cargo"
                  className="w-full border border-white/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-red-600"
                  maxLength={120}
                />
                <input
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  placeholder="Empresa"
                  className="w-full border border-white/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-red-600"
                  maxLength={120}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Ciudad"
                  className="w-full border border-white/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-red-600"
                  maxLength={90}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Correo"
                  className="w-full border border-white/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-red-600"
                  maxLength={160}
                />
              </div>

              <div className="flex items-center justify-between gap-4 border border-white/10 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-gray-300">
                  Tu calificacion
                </span>
                <Stars
                  value={form.rating}
                  interactive
                  onChange={(value) => updateField("rating", value)}
                />
              </div>

              <textarea
                required
                value={form.comment}
                onChange={(event) => updateField("comment", event.target.value)}
                placeholder="Cuentanos como fue tu experiencia"
                className="min-h-32 w-full resize-none border border-white/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-red-600"
                maxLength={700}
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-black disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {status === "sending" ? "Enviando..." : "Publicar resena"}
            </button>

            {status === "sent" && (
              <div className="mt-5 border border-red-600/40 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Resena publicada en la web. Para que tambien aparezca en Google,
                  abre el perfil y pegala alli.
                </p>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-300 hover:text-white"
                >
                  Publicar en Google
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            )}

            {status === "error" && (
              <p className="mt-5 text-sm font-semibold text-red-200">
                No se pudo guardar la resena. Intentalo nuevamente en unos minutos.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
