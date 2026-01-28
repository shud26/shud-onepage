'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, BlogPost } from '@/lib/supabase';

const ADMIN_PIN = '1507';

export default function BlogPageClient() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New/Edit post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      description: '',
      content: '',
      tags: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowPostModal(true);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      tags: (post.tags || []).join(', '),
      date: post.date,
    });
    setShowPostModal(true);
  };

  const savePost = async () => {
    if (!postForm.title.trim() || !postForm.slug.trim()) return;

    const tagsArray = postForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPost) {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: postForm.title,
          slug: postForm.slug,
          description: postForm.description,
          content: postForm.content,
          tags: tagsArray,
          date: postForm.date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPost.id);

      if (!error) {
        setPosts(posts.map(p =>
          p.id === editingPost.id
            ? { ...p, ...postForm, tags: tagsArray, updated_at: new Date().toISOString() }
            : p
        ));
      }
    } else {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: postForm.title,
          slug: postForm.slug,
          description: postForm.description,
          content: postForm.content,
          tags: tagsArray,
          date: postForm.date,
          published: true,
        }])
        .select()
        .single();

      if (!error && data) {
        setPosts([data, ...posts]);
      }
    }

    setShowPostModal(false);
    setEditingPost(null);
  };

  const deletePost = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
            <span className="text-[13px] text-[#6B6B70]">블로그</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-xs bg-[#22c55e]/10 text-green-400 px-3 py-1 rounded-full">Admin</span>
            )}
            <button
              onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isAdmin
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'border border-[#1F1F23] hover:bg-[#1A1A1D] text-[#8B8B90]'
              }`}
            >
              {isAdmin ? 'Logout' : 'Login'}
            </button>
          </div>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Title */}
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight">개발 블로그</h1>
            <p className="text-[#8B8B90] text-base mt-3">바이브 코딩으로 만드는 크립토 도구 개발 일지</p>
          </div>

          {/* Admin: Add button */}
          {isAdmin && (
            <button
              onClick={openNewPost}
              className="mb-8 px-5 py-3 rounded-xl text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors"
            >
              + 새 글 쓰기
            </button>
          )}

          {/* Post list */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6B6B70]">Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-[#6B6B70] text-center py-16">아직 글이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/blog/${post.slug}`} className="flex-1 block">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {(post.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FF5C00]/10 text-[#FF5C00]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-lg font-semibold text-white group-hover:text-[#FF5C00] transition-colors mb-2">
                        {post.title}
                      </h2>
                      <p className="text-[13px] text-[#ADADB0] line-clamp-2 leading-relaxed mb-3">
                        {post.description}
                      </p>
                      <span className="text-[11px] text-[#6B6B70] font-mono-data">{post.date}</span>
                    </Link>
                    {isAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.preventDefault(); openEditPost(post); }}
                          className="text-xs text-[#8B8B90] hover:text-[#FF5C00] transition-colors"
                        >수정</button>
                        <button
                          onClick={(e) => { e.preventDefault(); deletePost(post.id); }}
                          className="text-xs text-[#ef4444] hover:text-red-300 transition-colors"
                        >삭제</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <span>SHUD Blog</span>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <span>Built with Claude Code</span>
        </div>
      </footer>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-80">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">Admin Login</h3>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className={`w-full bg-[#0A0A0B] border ${pinError ? 'border-[#ef4444]' : 'border-[#1F1F23]'} rounded-lg px-4 py-2.5 mb-4 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors`}
              autoFocus
            />
            {pinError && <p className="text-[#ef4444] text-[13px] mb-4">Wrong PIN</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >Cancel</button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal (Add/Edit) */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">
              {editingPost ? '글 수정' : '새 글 쓰기'}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="제목"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
                autoFocus
              />
              <input
                type="text"
                placeholder="슬러그 (URL: /blog/your-slug)"
                value={postForm.slug}
                onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <input
                type="text"
                placeholder="설명 (한 줄 요약)"
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <input
                type="text"
                placeholder="태그 (쉼표 구분: Vibe Coding, Day 1, 시작)"
                value={postForm.tags}
                onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <input
                type="date"
                value={postForm.date}
                onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <textarea
                placeholder="본문 (HTML 지원)"
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-none"
                rows={16}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowPostModal(false); setEditingPost(null); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >취소</button>
              <button
                onClick={savePost}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >{editingPost ? '수정' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
