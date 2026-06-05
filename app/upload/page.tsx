'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

// ---- Config ----
const FILE_FORMATS = [
  { ext: 'mvr',  label: 'MVR',  category: '3D' },
  { ext: 'fbx',  label: 'FBX',  category: '3D' },
  { ext: 'skp',  label: 'SKP',  category: '3D' },
  { ext: 'glb',  label: 'GLB',  category: '3D' },
  { ext: 'gltf', label: 'GLTF', category: '3D' },
  { ext: 'obj',  label: 'OBJ',  category: '3D' },
  { ext: 'dwg',  label: 'DWG',  category: '3D' },
  { ext: 'dxf',  label: 'DXF',  category: '3D' },
  { ext: '3ds',  label: '3DS',  category: '3D' },
  { ext: 'gdtf', label: 'GDTF', category: 'Fixture' },
  { ext: 'exr',  label: 'EXR',  category: 'HDRI' },
  { ext: 'pdf',  label: 'PDF',  category: 'Doc' },
  { ext: 'xlsx', label: 'Excel',category: 'Doc' },
  { ext: 'xls',  label: 'Excel (xls)', category: 'Doc' },
]


const VENUE_TYPES = [
  'Stadium',
  'Concert / Arena',
  'Festival / Outdoor',
  'Theatre / Opera',
  'Event / Corporate',
  'Club / DJ',
  'TV / Broadcast',
  'Exhibition',
  'Architectural',
  'House of Worship',
  'Generic / Template',
  'Assets',
]

const LICENSES = [
  {
    id: 'cc_by',
    label: 'CC BY',
    badge: 'Recommanded',
    description: 'Others can use, share and adapt your file, even commercially, as long as they credit you.',
    color: 'border-amber-500 bg-amber-900/20',
    badgeColor: 'bg-amber-400 text-zinc-950',
  },
  {
    id: 'cc_by_nc',
    label: 'CC BY-NC',
    badge: 'Non-commercial',
    description: 'Others can use and share your file for non-commercial purposes only, with credit.',
    color: 'border-blue-500 bg-blue-900/20',
    badgeColor: 'bg-blue-400 text-zinc-950',
  },
  {
    id: 'cc0',
    label: 'CC0',
    badge: 'Public Domain',
    description: 'You waive all rights. Anyone can use your file for any purpose, no credit required.',
    color: 'border-green-500 bg-green-900/20',
    badgeColor: 'bg-green-400 text-zinc-950',
  },
]

const TYPE_COLORS: Record<string, string> = {
  mvr:   'bg-amber-900/30 text-amber-300 border-amber-700/40',
  fbx:   'bg-rose-900/30 text-rose-300 border-rose-700/40',
  skp:   'bg-teal-900/30 text-teal-300 border-teal-700/40',
  glb:   'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  gltf:  'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  obj:   'bg-blue-900/30 text-blue-300 border-blue-700/40',
  dwg:   'bg-violet-900/30 text-violet-300 border-violet-700/40',
  dxf:   'bg-indigo-900/30 text-indigo-300 border-indigo-700/40',
  '3ds': 'bg-orange-900/30 text-orange-300 border-orange-700/40',
  gdtf:  'bg-purple-900/30 text-purple-300 border-purple-700/40',
  exr:   'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
  pdf:   'bg-red-900/30 text-red-300 border-red-700/40',
  xlsx:  'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
  xls:   'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
  jpg:   'bg-pink-900/30 text-pink-300 border-pink-700/40',
  jpeg:  'bg-pink-900/30 text-pink-300 border-pink-700/40',
  png:   'bg-pink-900/30 text-pink-300 border-pink-700/40',
  webp:  'bg-pink-900/30 text-pink-300 border-pink-700/40',
  mp4:   'bg-violet-900/30 text-violet-300 border-violet-700/40',
  mov:   'bg-violet-900/30 text-violet-300 border-violet-700/40',
  blend: 'bg-green-900/30 text-green-300 border-green-700/40',
  ma:    'bg-lime-900/30 text-lime-300 border-lime-700/40',
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function getFileExt(filename: string) {
  return filename.split('.').pop()?.toLowerCase() ?? 'other'
}

function isImageFile(ext: string) {
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
}

function isVideoFile(ext: string) {
  return ['mp4', 'mov'].includes(ext)
}

function isMediaFile(ext: string) {
  return isImageFile(ext) || isVideoFile(ext)
}

function isProjectFile(ext: string) {
  return FILE_FORMATS.some(f => f.ext === ext)
}

type UploadedFile = {
  file: File
  ext: string
  id: string
}

export default function UploadPage() {
  const [profile, setProfile] = useState<{ id: string; username: string } | null>(null)
  const [notAuth, setNotAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fichiers projet (MVR, PDF, etc.)
  const [projectFiles, setProjectFiles] = useState<UploadedFile[]>([])
  // Médias (photos + vidéos)
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([])

  const [dragOverProject, setDragOverProject] = useState(false)
  const [dragOverMedia, setDragOverMedia] = useState(false)
  const projectInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  // Formulaire
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [venueType, setVenueType] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [license, setLicense] = useState('cc_by')
  const [acceptedRights, setAcceptedRights] = useState(false)

  // Upload
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
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

  function addProjectFiles(newFiles: FileList | null) {
    if (!newFiles) return
    const valid: UploadedFile[] = []
    Array.from(newFiles).forEach(f => {
      const ext = getFileExt(f.name)
      if (!isProjectFile(ext)) {
        setMessage({ type: 'error', text: `Format .${ext} is not supported as a project file.` })
        return
      }
      valid.push({ file: f, ext, id: Math.random().toString(36).slice(2) })
    })
    setProjectFiles(prev => [...prev, ...valid])
    if (valid.length > 0 && !title) {
      setTitle(valid[0].file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '))
    }
    setMessage(null)
  }

  function addMediaFiles(newFiles: FileList | null) {
    if (!newFiles) return
    const valid: UploadedFile[] = []
    Array.from(newFiles).forEach(f => {
      const ext = getFileExt(f.name)
      if (!isMediaFile(ext)) {
        setMessage({ type: 'error', text: `Format .${ext} is not supported as a media file.` })
        return
      }
      valid.push({ file: f, ext, id: Math.random().toString(36).slice(2) })
    })
    setMediaFiles(prev => [...prev, ...valid])
    setMessage(null)
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
    if (!profile) return
    if (projectFiles.length === 0) { setMessage({ type: 'error', text: 'Please add at least one project file.' }); return }
    if (!title.trim()) { setMessage({ type: 'error', text: 'Please add a title.' }); return }
    if (!acceptedRights) { setMessage({ type: 'error', text: 'Please confirm you hold the rights to publish this content.' }); return }

    setUploading(true)
    setMessage(null)

    const primaryExt = projectFiles[0].ext
    const totalFiles = projectFiles.length + mediaFiles.length
    let uploaded = 0

    const storedProjectPaths: string[] = []
    const storedMediaUrls: string[] = []

    // Upload fichiers projet
    for (const pf of projectFiles) {
      setProgressLabel(`Uploading ${pf.file.name}...`)
      setProgress(Math.round((uploaded / totalFiles) * 80))
      const path = `${profile.id}/${Date.now()}_${pf.file.name}`
      const { error } = await supabase.storage.from('mvr-files').upload(path, pf.file, { upsert: false })
      if (error) {
        setMessage({ type: 'error', text: `Failed to upload ${pf.file.name}: ${error.message}` })
        setUploading(false); setProgress(0); return
      }
      storedProjectPaths.push(path)
      uploaded++
    }

    // Upload médias
    for (const mf of mediaFiles) {
      setProgressLabel(`Uploading ${mf.file.name}...`)
      setProgress(Math.round((uploaded / totalFiles) * 80))
      const path = `${profile.id}/media/${Date.now()}_${mf.file.name}`
      const { error } = await supabase.storage.from('mvr-files').upload(path, mf.file, { upsert: false })
      if (error) {
        setMessage({ type: 'error', text: `Failed to upload ${mf.file.name}: ${error.message}` })
        setUploading(false); setProgress(0); return
      }
      const { data: urlData } = supabase.storage.from('mvr-files').getPublicUrl(path)
      storedMediaUrls.push(urlData.publicUrl)
      uploaded++
    }

    setProgress(85)
    setProgressLabel('Saving to database...')

    // URL publique du fichier principal
    const { data: urlData } = supabase.storage.from('mvr-files').getPublicUrl(storedProjectPaths[0])

    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert({
        author_id: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        file_type: primaryExt,
        file_name: projectFiles[0].file.name,
        file_size: projectFiles.reduce((sum, f) => sum + f.file.size, 0),
        storage_path: storedProjectPaths[0],
        download_url: urlData.publicUrl,
        venue_type: venueType || null,
        tags: tags.length > 0 ? tags : null,
        license: license as any,
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

  function resetForm() {
    setDone(false); setProjectFiles([]); setMediaFiles([])
    setTitle(''); setDescription(''); setVenueType('')
    setTags([]); setLicense('cc_by'); setAcceptedRights(false)
    setProgress(0); setUploadedFileId(null)
  }

  const hasFiles = projectFiles.length > 0

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
        <div className="w-16 h-16 bg-green-900/30 border border-green-700/40 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-2">Project uploaded successfully!</h2>
        <p className="text-zinc-400 text-sm">Your project is now available in the gallery.</p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <a href={`/files/${uploadedFileId}`} className="bg-amber-400 text-zinc-950 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition-colors text-sm">View project page</a>
        <button onClick={resetForm} className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg hover:border-zinc-500 transition-colors text-sm">Upload another</button>
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
          <h1 className="text-2xl font-medium">Share a project</h1>
          <p className="text-zinc-500 text-sm mt-1">Upload your files and share your work with the community.</p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-6">

          {/* ---- FICHIERS PROJET ---- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-1">Project files <span className="text-red-400">*</span></h2>
            <p className="text-xs text-zinc-500 mb-4">Add one or more files </p>

            {/* Zone drop */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOverProject(true) }}
              onDragLeave={() => setDragOverProject(false)}
              onDrop={e => { e.preventDefault(); setDragOverProject(false); addProjectFiles(e.dataTransfer.files) }}
              onClick={() => projectInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-14 px-8 text-center cursor-pointer transition-colors mb-3 ${dragOverProject ? 'border-amber-500 bg-amber-900/10' : 'border-zinc-700 hover:border-zinc-500'}`}
            >
              <div className="text-4xl mb-4">📁</div>
              <p className="text-zinc-200 font-medium mb-1">Drop your files here</p>
              <p className="text-zinc-400 text-sm mb-3">or <span className="text-amber-400 hover:underline">browse your computer</span></p>
              <input ref={projectInputRef} type="file" multiple onChange={e => addProjectFiles(e.target.files)} className="hidden"
                accept=".mvr,.fbx,.skp,.glb,.gltf,.obj,.dwg,.dxf,.3ds,.gdtf,.exr,.pdf,.xlsx,.xls" />
            </div>

            {/* Liste des fichiers */}
            {projectFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                {projectFiles.map(pf => (
                  <div key={pf.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2.5">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold font-mono border flex-shrink-0 ${TYPE_COLORS[pf.ext] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                      {pf.ext.toUpperCase().slice(0, 4)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-100 truncate">{pf.file.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{formatSize(pf.file.size)}</p>
                    </div>
                    <button type="button" onClick={() => setProjectFiles(prev => prev.filter(f => f.id !== pf.id))} className="text-zinc-500 hover:text-red-400 transition-colors text-base flex-shrink-0">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Formats acceptés */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs font-mono text-zinc-600 mb-2 uppercase tracking-wider">Accepted formats</p>
              {['3D', 'Fixture', 'HDRI', 'Doc'].map(cat => (
                <div key={cat} className="mb-1.5 flex items-start gap-2">
                  <span className="text-xs text-zinc-600 w-16 flex-shrink-0 font-mono pt-0.5">{cat}</span>
                  <div className="flex flex-wrap gap-1">
                    {FILE_FORMATS.filter(f => f.category === cat).map(f => (
                      <span key={f.ext} className={`text-xs px-1.5 py-0.5 rounded font-mono border ${TYPE_COLORS[f.ext] ?? 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>.{f.ext}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- MÉTADONNÉES (si au moins un fichier) ---- */}
          {hasFiles && (
            <>
              {/* Titre + description */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-medium text-zinc-300">Project details</h2>
                <div>
                  <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Title <span className="text-red-400">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Coldplay Stadium — Full MVR Scene" maxLength={200} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-mono mb-1.5 block">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Software used, fixture count, show context, known limitations..." maxLength={2000} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                  <p className="text-xs text-zinc-600 mt-1 text-right">{description.length}/2000</p>
                </div>
              </div>

              {/* ---- MÉDIAS ---- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-1">Medias <span className="text-zinc-600"> </span></h2>
            <p className="text-xs text-zinc-500 mb-4">Add photos or a video of your show or project. Accepted: JPG, PNG, WEBP, MP4, MOV.</p>

            <div
              onDragOver={e => { e.preventDefault(); setDragOverMedia(true) }}
              onDragLeave={() => setDragOverMedia(false)}
              onDrop={e => { e.preventDefault(); setDragOverMedia(false); addMediaFiles(e.dataTransfer.files) }}
              onClick={() => mediaInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors mb-3 ${dragOverMedia ? 'border-amber-500 bg-amber-900/10' : 'border-zinc-700 hover:border-zinc-500'}`}
            >
              <p className="text-zinc-400 text-sm">Drop photos or videos here or <span className="text-amber-400">browse</span></p>
              <input ref={mediaInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.mp4,.mov" onChange={e => addMediaFiles(e.target.files)} className="hidden" />
            </div>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaFiles.map(mf => (
                  <div key={mf.id} className="relative group">
                    {isImageFile(mf.ext) ? (
                      <img src={URL.createObjectURL(mf.file)} alt={mf.file.name} className="w-full h-24 object-cover rounded-lg border border-zinc-700" />
                    ) : (
                      <div className={`w-full h-24 rounded-lg border flex items-center justify-center ${TYPE_COLORS[mf.ext] ?? 'bg-zinc-800 border-zinc-700'}`}>
                        <span className="text-xs font-mono font-bold">.{mf.ext}</span>
                      </div>
                    )}
                    <button type="button" onClick={() => setMediaFiles(prev => prev.filter(f => f.id !== mf.id))} className="absolute top-1 right-1 w-5 h-5 bg-zinc-900/80 rounded-full text-zinc-400 hover:text-red-400 transition-colors text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

              {/* Venue type */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-sm font-medium text-zinc-300 mb-4">Stage / Venue type</h2>
                <div className="flex flex-wrap gap-2">
                  {VENUE_TYPES.map(v => (
                    <button key={v} type="button" onClick={() => setVenueType(venueType === v ? '' : v)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${venueType === v ? 'bg-amber-400 text-zinc-950 border-amber-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'}`}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Tags */}
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

              {/* License */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-sm font-medium text-zinc-300 mb-1">License</h2>
                <p className="text-xs text-zinc-500 mb-4">Choose how others can use your file.</p>
                <div className="flex flex-col gap-3">
                  {LICENSES.map(l => (
                    <label key={l.id} className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${license === l.id ? l.color : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}>
                      <input type="radio" name="license" value={l.id} checked={license === l.id} onChange={() => setLicense(l.id)} className="mt-0.5 flex-shrink-0 accent-amber-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-zinc-100 font-mono">{l.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${l.badgeColor}`}>{l.badge}</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{l.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {uploading && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">{progressLabel}</span>
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

              {/* Case à cocher droits */}
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={acceptedRights}
                  onChange={e => setAcceptedRights(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-amber-400 focus:ring-amber-500 flex-shrink-0 cursor-pointer"
                />
                <span className="text-xs text-zinc-400 leading-relaxed">
                  I confirm that I hold all necessary rights to publish this content and that it complies with
                  the MVRshare{' '}
                  <a href="/terms" target="_blank" className="text-amber-400 hover:underline">Terms and Conditions</a>.
                  I understand that uploading content I do not own the rights to may result in account suspension.
                  All third-party trademarks and manufacturer names remain the property of their respective owners.
                  <span className="text-red-400"> *</span>
                </span>
              </label>

              {/* Submit */}
              <div className="flex items-center justify-between">
                <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</a>
                <button
                  type="submit"
                  disabled={uploading || !title.trim() || !acceptedRights}
                  className="bg-amber-400 text-zinc-950 font-medium px-6 py-2.5 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 text-sm"
                >
                  {uploading ? 'Uploading...' : 'Publish project'}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  )
}
