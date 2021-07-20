import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function loadMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        function getPosts(post: Post): Post {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        }

        const result = data.results.map(getPosts);
        setPosts([...posts, ...result]);
        setNextPage(data.next_page);
      })
      .catch(err => {
        console.error(err);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <Header />
      <main className={styles.mainContainer}>
        {posts.map(post => (
          <section key={post.uid} className={styles.content}>
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <h1>{post.data.title}</h1>
            </Link>
            <p>{post.data.subtitle}</p>
            <div className={styles.iconContainer}>
              <div>
                <FiCalendar color="#BBBBBB" />
                <span>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
              </div>
              <div>
                <FiUser color="#BBBBBB" />
                <span>{post.data.author}</span>
              </div>
            </div>
          </section>
        ))}
        {nextPage && (
          <button
            id="load-posts"
            type="button"
            onClick={loadMorePosts}
            className={styles.loadMoreContent}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],

    { fetch: ['post.title', 'post.content'], pageSize: 4 }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 60 * 24, // 24hours
  };
};
