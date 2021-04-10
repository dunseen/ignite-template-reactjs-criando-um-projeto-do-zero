import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './post.module.scss';

interface PostProps {
  title: string;
  subtitle: string;
  date: Date;
  author: string;
}

const Post: React.FC<PostProps> = ({ title, subtitle, date, author }) => {
  return (
    <section className={styles.content}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className={styles.iconContainer}>
        <div>
          <FiCalendar color="#BBBBBB" />
          <span>{date}</span>
        </div>
        <div>
          <FiUser color="#BBBBBB" />
          <span>{author}</span>
        </div>
      </div>
    </section>
  );
};

export default Post;
