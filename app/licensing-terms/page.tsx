import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Crown, Users, Check, X, FileText, Scale, Shield, Download } from "lucide-react"

export const metadata: Metadata = {
  title: "Licensing Terms & Conditions | n3uralia360.art",
  description:
    "Comprehensive licensing terms and conditions for n3uralia360.art. Understand what you get with each license type - Non-Exclusive and Exclusive rights.",
  openGraph: {
    title: "Licensing Terms & Conditions | n3uralia360.art",
    description: "Detailed licensing information for AI-generated 360° photography from the n3uralia group",
    url: "https://n3uralia360.art/licensing-terms",
  },
}

export default function LicensingTermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Licensing Terms & Conditions</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Part of the <span className="font-semibold text-foreground">n3uralia group</span> - Ultra high-quality
            platform content
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: January 2025</p>
        </div>

        {/* Quick Comparison */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick License Comparison
            </CardTitle>
            <CardDescription>Choose the license that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Non-Exclusive License */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">Non-Exclusive License</CardTitle>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">1x Base Price</Badge>
                  </div>
                  <CardDescription>Standard commercial and personal use</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Full commercial use rights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Personal use rights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited reproductions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">One-time resale to final customer allowed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Image remains in marketplace</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Others can purchase same image</span>
                  </div>
                </CardContent>
              </Card>

              {/* Exclusive License */}
              <Card className="border-2 border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-xl">Exclusive License</CardTitle>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">3x Base Price</Badge>
                  </div>
                  <CardDescription>Exclusive rights with marketplace removal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Full commercial use rights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Personal use rights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited reproductions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Resale and redistribution rights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Full modification and derivative rights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Image removed from marketplace</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold">Exclusive ownership rights</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Terms */}
        <div className="space-y-6">
          {/* Section 1: Grant of Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                1. Grant of Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1.1 Non-Exclusive License</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upon purchase of a Non-Exclusive License, n3uralia360.art (part of the n3uralia group) grants you a
                  perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute
                  the licensed image for both commercial and personal purposes. The image will remain available in our
                  marketplace for other customers to purchase.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-semibold">
                  Limited Resale: Non-Exclusive licenses allow ONE resale to a final customer. The final customer may
                  use and display the image for their purposes but cannot resell, redistribute, or sublicense it
                  further, and receives no exclusive rights.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.2 Exclusive License</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upon purchase of an Exclusive License, n3uralia360.art grants you a perpetual, worldwide, exclusive,
                  royalty-free license to use, reproduce, modify, and distribute the licensed image. The image will be
                  permanently removed from our marketplace within 24 hours of purchase confirmation, and no other
                  licenses will be granted to any third parties. You become the sole licensee with exclusive commercial
                  rights to the image.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-semibold">
                  Exclusive License Benefits: With an Exclusive License, you CAN resell, redistribute, sublicense, and
                  create derivative works from the image. You have full commercial control including the right to modify
                  and monetize the content as you see fit.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Permitted Uses */}
          <Card>
            <CardHeader>
              <CardTitle>2. Permitted Uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-base">2.1 Both License Types Include:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Commercial Use:</strong> Advertising, marketing materials, websites, social media, product
                      packaging, presentations, and any commercial projects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Editorial Use:</strong> Magazines, newspapers, blogs, books, and editorial publications
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Digital Products:</strong> Websites, mobile apps, software interfaces, digital
                      presentations, and online content
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Print Products:</strong> Brochures, flyers, posters, business cards, and other printed
                      materials
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Modifications:</strong> You may modify, crop, resize, and edit the images to suit your
                      needs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Unlimited Reproductions:</strong> No limit on the number of times you can use or reproduce
                      the image
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 text-base">2.2 Exclusive License Additional Rights:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Resale Rights:</strong> You may resell the image or modified versions to third parties
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Redistribution Rights:</strong> You may redistribute the image through any channels
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Sublicensing Rights:</strong> You may grant sublicenses to others for use of the image
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Derivative Works:</strong> Full rights to create and monetize derivative works based on
                      the image
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>3. Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-base">3.1 Non-Exclusive License Restrictions:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Limited Resale:</strong> You may resale the image ONE time to a final customer. The final
                      customer may use and display the image for their purposes but cannot resell, redistribute, or
                      sublicense it further, and receives no exclusive rights.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No Standalone Distribution:</strong> Images cannot be distributed as standalone files or
                      in a way that allows extraction
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No Trademark Use:</strong> Images cannot be used as trademarks, service marks, or logos
                      without explicit written permission
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No Defamatory Use:</strong> Images cannot be used in a defamatory, pornographic, or
                      unlawful manner
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No False Representation:</strong> You may not claim authorship or ownership of the
                      original AI-generated content
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 text-base">3.2 Exclusive License Restrictions:</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Exclusive licenses have significantly fewer restrictions. You have full commercial control including
                  resale and redistribution rights. The following restrictions still apply:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No Defamatory Use:</strong> Images cannot be used in a defamatory, pornographic, or
                      unlawful manner
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No False Representation:</strong> You may not claim to have created the original
                      AI-generation technology or algorithms
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Delivery & Downloads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                4. Delivery & Downloads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">4.1 File Delivery</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upon successful payment, you will receive immediate access to download your licensed images in full
                  resolution. Download links are available in your account dashboard under "My Downloads" and are valid
                  indefinitely.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.2 File Formats</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Images are delivered in high-resolution formats suitable for both digital and print use. All images
                  are AI-generated 360° photography created using advanced mathematical algorithms developed by the
                  n3uralia group.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.3 Re-downloads</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You may re-download your purchased images at any time from your account dashboard at no additional
                  cost. We recommend keeping backup copies of your licensed files.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Pricing & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>5. Pricing & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">5.1 License Pricing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • <strong>Non-Exclusive License:</strong> 1x the base image price
                  </li>
                  <li>
                    • <strong>Exclusive License:</strong> 3x the base image price
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.2 Payment Terms</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All payments are processed securely through our payment provider. Prices are displayed in USD. All
                  sales are final once the download has been accessed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property & AI-Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">6.1 AI-Generated Content</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All images on n3uralia360.art are generated using proprietary AI algorithms developed by the n3uralia
                  group. These algorithms transform mathematical noise into ultra high-quality 360° photography through
                  advanced diffusion models, flow-based transformations, and neural network architectures.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.2 Ownership</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  n3uralia360.art retains all rights, title, and interest in the AI generation technology and
                  algorithms. Upon purchase, you receive the license rights as specified in your chosen license type,
                  but not ownership of the underlying technology or original generation process.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.3 Attribution</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Attribution is not required but appreciated. If you choose to provide attribution, please credit
                  "n3uralia360.art - Part of the n3uralia group" with a link to our website when possible.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Warranties & Liability */}
          <Card>
            <CardHeader>
              <CardTitle>7. Warranties & Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">7.1 Content Warranty</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  n3uralia360.art warrants that it has the right to license the images and that the images do not
                  infringe upon any third-party rights. All content is AI-generated and does not depict real people,
                  places, or copyrighted works.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">7.2 Limitation of Liability</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  n3uralia360.art's total liability shall not exceed the amount paid for the license. We are not liable
                  for any indirect, incidental, or consequential damages arising from the use of licensed images.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Termination */}
          <Card>
            <CardHeader>
              <CardTitle>8. Termination & Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">8.1 License Perpetuity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Both Non-Exclusive and Exclusive licenses are perpetual and do not expire. Once purchased, your
                  license rights continue indefinitely, even if you cancel your account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">8.2 Refund Policy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Due to the digital nature of our products, all sales are final once the download has been accessed. If
                  you experience technical issues with your download, please contact our support team for assistance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law & Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These licensing terms are governed by and construed in accordance with applicable international
                copyright and intellectual property laws. Any disputes arising from these terms shall be resolved
                through binding arbitration. By purchasing a license, you agree to these terms and conditions in their
                entirety.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Questions About Licensing?</CardTitle>
              <CardDescription>Our team is here to help you choose the right license</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you have questions about which license is right for your project, or need clarification on any of
                these terms, please don't hesitate to contact us.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/licensing-contract">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    View Contract Template
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button>Contact Support</Button>
                </Link>
                <Link href="/browse">
                  <Button variant="outline">Browse Images</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            n3uralia360.art is part of the n3uralia group - Pioneering ultra high-quality AI-generated content through
            advanced mathematical algorithms and neural network architectures. All images are generated using
            proprietary diffusion models and flow-based transformations developed by our research team.
          </p>
        </div>
      </div>
    </div>
  )
}
