'use client'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()} 
      className="absolute top-4 left-4 p-2 rounded-full hover:bg-neutral-100 transition-colors z-50"
      aria-label="Go back"
    >
      <ChevronLeft className="text-neutral-900" size={24}/>
    </button>
  )
}
