import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, BookOpen, Plus, Heart } from "lucide-react";
import books from "../database/books";
import AddBookModal from "../components/AddBookModal";
import {
  getAllBooks,
  addBook as saveBook,
  updateBook,
} from "../database/db";

const coverFiles = {
  "1984": "1984",
  "Atomic Habits": "atomic habits",
  "Can't Hurt Me": "can't hurt me",
  "Chivaraku Migiledi": "chivaraku migiledi",
  "Crime and Punishment": "crime and punishment",
  "Harry Potter – Complete Collection": "harry potter",
  "Man's Search for Meaning": "man's search for meaning",
  "Norwegian Wood": "norwegian wood",
  "Pride and Prejudice": "pride and prejudice",
  "Quantum Computation and Quantum Information": "quantum computing",
  "The Alchemist": "the alchemist",
  "The Diary of a Young Girl": "the diary of a young girl",
  "The Kite Runner": "the kite runner",
  "The Little Prince": "the little prince",
  "The Orion Mystery": "the orion mystery",
  "The Secret Garden": "the secret garden",
  "The Stranger": "the stranger",
  "The Trachtenberg Speed System of Basic Mathematics": "trachtenberg",
  "The Blue Umbrella": "the blue umbrella",
  "Rafa: My Story": "rafa",
};

function Library() {
  const [bookList, setBookList] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
useEffect(() => {
  async function loadBooks() {
    try {
      const savedBooks = await getAllBooks();

      const isNewLibrary = savedBooks.length === 0;
      const sourceBooks = isNewLibrary ? books : savedBooks;

      const updatedBooks = [];

      for (const book of sourceBooks) {
        const filename = coverFiles[book.title];

        if (filename) {
          const updatedBook = {
            ...book,
            cover: `/book-covers/${encodeURIComponent(filename)}.jpeg`,
          };

          if (isNewLibrary) {
            await saveBook(updatedBook);
          } else {
            await updateBook(updatedBook);
          }

          updatedBooks.push(updatedBook);
        } else {
          if (isNewLibrary) {
            await saveBook(book);
          }

          updatedBooks.push(book);
        }
      }

      setBookList(updatedBooks);

    } catch (error) {
      console.error("Could not load books:", error);
    } finally {
      setLoading(false);
    }
  }

  loadBooks();
}, []);

  async function addBook(newBook) {
    try {
      await saveBook(newBook);

      setBookList((previous) => [...previous, newBook]);
      setShowModal(false);
    } catch (error) {
      console.error("Could not save book:", error);
      alert("Unable to save this book. Please try again.");
    }
  }
  async function toggleFavorite(book) {
  const updatedBook = {
    ...book,
    isFavorite: !book.isFavorite,
  };

  await updateBook(updatedBook);

  setBookList((previous) =>
    previous.map((item) =>
      item.id === book.id ? updatedBook : item
    )
  );
}

  const genres = [
    "All",
    ...new Set(bookList.map((book) => book.genre).filter(Boolean)),
  ];

  const filteredBooks = bookList.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchesGenre = genre === "All" || book.genre === genre;

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
          <h1>My Library</h1>
          <p>A home for every story, idea and adventure.</p>
        </div>

        <button
          className="add-book-button"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Add a Book
        </button>
      </div>

      <div className="library-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search books or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          {genres.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="library-count">
        {filteredBooks.length} books in your collection
      </div>

      {loading ? (
        <p className="loading-message">Gathering your books...</p>
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
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
  className={`favorite-button ${book.isFavorite ? "active" : ""}`}
  onClick={() => toggleFavorite(book)}
  title={book.isFavorite ? "Remove from favourites" : "Add to favourites"}
>
  <Heart
    size={20}
    fill={book.isFavorite ? "currentColor" : "none"}
  />
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
      )}

      {!loading && filteredBooks.length === 0 && (
        <p className="empty-message">
          No books found. Try another search.
        </p>
      )}

      {showModal && (
        <AddBookModal
          onClose={() => setShowModal(false)}
          onAdd={addBook}
        />
      )}
    </div>
  );
}

export default Library;