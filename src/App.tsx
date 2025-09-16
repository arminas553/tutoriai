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

// ---------------- helpers ----------------
function pad2(n: number) { return String(n).padStart(2, "0"); }
function toKey(date: Date) { return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`; }
function generateMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // 0=Mon
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells: (Date|null)[] = [];
  for(let i=0;i<startDay;i++) cells.push(null);
  for(let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d));
  while(cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ------------- demo data -------------
const SUBJECTS = ["Matematika","Fizika","Chemija","Biologija","Anglų kalba","Istorija","Informatika","Ekonomika","Dailė","Muzika"];
const LEVELS = ["Pradinė","Pagrindinė","Vidurinė","Universitetas","Profesionalams"];

const TUTORS = [
  { id:1, name:"Amelia Brooks", rating:4.9, reviews:128, subject:"Matematika", levels:["Vidurinė","Universitetas"], price:28, location:"Nuotoliu • Londonas, JK", bio:"Buvusi universiteto asistentė. Sudėtingą kalculusą paverčiu draugiškomis kreivėmis.", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop", availabilityDemo:{"2025-09-20":["10:00","11:00","14:00"],"2025-09-22":["09:00","13:00","18:00"]}},
  { id:2, name:"Leo Chen", rating:4.8, reviews:76, subject:"Fizika", levels:["Vidurinė","Universitetas"], price:32, location:"Nuotoliu • Vankuveris, Kanada", bio:"Astrofizikos gerbėjas – daug praktinių pavyzdžių ir mąstymo eksperimentų.", avatar:"https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?q=80&w=400&auto=format&fit=crop", availabilityDemo:{"2025-09-21":["12:00","15:00"],"2025-09-23":["09:00","10:00","16:00"]}},
  { id:3, name:"Sara Ibrahim", rating:5.0, reviews:201, subject:"Anglų kalba", levels:["Pagrindinė","Vidurinė","Universitetas"], price:22, location:"Nuotoliu • Dubajus, JAE", bio:"Esė struktūra, aiškumas ir stilius – padedu parašyti įtikinamai.", avatar:"https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop", availabilityDemo:{"2025-09-19":["11:00","17:00"],"2025-09-22":["10:00","19:00"]}},
  { id:4, name:"Marco Rossi", rating:4.7, reviews:54, subject:"Informatika", levels:["Vidurinė","Universitetas","Profesionalams"], price:40, location:"Nuotoliu • Milanas, IT", bio:"Full-stack mentorystė. Algoritmai, projektai ir kodo peržiūros.", avatar:"https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400&auto=format&fit=crop", availabilityDemo:{"2025-09-18":["09:00","14:00","20:00"]}},
];

// ------------- simple UI atoms -------------
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">{children}</span>
);
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-2xl bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">{children}</span>
);
const Section = ({ id, title, subtitle, children }:{ id?: string, title: string, subtitle?: string, children: React.ReactNode }) => (
  <section id={id} className="py-12 md:py-16">
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (<p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>)}
        </div>
        {id === "tutors" && (<a href="#tutors" className="text-sm underline underline-offset-4">Peržiūrėti visus</a>)}
      </div>
      {children}
    </div>
  </section>
);

// ---------------- registration storage (demo/localStorage) ----------------
type Role = "student" | "teacher";
type User = { name: string; email: string; role: Role };
const USERS_KEY = "tutoriai.users";
const CURRENT_KEY = "tutoriai.currentUser";

function saveUser(u: User){
  const arr: User[] = JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
  arr.push(u);
  localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
}
function loadCurrentUser(): User | null {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); } catch { return null; }
}

// ---------------- nav ----------------
function NavBar({ onOpenSignup, current }: { onOpenSignup: () => void, current: User | null }){
  return (
    <div className="w-full sticky top-0 z-40 border-b bg-white/70 dark:bg-gray-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center"><GraduationCap className="h-5 w-5"/></div>
          <span className="font-semibold tracking-tight">Tutoriai</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:underline underline-offset-4">Funkcijos</a>
          <a href="#tutors" className="hover:underline underline-offset-4">Korepetitoriai</a>
          <a href="#pricing" className="hover:underline underline-offset-4">Kainodara</a>
          <a href="#faq" className="hover:underline underline-offset-4">DUK</a>
        </div>
        <div className="flex items-center gap-2">
          {current ? (
            <span className="text-xs md:text-sm px-3 py-1.5 rounded-xl border">
              Sveiki, {current.name} ({current.role === "teacher" ? "Korepetitorius" : "Mokinys"})
            </span>
          ) : (
            <button className="px-3 py-1.5 text-sm rounded-xl border">Prisijungti</button>
          )}
          <button onClick={onOpenSignup} className="px-3 py-1.5 text-sm rounded-xl bg-black text-white">Registruotis</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- hero (promo strip removed) ----------------
function Hero({ onSearch }:{ onSearch:(v:any)=>void }){
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");

  function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    onSearch({ query, subject, level });
  }

  return (
    <div className="relative overflow-hidden">
      {/* a bit more breathing room so the hero fills the screen */}
      <div className="absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(60%_60%_at_50%_20%,black,transparent)]">
        <div className="absolute -top-36 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-black via-gray-800 to-gray-400 blur-3xl opacity-20"/>
        <div className="absolute -bottom-36 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-gray-900 via-gray-700 to-gray-400 blur-3xl opacity-10"/>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24 md:py-36">
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Raskite tinkamą korepetitorių per kelias minutes
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Filtruokite pagal dalyką, lygį ir kainą. Rašykite korepetitoriams, rezervuokite pamokas ir mokykitės greičiau.
          </p>
        </motion.div>

        {/* BIG search bar */}
        <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Query input – wider & taller */}
          <div className="md:col-span-6">
            <div className="flex items-center gap-3 rounded-3xl border-2 px-5 h-16">
              <Search className="h-5 w-5"/>
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-base md:text-lg"
                placeholder="Paieška (pvz., algebra, IELTS, Python)…"
              />
            </div>
          </div>

          {/* Subject select – bigger */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 rounded-3xl border-2 px-5 h-16">
              <BookOpen className="h-5 w-5"/>
              <select
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
                className="w-full bg-transparent outline-none text-base md:text-lg"
              >
                <option value="">Visi dalykai</option>
                {SUBJECTS.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Level select – bigger */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 rounded-3xl border-2 px-5 h-16">
              <GraduationCap className="h-5 w-5"/>
              <select
                value={level}
                onChange={(e)=>setLevel(e.target.value)}
                className="w-full bg-transparent outline-none text-base md:text-lg"
              >
                <option value="">Visi lygiai</option>
                {LEVELS.map(l=> <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Big CTA button */}
          <div className="md:col-span-1 flex">
            <button
              type="submit"
              className="w-full rounded-3xl h-16 text-base md:text-lg font-medium bg-black text-white"
            >
              Ieškoti
            </button>
          </div>
        </form>

        {/* Smaller meta row but slightly larger text */}
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-600 dark:text-gray-300">
          <div className="inline-flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> Patikrinti profiliai</div>
          <div className="inline-flex items-center gap-2"><Users className="h-5 w-5"/> 10k+ mokinių</div>
          <div className="inline-flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Momentinis tvarkaraštis</div>
          <div className="inline-flex items-center gap-2"><MessageCircle className="h-5 w-5"/> Pokalbiai programoje</div>
        </div>
      </div>
    </div>
  );
}

// ---------------- calendar (student view only) ----------------
function CalendarInline({ availability, onBook }:{
  availability:Record<string,string[]>,
  onBook:(dayKey:string, time:string)=>void
}){
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoverDay, setHoverDay] = useState<Date|null>(null);
  const [selected, setSelected] = useState<Date|null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = generateMonthDays(year, month);

  const selKey = selected ? toKey(selected) : null;
  const hoverKey = hoverDay ? toKey(hoverDay) : null;
  const timesForHover = hoverKey ? (availability[hoverKey]||[]) : [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* left: calendar */}
      <div className="relative rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <button className="px-2 py-1 rounded-lg border" onClick={()=>setCursor(new Date(year, month-1, 1))}>←</button>
          <div className="font-medium">{cursor.toLocaleDateString('lt-LT',{month:'long',year:'numeric'})}</div>
          <button className="px-2 py-1 rounded-lg border" onClick={()=>setCursor(new Date(year, month+1, 1))}>→</button>
        </div>
        <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">{"Pr,A,T,K,Pn,Š,S".split(',').map(d=> <div key={d} className="py-1 text-center">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, idx)=>{
            if(!date) return <div key={idx} className="h-10"/>;
            const key = toKey(date);
            const hasSlots = (availability[key]||[]).length>0;
            return (
              <button key={idx}
                onClick={()=>setSelected(date)}
                onMouseEnter={()=>setHoverDay(date)}
                onMouseLeave={()=>setHoverDay(null)}
                className={`h-10 rounded-xl border text-sm transition-colors ${hasSlots? 'bg-orange-400 text-white border-orange-500':'bg-white dark:bg-gray-950'}`}>
                <div>{date.getDate()}</div>
              </button>
            );
          })}
        </div>

        {/* hover popover with times */}
        {hoverDay && timesForHover && timesForHover.length>0 ? (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 bg-white dark:bg-gray-900 border rounded-xl shadow-lg p-3 text-sm pointer-events-none" role="tooltip" aria-live="polite">
            <div className="font-medium mb-1">{hoverDay.toLocaleDateString('lt-LT',{day:'2-digit', month:'long'})}</div>
            <div className="flex flex-wrap gap-2">
              {timesForHover.map(t=>(<span key={t} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">{t}</span>))}
            </div>
          </div>
        ) : null}
      </div>

      {/* right: times for selected day */}
      <div className="rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{selected ? selected.toLocaleDateString('lt-LT',{weekday:'long',day:'2-digit',month:'long'}) : 'Pasirinkite dieną'}</h4>
        </div>
        {!selected ? (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Spustelėkite kalendoriuje dieną.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {(availability[selKey!]||[]).map(t=>(
              <button key={t} onClick={()=> selKey && onBook(selKey, t)}
                className="px-3 py-1 rounded-xl text-sm border bg-gray-50 dark:bg-gray-800">
                {t}<span className="ml-1 text-[10px] opacity-70">· Rezervuoti</span>
              </button>
            ))}
            {(availability[selKey!]||[]).length===0 && (
              <span className="text-sm text-gray-500">Šiai dienai laikų nėra.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- tutor dialog (no role toggle) ----------------
function TutorDialog({ tutor, onClose }:{ tutor: typeof TUTORS[number] | null, onClose:()=>void }){
  if(!tutor) return null;

  function bookSlot(dayKey: string, time: string){
    alert(`Rezervuota ${tutor!.name}: ${dayKey} ${time}`);
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} aria-modal role="dialog">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div className="relative z-10 w-full md:max-w-3xl bg-white dark:bg-gray-950 rounded-t-3xl md:rounded-3xl border p-6" initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}>
          <button onClick={onClose} className="absolute right-3 top-3 p-2 rounded-xl border" aria-label="Užverti"><X className="h-4 w-4"/></button>
          <div className="flex items-start gap-4">
            <img src={tutor.avatar} alt={tutor.name} className="h-16 w-16 rounded-2xl object-cover"/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-lg">{tutor.name}</h3>
                <div className="inline-flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/><span>{tutor.rating}</span><span className="text-gray-500">({tutor.reviews})</span></div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2"><Badge>{tutor.subject}</Badge></div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">{tutor.bio}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300"><MapPin className="h-4 w-4"/>{tutor.location}</div>
                <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300"><Euro className="h-4 w-4"/>{tutor.price} €/val</div>
                <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300"><Clock className="h-4 w-4"/>Atsako per 24 h</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <CalendarInline availability={tutor.availabilityDemo || {}} onBook={bookSlot} />
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-2">
            <button className="rounded-xl border px-3 py-2 text-sm">Parašyti žinutę</button>
            <button className="rounded-xl bg-black text-white px-3 py-2 text-sm">Tęsti rezervaciją</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------- signup (with role) ----------------
function SignupDialog({ open, onClose, onSigned }:{ open:boolean, onClose:()=>void, onSigned:(u:User)=>void }){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState<Role>("student");

  if(!open) return null;

  function submit(e: React.FormEvent){
    e.preventDefault();
    const user: User = { name, email, role };
    saveUser(user);
    onSigned(user);
    alert(`Registracija sėkminga: ${name} • ${email} (${role === "teacher" ? "korepetitorius" : "mokinys"})`);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} aria-modal role="dialog">
        <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
        <motion.div className="relative z-10 w-full md:max-w-md bg-white dark:bg-gray-950 rounded-t-3xl md:rounded-3xl border p-6" initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}>
          <button onClick={onClose} className="absolute right-3 top-3 p-2 rounded-xl border" aria-label="Užverti"><X className="h-4 w-4"/></button>
          <h3 className="text-lg font-semibold mb-4">Sukurti paskyrą</h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm">Vardas</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} required className="mt-1 w-full rounded-xl border px-3 py-2 bg-transparent"/>
            </div>
            <div>
              <label className="text-sm">El. paštas</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border px-3 py-2 bg-transparent"/>
            </div>
            <div>
              <label className="text-sm">Slaptažodis</label>
              <input type="password" value={pass} onChange={(e)=>setPass(e.target.value)} required className="mt-1 w-full rounded-xl border px-3 py-2 bg-transparent"/>
            </div>

            <div className="pt-2">
              <div className="text-sm mb-1">Rolė</div>
              <div className="flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="role" value="student" checked={role==="student"} onChange={()=>setRole("student")} />
                  Mokinys
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="role" value="teacher" checked={role==="teacher"} onChange={()=>setRole("teacher")} />
                  Korepetitorius
                </label>
              </div>
            </div>

            <button type="submit" className="w-full rounded-xl bg-black text-white px-3 py-2 text-sm">Registruotis</button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------- tutor card (simplified) ----------------
function TutorCard({ tutor, onClick }:{
  tutor: typeof TUTORS[number],
  onClick: ()=>void
}){
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="text-left rounded-3xl border overflow-hidden bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-black/20"
    >
      <div className="p-4 flex items-start gap-4">
        <img src={tutor.avatar} alt={tutor.name} className="h-16 w-16 rounded-2xl object-cover"/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{tutor.name}</h3>
            <div className="inline-flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
              <span>{tutor.rating}</span>
              <span className="text-gray-500">({tutor.reviews})</span>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>{tutor.subject}</Badge>
            {tutor.levels.map(l=> <Pill key={l}>{l}</Pill>)}
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{tutor.bio}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4"/>{tutor.location}
            </div>
            <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Euro className="h-4 w-4"/>{tutor.price} €/val
            </div>
            <div className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4"/>Atsako per 24 h
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center gap-2">
        <button onClick={onClick} className="flex-1 rounded-xl border px-3 py-2 text-sm">Peržiūrėti</button>
        <button onClick={onClick} className="flex-1 rounded-xl bg-black text-white px-3 py-2 text-sm">Greita peržiūra</button>
      </div>
    </motion.button>
  );
}

// ---------------- sections ----------------
function Features(){
  const items = [
    { icon:<CalendarIcon className="h-5 w-5"/>, title:"Integruotas tvarkaraštis", text:"Sinchronizacija su Google/Outlook, automatinės laiko juostos." },
    { icon:<MessageCircle className="h-5 w-5"/>, title:"Saugūs pokalbiai", text:"Failai, balso žinutės ir užduočių detalės." },
    { icon:<ShieldCheck className="h-5 w-5"/>, title:"Patikrinti korepetitoriai", text:"Tapatybės patikra ir bendruomenės atsiliepimai." },
  ];
  return (
    <Section id="features" title="Viskas greitesniam mokymuisi" subtitle="Paieška, rezervacijos ir pažangos sekimas.">
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(it=> (
          <div key={it.title} className="rounded-3xl border p-5 bg-white dark:bg-gray-950">
            <div className="h-10 w-10 rounded-2xl bg-gray-100 dark:bg-gray-800 grid place-items-center mb-3">{it.icon}</div>
            <h3 className="font-semibold">{it.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{it.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
function Pricing(){
  const plans = [
    { name:"Pradinis", price:0, features:["Naršymas","Saugūs pokalbiai","1 bandomoji pamoka"] },
    { name:"Plus", price:9, features:["Neribotos rezervacijos","Kalendoriaus sinchronizacija","Pirmenybinis palaikymas"] },
    { name:"Komandai/Klasei", price:29, features:["Grupinės pamokos","Pažangos ataskaitos","Keli mokiniai"] },
  ];
  return (
    <Section id="pricing" title="Paprasta kainodara" subtitle="Pradėkite nemokamai, bet kada atnaujinkite planą.">
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map(p=> (
          <div key={p.name} className="rounded-3xl border p-5 bg-white dark:bg-gray-950">
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <div className="mt-2 text-3xl font-semibold">€{p.price}<span className="text-base font-normal text-gray-500">/mėn</span></div>
            <ul className="mt-3 space-y-2 text-sm">{p.features.map(f=> <li key={f} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-500"/> {f}</li>)}</ul>
            <button className="mt-4 w-full rounded-xl bg-black text-white px-3 py-2 text-sm">Pasirinkti {p.name}</button>
          </div>
        ))}
      </div>
    </Section>
  );
}
function FAQ(){
  const faqs = [
    { q:"Kaip vyksta rezervacija?", a:"Pasirenkate laiką korepetitoriaus kalendoriuje. Patvirtinus – gausite priminimus." },
    { q:"Ar galima mokytis grupėje?", a:"Taip, planas Komandai/Klasei leidžia bendras pamokas ir pokalbius." },
    { q:"Kaip dėl grąžinimų?", a:"Atšaukus ar neįvykus pamokai – kreditai arba grąžinimas pagal politiką." },
  ];
  return (
    <Section id="faq" title="Dažniausiai užduodami klausimai">
      <div className="grid md:grid-cols-3 gap-4">
        {faqs.map(f=> (
          <div key={f.q} className="rounded-3xl border p-5 bg-white dark:bg-gray-950">
            <h3 className="font-medium">{f.q}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{f.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
function Footer(){
  return (
    <footer className="border-t">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center"><GraduationCap className="h-5 w-5"/></div><span className="font-semibold">Tutoriai</span></div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Jungiame mokinius su puikiais korepetitoriais.</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Produktas</h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300"><li><a href="#features" className="hover:underline">Funkcijos</a></li><li><a href="#pricing" className="hover:underline">Kainodara</a></li><li><a href="#tutors" className="hover:underline">Korepetitoriai</a></li></ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Apie</h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300"><li><a href="#" className="hover:underline">Apie mus</a></li><li><a href="#" className="hover:underline">Karjera</a></li><li><a href="#" className="hover:underline">Kontaktai</a></li></ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Teisinė informacija</h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300"><li><a href="#" className="hover:underline">Taisyklės</a></li><li><a href="#" className="hover:underline">Privatumas</a></li><li><a href="#" className="hover:underline">Slapukų politika</a></li></ul>
        </div>
      </div>
      <div className="border-t text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between"><span>© {new Date().getFullYear()} Tutoriai</span><div className="flex items-center gap-3"><a href="#" className="hover:underline">Twitter</a><a href="#" className="hover:underline">LinkedIn</a><a href="#" className="hover:underline">Instagram</a></div></div>
      </div>
    </footer>
  );
}

// ---------------- main app ----------------
export default function App(){
  const [filters, setFilters] = useState({ query:"", subject:"", level:"" });
  const [activeTutor, setActiveTutor] = useState<typeof TUTORS[number] | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(()=>{
    if (typeof window !== "undefined") {
      setCurrentUser(loadCurrentUser());
    }
  },[]);

  const filtered = TUTORS.filter(t=>{
    const matchQuery = filters.query ? (t.name+" "+t.subject+" "+t.bio).toLowerCase().includes(filters.query.toLowerCase()) : true;
    const matchSubject = filters.subject ? t.subject === filters.subject : true;
    const matchLevel = filters.level ? t.levels.includes(filters.level) : true;
    return matchQuery && matchSubject && matchLevel;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      <NavBar onOpenSignup={()=>setShowSignup(true)} current={currentUser}/>
      <Hero onSearch={setFilters}/>

      <Section id="tutors" title="Populiarūs korepetitoriai" subtitle="Atrinkti pagal įvertinimus ir atsakymo greitį.">
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.length ? (
            filtered.map(t => (
              <TutorCard
                key={t.id}
                tutor={t}
                onPreview={()=>setActiveTutor(t)}
                onSignup={()=>setShowSignup(true)}
              />
            ))
          ) : (
            <div className="rounded-3xl border p-8 text-center text-gray-600 dark:text-gray-300">
              <Filter className="h-5 w-5 mx-auto mb-2"/>
              Korepetitorių pagal jūsų filtrus nerasta. Pabandykite pakeisti paiešką.
            </div>
          )}
        </div>
      </Section>

      <Features/>
      <Pricing/>
      <FAQ/>
      <Footer/>

      <TutorDialog tutor={activeTutor} onClose={()=>setActiveTutor(null)}/>
      <SignupDialog
        open={showSignup}
        onClose={()=>setShowSignup(false)}
        onSigned={(u)=>setCurrentUser(u)}
      />
    </div>
  );
}
