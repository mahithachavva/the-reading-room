import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  BookCheck,
  Bookmark,
  Flame,
  Clock3,
  ArrowRight,
  MoreVertical
} from "lucide-react";

import { getAllBooks, updateBook } from "../database/db";

function Dashboard() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  useEffect(() => {
    async function loadBooks() {
      const savedBooks = await getAllBooks();
      setBooks(savedBooks);
    }

    loadBooks().catch(console.error);
  }, []);
  async function resetProgress(book) {
  const updatedBook = {
    ...book,
    currentPage: 0,
    progress: 0,
  };

  await updateBook(updatedBook);

  setBooks(prev =>
    prev.map(item =>
      item.id === book.id ? updatedBook : item
    )
  );

  setOpenMenuId(null);
}

async function pauseBook(book) {
  const updatedBook = {
    ...book,
    status: "Paused",
  };

  await updateBook(updatedBook);

  setBooks(prev =>
    prev.map(item =>
      item.id === book.id ? updatedBook : item
    )
  );

  setOpenMenuId(null);
}
  const completedBooks = books.filter(
    (book) => book.status === "Completed"
  );
  async function removeFromRecents(book) {
  const updatedBook = {
    ...book,
    hideFromRecents: true,
  };

  await updateBook(updatedBook);

  setBooks(prev =>
    prev.map(item =>
      item.id === book.id ? updatedBook : item
    )
  );
}
  const currentBooks = books.filter(
  (book) =>
    book.status === "Currently Reading" ||
    (
      book.currentPage > 0 &&
      book.status !== "Completed" &&
      book.status !== "Paused"
    )
);

  const toReadBooks = books.filter(
    (book) =>
      book.status === "To Read" && book.currentPage === 0
  );
  const recentlyOpenedBooks = [...books]
  .filter(book => book.lastOpenedAt && !book.hideFromRecents)
  .sort(
    (a, b) =>
      new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt)
  )
  .slice(0, 4);
  const stats = [
    {
      title: "Total Books",
      value: books.length,
      icon: <BookOpen />,
      note: "In your personal library",
    },
    {
      title: "Currently Reading",
      value: currentBooks.length,
      icon: <Bookmark />,
      note: "Your ongoing stories",
    },
    {
      title: "Books Completed",
      value: completedBooks.length,
      icon: <BookCheck />,
      note: "Stories you've finished",
    },
    {
      title: "Yet to Read",
      value: toReadBooks.length,
      icon: <Flame />,
      note: "Adventures waiting for you",
    },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="dashboard">

      {/* Welcome Section */}
      <header className="welcome-section">
        <div>
          <span className="eyebrow">
            {today.toUpperCase()}
          </span>

          <h1>Your next chapter awaits.</h1>

          <p>
            A little reading today, a world of stories tomorrow.
          </p>
        </div>

        <div className="welcome-decoration">✦</div>
      </header>

      {/* Statistics */}
      <section className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-top">
              <span>{stat.title}</span>

              <div className="stat-icon">
                {stat.icon}
              </div>
            </div>

            <h2>{stat.value}</h2>
            <p>{stat.note}</p>
          </div>
        ))}
      </section>

      {/* Currently Reading */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">
              YOUR READING JOURNEY
            </span>

            <h2>Currently Reading</h2>
          </div>

          <button
            className="text-button"
            onClick={() => navigate("/library")}
          >
            View all <ArrowRight size={16} />
          </button>
        </div>

        <div className="reading-grid">

          {currentBooks.length === 0 ? (
            <p className="empty-message">
              No books in progress yet. Pick a book and begin
              your next adventure!
            </p>
          ) : (
            currentBooks.map((book) => (
  <div className="reading-card" key={book.id}>

    <div className="recent-menu">
      <button
        className="recent-menu-button"
        onClick={() =>
          setOpenMenuId(openMenuId === book.id ? null : book.id)
        }
      >
        <MoreVertical size={19} />
      </button>

      {openMenuId === book.id && (
        <div className="recent-menu-dropdown">
          <button onClick={() => resetProgress(book)}>
            Reset Progress
          </button>
          <button onClick={() => pauseBook(book)}>
  Pause Reading
</button>
        </div>
      )}
    </div>

    <div className="book-cover">
  <img
    src={
      book.cover instanceof Blob
        ? URL.createObjectURL(book.cover)
        : book.cover
    }
    alt={book.title}
    onError={(e) => {
      console.log("Cover failed:", book.title, book.cover);
    }}
  />
</div>

                <div className="book-details">
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>

                  <div className="progress-info">
                    <span>Reading progress</span>
                    <strong>{book.progress || 0}%</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${book.progress || 0}%`,
                      }}
                    />
                  </div>

                  <small className="page-count">
                    {book.currentPage || 0} / {book.pages || "?"} pages
                  </small>

                  <button
                    className="continue-button"
                    onClick={() => navigate(`/reader/${book.id}`)}
                  >
                    Continue Reading
                    <ArrowRight size={15} />
                  </button>
                </div>

              </div>
            ))
          )}

        </div>
      </section>
    <section className="dashboard-section">
  <div className="section-heading">
    <div>
      <span className="eyebrow">BACK TO YOUR STORIES</span>
      <h2>Recently Opened</h2>
    </div>

    <button
      className="text-button"
      onClick={() => navigate("/library")}
    >
      View all <ArrowRight size={16} />
    </button>
  </div>

  <div className="recently-opened-grid">
    {recentlyOpenedBooks.length === 0 ? (
      <p className="empty-message">
        Your recently opened books will appear here.
        Open a book to get started!
      </p>
    ) : (
      recentlyOpenedBooks.map(book => (
        <div className="recent-book-card" key={book.id}>
            <div className="recent-menu">
  <button
    className="recent-menu-button"
    onClick={() =>
      setOpenMenuId(openMenuId === book.id ? null : book.id)
    }
  >
    <MoreVertical size={19} />
  </button>

  {openMenuId === book.id && (
    <div className="recent-menu-dropdown">
      <button
        onClick={() => {
          removeFromRecents(book);
          setOpenMenuId(null);
        }}
      >
        Remove from Recents
      </button>
    </div>
  )}
</div>
          <div className="recent-book-cover">
            <img
              src={
                book.cover instanceof Blob
                  ? URL.createObjectURL(book.cover)
                  : book.cover
              }
              alt={book.title}
            />
          </div>

          <div className="recent-book-details">
            <h3>{book.title}</h3>
            <p>{book.author}</p>

            <div className="progress-info">
              <span>Progress</span>
              <strong>{book.progress || 0}%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${book.progress || 0}%` }}
              />
            </div>

            <button
              className="continue-button"
              onClick={() => navigate(`/reader/${book.id}`)}
            >
              Open Book <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</section>

      {/* Bottom Section */}
      <section className="bottom-grid">

        <div className="activity-card">
          <span className="eyebrow">
            YOUR DAILY PROGRESS
          </span>

          <h2>Reading Activity</h2>

          <div className="activity-content">
            <div className="activity-icon">
              <Clock3 size={25} />
            </div>

            <div>
              <h3>Every page counts.</h3>

              <p>
                Your reading sessions and daily activity
                will appear here.
              </p>
            </div>
          </div>
        </div>

        <div className="quote-card">
          <span className="eyebrow">
            A LITTLE INSPIRATION
          </span>

          <div className="quote-mark">“</div>

          <h2>So many books, so little time.</h2>

          <p>— Frank Zappa</p>

          <div className="quote-decoration">✦</div>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;