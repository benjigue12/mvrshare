'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

export const SOFTWARE_OPTIONS = [
  'grandMA3', 'grandMA2', 'Capture', 'Vectorworks', 'Depence',
  'Wysiwyg', 'EOS', 'Hog4', 'Chamsys', 'Avolites',
  'Resolume', 'Madmapper', 'Smode', 'Millumin'
]

export const SOFTWARE_COLORS: Record<string, string> = {
  'grandMA3':   'bg-zinc-900 text-white border-white/30',
  'grandMA2':   'bg-yellow-400 text-zinc-900 border-yellow-300',
  'Capture':    'bg-lime-500 text-zinc-900 border-lime-400',
  'Vectorworks':'bg-cyan-500 text-zinc-900 border-cyan-400',
  'Depence':    'bg-indigo-400 text-zinc-900 border-indigo-300',
  'Wysiwyg':    'bg-orange-500 text-zinc-900 border-orange-400',
  'EOS':        'bg-violet-600 text-white border-violet-400',
  'Hog4':       'bg-fuchsia-500 text-white border-fuchsia-400',
  'Chamsys':    'bg-blue-800 text-white border-blue-600',
  'Avolites':   'bg-red-600 text-white border-red-400',
  'Resolume':   'bg-emerald-600 text-white border-emerald-400',
  'Madmapper':  'bg-zinc-500 text-white border-zinc-400',
  'Smode':      'bg-blue-500 text-white border-blue-400',
  'Millumin':   'bg-pink-500 text-white border-pink-400',
}

type Profile = {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  website: string | null
  software: string[] | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [notAuth, setNotAuth] = useState(false)

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [software, setSoftware] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setNotAuth(true); setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile(data)
        setUsername(data.username ?? '')
        setFirstName(data.first_name ?? '')
        setLastName(data.last_name ?? '')
        setBio(data.bio ?? '')
        setLocation(data.location ?? '')
        setWebsite(data.website ?? '')
        setSoftware(data.software ?? [])
        setAvatarUrl(data.avatar_url ?? null)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  function toggleSoftware(sw: string) {
    setSoftware(prev =>
      prev.includes(sw) ? prev.filter(s => s !== sw) : [...prev, sw]
    )
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    setUploadingAvatar(true)
    setMessage(null)

    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('mvr-files')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setMessage({ type: 'error', text: 'Failed to upload avatar: ' + uploadError.message })
      setAvatarPreview(null)
      setUploadingAvatar(false)
      return
    }

    const { data: urlData } = supabase.storage.from('mvr-files').getPublicUrl(path)
    const newUrl = urlData.publicUrl + '?t=' + Date.now()
    setAvatarUrl(newUrl)
    await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', profile.id)
    setUploadingAvatar(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (username !== profile?.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (existing) {
        setMessage({ type: 'error', text: 'This username is already taken.' })
        setSaving(false)
        return
      }
    }

    const newUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '_')

    const { error } = await supabase
      .from('profiles')
      .update({
        username: newUsername,
        first_name: firstName || null,
        last_name: lastName || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        software: software.length > 0 ? software : null,
      })
      .eq('id', profile!.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setSaving(false)
      return
    }

    setMessage({ type: 'success', text: 'Profile saved!' })
    setTimeout(() => {
      window.location.href = `/profile/${newUsername}`
    }, 1200)

    setSaving(false)
  }

  const displayAvatar = avatarPreview ?? avatarUrl
  const initials = ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')) || username.slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">Loading...</div>
      </div>
    )
  }

  if (notAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">You need to be signed in to access settings.</p>
        <a href="/auth" className="text-amber-400 hover:underline text-sm">Sign in →</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">
            MVR<span className="text-zinc-500">share</span>
          </a>
          <a href={`/profile/${profile?.username}`} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            ← My profile
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-mono text-amber-400 tracking-widest mb-1">// settings</p>
          <h1 className="text-2xl font-medium">Edit profile</h1>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* Avatar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">Avatar</h2>
            <div className="flex items-center gap-5">
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar" className={`w-20 h-20 rounded-full object-cover border-2 border-zinc-700 ${uploadingAvatar ? 'opacity-50' : ''}`} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-amber-900/40 border-2 border-amber-700/40 flex items-center justify-center text-2xl font-bold text-amber-300 font-mono">
                  {initials}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-sm bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                </button>
                <p className="text-xs text-zinc-600">JPG, PNG or WEBP · Max 5 MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
            </div>
          </div>

          {/* Infos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-zinc-300">Info</h2>

            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 font-mono mb-1.5 block">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Benjamin"
                  maxLength={50}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Dupont"
                  maxLength={50}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={30}
                  minLength={3}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <p className="text-xs text-zinc-600 mt-1">Lowercase letters, numbers and underscores only.</p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell the community about yourself — your experience, specialties, favorite shows..."
                maxLength={300}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{bio.length}/300</p>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Paris, FR"
                maxLength={60}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Website */}
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Logiciels */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">Software</h2>
            <div className="flex flex-wrap gap-2">
              {SOFTWARE_OPTIONS.map(sw => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => toggleSoftware(sw)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                    software.includes(sw)
                      ? SOFTWARE_COLORS[sw]
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {sw}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`text-sm px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900/30 text-green-400 border border-green-800'
                : 'bg-red-900/30 text-red-400 border border-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Save */}
          <div className="flex items-center justify-between">
            <a href={`/profile/${profile?.username}`} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancel
            </a>
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
