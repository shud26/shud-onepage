'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, BlogPost } from '@/lib/supabase';

const ADMIN_PIN = '1507';

export default function BlogPostClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null);
  const [nextPost, setNextPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    tags: '',
    date: '',
  });

  const fetchPost = useCallback(async () => {
    setLoading(true);

    // Fetch current post
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (!currentPost) {
      setPost(null);
      setLoading(false);
      return;
    }

    setPost(currentPost);

    // Fetch prev/next for navigation
    const { data: allPosts } = await supabase
      .from('blog_posts')
      .select('id, slug, title, date')
      .eq('published', true)
      .order('date', { ascending: true });

    if (allPosts) {
      const idx = allPosts.findIndex(p => p.slug === slug);
      if (idx > 0) setPrevPost(allPosts[idx - 1] as BlogPost);
      else setPrevPost(null);
      if (idx < allPosts.length - 1) setNextPost(allPosts[idx + 1] as BlogPost);
      else setNextPost(null);
    }

    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

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

  const openEdit = () => {
    if (!post) return;
    setEditForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      tags: (post.tags || []).join(', '),
      date: post.date,
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!post || !editForm.title.trim()) return;

    const tagsArray = editForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: editForm.title,
        slug: editForm.slug,
        description: editForm.description,
        content: editForm.content,
        tags: tagsArray,
        date: editForm.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id);

    if (!error) {
      // If slug changed, redirect
      if (editForm.slug !== post.slug) {
        router.push(`/blog/${editForm.slug}`);
      } else {
        setPost({ ...post, ...editForm, tags: tagsArray, updated_at: new Date().toISOString() });
      }
    }

    setShowEditModal(false);
  };

  const deletePost = async () => {
    if (!post || !confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('blog_posts').delete().eq('id', post.id);
    router.push('/blog');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B6B70]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="text-center">
          <p className="text-2xl mb-4">404</p>
          <p className="text-[#6B6B70] mb-6">글을 찾을 수 없습니다</p>
          <Link href="/blog" className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm">
            &#8592; 블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
            <Link href="/blog" className="text-[13px] text-[#6B6B70] hover:text-white transition-colors">블로그</Link>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <span className="text-xs bg-[#22c55e]/10 text-green-400 px-3 py-1 rounded-full">Admin</span>
                <button
                  onClick={openEdit}
                  className="text-xs text-[#8B8B90] hover:text-[#FF5C00] transition-colors"
                >수정</button>
                <button
                  onClick={deletePost}
                  className="text-xs text-[#ef4444] hover:text-red-300 transition-colors"
                >삭제</button>
              </>
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
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Back link */}
          <Link
            href="/blog"
            className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm mb-8 inline-block transition-colors"
          >
            &#8592; 블로그로 돌아가기
          </Link>

          {/* Post header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {(post.tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#FF5C00]/10 text-[#FF5C00]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-[#6B6B70] text-[13px] font-mono-data">{post.date}</p>
          </header>

          {/* Post content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Prev/Next navigation */}
          <footer className="mt-16 pt-8 border-t border-[#1F1F23]">
            <div className="flex justify-between items-center">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="text-[#8B8B90] hover:text-white transition-colors text-sm"
                >
                  &#8592; {prevPost.title}
                </Link>
              ) : (
                <span />
              )}
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="text-[#FF5C00] hover:text-[#FF8A4C] transition-colors text-sm"
                >
                  {nextPost.title} &#8594;
                </Link>
              ) : (
                <span className="text-[#4A4A4E] text-sm">최신 글</span>
              )}
            </div>
          </footer>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/blog" className="hover:text-[#FF5C00] transition-colors">블로그</Link>
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

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">글 수정</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="제목"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
                autoFocus
              />
              <input
                type="text"
                placeholder="슬러그 (URL)"
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <input
                type="text"
                placeholder="설명"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <input
                type="text"
                placeholder="태그 (쉼표 구분)"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <textarea
                placeholder="본문 (HTML)"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-none"
                rows={16}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >취소</button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
