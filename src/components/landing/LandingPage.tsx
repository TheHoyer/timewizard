'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import {
  AnimatedSection,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/AnimatedSection'

// Animated gradient background
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-violet-200/50 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ top: '-10%', right: '10%' }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-purple-200/40 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ top: '20%', left: '-10%' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-indigo-200/30 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ bottom: '10%', right: '20%' }}
      />
    </div>
  )
}

// Floating icons around hero
function FloatingIcons() {
  const icons = [
    { emoji: '📋', top: '15%', left: '10%', delay: 0 },
    { emoji: '⏰', top: '25%', right: '15%', delay: 0.5 },
    { emoji: '🎯', bottom: '30%', left: '8%', delay: 1 },
    { emoji: '📊', bottom: '25%', right: '10%', delay: 1.5 },
    { emoji: '✨', top: '40%', left: '5%', delay: 2 },
    { emoji: '🚀', top: '10%', right: '25%', delay: 2.5 },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {icons.map((icon, i) => (
        <FloatingElement
          key={i}
          delay={icon.delay}
          duration={3 + i * 0.5}
          className="absolute text-4xl opacity-20"
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            bottom: icon.bottom,
          } as React.CSSProperties}
        >
          {icon.emoji}
        </FloatingElement>
      ))}
    </div>
  )
}

// Animated stat counter
function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const end = value
          const duration = 2000
          const increment = end / (duration / 16)

          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)

          return () => clearInterval(timer)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-slate-900">
        {count.toLocaleString('pl-PL')}{suffix}
      </div>
      <div className="text-slate-600 font-medium mt-2">{label}</div>
    </div>
  )
}

// Navigation with scroll effect
function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">⏳</span>
            </div>
            <span className="font-bold text-xl text-slate-900">TimeWizard</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-violet-600 transition-colors"
            >
              Zaloguj się
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register">
                <Button size="sm">Rozpocznij za darmo</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <AnimatedBackground />
      <FloatingIcons />

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              Nowość: Inteligentne planowanie z AI
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Opanuj swój czas
            <motion.span
              className="block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              z TimeWizard
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-6 text-xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Inteligentny planer, który nie tylko zapisuje Twoje zadania, ale też
            <span className="text-violet-600 font-semibold"> optymalizuje harmonogram </span>
            na podstawie priorytetów, deadline&apos;ów i Twojej dostępności.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-violet-200">
                  Rozpocznij za darmo
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Zobacz jak działa
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-8 text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm font-medium">Bez karty kredytowej</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm font-medium">14 dni Pro za darmo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm font-medium">Anuluj kiedy chcesz</span>
            </div>
          </motion.div>
        </div>

        {/* Hero image/mockup */}
        <motion.div
          className="mt-16 relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-200/50 border border-slate-200 bg-white">
            <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-violet-50 p-4 sm:p-8">
              {/* Mock dashboard preview */}
              <div className="h-full rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-4 text-sm text-slate-500 font-medium">TimeWizard Dashboard</span>
                </div>
                <div className="flex h-[calc(100%-3rem)]">
                  <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 hidden sm:block">
                    <div className="space-y-2">
                      <div className="h-8 bg-violet-100 rounded-lg" />
                      <div className="h-8 bg-slate-200 rounded-lg" />
                      <div className="h-8 bg-slate-200 rounded-lg" />
                      <div className="h-8 bg-slate-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="h-16 sm:h-20 bg-violet-100 rounded-xl animate-pulse" />
                      <div className="h-16 sm:h-20 bg-blue-100 rounded-xl animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="h-16 sm:h-20 bg-green-100 rounded-xl animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="h-16 sm:h-20 bg-orange-100 rounded-xl animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="h-32 sm:h-40 bg-slate-100 rounded-xl" />
                      <div className="h-32 sm:h-40 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards around mockup */}
          <FloatingElement delay={0} className="absolute -left-4 sm:-left-8 top-1/4 z-20">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-slate-200"
              whileHover={{ scale: 1.05, rotate: -2 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-lg sm:text-xl">✓</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900">Zadanie ukończone!</div>
                  <div className="text-xs text-slate-500">Streak: 7 dni 🔥</div>
                </div>
              </div>
            </motion.div>
          </FloatingElement>

          <FloatingElement delay={1} className="absolute -right-4 sm:-right-8 top-1/3 z-20">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-slate-200"
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 text-lg sm:text-xl">🎯</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900">AI Sugestia</div>
                  <div className="text-xs text-slate-500">Zaplanuj spotkanie o 14:00</div>
                </div>
              </div>
            </motion.div>
          </FloatingElement>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}

// Stats Section
function StatsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Dołącz do rosnącej społeczności produktywnych ludzi
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedSection delay={0.1}>
            <StatCounter value={2847} suffix="+" label="Aktywnych użytkowników" />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <StatCounter value={127500} suffix="+" label="Ukończonych zadań" />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <StatCounter value={94} suffix="%" label="Poleca znajomym" />
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <StatCounter value={3} suffix="h" label="Średnio zaoszczędzone/tydz." />
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

// How it works section
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Dodaj zadania',
      description: 'Wpisz swoje zadania, ustaw priorytety, deadline\'y i szacowany czas wykonania.',
      icon: '📝',
    },
    {
      number: '02',
      title: 'Ustaw dostępność',
      description: 'Powiedz systemowi, kiedy możesz pracować. Definiuj bloki fokusowe i przerwy.',
      icon: '📅',
    },
    {
      number: '03',
      title: 'AI planuje',
      description: 'Nasz algorytm automatycznie układa optymalny harmonogram, uwzględniając wszystkie czynniki.',
      icon: '🤖',
    },
    {
      number: '04',
      title: 'Wykonuj i śledź',
      description: 'Realizuj zadania, buduj streak i śledź postępy z interaktywnymi statystykami.',
      icon: '🚀',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">
            Jak to działa
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            Od chaosu do perfekcyjnej organizacji
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Cztery proste kroki, które odmienią Twoją produktywność
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 0.15}>
                <motion.div
                  className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full"
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -20px rgba(139, 92, 246, 0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Number badge with connector dot */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 lg:left-1/2">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-200">
                      {step.number}
                    </div>
                  </div>
                  <div className="text-4xl mb-4 mt-4 text-center">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">{step.title}</h3>
                  <p className="text-slate-600 text-center">{step.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: '🎯',
      title: 'Inteligentne planowanie',
      description: 'Algorytm automatycznie układa Twoje zadania w optymalny harmonogram, uwzględniając priorytety i deadline\'y.',
      color: 'violet',
    },
    {
      icon: '📊',
      title: 'Wizualizacja produktywności',
      description: 'Śledź swoje postępy z interaktywnymi wykresami i statystykami. Zobacz, jak efektywnie wykorzystujesz czas.',
      color: 'blue',
    },
    {
      icon: '🔔',
      title: 'Inteligentne przypomnienia',
      description: 'Otrzymuj powiadomienia we właściwym momencie. Email, push i SMS - wybierz preferowany kanał.',
      color: 'green',
    },
    {
      icon: '📅',
      title: 'Integracja z kalendarzem',
      description: 'Połącz z Kalendarzem Google. Twoje zadania zawsze tam, gdzie ich potrzebujesz.',
      color: 'orange',
    },
    {
      icon: '🏆',
      title: 'Gamifikacja',
      description: 'Zdobywaj odznaki, buduj streak i rywalizuj ze sobą. Motywacja do działania każdego dnia.',
      color: 'pink',
    },
    {
      icon: '🚀',
      title: 'Bloki fokusowe',
      description: 'Definiuj swoje godziny skupienia. System nie zaplanuje rozpraszających zadań w czasie głębokiej pracy.',
      color: 'indigo',
    },
  ]

  const colorClasses = {
    violet: 'bg-violet-100 group-hover:bg-violet-200',
    blue: 'bg-blue-100 group-hover:bg-blue-200',
    green: 'bg-green-100 group-hover:bg-green-200',
    orange: 'bg-orange-100 group-hover:bg-orange-200',
    pink: 'bg-pink-100 group-hover:bg-pink-200',
    indigo: 'bg-indigo-100 group-hover:bg-indigo-200',
  }

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">
            Funkcje
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            Wszystko czego potrzebujesz do efektywnej pracy
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Potężne narzędzia w prostym i intuicyjnym interfejsie
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full cursor-pointer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-colors ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mt-4">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'TimeWizard całkowicie zmienił moje podejście do pracy. Teraz kończę projekty przed deadline\'em i mam więcej czasu dla rodziny.',
      author: 'Anna K.',
      role: 'Product Manager w branży IT',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      quote: 'Najlepszy planer jaki używałem. AI scheduling to game changer - oszczędzam kilka godzin tygodniowo na samym planowaniu.',
      author: 'Michał W.',
      role: 'Freelance Developer',
      avatar: '👨‍💻',
      rating: 5,
    },
    {
      quote: 'Gamifikacja motywuje mój zespół do lepszej pracy. Streak competition to świetny pomysł na budowanie nawyków!',
      author: 'Karolina M.',
      role: 'Team Lead w agencji marketingowej',
      avatar: '👩‍🚀',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">
            Opinie
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            Co mówią nasi użytkownicy
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full"
                whileHover={{ y: -4, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-slate-700 font-medium italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '0 zł',
      period: 'na zawsze',
      features: ['50 aktywnych zadań', '3 kategorie', 'Harmonogram dzienny', 'Powiadomienia email'],
      highlighted: false,
      cta: 'Rozpocznij za darmo',
    },
    {
      name: 'Pro',
      price: '39 zł',
      period: '/miesiąc',
      features: ['Nielimitowane zadania', 'Nielimitowane kategorie', 'AI scheduling', 'Google Calendar', 'Push + SMS'],
      highlighted: true,
      cta: 'Wybierz Pro',
      badge: 'Najpopularniejszy',
    },
    {
      name: 'Business',
      price: '79 zł',
      period: '/miesiąc',
      features: ['Wszystko z Pro', 'Workspace dla zespołu', 'Slack/Teams', 'API dostęp', 'Priorytetowe wsparcie'],
      highlighted: false,
      cta: 'Kontakt',
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">
            Cennik
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            Prosty cennik, bez niespodzianek
          </h2>
          <p className="text-slate-600 mt-4">
            Zacznij za darmo. Ulepsz, gdy będziesz gotowy.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <motion.div
                className={`relative rounded-2xl p-8 h-full ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white ring-4 ring-violet-200'
                    : 'bg-white border border-slate-200'
                }`}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-violet-200' : 'text-slate-600 font-medium'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className={plan.highlighted ? 'text-violet-200' : 'text-violet-600'}>✓</span>
                      <span className={plan.highlighted ? 'text-violet-100' : 'text-slate-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <motion.div className="mt-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/register"
                    className={`block w-full py-3 rounded-lg text-center font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-white text-violet-600 hover:bg-violet-50'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <AnimatedSection>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Gotowy, żeby odzyskać kontrolę nad czasem?
          </h2>
          <p className="mt-6 text-xl text-violet-100">
            Dołącz do tysięcy użytkowników, którzy już zwiększyli swoją produktywność.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register">
                <Button size="lg" className="bg-white text-violet-600 hover:bg-violet-50 w-full sm:w-auto">
                  Rozpocznij za darmo
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="mailto:kontakt@timewizard.pl"
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold hover:text-violet-100 transition-colors"
              >
                Porozmawiaj z nami
                <span>→</span>
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">⏳</span>
              </div>
              <span className="font-bold text-xl">TimeWizard</span>
            </div>
            <p className="text-slate-400 text-sm">
              Inteligentny planer dla nowoczesnych profesjonalistów.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Funkcje</a></li>
              <li><a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Cennik</a></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integracje</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Firma</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">O nas</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kariera</Link></li>
              <li><Link href="mailto:kontakt@timewizard.pl" className="hover:text-white transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Pomoc</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Dokumentacja</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Wsparcie</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 TimeWizard. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Polityka prywatności</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Regulamin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
