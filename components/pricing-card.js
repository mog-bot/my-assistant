export function PricingCard({ tier, price, features, highlighted }) {
  return (
    <div
      className={`rounded-xl p-8 ${
        highlighted
          ? 'bg-purple-600 border-2 border-purple-400 scale-105'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-2 ${
          highlighted ? 'text-white' : 'text-gray-300'
        }`}
      >
        {tier}
      </h3>
      <div className="text-4xl font-bold mb-6 text-white">{price}</div>
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 ${
              highlighted ? 'text-purple-100' : 'text-gray-400'
            }`}
          >
            <span className="text-green-400" aria-hidden="true">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${
          highlighted
            ? 'bg-white text-purple-600 hover:bg-gray-100'
            : 'bg-purple-600 text-white hover:bg-purple-500'
        }`}
      >
        Get Started
      </button>
    </div>
  )
}
