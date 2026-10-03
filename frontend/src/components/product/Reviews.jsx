import { useState } from 'react';
import PropTypes from 'prop-types';

export default function Reviews({ reviews, onSubmit }) {
  const [error, setError] = useState('');
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await onSubmit({
        rating: Number(data.get('rating')),
        title: data.get('title'),
        text: data.get('text'),
      });
      event.currentTarget.reset();
      setError('');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="reviews-layout">
      <div>
        <h3>{average.toFixed(1)} out of 5</h3>
        <p>{reviews.length} reviews</p>
        {counts.map(({ star, count }) => (
          <p key={star}>
            {star} star: {count}
          </p>
        ))}
      </div>
      <form className="review-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Your rating</legend>
          <div className="star-options">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star}>
                <input type="radio" name="rating" value={star} required />
                {star} ★
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          Review title
          <input name="title" required maxLength="80" />
        </label>
        <label>
          Review text
          <textarea name="text" required rows="4" />
        </label>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit">Submit review</button>
      </form>
      <div className="review-list">
        {reviews.map((review) => (
          <article key={review.id}>
            <p aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}</p>
            <h3>{review.title}</h3>
            <p className="preserve-text">{review.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

Reviews.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSubmit: PropTypes.func.isRequired,
};
