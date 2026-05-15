'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const SOFTWARE_OPTIONS = [
  'grandMA3', 'grandMA2', 'Capture', 'Vectorworks', 'Depence',
  'Wysiwyg', 'EOS', 'Hog4', 'Chamsys', 'Resolume', 'Madmapper'
]

type Profile = {
  id: string
  username: string
  display_name: string | null
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [notAuth, setNotAuth] = useState(false)

  // Champs du formulaire
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [software, setSoftware] = useState<string[]>([])

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
        setDisplayName(data.display_name ?? '')
        setBio(data.bio ?? '')
        setLocation(data.location ?? '')
        setWebsite(data.website ?? '')
        setSoftware(data.software ?? [])
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        software: software.length > 0 ? software : null,
      })
      .eq('id', profile!.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }

    setSaving(false)
  }

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

      {/* NAV */}
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
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-900/40 border-2 border-amber-700/40 flex items-center justify-center text-xl font-bold text-amber-300 font-mono">
                  {(displayName || profile?.username || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-300">
                  {profile?.avatar_url ? 'Avatar synced from your OAuth provider' : 'No avatar yet'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Your avatar is automatically pulled from GitHub, Google, or Discord when you sign in with OAuth.
                </p>
              </div>
            </div>
          </div>

          {/* Infos de base */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-zinc-300">Basic info</h2>

            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Username</label>
              <input
                type="text"
                value={profile?.username ?? ''}
                disabled
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-500 font-mono cursor-not-allowed"
              />
              <p className="text-xs text-zinc-600 mt-1">Username cannot be changed for now.</p>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your full name or alias"
                maxLength={60}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

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
            <h2 className="text-sm font-medium text-zinc-300 mb-1">Software</h2>
            <p className="text-xs text-zinc-500 mb-4">Select the lighting software you use.</p>
            <div className="flex flex-wrap gap-2">
              {SOFTWARE_OPTIONS.map(sw => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => toggleSoftware(sw)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                    software.includes(sw)
                      ? 'bg-amber-400 text-zinc-950 border-amber-400'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
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
              disabled={saving}
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
