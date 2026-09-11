import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import { deleteReview } from "./actions";

export default async function ReviewModerationPage() {
    await authorizeRole("ADMIN");
    const reviews = await prisma.review.findMany({ include: { user: { select: { name: true } }, course: { select: { title: true } } } });

    return (
        <div className="p-12">
            <h1 className="text-3xl font-bold mb-8">Review Moderation</h1>
            {reviews.map(r => (
                <div key={r.id} className="p-4 border mb-2 flex justify-between items-center">
                    <div>
                        <p><strong>{r.user.name}</strong> on <em>{r.course.title}</em>: {r.rating}/5</p>
                        <p>{r.comment}</p>
                    </div>
                    <form action={deleteReview.bind(null, r.id)}><button className="text-red-600 font-bold">Delete</button></form>
                </div>
            ))}
        </div>
    );
}
