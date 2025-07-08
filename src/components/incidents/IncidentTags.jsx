export default function IncidentTags({ tags }) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
        >
          #{tag}
        </span>
      ))}
    </div>
  )
} 