'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

const ACCEPTED_FORMATS = [
  { ext: 'mvr',  label: 'MVR',         category: 'Lighting' },
  { ext: 'gdtf', label: 'GDTF',        category: 'Lighting' },
  { ext: '3ds',  label: '3DS',         category: '3D' },
  { ext: 'obj',  label: 'OBJ',         category: '3D' },
  { ext: 'dxf',  label: 'DXF',         category: '3D' },
  { ext: 'dwg',  label: 'DWG',         category: '3D' },
  { ext: 'glb',  label: 'GLB',         category: '3D' },
  { ext: 'gltf', label: 'GLTF',        category: '3D' },
  { ext: 'exr',  label: 'EXR (HDRI)',  category: 'VFX' },
  { ext: 'blend',label: 'Blender',     category: 'DCC' },
  { ext: 'ma',   label: 'Maya',        category: 'DCC' },
  { ext: 'pdf',  label: 'PDF',         category: 'Docs' },
  { ext: 'xlsx', label: 'Excel',       category: 'Docs' },
  { ext: 'xls',  label: 'Excel (xls)', category: 'Docs' },
]

const VENUE_TYPES = [
  'Concert / Arena', 'Festival / Outdoor', 'Theatre', 'Opera',
  'Club / Nightclub', 'TV / Broadcast', 'Corporate / Event',
  'Exhibition', 'Generic / Template', 'Other',
]

const TYPE_COLORS: Record<string, string> = {
  mvr:   'bg-amber-900/30 text-amber-300 border-amber-700/40',
  gdtf:  'bg-purple-900/30 text-purple-300 border-purple-700/40',
  '3ds': 'bg-blue-900/30 text-blue-300 border-blue-700/40',
  obj:   'bg-blue-900/30 text-blue-300 border-blue-700/40',
  dxf:   'bg-blue-900/30 text-blue-300 border-blue-700/40',
  dwg:   'bg-blue-900/30 text-blue-300 border-blue-700/40',
  glb:   'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  gltf:  'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  exr:   'bg-orange-900/30 text-orange-300 border-orange-700/40',
  blend: 'bg-green-900/30 text-green-300 border-green-700/40',
  ma:    'bg-green-900/30 text-green-300 border-green-700/40',
  pdf:   'bg-red-900/30 text-red-300 border-red-700/40',
  xlsx:  'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
  xls:   'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function getFileExt(filename: string) {
  return filename.split('.').pop()?.toLowerCase() ?? 'other'
}

export default function UploadPage() {
  const [profile, setProfile] = useState<{ id: string; username: string } | null>(null)
  const [notAuth, setNotAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [venueType, setVenueType] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [done, setDone] = useState(false)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setNotAuth(true); setLoading(false); return }
      const { data } = await supabase.from('profiles').select('id, username').eq('id', session.user.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    checkAuth()
  }, [])

  function handleFileSelect(selected: File) {
    const ext = getFileExt(selected.name)
    const accepted = ACCEPTED_FORMATS.find(f => f.ext === ext)
    if (!accepted) {
      setMessage({ type: 'error', text: `Format .${ext} is not supported. Please check the accepted formats below.` })
      return
    }
    if (selected.size > 500 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File is too large. Maximum size is 500 MB.' })
      return
    }
    setFile(selected)
    setMessage(null)
    if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (newTag && !tags.includes(newTag) && tags.length < 10) setTags([...tags, newTag])
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags(tags.slice(0, -1))
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !profile) return
    if (!title.trim()) { setMessage({ type: 'error', text: 'Please add a title.' }); return }

    setUploading(true)
    setProgress(10)
    setMessage(null)

    const ext = getFileExt(file.name)
    const storagePath = `${profile.id}/${Date.now()}_${file.name}`

    setProgress(30)
    const { error: uploadError } = await supabase.storage.from('mvr-files').upload(storagePath, file, { upsert: false })

    if (uploadError) {
      setMessage({ type: 'error', text: 'Upload failed: ' + uploadError.message })
      setUploading(false); setProgress(0); return
    }

    setProgress(70)
    const { data: urlData } = supabase.storage.from('mvr-files').getPublicUrl(storagePath)

    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert({
        author_id: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        file_type: ext,
        file_name: file.name,
        file_size: file.size,
        storage_path: storagePath,
        download_url: urlData.publicUrl,
        venue_type: venueType || null,
        tags: tags.length > 0 ? tags : null,
        license: 'cc_by',
        is_public: true,
        is_latest: true,
        version: '1.0',
      })
      .select('id')
      .single()

    setProgress(100)

    if (dbError) {
      setMessage({ type: 'error', text: 'Database error: ' + dbError.message })
      setUploading(false); setProgress(0); return
    }

    setUploadedFileId(fileData.id)
    setDone(true)
    setUploading(false)
  }

  const fileExt = file ? getFileExt(file.name) : null
  const fileColor = fileExt ? (TYPE_COLORS[fileExt] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700') : ''

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500 font-mono text-sm animate-pulse">Loading...</div>
    </div>
  )

  if (notAuth) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-400">You need to be signed in to upload files.</p>
      <a href="/auth" className="bg-amber-400 text-zinc-950 font-medium px-5 py-2 rounded-lg hover:bg-amber-300 transition-colors text-sm">Sign in</a>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-900/30 border border-green-700/40 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-2">File uploaded successfully!</h2>
        <p className="text-zinc-400 text-sm">Your file is now available in the gallery.</p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <a href={`/files/${uploadedFileId}`} className="bg-amber-400 text-zinc-950 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors text-sm">View file page</a>
        <button onClick={() => { setDone(false); setFile(null); setTitle(''); setDescription(''); setVenueType(''); setTags([]); setProgress(0) }} className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg hover:border-zinc-500 transition-colors text-sm">Upload another</button>
        <a href="/" className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg hover:border-zinc-500 transition-colors text-sm">Back to gallery</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">MVR<span className="text-zinc-500">share</span></a>
          <a href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">← Gallery</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-mono text-amber-400 tracking-widest mb-1">// upload</p>
          <h1 className="text-2xl font-medium">Share a file</h1>
          <p className="text-zinc-500 text-sm mt-1">Share your MVR scenes, GDTF patches, 3D files, lighting plans, or patch sheets with the community.</p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-6">

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-amber-500 bg-amber-900/10' :
              file ? 'border-zinc-700 bg-zinc-900 cursor-default' :
              'border-zinc-700 hover:border-zinc-500 bg-zinc-900 cursor-pointer'
            }`}
          >
            {file ? (
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold font-mono border flex-shrink-0 ${fileColor}`}>
                  {fileExt?.toUpperCase().slice(0, 4)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{formatSize(file.size)}</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setTitle('') }} className="text-zinc-500 hover:text-red-400 transition-colors text-lg flex-shrink-0">✕</button>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-3">📁</div>
                <p className="text-zinc-300 font-medium mb-1">Drop your file here</p>
                <p className="text-zinc-500 text-sm">or click to browse · Max 500 MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }} className="hidden" accept=".mvr,.gdtf,.3ds,.obj,.dxf,.dwg,.glb,.gltf,.exr,.blend,.ma,.pdf,.xlsx,.xls" />
          </div>

          {/* Formats */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-mono text-zinc-500 mb-3 uppercase tracking-wider">Accepted formats</p>
            {['Lighting', '3D', 'VFX', 'DCC', 'Docs'].map(cat => (
              <div key={cat} className="mb-2 flex items-start gap-2">
                <span className="text-xs text-zinc-600 w-16 flex-shrink-0 font-mono pt-0.5">{cat}</span>
                <div className="flex flex-wrap gap-1.5">
                  {ACCEPTED_FORMATS.filter(f => f.category === cat).map(f => (
                    <span key={f.ext} className={`text-xs px-2 py-0.5 rounded font-mono border ${TYPE_COLORS[f.ext] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>.{f.ext}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Métadonnées */}
          {file && (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-medium text-zinc-300">File details</h2>
                <div>
                  <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Title <span className="text-red-400">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Coldplay Stadium — Full MVR Scene" maxLength={200} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the file — software used, fixture count, show context, known limitations..." maxLength={2000} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                  <p className="text-xs text-zinc-600 mt-1 text-right">{description.length}/2000</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-sm font-medium text-zinc-300 mb-1">Venue type</h2>
                <p className="text-xs text-zinc-500 mb-4">What kind of venue or show is this file for?</p>
                <div className="flex flex-wrap gap-2">
                  {VENUE_TYPES.map(v => (
                    <button key={v} type="button" onClick={() => setVenueType(venueType === v ? '' : v)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${venueType === v ? 'bg-amber-400 text-zinc-950 border-amber-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-sm font-medium text-zinc-300 mb-1">Tags</h2>
                <p className="text-xs text-zinc-500 mb-3">Press Enter or comma to add · Max 10 tags</p>
                <div className="flex flex-wrap gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 min-h-[44px] focus-within:border-amber-500 transition-colors">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded font-mono">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-zinc-400 hover:text-red-400 transition-colors">✕</button>
                    </span>
                  ))}
                  {tags.length < 10 && (
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={tags.length === 0 ? 'grandma3, robe, festival...' : ''} className="bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none flex-1 min-w-24" />
                  )}
                </div>
              </div>

              {uploading && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">Uploading...</span>
                    <span className="text-xs font-mono text-zinc-500">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {message && (
                <div className={`text-sm px-4 py-3 rounded-lg ${message.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-green-900/30 text-green-400 border border-green-800'}`}>
                  {message.text}
                </div>
              )}

              <p className="text-xs text-zinc-600 leading-relaxed">
                By uploading, you confirm that you hold the necessary rights to share this file and that it complies with our{' '}
                <a href="/terms" target="_blank" className="text-zinc-500 hover:text-amber-400 transition-colors">Terms and Conditions</a>.
                All third-party trademarks remain the property of their respective owners.
              </p>

              <div className="flex items-center justify-between">
                <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</a>
                <button type="submit" disabled={uploading || !title.trim()} className="bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 text-sm">
                  {uploading ? 'Uploading...' : 'Publish file'}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  )
}
