import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Lightbulb, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "About n3uralia360.art - AI-Powered 360° Photography Pioneers",
  description:
    "Learn how n3uralia360.art revolutionizes immersive imagery with AI-generated 360° photography. Part of the n3uralia group, discover our mission, technology, and commitment to professional-grade visual content for VR, projection mapping, and architectural visualization.",
  keywords: [
    "about n3uralia360.art",
    "n3uralia group",
    "AI photography company",
    "360 degree photography pioneers",
    "immersive imagery technology",
    "professional VR content creation",
    "who creates 360 images",
    "AI generated photography company",
    "equirectangular image specialists",
  ],
  openGraph: {
    title: "About n3uralia360.art - AI-Powered 360° Photography Pioneers",
    description:
      "Learn how n3uralia360.art revolutionizes immersive imagery with AI-generated 360° photography for professional applications. Part of the n3uralia group.",
    type: "website",
    url: "https://www.n3uralia360.art/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About n3uralia360.art - AI-Powered 360° Photography Pioneers",
    description:
      "Learn how n3uralia360.art revolutionizes immersive imagery with AI-generated 360° photography for professional applications. Part of the n3uralia group.",
  },
  alternates: {
    canonical: "https://www.n3uralia360.art/about",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              About n3uralia360.art • Part of n3uralia Group
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Revolutionizing
              <span className="text-primary"> Visual Content</span>
              <br />
              for Professionals
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              We're pioneering the future of immersive imagery with cutting-edge AI technology and professional-grade
              360° content that transforms how people experience digital environments. As part of the innovative
              n3uralia group, we deliver supreme quality through advanced platform technology.
            </p>
          </div>

          {/* Key Takeaways Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Why Choose n3uralia360.art?
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
                What Makes Us Different in 360° Photography
              </h2>
              <p className="text-muted-foreground text-pretty">
                Backed by n3uralia group's innovation and excellence standards
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold">100% AI-Generated Content</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Unlike traditional photography companies, every image is created from scratch using proprietary AI
                    technology developed by the n3uralia group. This means unique scenes that don't exist anywhere else,
                    with perfect lighting and composition that would be impossible to capture naturally.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold">Professional-Grade Quality</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Our custom enhancement pipeline, powered by n3uralia group technology, transforms AI output into
                    professional imagery with 4K-16K resolution. Every image meets the demanding standards required for
                    commercial VR applications, projection mapping, and architectural visualization.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                At n3uralia360.art, part of the n3uralia group, we believe that immersive visual content should be
                accessible, high-quality, and professionally crafted. Our mission is to provide creators, architects,
                and businesses with the tools and content they need to bring their visions to life.
              </p>
              <p className="text-muted-foreground">
                Through advanced AI generation and enhancement techniques developed within the n3uralia group ecosystem,
                we deliver unprecedented quality in 360° and fisheye imagery that meets the demanding standards of
                professional applications.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  High-resolution 360° equirectangular imagery
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Professional fisheye lens photography
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  AI-enhanced image quality and detail through n3uralia group technology
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Flexible licensing for commercial use
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Instant downloads and access
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Technology</h2>
            <p className="text-center text-muted-foreground mb-8">
              Powered by n3uralia group's innovative platform ecosystem
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced neural networks enhance image quality and detail through n3uralia group platforms
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Professional Capture</h3>
                <p className="text-sm text-muted-foreground">State-of-the-art equipment for pristine image capture</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Quality Assurance</h3>
                <p className="text-sm text-muted-foreground">
                  Rigorous testing ensures every image meets n3uralia group standards
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
                Learn More About Our
                <span className="text-primary block">Company & Process</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Common questions about n3uralia360.art, our technology, and how we create professional 360° imagery.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="company-background" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What is n3uralia360.art and how did the company start?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  n3uralia360.art is a pioneering company in AI-generated 360° photography, part of the innovative
                  n3uralia group. We were founded to bridge the gap between traditional photography limitations and the
                  growing demand for immersive visual content. We recognized that creating high-quality 360° imagery was
                  expensive, time-consuming, and often impossible for many creative scenarios. Our solution combines
                  cutting-edge AI generation with professional enhancement techniques developed within the n3uralia
                  group ecosystem to deliver unique, high-quality immersive imagery that meets professional standards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-vs-traditional" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How does AI-generated photography compare to traditional 360° photography?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  AI-generated photography offers several advantages over traditional methods: unlimited creative
                  possibilities without physical constraints, perfect lighting and composition control, unique scenes
                  that don't exist in reality, and consistent quality without weather or location dependencies. While
                  traditional photography captures real environments, our AI approach powered by n3uralia group
                  technology creates entirely new worlds with professional-grade quality, often exceeding what's
                  possible with conventional equipment and techniques.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality-standards" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What quality standards does n3uralia360.art maintain?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We maintain rigorous quality standards throughout our entire pipeline, backed by n3uralia group's
                  excellence standards. Every image undergoes professional enhancement to achieve 4K-16K resolution with
                  superior clarity, color accuracy, and detail. Our proprietary enhancement process ensures consistent
                  quality that meets the demanding requirements of commercial VR applications, projection mapping
                  installations, and architectural visualization projects. We test every image for technical
                  specifications and visual quality before making it available.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="custom-projects" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Does n3uralia360.art offer custom 360° imagery projects?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, we offer custom 360° imagery projects for clients with specific requirements. Our AI generation
                  capabilities, powered by n3uralia group technology, allow us to create unique environments,
                  architectural spaces, or artistic scenes tailored to your project needs. Custom projects include
                  consultation on technical specifications, multiple revision rounds, and delivery in your preferred
                  formats and resolutions. Contact us to discuss your specific requirements and timeline for custom
                  imagery solutions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technology-pipeline" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Can you explain n3uralia360.art's technology pipeline?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our technology pipeline consists of three main stages: AI generation using proprietary models trained
                  specifically for 360° imagery within the n3uralia group ecosystem, professional enhancement through
                  custom-built tools that improve resolution and quality, and quality assurance testing to ensure every
                  image meets our professional standards. Every tool in our pipeline is built from scratch by the
                  n3uralia group, giving us complete control over the creative process and final output quality. This
                  approach allows us to consistently deliver unique, high-quality imagery that exceeds traditional
                  photography limitations.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of professionals who trust n3uralia360.art and the n3uralia group for their immersive
              content needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Browse Gallery
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
