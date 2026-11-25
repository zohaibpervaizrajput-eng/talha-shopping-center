import { useState } from 'react';
const FAQS = [
  ['In how many days delivery happens?', 'In Lahore / Karachi / Islamabad in 2-3 days, in other cities in 3-5 working days.'],
  ['Is Cash on Delivery available?', 'Yes, COD is available in whole Pakistan.'],
  ['What is Return policy?', 'Within 7 days unused product can be returned. Jewellery should be in original packing.'],
  ['Which Payment methods are there?', 'COD, JazzCash, Easypaisa, Bank Transfer.'],
  ['When do I get Free delivery?', 'On orders above threshold given in Settings you get free delivery.'],
  ['How do I track Order?', 'In My Orders > Order Details you will get status + tracking number.'],
  ['Is Product genuine?', 'Yes, every product is quality-checked. If there is any issue then contact on WhatsApp.'],
];
export default function FAQ() {
  const [open, setOpen] = useState(0);
  return <div className="max-w-3xl mx-auto px-4 py-10"><h1 className="text-3xl font-bold">Frequently Asked Questions</h1><div className="mt-6 space-y-3">{FAQS.map(([q, a], i) => <div key={q} className="border rounded-2xl"><button onClick={() => setOpen(open === i ? -1 : i)} className="w-full text-left p-4 font-semibold flex justify-between">{q}<span>{open === i ? '−' : '+'}</span></button>{open === i && <p className="px-4 pb-4 text-sm text-gray-600">{a}</p>}</div>)}</div></div>;
}