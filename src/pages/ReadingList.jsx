import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks, updateBook } from "../database/db";
import { ArrowRight, BookOpen } from "lucide-react";

function ReadingList() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBooks() {
      const savedBooks = await getAllBooks();
      setBooks(savedBooks);
    }

    loadBooks().catch(console.error);
  }, []);

  async function resumeBook(book) {
    const updatedBook = {
      ...book,
      status: "Currently Reading",
    };

    await updateBook(updatedBook);

    setBooks(prev =>
      prev.map(item =>
        item.id === book.id ? updatedBook : item
      )
    );
  }

  const categories = [
    {
      title: "To Read",
      description: "Stories waiting for their turn.",
      books: books.filter(book => book.status === "To Read"),
    },
    {
      title: "Currently Reading",
      description: "Your ongoing adventures.",
      books: books.filter(book => book.status === "Currently Reading"),
    },
    {
      title: "Paused",
      description: "Stories waiting for you to return.",
      books: books.filter(book => book.status === "Paused"),
    },
    {
      title: "Completed",
      description: "Stories you've experienced.",
      books: books.filter(book => book.status === "Completed"),
    },
  ];

  return (
    <div className="reading-list-page">
      <header className="welcome-section">
        <div>
          <span className="eyebrow">YOUR READING COLLECTION</span>
          <h1>Your Reading List</h1>
          <p>Every story has its own place and its own time.</p>
        </div>
        <div className="welcome-decoration">✦</div>
      </header>

      {categories.map(category => (
        <section className="dashboard-section" key={category.title}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR COLLECTION</span>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
            </div>
            <span>{category.books.length} books</span>
          </div>

          <div className="reading-list-grid">
            {category.books.length === 0 ? (
              <p className="empty-message">
                No books here yet.
              </p>
            ) : (
              category.books.map(book => (
  <div className="reading-list-card" key={book.id}>

    <div className="reading-list-cover">
      <img
        src={
          book.cover instanceof Blob
            ? URL.createObjectURL(book.cover)
            : book.cover
        }
        alt={book.title}
      />
    </div>

    <div className="reading-list-details">

      <h3>{book.title}</h3>
      <p>{book.author}</p>

      <span>{book.progress || 0}% completed</span>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${book.progress || 0}%` }}
        />
      </div>

      {book.status === "Paused" && (
        <button
          className="continue-button"
          onClick={() => resumeBook(book)}
        >
          Resume Reading <ArrowRight size={15} />
        </button>
      )}

      {book.status === "Currently Reading" && (
        <button
          className="continue-button"
          onClick={() => navigate(`/reader/${book.id}`)}
        >
          Continue Reading <ArrowRight size={15} />
        </button>
      )}

      {book.status === "To Read" && (
        <button
          className="continue-button"
          onClick={() => resumeBook(book)}
        >
          Start Reading <BookOpen size={15} />
        </button>
      )}

    </div>
  </div>
))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ReadingList;