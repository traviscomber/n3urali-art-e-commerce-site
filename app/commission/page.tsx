import type { Metadata } from "next"
import { CommissionHeroBlock } from "@/components/commission-hero-block-page"
import { CommissionTypesBlock } from "@/components/commission-types-block"
import { CommissionProcessBlock } from "@/components/commission-process-block"
import { CommissionPricingBlock } from "@/components/commission-pricing-block"
import { ContactFormBlock } from "@/components/contact-form-block"

export const metadata: Metadata = {
  title: "Commission Custom Immersive Works - N3uralia360",
  description: "Commission custom immersive experiences from N3uralia360. Dome installations, VR environments, performance loops, and spatial media for museums, institutions, and brands.",
}

export default function CommissionPage() {
  const commissionTypes = [
    {
      icon: "🏛️",
      title: "Dome Installation",
      description: "Full-dome immersive experiences for planetariums, museums, and cultural venues.",
    },
    {
      icon: "🥽",
      title: "VR Experience",
      description: "Room-scale and headset-based VR environments for interactive storytelling.",
    },
    {
      icon: "🎬",
      title: "Performance Loop",
      description: "Seamless atmospheric loops optimized for live venue integration.",
    },
    {
      icon: "🎨",
      title: "Custom Format",
      description: "Tailored solutions for unique spatial and technical requirements.",
    },
  ]

  const processSteps = [
    {
      number: 1,
      title: "Discovery",
      description: "We understand your vision, venue, audience, and cultural context.",
    },
    {
      number: 2,
      title: "Research",
      description: "Deep cultural research and collaborative planning with stakeholders.",
    },
    {
      number: 3,
      title: "Design",
      description: "Creative direction, visual language development, and technical specification.",
    },
    {
      number: 4,
      title: "Production",
      description: "Creation, iteration, and refinement of the immersive experience.",
    },
    {
      number: 5,
      title: "Delivery",
      description: "Final files, technical support, and venue integration assistance.",
    },
  ]

  const pricingTiers = [
    {
      name: "Emerging",
      price: "Starting at $15k",
      description: "Perfect for smaller venues and experimental projects",
      features: [
        "Single format delivery",
        "Up to 3 revisions",
        "Technical consultation",
        "3-month timeline",
      ],
    },
    {
      name: "Professional",
      price: "Starting at $50k",
      description: "Ideal for museums and cultural institutions",
      features: [
        "Multiple format delivery",
        "Unlimited revisions",
        "Full technical support",
        "4-6 month timeline",
        "Marketing assets",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom Quote",
      description: "Large-scale projects and multi-venue installations",
      features: [
        "Complete customization",
        "Dedicated project team",
        "On-site support",
        "Extended timeline",
        "Training & documentation",
      ],
    },
  ]

  return (
    <main className="min-h-screen w-full bg-background">
      <CommissionHeroBlock
        title="Commission Custom Immersive Experiences"
        subtitle="Transform your vision into immersive reality. We create experiences for museums, planetariums, cultural institutions, and brands worldwide."
      />

      <CommissionTypesBlock types={commissionTypes} />

      <CommissionProcessBlock steps={processSteps} />

      <CommissionPricingBlock tiers={pricingTiers} />

      <div className="border-t border-gray-800">
        <ContactFormBlock />
      </div>
    </main>
  )
}
          briefDescription: '',
          venue: '',
          targetAudience: '',
          budget: '',
          timeline: '',
        })
      }
    } catch (error) {
      console.error('Failed to submit commission:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Commission an Immersive Work</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Tell us about your vision. We'll create an immersive experience uniquely suited to your venue and audience.
          </p>
        </div>

        {submitted ? (
          <Card className="p-8 text-center bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              We've received your commission inquiry. Our team will review your brief and contact you within 48 hours to discuss your project.
            </p>
            <Button onClick={() => setSubmitted(false)}>Submit Another Inquiry</Button>
          </Card>
        ) : (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization */}
              <div>
                <Label htmlFor="organization">Organization / Institution</Label>
                <Input
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Your organization name"
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Brief Description */}
              <div>
                <Label htmlFor="briefDescription">Project Brief</Label>
                <textarea
                  id="briefDescription"
                  name="briefDescription"
                  value={formData.briefDescription}
                  onChange={handleChange}
                  placeholder="Describe your vision, cultural inspiration, and goals for this immersive work..."
                  className="w-full p-3 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={5}
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <Label htmlFor="venue">Intended Venue / Format</Label>
                <select
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  required
                >
                  <option value="">Select venue type...</option>
                  <option value="planetarium">Planetarium / Dome Theater</option>
                  <option value="vr">VR Installation</option>
                  <option value="museum">Museum Exhibition</option>
                  <option value="cultural-center">Cultural Center</option>
                  <option value="performance">Live Performance Venue</option>
                  <option value="broadcast">Broadcast / Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  required
                >
                  <option value="">Select audience...</option>
                  <option value="all-ages">All Ages</option>
                  <option value="children">Children</option>
                  <option value="adults">Adults</option>
                  <option value="institutional">Institutional / Professional</option>
                </select>
              </div>

              {/* Budget & Timeline */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select budget...</option>
                    <option value="under-50k">Under $50K</option>
                    <option value="50k-100k">$50K - $100K</option>
                    <option value="100k-250k">$100K - $250K</option>
                    <option value="250k-plus">$250K+</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select timeline...</option>
                    <option value="3-months">3 Months</option>
                    <option value="6-months">6 Months</option>
                    <option value="12-months">12 Months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Commission Request'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                We'll review your brief and respond within 48 hours with next steps and a custom proposal.
              </p>
            </form>
          </Card>
        )}
      </div>
    </main>
  )
}
