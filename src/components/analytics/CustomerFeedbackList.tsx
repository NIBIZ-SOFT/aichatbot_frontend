"use client";

import React from "react";
import { MessageSquare, Star, User, Clock } from "lucide-react";

interface FeedbackItem {
  conversation_id: string;
  visitor_name: string;
  rating: number;
  feedback?: string;
  department: string;
  created_at: string;
}

interface CustomerFeedbackListProps {
  feedbacks: FeedbackItem[];
}

export default function CustomerFeedbackList({ feedbacks }: CustomerFeedbackListProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
        <h4 className="font-bold text-slate-700 text-sm">No customer reviews yet</h4>
        <p className="text-xs text-slate-400">Post-chat ratings and visitor feedback will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Verified Customer Reviews & Feedback
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time ratings received upon conversation completion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {feedbacks.map((f, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {f.department}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                "{f.feedback || 'Great customer experience and instant support!'}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" /> {f.visitor_name}
              </span>
              <span className="font-mono text-[10px]">
                {new Date(f.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
