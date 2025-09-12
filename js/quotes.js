// Random famous quote per load
(function(){
  const el = document.getElementById('hero-quote');
  if (!el) return;
  const quotes = [
    { t: 'Simplicity is the ultimate sophistication.', a: 'Leonardo da Vinci' },
    { t: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
    { t: 'Programs must be written for people to read, and only incidentally for machines to execute.', a: 'Harold Abelson' },
    { t: 'In the middle of difficulty lies opportunity.', a: 'Albert Einstein' },
    { t: 'The best way to predict the future is to invent it.', a: 'Alan Kay' },
    { t: 'First, solve the problem. Then, write the code.', a: 'John Johnson' },
    { t: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', a: 'Antoine de Saint-Exupéry' },
    { t: 'Stay hungry. Stay foolish.', a: 'Whole Earth Catalog' },
  ];
  const q = quotes[Math.floor(Math.random()*quotes.length)];
  el.textContent = `“${q.t}” — ${q.a}`;
})();

