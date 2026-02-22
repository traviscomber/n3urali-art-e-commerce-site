"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Menu, X, Trash2, Plus, Minus, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { LanguageToggle } from "@/components/language-toggle"
import { UserMenu } from "./user-menu"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/lib/contexts/auth-context"
import { useMusicPlayer } from "@/lib/contexts/music-player-context"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useRouter, usePathname } from "next/navigation"

interface HeaderProps {
  videoContext?: {
    videoUrl: string
    collectionTitle: string
    videoRef: React.RefObject<HTMLVideoElement>
  }
}

export function Header({ videoContext }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [musicHasStarted, setMusicHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)

  const { items, toggleCart, isOpen, removeItem, updateQuantity, total, closeCart } = useCart()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const musicPlayer = useMusicPlayer()

  const itemCount = (items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    if (!videoContext) return

    const handleScroll = () => {
      setShowVideoPlayer(window.scrollY > window.innerHeight * 0.8)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [videoContext])

  useEffect(() => {
    const handleScroll = () => {
      setShowAudioPlayer(window.scrollY > 400 && musicHasStarted && musicPlayer.playlist.length > 0)
    }

    window.addEventListener("scroll", handleScroll)

    // Also check on musicHasStarted state change
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [musicHasStarted, musicPlayer.playlist.length])

  useEffect(() => {
    if (musicPlayer.isPlaying && musicPlayer.playlist.length > 0) {
      setMusicHasStarted(true)
    }
  }, [musicPlayer.isPlaying, musicPlayer.playlist.length])

  useEffect(() => {
    if (!videoContext?.videoRef.current) return

    const video = videoContext.videoRef.current
    const updatePlayingState = () => setIsPlaying(!video.paused)

    video.addEventListener("play", updatePlayingState)
    video.addEventListener("pause", updatePlayingState)

    return () => {
      video.removeEventListener("play", updatePlayingState)
      video.removeEventListener("pause", updatePlayingState)
    }
  }, [videoContext])

  useEffect(() => {
    if (!musicPlayer.audioRef.current) return

    const audio = musicPlayer.audioRef.current
    const updateMuteState = () => setIsAudioMuted(audio.muted)

    // Set initial state
    updateMuteState()

    // Listen for volumechange events (includes mute changes)
    audio.addEventListener("volumechange", updateMuteState)

    return () => {
      audio.removeEventListener("volumechange", updateMuteState)
    }
  }, [musicPlayer.audioRef])

  const handleCheckout = () => {
    closeCart()
    router.push("/checkout")
  }

  const togglePlayPause = () => {
    if (videoContext && videoContext.videoRef.current) {
      const video = videoContext.videoRef.current
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }
  }

  const toggleMute = () => {
    if (videoContext && videoContext.videoRef.current) {
      const video = videoContext.videoRef.current
      video.muted = !video.muted
      setIsMuted(video.muted)
    }
  }

  const toggleAudioPlayPause = () => {
    if (!musicPlayer.audioRef.current) return

    if (musicPlayer.isPlaying) {
      musicPlayer.audioRef.current.pause()
      musicPlayer.setIsPlaying(false)
    } else {
      musicPlayer.audioRef.current.play().then(() => {
        musicPlayer.setIsPlaying(true)
      })
    }
  }

  const toggleAudioMute = () => {
    if (!musicPlayer.audioRef.current) return
    musicPlayer.audioRef.current.muted = !musicPlayer.audioRef.current.muted
    setIsAudioMuted(musicPlayer.audioRef.current.muted)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="relative h-12 w-48">
              <Image
                src="/images/n3uralia-logo.png"
                alt="N3uralia.art"
                fill
                className="object-contain brightness-0 invert group-hover:opacity-80 transition-opacity duration-300"
                priority
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/shows"
              className="relative text-sm font-medium text-slate-200 hover:text-cyan-400 transition-all duration-300 group px-4 py-2"
            >
              Shows
              <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 group-hover:w-[calc(100%-32px)] transition-all duration-300" />
            </Link>
            <Link
              href="/environments"
              className="relative text-sm font-medium text-slate-200 hover:text-cyan-400 transition-all duration-300 group px-4 py-2"
            >
              Environments
              <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 group-hover:w-[calc(100%-32px)] transition-all duration-300" />
            </Link>
            <Link
              href="/theatre"
              className="relative text-sm font-medium text-slate-200 hover:text-cyan-400 transition-all duration-300 group px-4 py-2"
            >
              Theatre
              <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 group-hover:w-[calc(100%-32px)] transition-all duration-300" />
            </Link>
            <Link
              href="/studio"
              className="relative text-sm font-medium text-slate-200 hover:text-cyan-400 transition-all duration-300 group px-4 py-2"
            >
              Studio
              <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 group-hover:w-[calc(100%-32px)] transition-all duration-300" />
            </Link>
            <Link
              href="/tools"
              className="relative text-sm font-medium text-slate-200 hover:text-cyan-400 transition-all duration-300 group px-4 py-2"
            >
              Tools
              <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 group-hover:w-[calc(100%-32px)] transition-all duration-300" />
            </Link>
            {isAuthenticated && (
              <Link
                href="/account/orders"
                className="relative text-sm font-medium text-slate-400 hover:text-cyan-400 transition-all duration-300 group px-4 py-2"
              >
                Orders
                <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 group-hover:w-[calc(100%-32px)] transition-all duration-300" />
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <ThemeToggle />

            <Sheet open={isOpen} onOpenChange={toggleCart}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative bg-card/50 border-border/50 text-foreground hover:bg-card hover:glow-accent transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground animate-pulse-glow">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>
                    {t("header.shoppingCart")} ({itemCount})
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col h-full">
                  {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t("header.cartEmpty")}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-auto space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                            <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                              <Image
                                src={item.preview_image_url || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.license_name}</p>
                              <p className="text-lg font-semibold mt-1">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {!item.isBundle && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="h-7 w-7"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-7 w-7"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 mt-4 space-y-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>{t("header.total")}</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <Button onClick={handleCheckout} className="w-full" size="lg">
                          {t("header.proceedToCheckout")}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <UserMenu />

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-accent/50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-6 bg-slate-900/80 backdrop-blur-xl rounded-b-lg">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/shows"
                className="text-base font-medium text-slate-200 hover:text-cyan-400 transition-colors px-4 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shows
              </Link>
              <Link
                href="/environments"
                className="text-base font-medium text-slate-200 hover:text-cyan-400 transition-colors px-4 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Environments
              </Link>
              <Link
                href="/theatre"
                className="text-base font-medium text-slate-200 hover:text-cyan-400 transition-colors px-4 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Theatre
              </Link>
              <Link
                href="/studio"
                className="text-base font-medium text-slate-200 hover:text-cyan-400 transition-colors px-4 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Studio
              </Link>
              <Link
                href="/tools"
                className="text-base font-medium text-slate-200 hover:text-cyan-400 transition-colors px-4 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tools
              </Link>
              {isAuthenticated && (
                <Link
                  href="/account/orders"
                  className="text-base font-medium text-slate-400 hover:text-cyan-400 transition-colors px-4 py-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Orders
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
