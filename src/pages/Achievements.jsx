import { useEffect, useState } from "react";
import {
  Trophy,
  BookOpen,
  Flame,
  Star,
  Flag,
} from "lucide-react";

import { getAllBooks, getAllCompletions } from "../database/db";

function Achievements() {
  const [books, setBooks] = useState([]);
  const [completions, setCompletions] = useState([]);

  useEffect(() => {
    async function loadAchievements() {
      const savedBooks = await getAllBooks();
      const savedCompletions = await getAllCompletions();

      setBooks(savedBooks);
      setCompletions(savedCompletions);
    }

    loadAchievements().catch(console.error);
  }, []);

  const milestones = [1, 5, 10, 25, 50];

  return (
    <div className="achievements-page">

      <header className="achievements-header">
        <p>THE READING ROOM · READING GRAND PRIX</p>

        <h1>Your Championship Gallery 🏆</h1>

        <span>
          Every book finished. Every finish line crossed.
        </span>
      </header>

      <div className="achievement-stats">

        <div className="achievement-stat-card">
          <BookOpen />
          <h2>{books.length}</h2>
          <p>Total Books</p>
        </div>

        <div className="achievement-stat-card">
          <Trophy />
          <h2>{completions.length}</h2>
          <p>Books Completed</p>
        </div>

        <div className="achievement-stat-card">
          <Star />
          <h2>{completions.length * 100}</h2>
          <p>Reading Points</p>
        </div>

      </div>

      <section className="milestones-section">

        <h2>Championship Milestones</h2>

        <p>Your journey, one book at a time.</p>

        <div className="milestone-grid">

          {milestones.map(number => (
            <div className="milestone-card" key={number}>

              <Trophy size={30} />

              <h3>{number} Books</h3>

              <p>
                {completions.length >= number
                  ? "Milestone Achieved!"
                  : `${number - completions.length} more to go`}
              </p>

              <div className="milestone-progress">
                <div
                  style={{
                    width: `${Math.min(
                      (completions.length / number) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

            </div>
          ))}

        </div>

      </section>

      <section className="completed-books-section">

        <div className="completed-section-heading">
          <Flag />
          <h2>Your Finished Races</h2>
        </div>

        {completions.length === 0 ? (

          <div className="empty-achievements">
            <img
              src="/book-covers/images/toto-wolff-sticker.png"
              alt="Toto Wolff"
            />

            <h3>Your first podium awaits!</h3>

            <p>
              Finish your first book to earn your place
              in the championship gallery.
            </p>
          </div>

        ) : (

          <div className="completed-achievements-grid">

            {completions
              .slice()
              .reverse()
              .map(completion => (

                <div
                  className="completed-book-card"
                  key={completion.id}
                >

                  {completion.cover && (
                    <img
                      src={completion.cover}
                      alt={completion.title}
                    />
                  )}

                  <div className="completed-book-details">

                    <span className="finish-label">
                      <Trophy size={14} />
                      FINISH LINE CROSSED
                    </span>

                    <h3>{completion.title}</h3>

                    <p>{completion.author}</p>

                    <span className="completion-date">
                      Started: {
                        completion.startedAt
                          ? new Date(
                              completion.startedAt
                            ).toLocaleDateString("en-IN")
                          : "Not recorded"
                      }
                    </span>

                  </div>

                </div>

              ))}

          </div>

        )}

      </section>

      <div className="achievements-toto">
        <img
          src="/book-covers/images/toto-wolff-sticker.png"
          alt="Toto Wolff giving a thumbs-up"
        />

        <div>
          <h3>Keep pushing. Keep reading.</h3>
          <p>There's always another finish line.</p>
        </div>
      </div>

    </div>
  );
}

export default Achievements;