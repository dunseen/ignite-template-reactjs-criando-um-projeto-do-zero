import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
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
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO

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
            <span>{post?.first_publication_date}</span>
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
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query();

  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd/MM/yyyy'
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => ({
        heading: c.heading,
        body: c.body.map(b => ({ text: b.text })),
      })),
    },
  };

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  };
};
