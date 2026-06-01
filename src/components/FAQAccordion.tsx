import { useState } from 'react';
import { FAQS_DATA } from '../data';
import { Plus, Minus, Search, LifeBuoy } from 'lucide-react';

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'General Care', 'Treatments', 'Cosmetic', 'Surgery', 'Emergency', 'Insurance & Pricing'];

  // Filter FAQs based on category filter and search query
  const filteredFAQs = FAQS_DATA.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search & Category Filter bar */}
      <div className="bg-[#F8FAFC] p-4 rounded-3xl border border-[#E2E8F0] space-y-3.5 shadow-sm">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4.5 h-4.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search our patient dental knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-full text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#E2E8F0] border-l-4 border-l-[#2563EB] bg-[#2563EB]/[0.02] shadow-sm'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex justify-between items-center text-left p-4 sm:p-5 font-semibold text-[#0F172A] text-sm sm:text-base focus:outline-none focus:bg-slate-50 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <span className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-slate-100 text-slate-500'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {/* Animated expand/collapsible container */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[300px] opacity-100 border-t border-[#E2E8F0]/50' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 sm:p-5 text-[#64748B] text-sm sm:text-base leading-relaxed bg-white">
                    {faq.answer}
                    <div className="flex gap-2 mt-4 items-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                        Category: {faq.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#E2E8F0] space-y-2">
            <LifeBuoy className="w-10 h-10 text-[#64748B] mx-auto opacity-40 animate-spin" />
            <p className="text-sm font-semibold text-[#0F172A]">No answers matching your search criteria</p>
            <p className="text-xs text-[#64748B]">Try selecting "All" or keying in alternative phrases</p>
          </div>
        )}
      </div>
    </div>
  );
}
