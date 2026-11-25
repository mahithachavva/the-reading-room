import { useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Trophy, BookOpen } from "lucide-react";

function CompletionCard({ completion }) {
  const cardRef = useRef(null);

  async function downloadCard() {
  // Wait for the card animation to finish
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Wait for images to load
  const images = cardRef.current.querySelectorAll("img");

  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();

      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  const canvas = await html2canvas(cardRef.current, {
    scale: 3,
    backgroundColor: "#080B10",
    useCORS: true,
    logging: false,

    onclone: document => {
      const card = document.querySelector(".completion-card");

      card.style.animation = "none";
      card.style.opacity = "1";
      card.style.transform = "none";
    },
  });

  const link = document.createElement("a");

  link.download = `${completion.title}-achievement.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
  const startDate = completion.startedAt
    ? new Date(completion.startedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not recorded";

  return (
    <div className="completion-wrapper">

      <div className="completion-card" ref={cardRef}>

        <div className="completion-header">
          <span>THE READING ROOM</span>
          <span className="f1-label">READING GRAND PRIX</span>
        </div>

        <div className="completion-main">

          <div className="toto-section">
            <img
              src="/book-covers/images/toto-wolff-sticker.png"
              alt="Toto Wolff giving a thumbs-up"
              className="toto-sticker"
            />
          </div>

          <div className="congratulations-section">
            <p className="completion-eyebrow">
              RACE DAY ACHIEVEMENT
            </p>

            <h1>CONGRATULATIONS!</h1>

            <p className="completion-message">
              Another book conquered.
              Another finish line crossed.
            </p>

            <div className="toto-message">
              "Great job! Keep reading,
              keep dreaming!"
            </div>

            <span className="toto-signature">
              — Toto Wolff
            </span>
          </div>

        </div>

        <div className="completion-book-section">

          {completion.cover && (
            <img
              src={completion.cover}
              alt={completion.title}
              className="completion-cover"
              crossOrigin="anonymous"
            />
          )}

          <div className="completion-book-details">

            <p className="book-completed-label">
              FINISH LINE CROSSED
            </p>

            <h2>{completion.title}</h2>

            <p className="completion-author">
              by {completion.author}
            </p>

            <div className="completion-info">

              <div>
                <BookOpen size={20} />
                <span>Language</span>
                <strong>{completion.language}</strong>
              </div>

              <div>
                <Trophy size={20} />
                <span>Genre</span>
                <strong>{completion.genre}</strong>
              </div>

              <div>
                <span>Started Reading</span>
                <strong>{startDate}</strong>
              </div>

            </div>

          </div>

        </div>

        <div className="completion-footer">
          <Trophy size={25} />
          <span>SUCCESSFULLY COMPLETED</span>
        </div>

        <div className="completion-bottom">
          READ · REFLECT · ACHIEVE
        </div>

      </div>

      <button
        className="download-card-button"
        onClick={downloadCard}
      >
        <Download size={19} />
        Download Achievement Card
      </button>

    </div>
  );
}

export default CompletionCard;