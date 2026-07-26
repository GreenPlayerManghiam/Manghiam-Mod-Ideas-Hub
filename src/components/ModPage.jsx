import { useState, useEffect } from 'react'
import { toggleFeaturedInStorage } from './AppPersistence'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'

export default function ModPage({
  mod,
  onBackToHome,
  onDownload,
  onRate,
  currentUser,
  onToggleFeature,
}) {
  const activeUser =
    currentUser ||
    localStorage.getItem('modhub_current_user') ||
    localStorage.getItem('currentUser') ||
    'GuestUser'

  const isFounder = activeUser.toLowerCase() === 'manghiam'

  // All hooks must be called before any conditional return
  const [likes, setLikes] = useState(mod?.likes || 0)
  const [dislikes, setDislikes] = useState(mod?.dislikes || 0)
  const [userVote, setUserVote] = useState(null)
  const [userRating, setUserRating] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const [isFeatured, setIsFeatured] = useState(() => {
    if (!mod) return false
    try {
      const overrides = JSON.parse(localStorage.getItem('modhub_featured_overrides') || '{}')
      if (Object.prototype.hasOwnProperty.call(overrides, mod.id)) return overrides[mod.id]
    } catch {}
    return mod.featured || false
  })

  const [comments, setComments] = useState(() => {
    if (!mod) return []
    const map = JSON.parse(localStorage.getItem('modhub_mod_comments') || '{}')
    return map[mod.id] || []
  })

  const [newCommentText, setNewCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editText, setEditText] = useState('')

  const [isSaved, setIsSaved] = useState(() => {
    if (!mod) return false
    const collections = JSON.parse(localStorage.getItem('modhub_collections') || '[]')
    return collections.some((m) => m.id === mod.id)
  })

  // Load ratings on mount
  useEffect(() => {
    if (!mod) return
    const allRatings = JSON.parse(localStorage.getItem('modhub_mod_ratings') || '{}')
    setUserRating(allRatings[mod.id]?.[activeUser] || null)
  }, [mod?.id, activeUser])

  // Load persisted votes
  useEffect(() => {
    if (!mod) return
    const allVotes = JSON.parse(localStorage.getItem('modhub_mod_votes') || '{}')
    const modVotes = allVotes[mod.id]
    if (modVotes) {
      setLikes(modVotes.likes ?? mod.likes ?? 0)
      setDislikes(modVotes.dislikes ?? mod.dislikes ?? 0)
      setUserVote(modVotes.userVotes?.[activeUser] || null)
    } else {
      setLikes(mod.likes || 0)
      setDislikes(mod.dislikes || 0)
      setUserVote(null)
    }
  }, [mod?.id, activeUser])

  // Persist comments
  useEffect(() => {
    if (!mod) return
    const map = JSON.parse(localStorage.getItem('modhub_mod_comments') || '{}')
    map[mod.id] = comments
    localStorage.setItem('modhub_mod_comments', JSON.stringify(map))
  }, [comments, mod?.id])

  // Guard moved after all hooks
  if (!mod) return null

  // Support both Supabase schema and mock static schema seamlessly
  const rawImages =
    (mod.gallery_images && mod.gallery_images.length > 0 && mod.gallery_images) ||
    (mod.images && mod.images.length > 0 && mod.images) ||
    [mod.cover_image || mod.image || PLACEHOLDER_IMAGE]

  const images = rawImages.filter(Boolean)

  const authorName =
    typeof mod.author === 'string'
      ? mod.author
      : mod.author?.username || 'Community Modder'

  const gameTitle = mod.gameName || mod.game?.name || mod.game || 'Game Mod'

  const persistVotes = (newLikes, newDislikes, newVote) => {
    const allVotes = JSON.parse(localStorage.getItem('modhub_mod_votes') || '{}')
    if (!allVotes[mod.id]) allVotes[mod.id] = { likes: 0, dislikes: 0, userVotes: {} }
    allVotes[mod.id].likes = newLikes
    allVotes[mod.id].dislikes = newDislikes
    allVotes[mod.id].userVotes[activeUser] = newVote
    localStorage.setItem('modhub_mod_votes', JSON.stringify(allVotes))
  }

  const handleLike = () => {
    const newLikes = userVote === 'like' ? likes - 1 : likes + 1
    const newDislikes = userVote === 'dislike' ? dislikes - 1 : dislikes
    const newVote = userVote === 'like' ? null : 'like'
    setLikes(newLikes)
    setDislikes(newDislikes)
    setUserVote(newVote)
    persistVotes(newLikes, newDislikes, newVote)
  }

  const handleDislike = () => {
    const newDislikes = userVote === 'dislike' ? dislikes - 1 : dislikes + 1
    const newLikes = userVote === 'like' ? likes - 1 : likes
    const newVote = userVote === 'dislike' ? null : 'dislike'
    setLikes(newLikes)
    setDislikes(newDislikes)
    setUserVote(newVote)
    persistVotes(newLikes, newDislikes, newVote)
  }

  const handleStarClick = (star) => {
    const allRatings = JSON.parse(localStorage.getItem('modhub_mod_ratings') || '{}')
    if (!allRatings[mod.id]) allRatings[mod.id] = {}
    let newScore = allRatings[mod.id][activeUser] === star ? null : star
    if (newScore === null) delete allRatings[mod.id][activeUser]
    else allRatings[mod.id][activeUser] = star
    localStorage.setItem('modhub_mod_ratings', JSON.stringify(allRatings))
    setUserRating(newScore)
    if (onRate) onRate(mod.id, newScore)
  }

  const handleToggleFeature = () => {
    const newState = toggleFeaturedInStorage(mod.id, isFeatured)
    setIsFeatured(newState)
    if (onToggleFeature) onToggleFeature(mod.id, newState)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    setComments([
      {
        id: Date.now(),
        author: activeUser,
        text: newCommentText,
        time: 'Just now',
        likes: 0,
        dislikes: 0,
        userVote: null,
        replies: [],
      },
      ...comments,
    ])
    setNewCommentText('')
  }

  const handleDeleteComment = (id) => setComments(comments.filter((c) => c.id !== id))

  const handleEditSave = (id) => {
    if (!editText.trim()) return
    setComments(comments.map((c) => (c.id === id ? { ...c, text: editText } : c)))
    setEditingCommentId(null)
    setEditText('')
  }

  const handleCommentVote = (id, type) => {
    setComments(
      comments.map((c) => {
        if (c.id !== id) return c
        let l = c.likes,
          d = c.dislikes,
          v = type
        if (c.userVote === type) {
          type === 'like' ? l-- : d--
          v = null
        } else {
          type === 'like' ? l++ : d++
          if (c.userVote === 'like') l--
          if (c.userVote === 'dislike') d--
        }
        return { ...c, likes: l, dislikes: d, userVote: v }
      })
    )
  }

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                { id: Date.now(), author: activeUser, text: replyText, time: 'Just now' },
              ],
            }
          : c
      )
    )
    setReplyingTo(null)
    setReplyText('')
  }

  const handleDeleteReply = (commentId, replyId) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) } : c
      )
    )
  }

  const handleToggleCollection = () => {
    const collections = JSON.parse(localStorage.getItem('modhub_collections') || '[]')
    if (isSaved) {
      localStorage.setItem(
        'modhub_collections',
        JSON.stringify(collections.filter((m) => m.id !== mod.id))
      )
      setIsSaved(false)
    } else {
      collections.push(mod)
      localStorage.setItem('modhub_collections', JSON.stringify(collections))
      setIsSaved(true)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={onBackToHome}
        className="mb-6 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
      >
        &larr; Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-raised shadow-2xl">
            <img
              src={images[galleryIndex] || PLACEHOLDER_IMAGE}
              alt={`${mod.title || 'Mod'} — image ${galleryIndex + 1}`}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = PLACEHOLDER_IMAGE
              }}
              className="w-full h-[400px] object-cover transition-opacity duration-300"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black/60 text-white text-lg hover:bg-black/80 cursor-pointer transition backdrop-blur-sm"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black/60 text-white text-lg hover:bg-black/80 cursor-pointer transition backdrop-blur-sm"
                >
                  ›
                </button>
                {/* Thumbnail strip */}
                <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent overflow-x-auto scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`shrink-0 h-12 w-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        i === galleryIndex
                          ? 'border-accent opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${i + 1}`}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = PLACEHOLDER_IMAGE
                        }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* About section */}
          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white">About This Modification</h2>
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
              {mod.description || 'No description provided for this modification.'}
            </p>
            {Array.isArray(mod.tags) && mod.tags.length > 0 && (
              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                {mod.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono bg-surface px-3 py-1 rounded-lg text-accent border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white">
              Community Discussion ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Write a comment as ${activeUser}…`}
                rows="3"
                className="w-full rounded-xl border border-white/10 bg-surface py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Post Comment
                </button>
              </div>
            </form>

            <div className="space-y-4 pt-2">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                comments.map((comment) => {
                  const isAuthor = comment.author === activeUser
                  const isEditing = editingCommentId === comment.id
                  return (
                    <div
                      key={comment.id}
                      className="rounded-xl bg-surface p-4 border border-white/5 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white text-sm">{comment.author}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{comment.time}</span>
                          {isAuthor && !isEditing && (
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditText(comment.text)
                                }}
                                className="text-gray-400 hover:text-white cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-400 hover:text-red-300 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows="2"
                            className="w-full rounded-lg border border-white/10 bg-surface-overlay py-2 px-3 text-xs text-white outline-none focus:border-accent"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 text-xs text-gray-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditSave(comment.id)}
                              className="btn-primary px-3 py-1 text-xs cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-300 text-sm">{comment.text}</p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          {['like', 'dislike'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleCommentVote(comment.id, type)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
                                comment.userVote === type
                                  ? type === 'like'
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'bg-red-500/20 border-red-500/50 text-red-400'
                                  : 'bg-surface-overlay border-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              {type === 'like' ? '👍' : '👎'}{' '}
                              {type === 'like' ? comment.likes : comment.dislikes}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-accent font-medium hover:underline cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>

                      {comment.replies?.length > 0 && (
                        <div className="pl-4 border-l border-white/10 space-y-2 mt-3">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-lg bg-surface-overlay p-3 border border-white/5 text-sm space-y-1"
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-white">{reply.author}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">{reply.time}</span>
                                  {reply.author === activeUser && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                      className="text-red-400 hover:text-red-300 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-300 text-xs">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyingTo === comment.id && (
                        <div className="space-y-2 pt-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply…"
                            className="w-full rounded-lg border border-white/10 bg-surface-overlay py-2 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-accent"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 text-xs text-gray-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddReply(comment.id)}
                              className="btn-primary px-3 py-1 text-xs cursor-pointer"
                            >
                              Send Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-raised p-6 border border-white/10 shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-accent/20 text-accent text-xs px-2.5 py-1 font-mono">
                  {gameTitle}
                </span>
                <span className="text-xs font-mono text-gray-400">v{mod.version || '1.0'}</span>
                {isFeatured && <span className="badge bg-accent/20 text-accent text-xs">⭐ Featured</span>}
              </div>
              <h1 className="font-display text-2xl font-bold text-white">{mod.title}</h1>
              <p className="text-xs text-gray-400 mt-1">
                Created by <span className="text-white font-medium">{authorName}</span>
              </p>
            </div>

            {/* Founder feature toggle in sidebar */}
            {isFounder && (
              <button
                type="button"
                onClick={handleToggleFeature}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isFeatured
                    ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                    : 'bg-surface border-yellow-400/20 text-yellow-400 border-dashed hover:border-yellow-400/50'
                }`}
              >
                {isFeatured ? '★ Remove from Featured' : '☆ Feature This Mod'}
              </button>
            )}

            {/* Like/Dislike */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  userVote === 'like'
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-surface border-white/5 text-gray-300 hover:bg-white/5'
                }`}
              >
                👍 {likes} Likes
              </button>
              <button
                type="button"
                onClick={handleDislike}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  userVote === 'dislike'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-surface border-white/5 text-gray-300 hover:bg-white/5'
                }`}
              >
                👎 {dislikes} Dislikes
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <div className="bg-surface p-3 rounded-xl border border-white/5 text-center">
                <div className="text-xs text-gray-400">Rating</div>
                <div className="text-base font-bold text-white mt-0.5">⭐ {mod.rating || '4.5'}</div>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-white/5 text-center">
                <div className="text-xs text-gray-400">Downloads</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {(mod.downloads || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Star rating */}
            <div className="rounded-xl bg-surface p-4 border border-white/5 space-y-2">
              <div className="text-xs text-gray-400 font-medium">
                {userRating ? `⭐ You rated this ${userRating} stars!` : 'Rate this mod (change or remove anytime):'}
              </div>
              <div className="flex gap-2 justify-center py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer border ${
                      userRating && star <= userRating
                        ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400 font-bold'
                        : 'bg-surface-overlay border-white/5 text-gray-500 hover:text-yellow-300 hover:border-yellow-400/30'
                    }`}
                    title={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {userRating && (
                <div className="text-[10px] text-center text-accent pt-1">
                  Click your active rating again to clear it.
                </div>
              )}
            </div>

            {/* Download */}
            <button
              type="button"
              onClick={() => onDownload && onDownload(mod.id)}
              className="w-full btn-primary py-3 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            >
              📥 Download Package ({mod.file_size || mod.fileSize || mod.size || '15 MB'})
            </button>

            {/* Collection */}
            <button
              type="button"
              onClick={handleToggleCollection}
              className={`w-full py-3 text-sm font-semibold rounded-xl border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                isSaved
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-surface border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isSaved ? '❤️ Added to Collection' : '🤍 Add to Collection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}