"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Monitor, Circle, Zap, Maximize2 } from "lucide-react"
import { Footer } from "@/components/footer"

interface Video {
  id: string
  title: string
  description: string
  original_url: string
  thumbnail_medium_url: string
  image_format: string
  price: number
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string
}

interface EnvironmentVideoDetailClientProps {
  video: Video
  category: Category | null
  relatedVideos: Video[]
  natureSectionVideos: Video[]
}

export function EnvironmentVideoDetailClient({
  video,
  category,
  relatedVideos,
  natureSectionVideos,
}: EnvironmentVideoDetailClientProps) {
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "email" | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    interests: [] as string[],
  })

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleWhatsAppContact = () => {
    const message = `Hi, I'm interested in ${video.title}. Please send me more information.`
    const phoneNumber = "1234567890" // Replace with your WhatsApp number
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          interests: formData.interests.join(", "),
          videoTitle: video.title,
        }),
      })

      if (response.ok) {
        alert("Your inquiry has been submitted successfully!")
        setFormData({ email: "", interests: [] })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 py-6 px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/environments" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-light tracking-wider">{video.title}</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed text-sm">
                  {video.description || `A seamless immersive environment engineered for large-scale dome projection. Designed for continuous immersive installation and event programming.`}
                </p>
                <p className="text-slate-400 leading-relaxed text-sm font-light">
                  Full-dome preview available by request. For pricing, technical specifications, and licensing inquiries, please submit a request below.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button className="bg-slate-700 hover:bg-slate-600 text-white border-0">
                  Request Private Demo
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                  View Licensing Options
                </Button>
              </div>
            </div>

            {/* Right - Video Preview */}
            <div className="lg:col-span-1">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-xl shadow-cyan-500/10">
                <Image
                  src={video.thumbnail_medium_url || video.original_url || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-16" />

          {/* Video Specifications */}
          <div className="mb-16">
            <h2 className="text-lg font-light tracking-wider mb-8">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <Monitor className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Format</p>
                    <p className="text-sm font-light">4096 x 4096</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <Circle className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Structure</p>
                    <p className="text-sm font-light">Seamless Loop</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Duration of Cycle</p>
                    <p className="text-sm font-light">60 seconds</p>
                    <p className="text-xs text-slate-500">60 fps</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <Maximize2 className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Dome Size</p>
                    <p className="text-sm font-light">8m - 20m+</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-16" />

          {/* Fast Inquiry Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-light tracking-wider mb-8">Submit Fast Inquiry</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* WhatsApp */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-lg font-light">WhatsApp</h3>
                  <p className="text-sm text-slate-400">Contact us and we will reply within few hours</p>
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white border-0"
                  >
                    Contact Now
                  </Button>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-8">
                  <h3 className="text-lg font-light mb-6">Email</h3>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />

                    <div className="space-y-2">
                      {[
                        "I'd like to test a demo in my dome",
                        "I'm interested in watching a full episode",
                        "Send me the complete catalogue",
                        "I want to commission a custom show",
                      ].map((interest) => (
                        <label key={interest} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                            className="w-4 h-4 border border-slate-600 rounded bg-slate-800 cursor-pointer"
                          />
                          <span className="text-slate-300">{interest}</span>
                        </label>
                      ))}
                    </div>

                    <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white border-0">
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-16" />

          {/* Related Items */}
          {relatedVideos.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-light tracking-wider mb-8">Related Items</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedVideos.map((relatedVideo) => (
                  <Link
                    key={relatedVideo.id}
                    href={`/environments/${relatedVideo.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 mb-2">
                      <Image
                        src={relatedVideo.thumbnail_medium_url || relatedVideo.original_url || "/placeholder.svg"}
                        alt={relatedVideo.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors line-clamp-2">
                      {relatedVideo.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Nature Section */}
          {natureSectionVideos.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light tracking-wider">Nature</h2>
                <Link href="/environments" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Show All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {natureSectionVideos.map((natureVideo) => (
                  <Link
                    key={natureVideo.id}
                    href={`/environments/${natureVideo.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 mb-2">
                      <Image
                        src={natureVideo.thumbnail_medium_url || natureVideo.original_url || "/placeholder.svg"}
                        alt={natureVideo.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors line-clamp-2">
                      {natureVideo.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-slate-800 mb-16" />

          {/* Auth Section */}
          <div className="text-center py-8 space-y-4">
            <p className="text-slate-400 text-sm">Already registered?</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                Log In
              </Button>
              <Button className="bg-slate-700 hover:bg-slate-600 text-white border-0">
                Register
              </Button>
            </div>
            <p className="text-slate-500 text-sm pt-4">Register now and get premium access</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
