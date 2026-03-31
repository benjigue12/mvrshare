'use client'

import { useEffect, useState } from 'react'
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
  tags: string[] | null
  venue_type: string | null
}

type SiteStats = {
  total_files: number
  total_users: number
  total_downloads: number
  total_topics: number
}

type Profile = {
  username: string
  display_name: string | null
  avatar_url: string | null
}

function formatSize(bytes: number) {
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
  mvr:  'bg-amber-900/30 text-amber-300 border border-amber-700/40',
  gdtf: 'bg-purple-900/30 text-purple-300 border border-purple-700/40',
  '3ds':'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  obj:  'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  blend:'bg-green-900/30 text-green-300 border border-green-700/40',
  other:'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

function FileCard({ file }: { file: FileItem }) {
  const typeColor = TYPE_COLORS[file.file_type] ?? TYPE_COLORS.other
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-700/50 transition-colors cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${typeColor}`}>
          {file.file_type.toUpperCase().slice(0, 4)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
            {file.title}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            @{file.username} · {formatSize(file.file_size)} · {timeAgo(file.created_at)}
          </p>
        </div>
      </div>
      {file.tags && file.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {file.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
        <span className="text-xs text-zinc-500 font-mono">↓ {file.download_count.toLocaleString()}</span>
        <span className="text-xs text-zinc-500 font-mono">♥ {file.like_count}</span>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-amber-400 font-mono">{value}</div>
      <div className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function Avatar({ profile }: { profile: Profile }) {
  const initials = (profile.display_name ?? profile.username).slice(0, 2).toUpperCase()
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs font-bold text-amber-300 font-mono">
      {initials}
    </div>
  )
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [menuOpen, setMenuOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', session.user.id)
          .single()
        if (profileData) setProfile(profileData)
      }

      const { data: filesData } = await supabase
        .from('files_with_author')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)

      const { data: statsData } = await supabase
        .from('site_stats')
        .select('*')
        .single()

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

  const filtered = filter === 'all' ? files : files.filter(f => f.file_type === filter)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">
            MVR<span className="text-zinc-500">share</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="#gallery" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Gallery</a>
            <a href="#forum" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Forum</a>
            <a href="#about" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">About</a>
            <span className="text-xs font-mono bg-amber-900/30 text-amber-400 border border-amber-700/40 px-2 py-1 rounded">
              OPEN SOURCE
            </span>
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar profile={profile} />
                  <span className="text-sm text-zinc-300 font-mono">@{profile.username}</span>
                  <span className="text-zinc-600 text-xs">▾</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-48 py-1 z-50">
                    <a href={`/profile/${profile.username}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      My profile
                    </a>
                    <a href="/upload" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      Upload a file
                    </a>
                    <a href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      Settings
                    </a>
                    <div className="border-t border-zinc-800 my-1" />
                    <button onClick={handleSignOut} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/auth" className="text-sm bg-amber-400 text-zinc-950 font-medium px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                Join
              </a>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <h1 className="font-mono text-4xl font-bold leading-tight mb-5">
            The open library for<br />
            <span className="text-amber-400">lighting designers</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Share your MVR files, 3D scenes and GDTF patches with the community.
            Free, open source, built by and for lighting professionals.
          </p>
          <div className="flex gap-3">
            <a href="#gallery" className="bg-amber-400 text-zinc-950 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors">
              Browse files
            </a>
            <a href={profile ? '/upload' : '/auth'} className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg hover:border-zinc-500 hover:text-zinc-100 transition-colors">
              Upload a file
            </a>
          </div>
        </div>
        {stats && (
          <div className="flex gap-12 mt-14 pt-10 border-t border-zinc-800">
            <StatCard label="MVR files" value={stats.total_files.toLocaleString()} />
            <StatCard label="Designers" value={stats.total_users.toLocaleString()} />
            <StatCard label="Downloads" value={stats.total_downloads.toLocaleString()} />
            <StatCard label="Forum topics" value={stats.total_topics.toLocaleString()} />
          </div>
        )}
      </section>

      <section id="gallery" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-mono text-amber-400 tracking-widest mb-1">// gallery</p>
            <h2 className="text-2xl font-medium">Recently shared files</h2>
          </div>
          <div className="flex gap-2">
            {['all', 'mvr', 'gdtf', '3ds', 'blend'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                  filter === type
                    ? 'bg-amber-400 text-zinc-950 border-amber-400'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {type === 'all' ? 'All' : `.${type}`}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="font-mono text-lg mb-2">No files yet</p>
            <p className="text-sm">Be the first to share a scene!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </section>

      <section id="about" className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-mono text-3xl font-bold mb-4">Join MVRshare</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            Free, no ads, open source. Self-host your own instance or contribute on GitHub.
          </p>
          <div className="flex gap-3 justify-center">
            {!profile && (
              <a href="/auth" className="bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-lg hover:bg-amber-300 transition-colors">
                Create a free account
              </a>
            )}
            <a href="https://github.com/benjigue12/mvrshare" target="_blank" className="border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-lg hover:border-zinc-500 transition-colors">
              View on GitHub
            </a>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            {['MIT License', 'Self-hostable', 'No tracking', 'GDTF / MVR'].map(b => (
              <span key={b} className="text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-600">© 2025 MVRshare — open source community</span>
          <div className="flex gap-6">
            {['GitHub', 'Docs', 'API', 'Discord'].map(l => (
              <a key={l} href="#" className="text-xs font-mono text-zinc-500 hover:text-amber-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}

    </div>
  )
}
