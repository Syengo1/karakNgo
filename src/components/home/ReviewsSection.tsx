"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { Star, Send, User } from "lucide-react";

export default function ReviewsSection() {
  const { currentBranch } = useBranchStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentBranch) return;
    
    // Fetch last 3 reviews for this branch
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setReviews(data);
    };
    fetchReviews();
  }, [currentBranch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranch) return;
    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert([{
        branch_id: currentBranch.id,
        customer_name: newName || "Anonymous Sip",
        rating: newRating,
        comment: newComment
    }]);

    if (!error) {
        alert("Thanks for the love! 🌸");
        setNewComment("");
        setNewName("");
        // Refresh local list temporarily
        setReviews(prev => [{
            id: 'temp', customer_name: newName || "You", rating: newRating, comment: newComment, created_at: new Date()
        }, ...prev].slice(0, 3));
    }
    setSubmitting(false);
  };

  if (!currentBranch) return null;

  return (
    <section className="py-16 bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        
        {/* Left: Display Reviews */}
        <div>
            <h2 className="font-serif text-3xl text-crack-black mb-8">Community Sips</h2>
            <div className="space-y-6">
                {reviews.length === 0 && <p className="text-crack-black/50 italic">Be the first to review {currentBranch.name}!</p>}
                
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-crack-black/5">
                        <div className="flex gap-1 mb-2 text-crack-orange">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                        </div>
                        <p className="text-crack-black/80 font-serif italic mb-3">"{review.comment}"</p>
                        <div className="flex items-center gap-2 text-sm text-crack-black/40 font-bold uppercase tracking-wider">
                            <div className="w-6 h-6 bg-crack-sage/20 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-crack-sage" />
                            </div>
                            {review.customer_name}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Write Review */}
        <div className="bg-crack-cream p-8 rounded-3xl border border-crack-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-crack-orange/10 rounded-full blur-3xl -z-10" />
            
            <h3 className="font-serif text-2xl text-crack-black mb-1">Pass the Vibe Check</h3>
            <p className="text-sm text-crack-black/60 mb-6">How was your {currentBranch.name} experience?</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase text-crack-black/40 block mb-2">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setNewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                <Star className={`w-8 h-8 ${star <= newRating ? 'text-crack-orange fill-current' : 'text-black/10'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <input 
                    className="w-full bg-white border-0 rounded-xl p-4 text-crack-black placeholder:text-black/30 focus:ring-2 focus:ring-crack-orange outline-none"
                    placeholder="Your Name (Optional)"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />

                <textarea 
                    className="w-full bg-white border-0 rounded-xl p-4 text-crack-black placeholder:text-black/30 focus:ring-2 focus:ring-crack-orange outline-none resize-none"
                    rows={3}
                    placeholder="Tell us what you sipped..."
                    required
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                />

                <button disabled={submitting} className="w-full bg-crack-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-crack-orange transition-colors">
                    {submitting ? "Posting..." : <><Send className="w-4 h-4" /> Post Review</>}
                </button>
            </form>
        </div>

      </div>
    </section>
  );
}