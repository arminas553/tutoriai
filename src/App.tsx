import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Euro,
  GraduationCap,
  BookOpen,
  Users,
  Calendar as CalendarIcon,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
export function toKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}
export function generateMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const SUBJECTS = [
  "Matematika",
  "Fizika",
  "Chemija",
  "Biologija",
  "Anglų kalba",
  "Istorija",
  "Informatika",
  "Ekonomika",
  "Dailė",
  "Muzika",
];
const LEVELS = [
  "Pradinė",
  "Pagrindinė",
  "Vidurinė",
  "Universitetas",
  "Profesionalams",
];

const TUTORS = [
  {
    id: 1,
    name: "Amelia Brooks",
    rating: 4.9,
    reviews: 128,
    subject: "Matematika",
    levels: ["Vidurinė", "Universitetas"],
    price: 28,
    location: "Nuotoliu • Londonas, JK",
    bio: "Buvusi universiteto asistentė. Sudėtingą kalculusą paverčiu draugiškomis kreivėmis.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    availabilityDemo: {
      "2025-09-20": ["10:00", "11:00", "14:00"],
      "2025-09-22": ["09:00", "13:00", "18:00"],
    },
  },
];

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">
    {children}
  </span>
);
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-2xl bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
    {children}
  </span>
);

function NavBar({ onOpenSignup }: { onOpenSignup: () => void }) {
  return (
    <div className="w-full sticky top-0 z-40 border-b bg-white/70 dark:bg-gray-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">Tutoriai</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:underline underline-offset-4">
            Funkcijos
          </a>
          <a href="#tutors" className="hover:underline underline-offset-4">
            Korepetitoriai
          </a>
          <a href="#pricing" className="hover:underline underline-offset-4">
            Kainodara
          </a>
          <a href="#faq" className="hover:underline underline-offset-4">
            DUK
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm rounded-xl border">
            Prisijungti
          </button>
          <button
            onClick={onOpenSignup}
            className="px-3 py-1.5 text-sm rounded-xl bg-black text-white"
          >
            Registruotis
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Raskite tinkamą korepetitorių per kelias minutes
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl">
            Filtruokite pagal dalyką, lygį ir kainą. Rašykite korepetitoriams,
            rezervuokite pamokas ir mokykitės greičiau.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function SignupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  if (!open) return null;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    alert(`Registracija: ${name} • ${email}`);
    onClose();
  }
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal
        role="dialog"
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div className="relative z-10 w-full md:max-w-md bg-white dark:bg-gray-950 rounded-t-3xl md:rounded-3xl border p-6">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-2 rounded-xl border"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-lg font-semibold mb-4">Sukurti paskyrą</h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm">Vardas</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm">El. paštas</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm">Slaptažodis</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-black text-white px-3 py-2 text-sm"
            >
              Registruotis
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [showSignup, setShowSignup] = useState(false);
  return (
    <div>
      <NavBar onOpenSignup={() => setShowSignup(true)} />
      <Hero />
      <SignupDialog open={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
}
