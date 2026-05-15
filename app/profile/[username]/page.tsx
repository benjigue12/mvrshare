'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// ---- Types ----
type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  website: string | null
  software: string[] | null
  created_at: string
}

type FileItem = {
  id: string
  title: string
  file_type: string
  file_size: number
  download_count: number
  like_count: number
  created_at: string
  tags: string[] | null
}

type Stats = {
  total_files: number
  total_downloads: number
  total_likes: number
  followers_count: number
  following_count: number
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

const SOFTWARE_COLORS: Record<string, string> = {
  'grandMA3': 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
  'grandMA2': 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30',
  'Capture': 'bg-blue-900/30 text-blue-300 border-blue-700/40',
  'Vectorworks': 'bg-green-900/30 text-green-300 border-green-700/40',
  'Depence': 'bg-purple-900/30 text-purple-300 border-purple-700/40',
  'Wysiwyg': 'bg-red-900/30 text-red-300 border-red-700/40',
  'EOS': 'bg-orange-900/30 text-orange-300 border-orange-700/40',
}

// ---- Main Page ----
export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [stats, setStats] = useState<Stats>({ total_files: 0, total_downloads: 0, total_likes: 0, followers_count: 0, following_count: 0 })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'files' | 'followers' | 'following'>('files')
  const [followers, setFollowers] = useState<Profile[]>([])
  const [following, setFollowing] = useState<Profile[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Session courante
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setCurrentUserId(session.user.id)

      // Profil de la page
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) { setNotFound(true); setLoading(false); return }
      setProfile(profileData)

      // Fichiers de l'utilisateur
      const { data: filesData } = await supabase
        .from('files')
        .select('id, title, file_type, file_size, download_count, like_count, created_at, tags')
        .eq('author_id', profileData.id)
        .eq('is_public', true)
        .eq('is_latest', true)
        .order('created_at', { ascending: false })

      if (filesData) setFiles(filesData)

      // Stats agrégées
      const totalDownloads = (filesData ?? []).reduce((sum, f) => sum + f.download_count, 0)
      const totalLikes = (filesData ?? []).reduce((sum, f) => sum + f.like_count, 0)

      // Followers
      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id, profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)')
        .eq('following_id', profileData.id)

      const followersList = (followersData ?? []).map((f: any) => f.profiles).filter(Boolean)
      setFollowers(followersList)

      // Following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(id, username, display_name, avatar_url)')
        .eq('follower_id', profileData.id)

      const followingList = (followingData ?? []).map((f: any) => f.profiles).filter(Boolean)
      setFollowing(followingList)

      setStats({
        total_files: (filesData ?? []).length,
        total_downloads: totalDownloads,
        total_likes: totalLikes,
        followers_count: followersList.length,
        following_count: followingList.length,
      })

      // Est-ce que je suis déjà cet utilisateur ?
      if (session?.user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', session.user.id)
          .eq('following_id', profileData.id)
          .single()
        setIsFollowing(!!followData)
      }

      setLoading(false)
    }

    fetchData()
  }, [username])

  async function handleFollow() {
    if (!currentUserId || !profile) return
    setFollowLoading(true)

    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', profile.id)
      setIsFollowing(false)
      setStats(s => ({ ...s, followers_count: s.followers_count - 1 }))
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: profile.id,
      })
      setIsFollowing(true)
      setStats(s => ({ ...s, followers_count: s.followers_count + 1 }))
    }

    setFollowLoading(false)
  }

  const isOwnProfile = currentUserId === profile?.id

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">Loading profile...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-zinc-400 text-lg">User not found</p>
        <a href="/" className="text-amber-400 text-sm hover:underline">← Back to home</a>
      </div>
    )
  }

  const avatarInitials = (profile!.display_name ?? profile!.username).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">
            MVR<span className="text-zinc-500">share</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">← Gallery</a>
            {isOwnProfile && (
              <a href="/settings" className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700">
                Edit profile
              </a>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HEADER PROFIL */}
        <div className="flex items-start gap-6 mb-8">

          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile!.avatar_url ? (
              <img
                src={profile!.avatar_url}
                alt={profile!.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-900/40 border-2 border-amber-700/40 flex items-center justify-center text-2xl font-bold text-amber-300 font-mono">
                {avatarInitials}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-100">
                  {profile!.display_name ?? profile!.username}
                </h1>
                <p className="text-zinc-500 font-mono text-sm mt-0.5">@{profile!.username}</p>
              </div>

              {/* Bouton follow */}
              {!isOwnProfile && currentUserId && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-800'
                      : 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
                  }`}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}

              {!isOwnProfile && !currentUserId && (
                <a href="/auth" className="px-5 py-2 rounded-lg text-sm font-medium bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors">
                  Sign in to follow
                </a>
              )}
            </div>

            {/* Bio */}
            {profile!.bio && (
              <p className="text-zinc-300 text-sm mt-3 leading-relaxed max-w-xl">{profile!.bio}</p>
            )}

            {/* Méta */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {profile!.location && (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  📍 {profile!.location}
                </span>
              )}
              {profile!.website && (
                <a href={profile!.website} target="_blank" className="text-xs text-amber-400 hover:underline">
                  🔗 {profile!.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="text-xs text-zinc-600 font-mono">
                Joined {new Date(profile!.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Logiciels */}
            {profile!.software && profile!.software.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {profile!.software.map(sw => (
                  <span
                    key={sw}
                    className={`text-xs px-2.5 py-1 rounded-md border font-mono ${SOFTWARE_COLORS[sw] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                  >
                    {sw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-5 gap-1 mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          {[
            { label: 'Files', value: stats.total_files },
            { label: 'Downloads', value: stats.total_downloads.toLocaleString() },
            { label: 'Likes', value: stats.total_likes },
            { label: 'Followers', value: stats.followers_count },
            { label: 'Following', value: stats.following_count },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-amber-400 font-mono">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
          {(['files', 'followers', 'following'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab} {tab === 'files' ? `(${stats.total_files})` : tab === 'followers' ? `(${stats.followers_count})` : `(${stats.following_count})`}
            </button>
          ))}
        </div>

        {/* TAB FILES */}
        {activeTab === 'files' && (
          <div>
            {files.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <p className="font-mono text-lg mb-2">No files shared yet</p>
                {isOwnProfile && (
                  <a href="/upload" className="text-amber-400 text-sm hover:underline">Upload your first file →</a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map(file => (
                  <div key={file.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-700/50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${TYPE_COLORS[file.file_type] ?? TYPE_COLORS.other}`}>
                        {file.file_type.toUpperCase().slice(0, 4)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
                          {file.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                          {formatSize(file.file_size)} · {timeAgo(file.created_at)}
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB FOLLOWERS */}
        {activeTab === 'followers' && (
          <div>
            {followers.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <p className="font-mono">No followers yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {followers.map((f: any) => (
                  <a
                    key={f.id}
                    href={`/profile/${f.username}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors"
                  >
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.username} className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs font-bold text-amber-300 font-mono">
                        {(f.display_name ?? f.username).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{f.display_name ?? f.username}</p>
                      <p className="text-xs text-zinc-500 font-mono">@{f.username}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB FOLLOWING */}
        {activeTab === 'following' && (
          <div>
            {following.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <p className="font-mono">Not following anyone yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {following.map((f: any) => (
                  <a
                    key={f.id}
                    href={`/profile/${f.username}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors"
                  >
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.username} className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs font-bold text-amber-300 font-mono">
                        {(f.display_name ?? f.username).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{f.display_name ?? f.username}</p>
                      <p className="text-xs text-zinc-500 font-mono">@{f.username}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
