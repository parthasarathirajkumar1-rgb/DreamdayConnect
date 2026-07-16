import React, { useState, useMemo } from "react";
import {
  Search, MapPin, Star, Menu, X, Sparkles, Calendar, CheckCircle2,
  ChevronLeft, TrendingUp, Users, Eye, MessageCircle, ArrowRight,
  Wallet, Heart, Camera, Utensils, PartyPopper, Building2, Music, Palette
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ── Supabase connection ──────────────────────────────────────────
// The anon/public key below is safe to expose in client-side code —
// it only allows the actions permitted by the Row Level Security
// policies set up in the database (public read on vendors/packages,
// users can only touch their own bookings/profile).
const SUPABASE_URL = "https://vyaecenvytkbfrpyuwvr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-FATzdUz5LtrxXQhEnvjhA_41Y1mI8r";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORY_ICONS = {
  Photographers: Camera,
  Caterers: Utensils,
  Decorators: Palette,
  "Marriage Halls": Building2,
  DJs: Music,
  "Makeup Artists": Sparkles,
  "Wedding Planners": PartyPopper,
};

// Fetches all vendors + their packages from Supabase and reshapes them
// into the exact same {id, name, category, ..., packages: [...]} shape
// the rest of this file already expects — so no other component needs
// to change how it reads vendor data.
async function fetchVendors() {
  const { data: vendors, error: vErr } = await supabase.from("vendors").select("*");
  if (vErr) throw vErr;
  const { data: packages, error: pErr } = await supabase.from("vendor_packages").select("*").order("sort_order");
  if (pErr) throw pErr;

  return (vendors || []).map(v => ({
    id: v.id,
    name: v.name,
    category: v.category,
    city: v.city,
    rating: v.rating,
    reviews: v.reviews_count,
    priceFrom: v.price_from,
    tags: v.tags || [],
    about: v.about,
    packages: (packages || [])
      .filter(p => p.vendor_id === v.id)
      .map(p => ({ name: p.name, price: p.price, desc: p.description })),
  }));
}

const CATEGORIES = ["Photographers", "Caterers", "Decorators", "Marriage Halls", "DJs", "Makeup Artists", "Wedding Planners"];
const CITIES = ["Chennai", "Bengaluru", "Coimbatore", "Hyderabad"];

function currency(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function NavBar({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const links = [
    { key: "home", label: "Home" },
    { key: "search", label: "Find Vendors" },
    { key: "planner", label: "AI Planner" },
    { key: "dashboard", label: "Vendor Dashboard" },
    { key: "vendorSignup", label: "Become a Vendor" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 font-serif font-bold text-lg text-stone-900">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-600 via-amber-500 to-teal-700 flex items-center justify-center text-white text-sm">◆</span>
          DreamDay <span className="text-rose-600 italic font-normal">Connect</span>
        </button>
        <nav className="hidden md:flex gap-7 text-sm font-semibold text-stone-600">
          {links.map(l => (
            <button key={l.key} onClick={() => setPage(l.key)} className={`hover:text-stone-900 transition ${page === l.key ? "text-rose-600" : ""}`}>{l.label}</button>
          ))}
        </nav>
        <button className="hidden md:inline-flex items-center gap-2 bg-stone-900 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition" onClick={() => setPage("search")}>
          Get Started
        </button>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
      {open && (
        <div className="md:hidden border-t border-stone-200 px-5 py-3 flex flex-col gap-3 bg-white">
          {links.map(l => (
            <button key={l.key} onClick={() => { setPage(l.key); setOpen(false); }} className="text-left text-sm font-semibold text-stone-700">{l.label}</button>
          ))}
        </div>
      )}
    </header>
  );
}

function HomePage({ setPage, setFilters }) {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-10">
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-rose-50 via-white to-teal-50 p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-wide uppercase text-rose-700 bg-rose-100 px-3 py-1.5 rounded-full mb-5">✦ Every vendor. One invitation.</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-stone-900">Plan the day you've <em className="text-rose-600 not-italic font-semibold">always imagined.</em></h1>
            <p className="mt-5 text-stone-600 text-lg max-w-md">Compare, chat, book and pay every event vendor in your city — from one dashboard.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => setPage("search")} className="bg-stone-900 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:-translate-y-0.5 transition">
                Find vendors near me <ArrowRight size={16}/>
              </button>
              <button onClick={() => setPage("planner")} className="border-2 border-stone-900 font-bold px-6 py-3 rounded-full flex items-center gap-2">
                <Sparkles size={16}/> Ask the AI planner
              </button>
            </div>
            <div className="flex gap-8 mt-9">
              <div><b className="font-serif text-2xl block">12,400+</b><span className="text-xs text-stone-500">verified vendors</span></div>
              <div><b className="font-serif text-2xl block">60,000+</b><span className="text-xs text-stone-500">events booked</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.slice(0, 4).map((c, i) => {
              const Icon = CATEGORY_ICONS[c] || Sparkles;
              const colors = ["bg-rose-600 text-white", "bg-amber-500 text-stone-900", "bg-teal-800 text-white", "bg-stone-900 text-white"];
              return (
                <button key={c} onClick={() => { setFilters(f => ({ ...f, category: c })); setPage("search"); }}
                  className={`rounded-2xl p-5 flex flex-col items-center justify-center gap-2 shadow-lg hover:-translate-y-1 transition ${colors[i % colors.length]}`}>
                  <Icon size={26} />
                  <span className="text-xs font-bold text-center">{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="font-serif text-2xl font-bold text-center mb-8">Browse every category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(c => {
            const Icon = CATEGORY_ICONS[c] || Sparkles;
            return (
              <button key={c} onClick={() => { setFilters(f => ({ ...f, category: c })); setPage("search"); }}
                className="bg-white border border-stone-200 rounded-2xl p-5 text-center hover:border-rose-400 hover:-translate-y-1 transition">
                <Icon className="mx-auto text-rose-600" size={24} />
                <p className="text-xs font-bold mt-2">{c}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SearchPage({ vendors, filters, setFilters, setPage, setSelectedVendorId }) {
  const results = useMemo(() => {
    return vendors.filter(v =>
      (!filters.category || v.category === filters.category) &&
      (!filters.city || v.city === filters.city) &&
      v.priceFrom <= filters.budgetMax &&
      v.rating >= filters.minRating
    );
  }, [vendors, filters]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-[260px_1fr] gap-8">
      <aside className="bg-white border border-stone-200 rounded-2xl p-5 h-fit">
        <h3 className="font-serif font-bold mb-4">Filters</h3>
        <label className="text-xs font-bold uppercase text-stone-500">Category</label>
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="w-full border border-stone-300 rounded-lg p-2 mt-1 mb-4 text-sm">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="text-xs font-bold uppercase text-stone-500">City</label>
        <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} className="w-full border border-stone-300 rounded-lg p-2 mt-1 mb-4 text-sm">
          <option value="">All cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="text-xs font-bold uppercase text-stone-500">Max budget: {currency(filters.budgetMax)}</label>
        <input type="range" min="5000" max="150000" step="1000" value={filters.budgetMax}
          onChange={e => setFilters(f => ({ ...f, budgetMax: Number(e.target.value) }))} className="w-full mt-2 mb-4" />
        <label className="text-xs font-bold uppercase text-stone-500">Min rating: {filters.minRating}★</label>
        <input type="range" min="0" max="5" step="0.5" value={filters.minRating}
          onChange={e => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))} className="w-full mt-2" />
      </aside>

      <div>
        <p className="text-sm text-stone-500 mb-4">{results.length} vendors found</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {results.map(v => (
            <button key={v.id} onClick={() => { setSelectedVendorId(v.id); setPage("vendor"); }}
              className="text-left bg-white border border-stone-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition">
              <div className="h-28 bg-gradient-to-br from-rose-600 to-amber-500 relative">
                <span className="absolute top-3 left-3 bg-white/90 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full">✓ Verified</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold">{v.name}</h3>
                  <span className="text-amber-600 text-xs font-bold flex items-center gap-1"><Star size={12} fill="currentColor"/>{v.rating}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin size={12}/>{v.category} · {v.city}</p>
                <p className="text-sm font-bold text-stone-800 mt-2">From {currency(v.priceFrom)}</p>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {v.tags.map(t => <span key={t} className="text-[10px] font-bold bg-stone-100 px-2 py-1 rounded">{t}</span>)}
                </div>
              </div>
            </button>
          ))}
          {results.length === 0 && <p className="text-stone-500 col-span-2 text-center py-10">No vendors match these filters — try widening your budget.</p>}
        </div>
      </div>
    </div>
  );
}

function VendorPage({ vendors, vendorId, setPage, setBooking }) {
  const v = vendors.find(v => v.id === vendorId);
  const [pkgIdx, setPkgIdx] = useState(0);
  if (!v) return null;
  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <button onClick={() => setPage("search")} className="flex items-center gap-1 text-sm font-semibold text-stone-600 mb-6"><ChevronLeft size={16}/> Back to results</button>
      <div className="h-52 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 mb-6"></div>
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{v.name}</h1>
          <p className="text-stone-500 flex items-center gap-1 mt-1"><MapPin size={14}/>{v.category} · {v.city}</p>
        </div>
        <span className="flex items-center gap-1 text-amber-600 font-bold"><Star size={16} fill="currentColor"/>{v.rating} <span className="text-stone-400 font-normal text-sm">({v.reviews} reviews)</span></span>
      </div>
      <p className="mt-5 text-stone-600 leading-relaxed">{v.about}</p>

      <h2 className="font-serif text-xl font-bold mt-9 mb-4">Pricing packages</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {v.packages.map((p, i) => (
          <button key={p.name} onClick={() => setPkgIdx(i)} className={`text-left rounded-2xl p-5 border-2 transition ${pkgIdx === i ? "border-rose-600 bg-rose-50" : "border-stone-200 bg-white"}`}>
            <h3 className="font-bold">{p.name}</h3>
            <p className="font-serif text-2xl mt-1">{currency(p.price)}</p>
            <p className="text-xs text-stone-500 mt-2">{p.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-9 bg-teal-50 border border-teal-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-bold">Ready to book {v.packages[pkgIdx].name}?</p>
          <p className="text-sm text-stone-600">{currency(v.packages[pkgIdx].price)} · 20% advance to confirm</p>
        </div>
        <button onClick={() => { setBooking({ vendor: v, pkg: v.packages[pkgIdx] }); setPage("booking"); }}
          className="bg-rose-600 text-white font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition flex items-center gap-2">
          Book now <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}

function BookingPage({ booking, setPage }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ date: "", guests: "", name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  if (!booking) return <div className="max-w-2xl mx-auto px-5 py-16 text-center text-stone-500">Pick a vendor first to start a booking.</div>;

  const gst = Math.round(booking.pkg.price * 0.18);
  const total = booking.pkg.price + gst;
  const advance = Math.round(total * 0.2);

  async function confirmBooking() {
    setSaving(true);
    setSaveError("");
    const { error } = await supabase.from("bookings").insert({
      vendor_id: booking.vendor.id,
      customer_name: form.name,
      customer_phone: form.phone,
      event_date: form.date || null,
      guest_count: form.guests ? Number(form.guests) : null,
      package_name: booking.pkg.name,
      package_price: booking.pkg.price,
      gst_amount: gst,
      advance_amount: advance,
      total_amount: total,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      setSaveError("Couldn't save your booking — please try again.");
      return;
    }
    setStep(4);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="flex items-center gap-2 mb-8 text-xs font-bold text-stone-400">
        {["Details", "Contact", "Confirm"].map((s, i) => (
          <React.Fragment key={s}>
            <span className={`flex items-center gap-1 ${step === i + 1 ? "text-rose-600" : step > i + 1 ? "text-teal-700" : ""}`}>
              {step > i + 1 ? <CheckCircle2 size={14}/> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">{i+1}</span>} {s}
            </span>
            {i < 2 && <span className="flex-1 h-px bg-stone-200"/>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-7">
        <h2 className="font-serif text-xl font-bold">{booking.vendor.name} — {booking.pkg.name}</h2>
        <p className="text-stone-500 text-sm mb-6">{currency(booking.pkg.price)} package</p>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-stone-500">Event date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1"/>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-stone-500">Guest count</label>
              <input type="number" placeholder="e.g. 150" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1"/>
            </div>
            <button disabled={!form.date} onClick={() => setStep(2)} className="w-full bg-stone-900 disabled:opacity-40 text-white font-bold py-3 rounded-full mt-2">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-stone-500">Your name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1"/>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-stone-500">Phone number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-stone-900 font-bold py-3 rounded-full">Back</button>
              <button disabled={!form.name || !form.phone} onClick={() => setStep(3)} className="flex-1 bg-stone-900 disabled:opacity-40 text-white font-bold py-3 rounded-full">Review quotation</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-stone-50 rounded-xl p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span>Package ({booking.pkg.name})</span><span>{currency(booking.pkg.price)}</span></div>
              <div className="flex justify-between text-stone-500"><span>GST (18%)</span><span>{currency(gst)}</span></div>
              <div className="flex justify-between font-bold border-t border-stone-200 pt-2"><span>Total</span><span>{currency(total)}</span></div>
              <div className="flex justify-between text-rose-600 font-bold"><span>Advance due now (20%)</span><span>{currency(advance)}</span></div>
            </div>
            {saveError && <p className="text-rose-600 text-sm mt-3">{saveError}</p>}
            <button onClick={confirmBooking} disabled={saving} className="w-full bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-full mt-5">
              {saving ? "Saving your booking…" : "Pay advance & confirm booking"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto text-teal-700" size={44}/>
            <h3 className="font-serif text-xl font-bold mt-4">Booking confirmed!</h3>
            <p className="text-stone-500 text-sm mt-2">A digital quotation has been sent to you. {booking.vendor.name} will reach out to finalize details for {form.date || "your event date"}.</p>
            <button onClick={() => setPage("search")} className="mt-6 bg-stone-900 text-white font-bold px-6 py-3 rounded-full">Browse more vendors</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlannerPage() {
  const [budget, setBudget] = useState(100000);
  const [city, setCity] = useState("Chennai");
  const [eventType, setEventType] = useState("Wedding");
  const [guests, setGuests] = useState(150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  async function generatePlan() {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const prompt = `You are a wedding/event budget planner for the Indian market. Given: budget ₹${budget}, city ${city}, event type ${eventType}, guest count ${guests}.
Return ONLY a raw JSON object, no markdown fences, no preamble, in this exact shape:
{"total": number, "items": [{"category": string, "amount": number, "note": string}], "tip": string}
The sum of all "items[].amount" must be less than or equal to the budget. Include 4-6 realistic categories relevant to the event type (e.g. photography, catering, decoration, makeup, venue, entertainment). Amounts should reflect realistic Indian vendor pricing for a mid-size city. Keep "note" under 8 words and "tip" under 20 words.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = (data.content || []).map(b => b.text || "").join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setPlan(parsed);
    } catch (e) {
      setError("Couldn't generate a plan right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-bold uppercase text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full mb-4">✦ AI Wedding Planner</span>
        <h1 className="font-serif text-3xl font-bold">Tell it your budget. It plans the day.</h1>
        <p className="text-stone-500 mt-2">Get a realistic, itemised vendor plan powered by Claude.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase text-stone-500">Total budget (₹)</label>
          <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1"/>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-stone-500">City</label>
          <select value={city} onChange={e => setCity(e.target.value)} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1">
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-stone-500">Event type</label>
          <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1">
            <option>Wedding</option><option>Engagement</option><option>Birthday</option><option>Corporate Event</option><option>Baby Shower</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-stone-500">Guest count</label>
          <input type="number" value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full border border-stone-300 rounded-lg p-2.5 mt-1"/>
        </div>
        <button onClick={generatePlan} disabled={loading} className="sm:col-span-2 bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2">
          {loading ? "Planning your event…" : (<><Wallet size={16}/> Generate my plan</>)}
        </button>
      </div>

      {error && <p className="text-center text-rose-600 text-sm mt-4">{error}</p>}

      {plan && (
        <div className="mt-8 bg-teal-50 border border-teal-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl font-bold">Your plan</h3>
            <span className="font-bold text-teal-800">{currency(plan.total || budget)}</span>
          </div>
          <div className="space-y-2">
            {(plan.items || []).map((it, i) => (
              <div key={i} className="flex justify-between items-center bg-white rounded-xl p-3 text-sm">
                <div>
                  <p className="font-bold">{it.category}</p>
                  <p className="text-stone-500 text-xs">{it.note}</p>
                </div>
                <span className="font-bold">{currency(it.amount)}</span>
              </div>
            ))}
          </div>
          {plan.tip && <p className="text-sm text-teal-800 mt-4 italic">💡 {plan.tip}</p>}
        </div>
      )}
    </div>
  );
}

function DashboardPage() {
  const monthly = [
    { month: "Feb", bookings: 6 }, { month: "Mar", bookings: 9 }, { month: "Apr", bookings: 8 },
    { month: "May", bookings: 14 }, { month: "Jun", bookings: 17 }, { month: "Jul", bookings: 21 },
  ];
  const stats = [
    { label: "Profile views", value: "3,420", icon: Eye, color: "text-rose-600" },
    { label: "Leads this month", value: "148", icon: Users, color: "text-amber-600" },
    { label: "WhatsApp clicks", value: "612", icon: MessageCircle, color: "text-teal-700" },
    { label: "Booking conversion", value: "24%", icon: TrendingUp, color: "text-stone-900" },
  ];
  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="font-serif text-3xl font-bold mb-1">Business Growth Dashboard</h1>
      <p className="text-stone-500 mb-8">Sample analytics for Lens & Light Studio · Gold plan</p>
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5">
            <s.icon className={s.color} size={20}/>
            <p className="font-serif text-2xl font-bold mt-2">{s.value}</p>
            <p className="text-xs text-stone-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h3 className="font-bold mb-4">Bookings over time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="month" stroke="#78716c" fontSize={12}/>
            <YAxis stroke="#78716c" fontSize={12}/>
            <Tooltip />
            <Bar dataKey="bookings" fill="#C81457" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VendorSignupPage({ setPage }) {
  const [form, setForm] = useState({ businessName: "", category: CATEGORIES[0], city: CITIES[0], priceFrom: "", about: "", email: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | saving | done | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      // 1. Create the login account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Signup didn't return a user — check your email to confirm, then log in.");

      // 2. Create the vendor listing
      const { data: vendorRow, error: vendorError } = await supabase
        .from("vendors")
        .insert({
          name: form.businessName,
          category: form.category,
          city: form.city,
          price_from: Number(form.priceFrom) || 0,
          about: form.about,
          tags: [],
        })
        .select()
        .single();
      if (vendorError) throw vendorError;

      // 3. Link the profile to the vendor listing
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: userId, role: "vendor", vendor_id: vendorRow.id, full_name: form.businessName });
      if (profileError) throw profileError;

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong — please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto text-teal-700 mb-4" size={44}/>
        <h1 className="font-serif text-2xl font-bold mb-2">You're listed on DreamDay Connect!</h1>
        <p className="text-stone-500 mb-6">Check your email ({form.email}) to confirm your account, then you can log in and manage your listing.</p>
        <button onClick={() => setPage("search")} className="bg-stone-900 text-white font-bold px-6 py-3 rounded-full">See your listing in Find Vendors</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-12">
      <h1 className="font-serif text-3xl font-bold mb-1">Become a Vendor</h1>
      <p className="text-stone-500 mb-8">List your business on DreamDay Connect — it's free to get started.</p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-stone-200 rounded-2xl p-6">
        <div>
          <label className="text-sm font-semibold block mb-1">Business name</label>
          <input required value={form.businessName} onChange={e => update("businessName", e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2" placeholder="e.g. Lens & Light Studio" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Category</label>
            <select value={form.category} onChange={e => update("category", e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">City</label>
            <select value={form.city} onChange={e => update("city", e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2">
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Starting price (₹)</label>
          <input required type="number" min="0" value={form.priceFrom} onChange={e => update("priceFrom", e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2" placeholder="e.g. 15000" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">About your business</label>
          <textarea value={form.about} onChange={e => update("about", e.target.value)} rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2" placeholder="What makes your service special?" />
        </div>
        <hr className="border-stone-200" />
        <div>
          <label className="text-sm font-semibold block mb-1">Email (for login)</label>
          <input required type="email" value={form.email} onChange={e => update("email", e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2" placeholder="you@business.com" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Password</label>
          <input required type="password" minLength={6} value={form.password} onChange={e => update("password", e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2" placeholder="At least 6 characters" />
        </div>
        {status === "error" && <p className="text-rose-600 text-sm">{error}</p>}
        <button type="submit" disabled={status === "saving"} className="w-full bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-full">
          {status === "saving" ? "Creating your listing…" : "List my business"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [filters, setFilters] = useState({ category: "", city: "", budgetMax: 150000, minRating: 0 });
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState("");

  React.useEffect(() => {
    fetchVendors()
      .then(setVendors)
      .catch(() => setVendorsError("Couldn't load vendors — check your connection and try again."))
      .finally(() => setVendorsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <NavBar page={page} setPage={setPage} />
      {vendorsLoading && <p className="text-center text-stone-400 py-10 text-sm">Loading vendors…</p>}
      {vendorsError && <p className="text-center text-rose-600 py-10 text-sm">{vendorsError}</p>}
      {!vendorsLoading && !vendorsError && (
        <>
          {page === "home" && <HomePage setPage={setPage} setFilters={setFilters} />}
          {page === "search" && <SearchPage vendors={vendors} filters={filters} setFilters={setFilters} setPage={setPage} setSelectedVendorId={setSelectedVendorId} />}
          {page === "vendor" && <VendorPage vendors={vendors} vendorId={selectedVendorId} setPage={setPage} setBooking={setBooking} />}
          {page === "booking" && <BookingPage booking={booking} setPage={setPage} />}
          {page === "planner" && <PlannerPage />}
          {page === "dashboard" && <DashboardPage />}
          {page === "vendorSignup" && <VendorSignupPage setPage={setPage} />}
        </>
      )}
      <footer className="text-center text-xs text-stone-400 py-8 border-t border-stone-200 mt-10">
        © 2026 DreamDay Connect · Live data from Supabase
      </footer>
    </div>
  );
}
