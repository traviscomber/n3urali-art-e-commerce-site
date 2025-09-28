import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Clock, MapPin, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact N3urali.art - Get Professional 360° Photography Solutions",
  description:
    "Contact N3urali.art for custom 360° imagery projects, enterprise solutions, technical support, and partnership opportunities. Professional AI-generated immersive photography for VR, projection mapping, and visualization.",
  keywords: [
    "contact n3urali.art",
    "360 photography support",
    "custom VR imagery projects",
    "enterprise immersive solutions",
    "professional 360 photography help",
    "AI photography consultation",
    "projection mapping imagery support",
    "architectural visualization contact",
  ],
  openGraph: {
    title: "Contact N3urali.art - Get Professional 360° Photography Solutions",
    description:
      "Contact N3urali.art for custom 360° imagery projects, enterprise solutions, and professional support.",
    type: "website",
    url: "https://www.n3uralia360.art/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact N3urali.art - Get Professional 360° Photography Solutions",
    description:
      "Contact N3urali.art for custom 360° imagery projects, enterprise solutions, and professional support.",
  },
  alternates: {
    canonical: "https://www.n3uralia360.art/contact",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              Contact Us
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Let's Create Something
              <span className="text-primary"> Amazing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Have questions about our services or need custom imagery solutions? We'd love to hear from you and help
              bring your immersive vision to life.
            </p>
          </div>

          {/* Quick Contact Info */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Quick Contact
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">How to Reach N3urali.art</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Response</h3>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM PST</p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Global Service</h3>
                  <p className="text-sm text-muted-foreground">Worldwide clients</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    {/* Updated email domain to www.n3uralia360.art */}
                    <p className="text-muted-foreground">hello@n3uralia360.art</p>
                    <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                    <p className="text-sm text-muted-foreground">Weekend support available for urgent requests</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">San Francisco, CA</p>
                    <p className="text-sm text-muted-foreground">Serving clients worldwide</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-3">What can we help you with?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Custom 360° imagery projects</li>
                  <li>Bulk licensing and enterprise solutions</li>
                  <li>Technical support and integration</li>
                  <li>Partnership opportunities</li>
                  <li>General questions about our services</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="custom">Custom Project</option>
                      <option value="enterprise">Enterprise Solutions</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder="Tell us about your project or question..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
                <Badge variant="secondary">Contact FAQ</Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
                Common Questions About
                <span className="text-primary block">Getting Started</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Quick answers to help you understand our process and how we can help with your project.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="response-time" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How quickly does N3urali.art respond to inquiries?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We respond to all inquiries within 24 hours during business days (Monday-Friday, 9AM-6PM PST). For
                  urgent requests or weekend inquiries, we offer expedited support. Custom project consultations are
                  typically scheduled within 48 hours of initial contact, and we provide detailed project timelines and
                  specifications during our first conversation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="custom-projects" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What information should I include when requesting a custom project?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  For custom projects, please include: your project's purpose (VR, projection mapping, etc.), desired
                  resolution and format specifications, timeline requirements, any specific visual themes or
                  environments needed, and your budget range. The more details you provide, the better we can tailor our
                  proposal to meet your exact needs and provide accurate pricing and delivery estimates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="enterprise-solutions" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Does N3urali.art offer enterprise or bulk licensing solutions?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, we offer comprehensive enterprise solutions including bulk licensing, custom content creation,
                  and ongoing support packages. Enterprise clients receive dedicated account management, priority
                  support, custom licensing terms, and volume discounts. We work with businesses of all sizes, from
                  small creative agencies to large corporations requiring extensive 360° content libraries.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-support" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What kind of technical support does N3urali.art provide?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We provide comprehensive technical support including integration guidance for VR platforms, projection
                  mapping setup assistance, format conversion help, and troubleshooting for implementation issues. Our
                  team can help with software compatibility questions, optimal resolution selection for your specific
                  use case, and best practices for displaying 360° content across different platforms and devices.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="partnership-opportunities" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What partnership opportunities are available with N3urali.art?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We offer various partnership opportunities including reseller programs for agencies and consultants,
                  integration partnerships with VR/AR platforms, collaborative content creation with other creative
                  professionals, and white-label solutions for companies wanting to offer 360° imagery under their own
                  brand. Contact us to discuss how we can work together to serve your clients' immersive content needs.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  )
}
