'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

// ---- Types ----
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

// ---- Helpers ----
function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return "à l'instant"
  if (h < 24) return `il y a ${h}h`
  if (d < 7) return `il y a ${d}j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const TYPE_COLORS: Record<string, string> = {
  mvr:  'bg-amber-900/30 text-amber-300 border border-amber-700/40',
  gdtf: 'bg-purple-900/30 text-purple-300 border border-purple-700/40',
  '3ds':'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  obj:  'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  blend:'bg-green-900/30 text-green-300 border border-green-700/40',
  other:'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

// ---- Composants ----
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
            <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              {tag}
            </span>
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

// ---- Page principale ----
export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Fichiers récents
      const { data: filesData } = await supabase
        .from('files_with_author')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)

      // Stats globales
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

  const filtered = filter === 'all'
    ? files
    : files.filter(f => f.file_type === filter)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-lg font-bold text-amber-400">
            MVR<span className="text-zinc-500">share</span>
          </span>
          <div className="flex items-center gap-6">
            <a href="#galerie" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Galerie</a>
            <a href="#forum" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Forum</a>
            <span className="text-xs font-mono bg-amber-900/30 text-amber-400 border border-amber-700/40 px-2 py-1 rounded">
              OPEN SOURCE
            </span>
            <button className="text-sm bg-amber-400 text-zinc-950 font-medium px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
              Rejoindre
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <h1 className="font-mono text-4xl font-bold leading-tight mb-5">
            La bibliothèque ouverte<br />
            des <span className="text-amber-400">light designers</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Partagez vos fichiers MVR, scènes 3D et patches GDTF avec la communauté.
            Gratuit, open source, pour et par les techniciens lumière.
          </p>
          <div className="flex gap-3">
            <button className="bg-amber-400 text-zinc-950 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors">
              Explorer la galerie
            </button>
            <button className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg hover:border-zinc-500 hover:text-zinc-100 transition-colors">
              Uploader un fichier
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex gap-12 mt-14 pt-10 border-t border-zinc-800">
            <StatCard label="Fichiers MVR" value={stats.total_files.toLocaleString()} />
            <StatCard label="Designers" value={stats.total_users.toLocaleString()} />
            <StatCard label="Télécharg." value={stats.total_downloads.toLocaleString()} />
            <StatCard label="Topics forum" value={stats.total_topics.toLocaleString()} />
          </div>
        )}
      </section>

      {/* GALERIE */}
      <section id="galerie" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-mono text-amber-400 tracking-widest mb-1">// galerie</p>
            <h2 className="text-2xl font-medium">Fichiers partagés récemment</h2>
          </div>

          {/* Filtres */}
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
                {type === 'all' ? 'Tous' : `.${type}`}
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
            <p className="font-mono text-lg mb-2">Aucun fichier pour l'instant</p>
            <p className="text-sm">Sois le premier à partager une scène !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-mono text-3xl font-bold mb-4">Rejoignez MVRshare</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            Gratuit, sans pub, open source. Hébergez votre instance ou contribuez au code sur GitHub.
          </p>
          <div className="flex gap-3 justify-center">
            <button className="bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-lg hover:bg-amber-300 transition-colors">
              Créer un compte gratuit
            </button>
            <button className="border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-lg hover:border-zinc-500 transition-colors">
              Voir sur GitHub
            </button>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            {['MIT License', 'Self-hostable', 'No tracking', 'GDTF / MVR'].map(b => (
              <span key={b} className="text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
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

    </div>
  )
}
