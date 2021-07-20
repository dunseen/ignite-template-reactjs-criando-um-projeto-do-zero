import Prismic from '@prismicio/client';
// eslint-disable-next-line no-use-before-define
import React from 'react';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
        type: string;
        spans: string[];
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <header className={styles.headerContainer}>
        <img src={`${post?.data.banner.url}`} alt="logo" />
      </header>
      <main className={styles.mainContainer}>
        <h1>{post?.data.title}</h1>
        <div className={styles.iconContainer}>
          <div>
            <FiCalendar color="#BBBBBB" />
            <span>
              {post &&
                format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
            </span>
          </div>
          <div>
            <FiUser color="#BBBBBB" />
            <span>{post?.data.author}</span>
          </div>
          <div>
            <FiClock color="#BBBBBB" />
            <span>4 min</span>
          </div>
        </div>

        <section className={styles.content}>
          {post?.data.content.map(content => (
            <React.Fragment key={content.heading}>
              <h1>{content.heading}</h1>
              {content.body.map(item => (
                <p key={item.text}>{item.text}</p>
              ))}
            </React.Fragment>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],

    { fetch: ['post.slug'], pageSize: 1 }
  );

  const paths = postsResponse.results.map(item => ({
    params: { slug: item.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const {
    first_publication_date,
    uid,
    data: { title, subtitle, banner, author, content },
  } = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date,
    uid,
    data: {
      title,
      subtitle,
      banner: {
        url: banner.url,
      },
      author,
      content: content.map(c => ({
        heading: c.heading,
        body: c.body.map(b => b),
      })),
    },
  };

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  };
};
