import React from 'react';
import { HelpCircle, Mail, MessageSquare, PhoneCall } from 'lucide-react';

export default function DoctorSupport() {
  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto flex-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">How can we help you?</h2>
        <p className="text-slate-400">Search our knowledge base or get in touch with our support team.</p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <input 
          type="text" 
          placeholder="Search for answers..." 
          className="w-full bg-[#131F35] border border-slate-700 hover:border-blue-500 focus:border-blue-500 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white outline-none transition-colors shadow-lg text-sm md:text-base" 
        />
        <button className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 rounded-xl font-bold transition-colors text-sm md:text-base">
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-white font-bold mb-2">Live Chat</h3>
          <p className="text-slate-400 text-sm">Chat with our support team instantly.</p>
        </div>
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h3 className="text-white font-bold mb-2">Email Us</h3>
          <p className="text-slate-400 text-sm">Get a response within 24 hours.</p>
        </div>
        <div className="bg-[#131F35] border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4">
            <PhoneCall size={24} />
          </div>
          <h3 className="text-white font-bold mb-2">Call Support</h3>
          <p className="text-slate-400 text-sm">Available for urgent technical issues.</p>
        </div>
      </div>

      <div className="bg-[#131F35] border border-slate-800 rounded-3xl p-4 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            'How do I add a new prescription template?',
            'What happens if I miss a scheduled consultation?',
            'How are my monthly payouts calculated?',
            'Can I change my consultation availability hours?'
          ].map((q, i) => (
            <details key={i} className="group bg-[#0B1121] border border-slate-800 rounded-xl">
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-white">
                {q}
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-400 mt-3 group-open:animate-fadeIn px-5 pb-5 text-sm">
                This is a placeholder answer for the frequently asked question. Our support team is currently working on providing detailed documentation for all these queries.
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
