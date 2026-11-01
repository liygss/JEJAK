import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Zap,
  Leaf,
  Brain,
  BarChart3,
  FileText,
  Radio,
  ArrowRight,
  ArrowUpRight,
  Gauge,
  TrendingUp,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Clock,
  Menu,
  X,
  Send,
  Factory,
  Compass,
  Layers,
  ChevronDown,
  Activity,
} from 'lucide-react'
import SectionHeader from '../components/landing/SectionHeader'
import Reveal from '../components/ui/Reveal'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const navItems = [
  { label: 'Platform', href: '#main-banner' },
  { label: 'How It Works', href: '#development' },
  { label: 'Solutions', href: '#work' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Insights', href: '#upgrade' },
  { label: 'FAQ', href: '#faq' },
]

const tickerData = [
  { title: 'Total Energy', short: 'MWh today', icon: Zap, value: '356.5 MWh', mark: '+4.2% vs yesterday', up: true },
  { title: 'Carbon', short: 'tCO₂e today', icon: Leaf, value: '143.7 tCO₂e', mark: '-3.1% vs yesterday', up: false },
  { title: 'Efficiency', short: 'output/energy', icon: Gauge, value: '0.72 ratio', mark: '+0.06 vs baseline', up: true },
  { title: 'Peak Load', short: 'MW at 14:00', icon: TrendingUp, value: '18.4 MW', mark: '+2.3% vs baseline', up: true },
  { title: 'Devices Online', short: 'of 9 sensors', icon: Radio, value: '9 / 9 online', mark: 'All reporting', up: true },
  { title: 'CO₂ Intensity', short: 'kg per MWh', icon: Activity, value: '403 kg/MWh', mark: '-6.0% vs baseline', up: false },
]

const services = [
  { icon: Factory, text: 'Real-Time Monitoring' },
  { icon: Brain, text: 'AI-Powered Insights' },
  { icon: Leaf, text: 'Carbon MRV' },
  { icon: BarChart3, text: 'Energy Analytics' },
]

const timelineData = [
  { icon: Compass, title: 'Connect', text: 'Link your plant, meters and IoT sensors' },
  { icon: Layers, title: 'Aggregate', text: 'Unify energy and carbon data in one place' },
  { icon: Brain, title: 'Analyze', text: 'Surface anomalies, waste and opportunities' },
  { icon: FileText, title: 'Report', text: 'Generate audit-ready operational reports' },
]

const protocolsData = [
  { icon: Zap, title: 'Track real-time energy', text: 'Live readings from your meters and sensors.' },
  { icon: Leaf, title: 'Measure carbon output', text: 'Translate energy use into tCO₂e estimates.' },
  { icon: Brain, title: 'Detect anomalies early', text: 'Flag waste, spikes and idle load automatically.' },
]

const upgradeData = [
  'Real-Time Visibility',
  'AI-Powered Recommendations',
  'Carbon Accounting',
  'Audit-Ready Reports',
]

const perksData = [
  {
    icon: ShieldCheck,
    title: 'Reliable',
    text: 'Built for industrial uptime with continuous monitoring across every connected asset.',
  },
  {
    icon: Sparkles,
    title: 'Intelligent',
    text: 'Turn raw meter and sensor data into clear, actionable operational insights.',
  },
  {
    icon: Clock,
    title: 'Always On',
    text: 'Dashboards and reports that stay current as your operations run around the clock.',
  },
]

const faqData = [
  {
    q: 'What data does JEJAK use?',
    a: 'JEJAK memakai data pabrik, meteran, dan sensor untuk dapat menjelajah seluruh tampilan tanpa perlu menghubungkan perangkat keras.',
  },
  {
    q: 'Is the energy and carbon data accurate?',
    a: 'The figures shown here are drawn from the selected period. They illustrate how JEJAK visualises energy consumption and carbon output — they are not official measured emissions.',
  },
  {
    q: 'Can JEJAK replace regulatory reporting?',
    a: 'No. JEJAK helps you organise operational data and produce audit-ready summaries. Formal regulatory submissions and verification remain your responsibility.',
  },
  {
    q: 'Do I need special hardware?',
    a: 'JEJAK is designed to work with existing industrial meters and IoT gateways through the device integration layer.',
  },
]

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`container mx-auto lg:max-w-screen-xl px-4 sm:px-6 ${className}`}>{children}</div>
)

const Section = ({ children, id, className = '' }: { children: React.ReactNode; id?: string; className?: string }) => (
  <section id={id} className={`md:py-32 py-16 ${className}`}>
    {children}
  </section>
)

const Brand = ({ dark = false }: { dark?: boolean }) => (
  <Link to="/" className="flex items-center gap-3">
    <img
      src="/logo-jejak.jpeg"
      alt="JEJAK logo"
      className="h-10 w-10 rounded-full object-cover bg-white ring-1 ring-border"
    />
    <span
      className="flex items-baseline text-2xl md:text-3xl font-bold tracking-tight"
      style={{ color: dark ? '#99E39E' : '#059669' }}
    >
      JEJAK
    </span>
  </Link>
)

const TickerCard = ({ item }: { item: (typeof tickerData)[number] }) => {
  const Icon = item.icon
  return (
    <div className="w-[280px] shrink-0 px-5 py-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-4">
        <div className="bg-soft-mint p-3 rounded-full">
          <Icon className="w-6 h-6 text-primary-green" />
        </div>
        <p className="text-main-text text-xs font-normal">
          <span className="text-16 font-bold mr-2">{item.title}</span>
          {item.short}
        </p>
      </div>
      <div className="flex justify-between items-baseline mt-6">
        <p className="text-16 font-bold text-main-text leading-none">{item.value}</p>
        <span className={`text-xs font-medium ${item.up ? 'text-primary-green' : 'text-secondary-text'}`}>
          {item.mark}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

const Header = () => {
  const [sticky, setSticky] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 80)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        sticky ? 'shadow-md bg-surface/95 backdrop-blur py-3' : 'bg-surface py-5 md:py-6'
      }`}
    >
      <Container className="flex items-center justify-between">
        <Brand />

        <nav className="hidden lg:flex flex-grow items-center gap-8 justify-center">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-17 font-medium text-main-text hover:text-primary-green transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="hidden lg:inline-flex border border-border text-main-text px-5 py-2.5 rounded-lg font-medium hover:bg-main-bg transition-colors"
          >
            Admin
          </Link>
          <Link
            to="/dashboard"
            className="hidden lg:inline-flex bg-primary-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-deep-teal transition-colors"
          >
            Open Dashboard
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="block lg:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="w-6 h-6 text-main-text" /> : <Menu className="w-6 h-6 text-main-text" />}
          </button>
        </div>
      </Container>

      {open && (
        <div
          id="mobile-nav"
          className="lg:hidden absolute top-full left-0 w-full bg-surface shadow-lg border-t border-border px-4 py-4"
        >
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-17 font-medium text-main-text border-b border-border"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              className="mt-4 bg-primary-green text-white text-center px-5 py-3 rounded-lg font-medium"
            >
              Open Dashboard
            </Link>
            <Link
              to="/admin"
              className="mt-2 border border-border text-main-text text-center px-5 py-3 rounded-lg font-medium"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

const Hero = () => (
  <section className="relative md:pt-44 pt-32 overflow-hidden" id="main-banner">
    <div className="pointer-events-none absolute -top-24 -left-24 w-[32rem] h-[32rem] bg-soft-mint rounded-full blur-3xl opacity-50" />
    <Container className="relative">
      <div className="grid grid-cols-12 items-center gap-8">
        <motion.div
          initial={{ x: '-40%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-6 col-span-12"
        >
          <div className="inline-flex gap-3 items-center bg-soft-mint/60 border border-soft-mint rounded-full pl-2 pr-5 py-2 mb-6">
            <div className="bg-white p-2 rounded-full">
              <Zap className="w-5 h-5 text-primary-green" />
            </div>
            <p className="text-main-text text-16 md:text-18 font-semibold mb-0">
              Industrial Energy On The <span className="text-primary-green">Go</span>
            </p>
          </div>
          <h1 className="font-semibold lg:text-[4.75rem] md:text-70 text-44 leading-[1.08] tracking-tight lg:text-start text-center text-main-text mb-6">
            Track every <span className="text-primary-green">watt</span>, measure every{' '}
            <span className="text-primary-green">tonne</span>.
          </h1>
          <p className="text-secondary-text text-21 mb-10 lg:text-start text-center max-w-xl">
            JEJAK turns scattered plant data into clear, real-time intelligence. Figures shown here
            reflect the selected period.
          </p>
          <div className="flex flex-wrap items-center md:justify-start justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-primary-green border border-primary-green rounded-lg text-21 font-medium hover:bg-deep-teal text-white py-3 px-8 transition-colors"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/admin"
              className="bg-transparent border border-primary-green rounded-lg text-21 font-medium hover:bg-soft-mint text-primary-green py-3 px-8 transition-colors"
            >
              Admin
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: '40%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="col-span-6 lg:block hidden"
        >
          <div className="relative ml-6">
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-soft-mint/70" />
            <img
              src="/Industrial%20IoT%20Dashboard%20Showcase.png"
              alt="JEJAK dashboard preview"
              className="relative w-full max-h-[540px] object-contain rounded-3xl border border-border shadow-xl bg-surface"
            />
          </div>
        </motion.div>
      </div>

      <Ticker />
    </Container>
  </section>
)

const Ticker = () => (
  <div className="mt-20 lg:mt-24 marquee-track overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
    <div className="flex gap-6 w-max animate-marquee">
      {[...tickerData, ...tickerData].map((item, i) => (
        <TickerCard key={`${item.title}-${i}`} item={item} />
      ))}
    </div>
  </div>
)

const Work = () => (
  <Section id="work">
    <Container>
      <div className="grid grid-cols-12 items-center gap-10">
        <Reveal className="lg:col-span-7 col-span-12">
          <SectionHeader
            eyebrow={
              <>
                Work with <span className="text-primary-green">JEJAK</span>
              </>
            }
            title="Give every kilowatt a purpose."
            subtitle="From live monitoring to carbon accounting — JEJAK covers the full operational picture."
          />
          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.text}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="p-3 bg-soft-mint rounded-full shrink-0">
                    <Icon className="w-6 h-6 text-primary-green" />
                  </div>
                  <p className="text-18 font-medium text-main-text">{service.text}</p>
                </div>
              )
            })}
          </div>
        </Reveal>
        <Reveal className="lg:col-span-5 col-span-12" delay={0.1}>
          <div className="group relative mx-auto max-w-md lg:mx-0">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-soft-mint/70 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-teal-accent/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-2xl shadow-deep-teal/10">
              <img
                src="/Smart%20IoT%20Monitoring%20in%20Electrical%20Cabinet.png"
                alt="JEJAK operations"
                className="h-[300px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:h-[380px] lg:h-[430px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/60 via-transparent to-transparent" />
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary-green shadow-sm backdrop-blur">
                AIoT
              </span>
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-deep-teal shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-green" /> Langsung
              </span>
            </div>

            <div className="relative -mt-8 ml-5 mr-5 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-xl">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-deep-teal to-primary-green text-white">
                <Radio className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-main-text">Pemantauan Perangkat Langsung</p>
                <p className="truncate text-xs text-secondary-text">Meteran, sensor &amp; gateway dalam satu konsol</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-secondary-text transition-colors group-hover:text-primary-green" />
            </div>
          </div>
        </Reveal>
      </div>
    </Container>
  </Section>
)

const Timeline = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <Section id="development">
      <Container className="text-center">
        <SectionHeader
          align="center"
          eyebrow={
            <>
              Operating <span className="text-primary-green">flow</span>
            </>
          }
          title="From raw readings to decisions — JEJAK helps at every step."
          subtitle="Four stages that turn scattered signals into confident action."
        />

        <div ref={ref} className="relative mt-16">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="lg:block hidden rounded-3xl bg-gradient-to-b from-grey to-transparent py-8">
              <img
                src="/alat%20iot.jpeg"
                alt="JEJAK timeline"
                className="w-3/4 max-h-[440px] object-contain rounded-[3rem] mx-auto"
              />
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {timelineData.map((item, i) => {
              const Icon = item.icon
              return (
                <Reveal key={item.title} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="bg-soft-mint p-3 rounded-full w-fit mx-auto">
                      <Icon className="w-6 h-6 text-primary-green" />
                    </div>
                    <h4 className="text-24 text-main-text mt-4 font-medium">{item.title}</h4>
                    <p className="text-secondary-text text-18 mt-2">{item.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}

const Platform = () => (
  <Section className="md:pt-8 py-0">
    <Container>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-green to-deep-teal rounded-3xl px-8 sm:px-16 py-12 sm:py-14 grid grid-cols-12 items-center gap-6 shadow-lg">
        <div className="pointer-events-none absolute -right-16 -bottom-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="lg:col-span-8 col-span-12 relative">
          <h2 className="text-white sm:text-40 text-30 font-semibold mb-4">
            Powered by the JEJAK Platform
          </h2>
          <p className="text-white/80 text-18">
            One place to observe energy, carbon and operational performance across your plant.
          </p>
        </div>
        <div className="lg:col-span-4 col-span-12 relative">
          <div className="flex lg:justify-end lg:mt-0 mt-5 justify-center">
            <Link
              to="/dashboard"
              className="text-primary-green bg-white py-3 px-6 rounded-lg sm:text-21 text-18 font-medium hover:bg-deep-teal hover:text-white transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </Container>
  </Section>
)

const Analytics = () => (
  <Section id="analytics">
    <Container>
      <div className="grid lg:grid-cols-2 items-center gap-16">
        <Reveal>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal-accent/10 via-primary-green/5 to-transparent blur-2xl" />
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-main-text/5 ring-1 ring-black/[0.03] transition-transform duration-500 hover:-translate-y-1">
              <div className="flex items-center gap-1.5 border-b border-border bg-main-bg/70 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary-green/70" />
                <span className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary-text">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-green" />
                  jejak.app/analytics
                </span>
              </div>
              <img
                src="/jejak%20analysis.png"
                alt="JEJAK analytics"
                className="w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeader
            eyebrow={
              <>
                Operational <span className="text-primary-green">analytics</span>
              </>
            }
            title="See how your plant really runs."
            subtitle="JEJAK highlights where energy is used, where carbon is emitted, and where there is room to improve."
          />

          <div className="space-y-4 mt-8">
            {protocolsData.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="bg-soft-mint p-3 rounded-full shrink-0">
                    <Icon className="w-6 h-6 text-primary-green" />
                  </div>
                  <div>
                    <h4 className="text-18 font-medium text-main-text">{item.title}</h4>
                    <p className="text-secondary-text text-16 mt-1">{item.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </Container>
  </Section>
)

const Upgrade = () => (
  <Section id="upgrade">
    <Container>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <SectionHeader
            eyebrow={<span className="text-primary-green">Upgrade</span>}
            title="Turn your data into an advantage."
            subtitle="Move from manual tracking and guesswork to a single, reliable operational view."
          />
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {upgradeData.map((item) => (
              <div
                key={item}
                className="flex gap-3 items-center rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-primary-green shrink-0" />
                <h4 className="text-16 font-medium text-main-text">{item}</h4>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-3xl bg-gradient-to-br from-soft-mint/70 to-transparent p-6">
            <img
              src="/images/upgrade/img-upgrade.png"
              alt="JEJAK upgrade"
              className="w-full max-h-[440px] object-contain"
            />
          </div>
        </Reveal>
      </div>
    </Container>
  </Section>
)

const Perks = () => (
  <Section>
    <Container className="text-center">
      <SectionHeader
        align="center"
        eyebrow={
          <>
            Always by <span className="text-primary-green">your side</span>
          </>
        }
        title={
          <>
            Built to keep your operations <span className="text-primary-green">clear</span>.
          </>
        }
      />
      <div className="mt-14 grid lg:grid-cols-3 sm:grid-cols-1 gap-6">
        {perksData.map((item, i) => {
          const Icon = item.icon
          return (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-border bg-surface p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center flex flex-col items-center">
                <div className="bg-soft-mint p-4 rounded-full w-fit">
                  <Icon className="w-7 h-7 text-primary-green" />
                </div>
                <h4 className="text-main-text text-28 mb-3 mt-5 font-medium">{item.title}</h4>
                <p className="text-secondary-text text-18">{item.text}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Container>
  </Section>
)

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <SectionHeader
          align="center"
          className="mb-12"
          eyebrow={
            <>
              Questions, <span className="text-primary-green">answered</span>
            </>
          }
          title="Frequently asked"
        />
        <div className="space-y-4">
          {faqData.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={item.q} className="border border-border rounded-2xl bg-surface overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="text-18 font-medium text-main-text">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary-green shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p id={`faq-panel-${i}`} className="px-6 pb-5 text-secondary-text text-16">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

const FinalCta = () => (
  <section className="pb-28">
    <Container>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-green to-deep-teal rounded-3xl px-8 sm:px-16 py-16 text-center shadow-lg">
        <div className="pointer-events-none absolute -left-16 -top-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <h2 className="text-white sm:text-40 text-30 font-semibold mb-4">
            Ready to make every watt count?
          </h2>
          <p className="text-white/80 text-18 mb-8 max-w-xl mx-auto">
            Explore the JEJAK dashboard — no setup required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-primary-green py-3 px-7 rounded-lg sm:text-21 text-18 font-medium hover:bg-deep-teal hover:text-white transition-colors"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 border border-white/60 text-white py-3 px-7 rounded-lg sm:text-21 text-18 font-medium hover:bg-white hover:text-primary-green transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </Container>
  </section>
)

const Footer = () => (
  <footer className="pt-16 bg-darkmode font-dmsans">
    <Container>
      <div className="grid grid-cols-1 sm:grid-cols-12 lg:gap-20 md:gap-6 gap-10 pb-16">
        <div className="lg:col-span-4 md:col-span-6 col-span-12">
          <Brand dark />
          <p className="text-muted/70 text-18 mt-5">
            Industrial energy &amp; carbon intelligence.
          </p>
          <div className="flex gap-4 items-center mt-8">
            {[
              { label: 'LinkedIn', path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z' },
              { label: 'X', path: 'M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L6 22H2.9l7.5-8.6L2.5 2h6.6l4.5 6.6zM17.7 20h1.7L7.4 3.8H5.6z' },
              { label: 'Facebook', path: 'M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.25-1.5 1.5-1.5H17V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8z' },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white hover:bg-primary-green hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
          <h3 className="text-white/70 text-16 font-medium mt-12">© 2026 JEJAK</h3>
        </div>

        <div className="lg:col-span-2 md:col-span-3 col-span-6">
          <h4 className="text-white mb-4 font-medium text-24">Platform</h4>
          <ul>
            {navItems.map((item) => (
              <li key={item.label} className="pb-4">
                <a href={item.href} className="text-white/80 hover:text-primary-green transition-colors text-17">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 md:col-span-3 col-span-6">
          <h4 className="text-white mb-4 font-medium text-24">Dashboard</h4>
          <ul>
            {[
              { label: 'Overview', to: '/dashboard' },
              { label: 'Energy', to: '/dashboard/energy' },
              { label: 'Carbon', to: '/dashboard/carbon' },
              { label: 'Insights', to: '/dashboard/insights' },
              { label: 'Reports', to: '/dashboard/reports' },
            ].map((item) => (
              <li key={item.label} className="pb-4">
                <Link to={item.to} className="text-white/80 hover:text-primary-green transition-colors text-17">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4 md:col-span-12 col-span-12">
          <h3 className="text-white text-24 font-medium">Subscribe</h3>
          <p className="text-muted/70 text-18 mt-5">Get product updates from JEJAK</p>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter Email"
              className="bg-transparent border border-dark_border/50 py-4 text-white rounded-lg w-full mt-6 pl-6 pr-12 placeholder:text-white/40 focus:border-primary-green focus:outline-none"
            />
            <Send className="w-6 h-6 text-primary-green absolute right-6 bottom-3.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </Container>
  </footer>
)

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="font-dmsans bg-main-bg text-main-text min-h-screen">
      <Header />
      <main>
        <Hero />
        <Work />
        <Timeline />
        <Platform />
        <Analytics />
        <Upgrade />
        <Perks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
