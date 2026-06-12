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
  avatar_url: string | null
  tags: string[] | null
  venue_type: string | null
  media_urls: string[] | null
  additional_files: string[] | null
  fixture_count: number | null
  universe_count: number | null
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

function isImage(url: string) { return url.match(/\.(jpg|jpeg|png|webp)$/i) !== null }
function isVideo(url: string) { return url.match(/\.(mp4|mov)$/i) !== null }

function MediaThumb({ urls }: { urls: string[] }) {
  const url = urls[0]
  if (isImage(url)) return <img src={url} alt="" className="w-full h-full object-cover" />
  if (isVideo(url)) return <video src={url} className="w-full h-full object-cover" muted playsInline />
  return <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><span className="text-2xl">📄</span></div>
}

export default function FavoritesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notAuth, setNotAuth] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchFavorites() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setNotAuth(true); setLoading(false); return }
      setUserId(session.user.id)

      const { data: profileData } = await supabase.from('profiles').select('username').eq('id', session.user.id).single()
      if (profileData) setUsername(profileData.username)

      const { data: favData } = await supabase
        .from('favorites')
        .select('file_id')
        .eq('user_id', session.user.id)

      if (!favData || favData.length === 0) { setLoading(false); return }

      const fileIds = favData.map(f => f.file_id)
      const { data: filesData } = await supabase
        .from('files_with_author')
        .select('*')
        .in('id', fileIds)

      if (filesData) setFiles(filesData)
      setLoading(false)
    }
    fetchFavorites()
  }, [])

  async function removeFavorite(fileId: string) {
    if (!userId) return
    await supabase.from('favorites').delete().eq('user_id', userId).eq('file_id', fileId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  if (notAuth) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-400">You need to be signed in to view your favorites.</p>
      <a href="/auth" className="bg-amber-400 text-zinc-950 font-medium px-5 py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm">Sign in</a>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">MVR<span className="text-zinc-500">share</span></a>
          <a href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">← Gallery</a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-mono text-amber-400 tracking-widest mb-1">// favorites</p>
          <h1 className="text-2xl font-medium">My favorites</h1>
          <p className="text-zinc-500 text-sm mt-1">{files.length} saved file{files.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-4xl mb-4">☆</p>
            <p className="font-mono text-lg mb-2">No favorites yet</p>
            <p className="text-sm mb-6">Star files in the gallery to save them here.</p>
            <a href="/" className="bg-amber-400 text-zinc-950 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors text-sm">Browse gallery</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map(file => {
              const allExts = [file.file_type, ...((file.additional_files ?? []).map((url: string) =>
                url.split('.').pop()?.split('?')[0]?.toLowerCase() ?? ''
              ))]
              const uniqueExts = [...new Set(allExts)].filter(Boolean)
              const hasMedia = file.media_urls && file.media_urls.length > 0
              const typeColor = TYPE_COLORS[file.file_type] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'

              return (
                <div key={file.id} className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-700/50 transition-colors group">

                  {/* Remove favorite */}
                  <button
                    onClick={() => removeFavorite(file.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-zinc-900/90 rounded-full flex items-center justify-center text-amber-400 hover:text-zinc-400 transition-colors shadow-lg"
                    title="Remove from favorites"
                  >
                    ★
                  </button>

                  <a href={`/files/${file.id}`} className="block">
                    {hasMedia ? (
                      <div className="w-full aspect-[4/3] bg-zinc-800 overflow-hidden">
                        <MediaThumb urls={file.media_urls!} />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-zinc-800 flex items-center justify-center">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold font-mono border ${typeColor}`}>
                          {file.file_type.toUpperCase().slice(0, 4)}
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-sm font-medium text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mb-2">
                        {file.title}
                      </h3>

                      {file.venue_type && <p className="text-xs text-zinc-500 mb-2">{file.venue_type}</p>}

                      <div className="flex gap-1 flex-wrap mb-2">
                        {uniqueExts.map(ext => (
                          <span key={ext} className={`text-xs px-1.5 py-0.5 rounded font-mono border ${TYPE_COLORS[ext] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>.{ext}</span>
                        ))}
                      </div>

                      {(file.fixture_count || file.universe_count) && (
                        <div className="flex gap-2 mb-2">
                          {file.fixture_count && <span className="text-xs text-zinc-500 font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{file.fixture_count} fix.</span>}
                          {file.universe_count && <span className="text-xs text-zinc-500 font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{file.universe_count} univ.</span>}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
