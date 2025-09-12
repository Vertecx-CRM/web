'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="card">
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex justify-between items-center text-left p-0 focus:outline-none focus:ring-2 focus:ring-rojo-primario focus:ring-offset-2 rounded-lg"
            aria-expanded={openIndex === index}
            aria-controls={`accordion-content-${index}`}
          >
            <h3 className="text-lg font-semibold text-gray-900 pr-4">
              {item.question}
            </h3>
            <ChevronDown 
              className={`w-5 h-5 text-rojo-primario transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          <div
            id={`accordion-content-${index}`}
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? 'max-h-96 mt-4' : 'max-h-0'
            }`}
          >
            <p className="text-muted leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}