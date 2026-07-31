import { useState, useEffect } from 'react'
import {
  getForumTopics,
  createForumTopic,
  getForumThreads,
  createForumThread,
  deleteForumThread,
  getForumComments,
  createForumComment,
  deleteForumComment,
  toggleThreadUpvote,
  getUserUpvotes,
} from '../lib/supabaseApi'

export default function Forums({ currentUser, isModerator }) {
  const [topics, setTopics] = useState([])
  const [selectedTopicId, setSelectedTopicId] = useState('All')
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  
  const [comments, setComments] = useState([])
  const [userUpvotes, setUserUpvotes] = useState([])
  const [loading, setLoading] = useState(true)

  // New Topic Form State (Apex Founder / Moderator Only)
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicSlug, setNewTopicSlug] = useState('')
  const [newTopicDesc, setNewTopicDesc] = useState('')

  // New Thread Form State
  const [isCreatingThread, setIsCreatingThread] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadBody, setNewThreadBody] = useState('')

  // New Comment Form State
  const [newCommentBody, setNewCommentBody] = useState('')

  // Check if current user is the Apex Founder
  const isFounder = currentUser?.email === 'manghiamknongsiej@gmail.com'

  // Fetch Topics and Threads on Mount
  useEffect(() => {
    loadData()
  }, [])

  // Fetch Comments when activeThread changes
  useEffect(() => {
    if (activeThread) {
      loadComments(activeThread.id)
    } else {
      setComments([])
    }
  }, [activeThread])

  async function loadData() {
    setLoading(true)
    const [fetchedTopics, fetchedThreads] = await Promise.all([
      getForumTopics(),
      getForumThreads(),
    ])
    setTopics(fetchedTopics)
    setThreads(fetchedThreads)

    if (currentUser) {
      const upvotes = await getUserUpvotes(currentUser.id)
      setUserUpvotes(upvotes)
    }
    setLoading(false)
  }

  async function loadComments(threadId) {
    const fetchedComments = await getForumComments(threadId)
    setComments(fetchedComments)
  }

  // Filter threads based on selected topic
  const filteredThreads = selectedTopicId === 'All'
    ? threads
    : threads.filter((t) => t.topic_id === selectedTopicId)

  // Handle Topic Creation (Founder / Mod Only)
  const handleCreateTopic = async (e) => {
    e.preventDefault()
    if (!newTopicName.trim()) return

    const slug = newTopicSlug.trim() || newTopicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    try {
      const created = await createForumTopic({
        name: newTopicName,
        slug,
        description: newTopicDesc,
      })
      setTopics([...topics, created])
      setNewTopicName('')
      setNewTopicSlug('')
      setNewTopicDesc('')
      setIsCreatingTopic(false)
    } catch (err) {
      alert('Error creating topic: ' + err.message)
    }
  }

  // Handle Thread Creation
  const handleCreateThread = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('You must be logged in to start a discussion.')
      return
    }
    if (!newThreadTitle.trim() || !newThreadBody.trim()) return

    // Default to first available topic if 'All' is selected
    const targetTopicId = selectedTopicId === 'All' ? (topics[0]?.id) : selectedTopicId
    if (!targetTopicId) {
      alert('Please create or select a valid topic category first.')
      return
    }

    const authorName = currentUser.user_metadata?.username || currentUser.email.split('@')[0]
    const authorRole = isFounder ? 'Apex Founder' : (isModerator ? 'Moderator' : 'User')

    try {
      const created = await createForumThread({
        topic_id: targetTopicId,
        title: newThreadTitle,
        body: newThreadBody,
        author_id: currentUser.id,
        author_name: authorName,
        author_role: authorRole,
        upvotes: 0,
        views: 1,
      })
      setThreads([created, ...threads])
      setNewThreadTitle('')
      setNewThreadBody('')
      setIsCreatingThread(false)
      setActiveThread(created)
    } catch (err) {
      alert('Error creating thread: ' + err.message)
    }
  }

  // Handle Delete Thread
  const handleDeleteThread = async (threadId) => {
    if (!confirm('Are you sure you want to delete this discussion?')) return
    try {
      await deleteForumThread(threadId)
      setThreads(threads.filter((t) => t.id !== threadId))
      if (activeThread?.id === threadId) setActiveThread(null)
    } catch (err) {
      alert('Failed to delete thread: ' + err.message)
    }
  }

  // Handle Comment Submission
  const handleCreateComment = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('You must be logged in to reply.')
      return
    }
    if (!newCommentBody.trim() || !activeThread) return

    const authorName = currentUser.user_metadata?.username || currentUser.email.split('@')[0]
    const authorRole = isFounder ? 'Apex Founder' : (isModerator ? 'Moderator' : 'User')

    try {
      const created = await createForumComment({
        thread_id: activeThread.id,
        body: newCommentBody,
        author_id: currentUser.id,
        author_name: authorName,
        author_role: authorRole,
      })
      setComments([...comments, created])
      setNewCommentBody('')
    } catch (err) {
      alert('Error posting comment: ' + err.message)
    }
  }

  // Handle Comment Deletion
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteForumComment(commentId)
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err) {
      alert('Failed to delete comment: ' + err.message)
    }
  }

  // Handle Upvotes
  const handleToggleUpvote = async (thread) => {
    if (!currentUser) {
      alert('Please log in to upvote discussions.')
      return
    }
    const hasUpvoted = userUpvotes.includes(thread.id)
    try {
      const newCount = await toggleThreadUpvote(thread.id, currentUser.id, thread.upvotes, hasUpvoted)
      
      // Update local states
      setUserUpvotes(hasUpvoted ? userUpvotes.filter((id) => id !== thread.id) : [...userUpvotes, thread.id])
      setThreads(threads.map((t) => t.id === thread.id ? { ...t, upvotes: newCount } : t))
      if (activeThread?.id === thread.id) {
        setActiveThread({ ...activeThread, upvotes: newCount })
      }
    } catch (err) {
      alert('Error updating upvote: ' + err.message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Community Forums</h1>
          <p className="mt-1 text-sm text-gray-400">Discuss mods, coordinate collaborations, and share troubleshooting steps.</p>
        </div>
        <div className="flex items-center gap-3">
          {(isFounder || isModerator) && (
            <button
              type="button"
              onClick={() => setIsCreatingTopic(!isCreatingTopic)}
              className="px-4 py-2.5 rounded-xl font-semibold bg-surface-raised border border-accent/40 text-accent hover:bg-accent/10 transition-colors cursor-pointer text-sm"
            >
              {isCreatingTopic ? 'Cancel Topic' : '+ New Topic Category'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCreatingThread(!isCreatingThread)}
            className="btn-primary px-5 py-2.5 rounded-xl font-semibold cursor-pointer text-sm"
          >
            {isCreatingThread ? 'Cancel' : '+ New Discussion'}
          </button>
        </div>
      </div>

      {/* Create Topic Category Modal / Form Box (Founder / Mod Only) */}
      {isCreatingTopic && (
        <div className="mb-8 rounded-2xl bg-surface-raised p-6 border border-accent/40 shadow-xl">
          <h3 className="font-display text-lg font-bold text-white mb-2">Create New Topic Category</h3>
          <p className="text-xs text-gray-400 mb-4">Establish a new channel for community members to start discussions.</p>
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Topic Name</label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Sound Overhauls"
                  className="w-full rounded-xl bg-surface-overlay px-4 py-2.5 text-sm text-white border border-white/10 focus:border-accent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Slug (optional URL identifier)</label>
                <input
                  type="text"
                  value={newTopicSlug}
                  onChange={(e) => setNewTopicSlug(e.target.value)}
                  placeholder="e.g. sound-overhauls"
                  className="w-full rounded-xl bg-surface-overlay px-4 py-2.5 text-sm text-white border border-white/10 focus:border-accent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <input
                type="text"
                value={newTopicDesc}
                onChange={(e) => setNewTopicDesc(e.target.value)}
                placeholder="Short description of what belongs in this category..."
                className="w-full rounded-xl bg-surface-overlay px-4 py-2.5 text-sm text-white border border-white/10 focus:border-accent outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingTopic(false)}
                className="px-4 py-2 rounded-xl bg-surface-overlay text-gray-300 hover:text-white text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer">
                Save Topic Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Thread Form Box */}
      {isCreatingThread && (
        <div className="mb-8 rounded-2xl bg-surface-raised p-6 border border-accent/30 shadow-xl">
          <h3 className="font-display text-lg font-bold text-white mb-4">Start a New Discussion Thread</h3>
          <form onSubmit={handleCreateThread} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="What is your topic about?"
                className="w-full rounded-xl bg-surface-overlay px-4 py-2.5 text-sm text-white border border-white/10 focus:border-accent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Content / Message</label>
              <textarea
                value={newThreadBody}
                onChange={(e) => setNewThreadBody(e.target.value)}
                rows={4}
                placeholder="Write your message here..."
                className="w-full rounded-xl bg-surface-overlay px-4 py-2.5 text-sm text-white border border-white/10 focus:border-accent outline-none resize-none"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingThread(false)}
                className="px-4 py-2 rounded-xl bg-surface-overlay text-gray-300 hover:text-white text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer">
                Publish Discussion
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topic Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Topics:</span>
        <button
          type="button"
          onClick={() => setSelectedTopicId('All')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
            selectedTopicId === 'All'
              ? 'bg-accent text-white font-semibold'
              : 'bg-surface-raised text-gray-400 hover:bg-surface-overlay hover:text-white border border-white/5'
          }`}
        >
          All Discussions
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => setSelectedTopicId(topic.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedTopicId === topic.id
                ? 'bg-accent text-white font-semibold'
                : 'bg-surface-raised text-gray-400 hover:bg-surface-overlay hover:text-white border border-white/5'
            }`}
          >
            {topic.name}
          </button>
        ))}
      </div>

      {/* Main Content layout (List vs Detail view) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threads List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-surface-raised p-12 text-center border border-white/5">
              <p className="text-gray-400 text-sm">Loading discussions...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="rounded-2xl bg-surface-raised p-12 text-center border border-white/5">
              <p className="text-gray-400 text-sm">No discussions found in this topic yet. Be the first to start one!</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const currentTopic = topics.find((t) => t.id === thread.topic_id)
              const hasUpvoted = userUpvotes.includes(thread.id)

              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThread(thread)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer ${
                    activeThread?.id === thread.id
                      ? 'bg-surface-raised border-accent shadow-lg shadow-accent/5'
                      : 'bg-surface-raised border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="badge bg-accent/10 text-accent text-[11px] font-semibold">
                      {currentTopic ? currentTopic.name : 'General'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(thread.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{thread.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{thread.body}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        by <strong className="text-gray-300">{thread.author_name}</strong>
                      </span>
                      {thread.author_role && thread.author_role !== 'User' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          thread.author_role === 'Apex Founder' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {thread.author_role}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Upvote Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleUpvote(thread)
                        }}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          hasUpvoted ? 'bg-accent text-white font-bold' : 'bg-surface-overlay text-gray-400 hover:text-white'
                        }`}
                      >
                        ▲ {thread.upvotes || 0}
                      </button>

                      {/* Delete Button for Owner / Mod / Founder */}
                      {(isFounder || isModerator || currentUser?.id === thread.author_id) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteThread(thread.id)
                          }}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 cursor-pointer"
                          title="Delete discussion"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Thread Detail & Comment Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl bg-surface-raised p-6 border border-white/5 shadow-xl">
            {activeThread ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge bg-accent/20 text-accent text-xs">
                    {topics.find((t) => t.id === activeThread.topic_id)?.name || 'Discussion'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(activeThread.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-white mb-2">{activeThread.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-400">
                    Posted by <span className="text-gray-200 font-medium">{activeThread.author_name}</span>
                  </span>
                  {activeThread.author_role && activeThread.author_role !== 'User' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      activeThread.author_role === 'Apex Founder' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {activeThread.author_role}
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-surface-overlay p-4 text-sm text-gray-300 leading-relaxed border border-white/5 mb-6">
                  {activeThread.body}
                </div>

                {/* Comment Section Header */}
                <div className="pt-4 border-t border-white/5 mb-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Replies ({comments.length})</h4>
                  
                  {/* Comments list */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4 scrollbar-thin">
                    {comments.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No replies yet. Be the first to join the conversation!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="rounded-xl bg-surface-overlay p-3 border border-white/5 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-300">{comment.author_name}</span>
                              {comment.author_role && comment.author_role !== 'User' && (
                                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                  comment.author_role === 'Apex Founder' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                  {comment.author_role}
                                </span>
                              )}
                            </div>
                            {(isFounder || isModerator || currentUser?.id === comment.author_id) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-400 hover:text-red-300 cursor-pointer text-[10px]"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 leading-relaxed">{comment.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  {currentUser ? (
                    <form onSubmit={handleCreateComment} className="space-y-2">
                      <textarea
                        value={newCommentBody}
                        onChange={(e) => setNewCommentBody(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="w-full rounded-xl bg-surface-overlay px-3 py-2 text-xs text-white border border-white/10 focus:border-accent outline-none resize-none"
                        required
                      />
                      <div className="flex justify-end">
                        <button type="submit" className="btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                          Post Reply
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2 bg-surface-overlay rounded-xl">
                      Please log in to join the discussion.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="text-sm font-semibold text-white">Select a Discussion</h3>
                <p className="mt-1 text-xs text-gray-500">Click on any forum topic on the left to read and review details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}