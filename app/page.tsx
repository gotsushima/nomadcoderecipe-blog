import { BlogHeader } from '@/components/blog-header'
import { BlogHero } from '@/components/blog-hero'
import { BlogFeaturedPosts } from '@/components/blog-featured-posts'
import { BlogArticleList } from '@/components/blog-article-list'
import { BlogAbout } from '@/components/blog-about'
import { BlogFooter } from '@/components/blog-footer'
import { getWpPosts } from '@/lib/wp-posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nomad Code Recipe',
  description: '試して、捨てて、残した判断の記録。高単価案件獲得に辿り着くまでの遠回りログ。',
}

export const revalidate = 3600

export default async function HomePage() {
  const posts = await getWpPosts()

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <BlogHeader />
      <BlogHero />
      <BlogFeaturedPosts posts={posts} />
      <BlogArticleList posts={posts} />
      <BlogAbout />
      <BlogFooter />
    </main>
  )
}
