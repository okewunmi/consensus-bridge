'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function CategorySelector({ selectedCategories = [], onChange, maxSelections = 3 }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
    setLoading(false)
  }

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId))
    } else if (selectedCategories.length < maxSelections) {
      onChange([...selectedCategories, categoryId])
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading categories...</div>

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-3">
        Categories (select up to {maxSelections})
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {categories.map(category => {
          const isSelected = selectedCategories.includes(category.id)
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }
              `}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className={`text-xs font-medium ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                {category.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// 2. TAG INPUT COMPONENT
// Allow users to add custom tags
// ============================================================================

export function TagInput({ selectedTags = [], onChange, maxTags = 5 }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (input.length > 1) {
      searchTags(input)
    } else {
      setSuggestions([])
    }
  }, [input])

  const searchTags = async (query) => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(5)
    
    if (data) setSuggestions(data)
  }

  const addTag = async (tagName) => {
    if (selectedTags.length >= maxTags) return
    if (selectedTags.some(t => t.toLowerCase() === tagName.toLowerCase())) return

    // Find or create tag
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', tagName)
      .single()

    if (existingTag) {
      // Increment usage
      await supabase
        .from('tags')
        .update({ usage_count: existingTag.usage_count + 1 })
        .eq('id', existingTag.id)
      
      onChange([...selectedTags, existingTag])
    } else {
      // Create new tag
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: newTag } = await supabase
        .from('tags')
        .insert({ name: tagName, slug })
        .select()
        .single()
      
      if (newTag) onChange([...selectedTags, newTag])
    }

    setInput('')
    setSuggestions([])
  }

  const removeTag = (tagId) => {
    onChange(selectedTags.filter(t => t.id !== tagId))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim()) addTag(input.trim())
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Tags (optional, up to {maxTags})
      </label>
      
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(tag => (
            <div
              key={tag.id}
              className="px-3 py-1 bg-blue-400/10 border border-blue-400/30 rounded-full text-xs text-blue-400 flex items-center gap-2"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="hover:text-blue-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {selectedTags.length < maxTags && (
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to add tags..."
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-amber-400 outline-none"
          />
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg">
              {suggestions.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {tag.name} <span className="text-slate-500">({tag.usage_count} uses)</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 3. CATEGORY FILTER (for browse page)
// ============================================================================

export function CategoryFilter({ selectedCategory, onChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
          ${!selectedCategory
            ? 'bg-amber-400 text-slate-950'
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
          }
        `}
      >
        All Topics
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2
            ${selectedCategory === category.id
              ? 'bg-amber-400 text-slate-950'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
            }
          `}
        >
          <span>{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// 4. TRENDING TOPICS WIDGET
// ============================================================================

export function TrendingTopics({ limit = 5 }) {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    loadTrending()
  }, [])

  const loadTrending = async () => {
    // Get categories with most active dialogues in last 7 days
    const { data } = await supabase
      .from('dialogue_categories')
      .select(`
        category_id,
        categories (
          id,
          name,
          icon,
          color
        ),
        dialogues (
          id,
          status,
          created_at
        )
      `)
      .gte('dialogues.created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('dialogues.status', 'active')

    if (data) {
      // Count dialogues per category
      const counts = {}
      data.forEach(item => {
        const catId = item.category_id
        counts[catId] = (counts[catId] || 0) + 1
      })

      // Sort and limit
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([categoryId, count]) => {
          const item = data.find(d => d.category_id === categoryId)
          return {
            ...item.categories,
            dialogueCount: count
          }
        })

      setTrending(sorted)
    }
  }

  if (trending.length === 0) return null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔥</span>
        <h3 className="font-display text-lg font-bold">Trending Topics</h3>
      </div>
      <div className="space-y-3">
        {trending.map((category, i) => (
          <div
            key={category.id}
            className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <div className="text-2xl">{category.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">
                {category.name}
              </div>
              <div className="text-xs text-slate-500">
                {category.dialogueCount} active dialogue{category.dialogueCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-lg font-bold text-amber-400">
              #{i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 5. RELATED DIALOGUES (based on categories/tags)
// ============================================================================

export function RelatedDialogues({ currentDialogueId, categoryIds = [], tagIds = [], limit = 3 }) {
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (categoryIds.length > 0 || tagIds.length > 0) {
      loadRelated()
    }
  }, [categoryIds, tagIds])

  const loadRelated = async () => {
    // Find dialogues with matching categories or tags
    const { data } = await supabase
      .from('dialogues')
      .select(`
        id,
        topic,
        status,
        created_at,
        dialogue_categories!inner (
          category_id
        ),
        dialogue_participants (
          user_id
        )
      `)
      .neq('id', currentDialogueId)
      .eq('status', 'active')
      .in('dialogue_categories.category_id', categoryIds)
      .limit(limit)

    if (data) setRelated(data)
  }

  if (related.length === 0) return null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6">
      <h3 className="font-display text-lg font-bold mb-4">Related Dialogues</h3>
      <div className="space-y-3">
        {related.map(dialogue => (
          <a
            key={dialogue.id}
            href={`/dialogues/${dialogue.id}`}
            className="block p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="text-sm font-medium text-slate-200 line-clamp-2 mb-1">
              {dialogue.topic}
            </div>
            <div className="text-xs text-slate-500">
              {dialogue.dialogue_participants?.length || 0} participants
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}