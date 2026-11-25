import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, BookOpen } from "lucide-react";
import { getAllBooks, updateBook } from "../database/db";

function Favourites() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFavorites() {
      const allBooks = await getAllBooks();
      setBooks(allBooks.filter((book) => book.isFavorite));
    }

    loadFavorites();
  }, []);

  async function removeFavorite(book) {
    const updatedBook = {
      ...book,
      isFavorite: false,
    };

    await updateBook(updatedBook);

    setBooks((previous) =>
      previous.filter((item) => item.id !== book.id)
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <span className="eyebrow">THE BOOKS YOU LOVE</span>
          <h1>My Favourites ❤️</h1>
          <p>A little collection of stories close to your heart.</p>
        </div>
      </div>

      <div className="library-count">
        {books.length} favourite books
      </div>

      {books.length > 0 ? (
        <div className="books-grid">
          {books.map((book) => (
            <div className="library-book" key={book.id}>
              <div className="library-cover">
                {book.cover ? (
                  <img
                    src={
                      book.cover instanceof Blob
                        ? URL.createObjectURL(book.cover)
                        : book.cover
                    }
                    alt={book.title}
                  />
                ) : (
                  <div className="cover-placeholder">
                    <BookOpen size={32} />
                    <span>{book.title}</span>
                  </div>
                )}
              </div>

              <div className="library-book-info">
                <button
                  className="favorite-button active"
                  onClick={() => removeFavorite(book)}
                  title="Remove from favourites"
                >
                  <Heart size={20} fill="currentColor" />
                </button>

                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <span>{book.language} · {book.genre}</span>

                <div className="status">{book.status}</div>

                <button
                  className="open-book-button"
                  onClick={() => navigate(`/reader/${book.id}`)}
                >
                  Open Book
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-message">
          <Heart size={40} />
          <h3>No favourites yet</h3>
          <p>
            Visit your library and tap the heart on a book
            to add it here.
          </p>
        </div>
      )}
    </div>
  );
}

export default Favourites;