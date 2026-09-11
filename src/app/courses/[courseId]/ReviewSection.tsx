"use client";
import { useState } from "react";
import { submitReview } from "../review-actions";

export default function ReviewSection({ courseId }: { courseId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
      await submitReview(courseId, rating, comment);
      alert("Review submitted!");
  };

  return (
    <div className="mt-8 p-4 bg-white rounded border">
        <h2 className="font-bold text-lg">Leave a Review</h2>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border p-2 mt-2">
            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border p-2 mt-2" placeholder="Comment..." />
        <button onClick={handleSubmit} className="bg-primary text-white p-2 mt-2 rounded">Submit Review</button>
    </div>
  );
}
