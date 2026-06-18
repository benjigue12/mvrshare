'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

type FileItem = {
  id: string
  title: string
  file_type: string
  file_size: number
  download_count: number
  like_count: number
  created_at: string
  username: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  tags: string[] | null
  venue_type: string | null
  media_urls: string[] | null
  additional_files: string[] | null
  description: string | null
  fixture_count: number | null
  universe_count: number | null
  param_count: number | null
}

type SiteStats = {
  total_files: number
  total_users: number
  total_downloads: number
  total_fixtures: number
  total_universes: number
}

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-US')
}

const TYPE_COLORS: Record<string, string> = {
  mvr:   'bg-amber-900/30 text-amber-300 border-amber-700/40',
  gdtf:  'bg-purple-900/30 text-purple-300 border-purple-700/40',
  fbx:   'bg-rose-900/30 text-rose-300 border-rose-700/40',
  skp:   'bg-teal-900/30 text-teal-300 border-teal-700/40',
  glb:   'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  gltf:  'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  obj:   'bg-blue-900/30 text-blue-300 border-blue-700/40',
  dwg:   'bg-violet-900/30 text-violet-300 border-violet-700/40',
  dxf:   'bg-indigo-900/30 text-indigo-300 border-indigo-700/40',
  '3ds': 'bg-orange-900/30 text-orange-300 border-orange-700/40',
  exr:   'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
  pdf:   'bg-red-900/30 text-red-300 border-red-700/40',
  xlsx:  'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
  xls:   'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
}

const ALL_FILE_TYPES = ['mvr', 'gdtf', 'fbx', 'skp', 'glb', 'gltf', 'obj', 'dwg', 'dxf', '3ds', 'exr', 'pdf', 'xlsx', 'xls']
const VENUE_FILTERS = ['Stadium', 'Concert / Arena', 'Festival / Outdoor', 'Theatre / Opera', 'Club / DJ', 'TV / Broadcast', 'Event / Corporate', 'Exhibition', 'Architectural', 'House of Worship', 'Generic / Template', 'Fixture', 'Assets']
const SORT_OPTIONS = [
  { id: 'recent',       label: 'Most recent' },
  { id: 'popular',      label: 'Most popular' },
  { id: 'size_desc',    label: 'Heaviest' },
  { id: 'size_asc',     label: 'Lightest' },
  { id: 'name_asc',     label: 'Name A → Z' },
  { id: 'name_desc',    label: 'Name Z → A' },
]
const LICENSE_FILTERS = [
  { id: 'cc_by',    label: 'CC BY',    desc: 'Credit required' },
  { id: 'cc_by_nc', label: 'CC BY-NC', desc: 'Non-commercial' },
  { id: 'cc0',      label: 'CC0',      desc: 'Public domain' },
]

function isPdf(url: string) { return url.toLowerCase().includes('.pdf') }
function isVideo(url: string) { return url.match(/\.(mp4|mov)$/i) !== null }
function isImage(url: string) { return url.match(/\.(jpg|jpeg|png|webp)$/i) !== null }

// ---- Dropdown générique ----
function Dropdown({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm px-3 py-2 rounded-lg hover:border-zinc-600 transition-colors"
      >
        {label}
        <span className={`text-zinc-500 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl min-w-[200px] py-1">
          {children}
        </div>
      )}
    </div>
  )
}

// ---- Carrousel ----
function MediaCarousel({ urls }: { urls: string[] }) {
  const [current, setCurrent] = useState(0)
  const total = urls.length
  if (total === 0) return null
  const url = urls[current]

  return (
    <div className="relative w-full aspect-[4/3] bg-zinc-800 overflow-hidden group">
      {isImage(url) && <img src={url} alt="" className="w-full h-full object-cover" />}
      {isVideo(url) && <video src={url} className="w-full h-full object-cover" muted autoPlay loop playsInline />}
      {isPdf(url) && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-800">
          <div className="w-16 h-20 bg-red-900/30 border border-red-700/40 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">PDF Document</p>
        </div>
      )}
      {total > 1 && (
        <>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setCurrent(p => (p - 1 + total) % total) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-900/80 rounded-full flex items-center justify-center text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-zinc-800">‹</button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setCurrent(p => (p + 1) % total) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-900/80 rounded-full flex items-center justify-center text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-zinc-800">›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {urls.map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-zinc-900/70 rounded-full px-2 py-0.5 text-xs text-zinc-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {current + 1}/{total}
          </div>
        </>
      )}
    </div>
  )
}

// ---- File Card ----
function FileCard({ file, isFavorite, isLoggedIn, onToggleFav }: {
  file: FileItem
  isFavorite: boolean
  isLoggedIn: boolean
  onToggleFav: (id: string) => void
}) {
  const typeColor = TYPE_COLORS[file.file_type] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'
  const hasMedia = file.media_urls && file.media_urls.length > 0

  const allExts = [file.file_type, ...((file.additional_files ?? []).map((url: string) =>
    url.split('.').pop()?.split('?')[0]?.toLowerCase() ?? ''
  ))]
  const uniqueExts = [...new Set(allExts)].filter(Boolean)

   return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-700/50 transition-colors group">


      <a href={`/files/${file.id}`} className="block">
        {hasMedia ? (
          <MediaCarousel urls={file.media_urls!} />
        ) : (
          <div className="w-full aspect-[4/3] bg-zinc-800 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold font-mono border ${typeColor}`}>
              {file.file_type.toUpperCase().slice(0, 4)}
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug flex-1">
            {file.title}
          </h3>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav(file.id) }}
            className={`flex-shrink-0 text-base transition-colors ${isFavorite ? 'text-amber-400' : 'text-zinc-600 hover:text-amber-400'}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
       <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
          {file.venue_type && <p className="text-xs text-zinc-500 mb-2">{file.venue_type}</p>}
          <div className="flex gap-1 flex-wrap mb-2">
            {uniqueExts.map(ext => (
              <span key={ext} className={`text-xs px-1.5 py-0.5 rounded font-mono border ${TYPE_COLORS[ext] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>.{ext}</span>
            ))}
          </div>
          {(file.fixture_count || file.universe_count || file.param_count) && (
            <div className="flex gap-3 mb-2">
              {file.fixture_count && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z"/>
                    <path d="M9 17h6"/>
                  </svg>
                  {file.fixture_count}
                </span>
              )}
              {file.universe_count && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    <path d="M2 12h20"/>
                  </svg>
                  {file.universe_count}
                </span>
              )}
              {file.param_count && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 10h16M4 14h8"/>
                    <circle cx="15" cy="15" r="3"/>
                    <path d="M15 12v1M15 18v1M12.27 13.27l.73.73M17.27 16.27l.73.73M12.27 16.73l.73-.73M17.27 13.73l.73-.73"/>
                  </svg>
                  {file.param_count.toLocaleString()}
                </span>
              )}
            </div>
          )}
          {file.tags && file.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {file.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-mono">{tag}</span>
              ))}
            </div>
          )}
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {file.avatar_url ? (
                  <img src={file.avatar_url} alt={file.username} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs font-bold text-amber-300 font-mono flex-shrink-0">
                    {file.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-zinc-500 font-mono truncate">@{file.username}</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono bg-zinc-800 px-1.5 py-0.5 rounded flex-shrink-0">{formatSize(file.file_size)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600 font-mono">↓ {file.download_count.toLocaleString()}</span>
              <span className="text-xs text-zinc-600 font-mono">♥ {file.like_count}</span>
              <span className="text-xs text-zinc-600 ml-auto">{timeAgo(file.created_at)}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  )}
  

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * target))
      if (progress === 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function StatCard({ label, value }: { label: string; value: number }) {
  const count = useCountUp(value)
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-amber-400 font-mono">
        {count.toLocaleString()}
      </div>
      <div className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function Avatar({ profile }: { profile: Profile }) {
  if (profile.avatar_url) return <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
  return (
    <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs font-bold text-amber-300 font-mono">
      {profile.username.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [venueFilter, setVenueFilter] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [search, setSearch] = useState('')
  const [licenseFilter, setLicenseFilter] = useState('')
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 24
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profileData } = await supabase.from('profiles').select('id, username, display_name, avatar_url').eq('id', session.user.id).single()
        if (profileData) setProfile(profileData)
        const { data: favData } = await supabase.from('favorites').select('file_id').eq('user_id', session.user.id)
        if (favData) setFavoriteIds(new Set(favData.map((f: any) => f.file_id)))
      }
      const { data: filesData } = await supabase.from('files_with_author').select('*').order('created_at', { ascending: false }).limit(500)
      const { data: statsData } = await supabase.from('site_stats').select('*').single()
      if (filesData) setFiles(filesData)
      if (statsData) setStats(statsData)
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setMenuOpen(false)
  }

  function scrollToGallery() {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })
  }

  function toggleType(type: string) {
  setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  setCurrentPage(1)
}

  const filtered = files
    .filter(f => {
      const additionalExts = (f.additional_files ?? []).map((url: string) => url.split('.').pop()?.split('?')[0]?.toLowerCase() ?? '')
      const allExts = [f.file_type, ...additionalExts]
      const matchType = selectedTypes.length === 0 || selectedTypes.some(t => allExts.includes(t))
      const matchVenue = !venueFilter || f.venue_type === venueFilter
      const matchLicense = !licenseFilter || (f as any).license === licenseFilter
      const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.tags?.some(t => t.includes(search.toLowerCase()))
      const matchFav = !showFavOnly || favoriteIds.has(f.id)
      return matchType && matchVenue && matchSearch && matchLicense && matchFav
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':   return (b.download_count + b.like_count) - (a.download_count + a.like_count)
        case 'downloads': return b.download_count - a.download_count
        case 'likes':     return b.like_count - a.like_count
        case 'size_desc': return b.file_size - a.file_size
        case 'size_asc':  return a.file_size - b.file_size
        case 'name_asc':  return a.title.localeCompare(b.title)
        case 'name_desc': return b.title.localeCompare(a.title)
        default:          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const activeFiltersCount = selectedTypes.length + (venueFilter ? 1 : 0) + (licenseFilter ? 1 : 0)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">MVR<span className="text-zinc-500">share</span></a>
          <div className="flex items-center gap-6">
            <button onClick={scrollToGallery} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Gallery</button>
            <a href="#forum" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Forum</a>
            <a href="#about" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">About</a>
            <span className="text-xs font-mono bg-amber-900/30 text-amber-400 border border-amber-700/40 px-2 py-1 rounded">OPEN SOURCE</span>
            {profile ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar profile={profile} />
                  <span className="text-sm text-zinc-300 font-mono">@{profile.username}</span>
                  <span className="text-zinc-600 text-xs">▾</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-48 py-1 z-50">
                    <a href={`/profile/${profile.username}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>My profile</a>
                    <a href="/upload" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>Upload a file</a>
                    <a href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>Settings</a>
                    <div className="border-t border-zinc-800 my-1" />
                    <button onClick={handleSignOut} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition-colors">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/auth" className="text-sm bg-amber-400 text-zinc-950 font-medium px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">Join</a>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="max-w-2xl">
          <h1 className="font-mono text-4xl font-bold leading-tight mb-5">
            The open library for<br />
            <span className="text-amber-400">lighting designers</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Share your MVR files, 3D scenes and Lighting plots with the community.
            Free, open source, built by and for lighting professionals. In Development
          </p>
          <div className="flex gap-3">
            <button onClick={scrollToGallery} className="bg-amber-400 text-zinc-950 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors">Browse files</button>
            <a href={profile ? '/upload' : '/auth'} className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg hover:border-zinc-500 hover:text-zinc-100 transition-colors">Upload a file</a>
          </div>
        </div>
        {stats && (
  <div className="flex gap-12 mt-12 pt-10 border-t border-zinc-800">
  <StatCard label="Files" value={stats.total_files} />
  <StatCard label="Designers" value={stats.total_users} />
  <StatCard label="Downloads" value={stats.total_downloads} />
  <StatCard label="Fixtures" value={stats.total_fixtures} />
  <StatCard label="Universes" value={stats.total_universes} /> 
  </div>
)}
      </section>

      {/* GALLERY */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 pb-20">

        {/* Filters bar */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-mono text-amber-400 tracking-widest mb-1">// gallery</p>
              <h2 className="text-2xl font-medium">
                Shared files
                {filtered.length !== files.length && (
                  <span className="text-base font-normal text-zinc-500 ml-3">{filtered.length} results</span>
                )}
              </h2>
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search files, tags..."
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors w-64"
            />
          </div>

          {/* Dropdowns row */}
          <div className="flex gap-2 flex-wrap items-center">

            {/* File types — multi-select */}
            <Dropdown label={
              selectedTypes.length === 0
                ? <span className="text-zinc-400">File type</span>
                : <span className="text-amber-300">{selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} selected</span>
            }>
              <div className="px-2 py-1.5">
                <p className="text-xs text-zinc-500 px-2 mb-2 font-mono uppercase tracking-wider">Select one or more</p>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_FILE_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono transition-colors text-left ${selectedTypes.includes(type) ? 'bg-amber-900/30 text-amber-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                      <span className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${selectedTypes.includes(type) ? 'bg-amber-400 border-amber-400 text-zinc-950' : 'border-zinc-600'}`}>
                        {selectedTypes.includes(type) && <span className="text-xs leading-none">✓</span>}
                      </span>
                      .{type}
                    </button>
                  ))}
                </div>
                {selectedTypes.length > 0 && (
                  <button onClick={() => setSelectedTypes([])} className="w-full text-xs text-zinc-500 hover:text-zinc-300 mt-2 px-2 py-1 text-left transition-colors">
                    Clear selection
                  </button>
                )}
              </div>
            </Dropdown>

            {/* Venue */}
            <Dropdown label={
              venueFilter
                ? <span className="text-amber-300 truncate max-w-[140px]">{venueFilter}</span>
                : <span className="text-zinc-400">Venue type</span>
            }>
              <div className="py-1">
                <button
                  onClick={() => setVenueFilter('')}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${!venueFilter ? 'text-amber-300 bg-amber-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                >
                  All venues
                </button>
                {VENUE_FILTERS.map(v => (
                  <button
                    key={v}
                    onClick={() => { setVenueFilter(v === venueFilter ? '' : v); setCurrentPage(1) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${venueFilter === v ? 'text-amber-300 bg-amber-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Dropdown>

            {/* License */}
<Dropdown label={
  licenseFilter
    ? <span className="text-amber-300">{LICENSE_FILTERS.find(l => l.id === licenseFilter)?.label}</span>
    : <span className="text-zinc-400">License</span>
}>
  <div className="py-1">
    <button onClick={() => setLicenseFilter('')} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!licenseFilter ? 'text-amber-300 bg-amber-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}>
      All licenses
    </button>
    {LICENSE_FILTERS.map(l => (
      <button key={l.id} onClick={() => setLicenseFilter(l.id === licenseFilter ? '' : l.id)}
        className={`w-full text-left px-4 py-2 text-sm transition-colors ${licenseFilter === l.id ? 'text-amber-300 bg-amber-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}>
        <span className="font-mono">{l.label}</span>
        <span className="text-xs text-zinc-600 ml-2">{l.desc}</span>
      </button>
    ))}
  </div>
</Dropdown>

            {/* Sort */}
            <Dropdown label={
              <span className="text-zinc-400">
                {SORT_OPTIONS.find(s => s.id === sortBy)?.label ?? 'Sort'}
              </span>
            }>
              <div className="py-1">
                {SORT_OPTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSortBy(s.id); setCurrentPage(1) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === s.id ? 'text-amber-300 bg-amber-900/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Dropdown>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => { setSelectedTypes([]); setVenueFilter(''); setLicenseFilter('') ; setCurrentPage(1) }}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-2 flex items-center gap-1"
              >
                ✕ Clear filters
              </button>
            )}
         {profile && (
              <button
                onClick={() => { setShowFavOnly(f => !f); setCurrentPage(1) }}
                className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
                  showFavOnly
                    ? 'bg-amber-400 text-zinc-950 border-amber-400'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={showFavOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Favorites
              </button>
            )}

          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="font-mono text-lg mb-2">No files found</p>
            <p className="text-sm">Try adjusting your filters or be the first to share a scene!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(file => (

  <FileCard
    key={file.id}
    file={file}
    isFavorite={favoriteIds.has(file.id)}
    isLoggedIn={!!profile}
    onToggleFav={async (fileId) => {
      if (!profile) { window.location.href = '/auth'; return }
      if (favoriteIds.has(fileId)) {
        await supabase.from('favorites').delete().eq('user_id', profile.id).eq('file_id', fileId)
        setFavoriteIds(prev => { const next = new Set(prev); next.delete(fileId); return next })
      } else {
        await supabase.from('favorites').insert({ user_id: profile.id, file_id: fileId })
        setFavoriteIds(prev => new Set(prev).add(fileId))
      }
    }}
  />
))}
          </div>
        )
}

{/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="text-zinc-600 px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => { setCurrentPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                      currentPage === p
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>

            <span className="text-xs text-zinc-600 font-mono ml-2">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
          </div>
        )}

      </section>

      {/* CTA */}
      <section id="about" className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-mono text-3xl font-bold mb-4">Join MVRshare</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">Free, no ads, open source. Self-host your own instance or contribute on GitHub.</p>
          <div className="flex gap-3 justify-center">
            {!profile && <a href="/auth" className="bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-lg hover:bg-amber-300 transition-colors">Create a free account</a>}
            <a href="https://github.com/benjigue12/mvrshare" target="_blank" className="border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-lg hover:border-zinc-500 transition-colors">View on GitHub</a>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            {['MIT License', 'Self-hostable', 'No tracking', 'GDTF / MVR'].map(b => (
              <span key={b} className="text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-600">© 2025 MVRshare — open source community</span>
          <div className="flex gap-6">
            {['GitHub', 'Docs', 'API', 'Discord'].map(l => (
              <a key={l} href="#" className="text-xs font-mono text-zinc-500 hover:text-amber-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </div>
  )}
