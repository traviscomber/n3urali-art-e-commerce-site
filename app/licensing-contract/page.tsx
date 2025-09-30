import type { Metadata } from "next"
import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DownloadContractPDF } from "@/components/download-contract-pdf"
import "./print-styles.css"

export const metadata: Metadata = {
  title: "Licensing Contract Template | n3uralia360.art",
  description: "Official licensing contract template for n3uralia360.art image purchases",
}

export default function LicensingContractPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/licensing-terms"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Licensing Terms
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Licensing Contract Template</h1>
              <p className="text-muted-foreground">Official agreement template for n3uralia360.art image licensing</p>
            </div>
            <DownloadContractPDF />
          </div>
        </div>

        {/* Contract Document */}
        <Card className="p-8 md:p-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* Header */}
            <div className="text-center mb-12 pb-8 border-b border-gray-300 dark:border-gray-700">
              <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">IMAGE LICENSING AGREEMENT</h2>
              <p className="text-gray-600 dark:text-gray-400">n3uralia360.art - Part of n3uralia Group</p>
            </div>

            {/* Agreement Details */}
            <div className="space-y-8">
              {/* Parties */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  PARTIES TO THIS AGREEMENT
                </h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Licensor:</p>
                    <p className="text-gray-800 dark:text-gray-200">n3uralia360.art</p>
                    <p className="text-gray-800 dark:text-gray-200">Part of n3uralia Group</p>
                    <p className="text-gray-800 dark:text-gray-200">Website: https://n3uralia360.art</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Licensee:</p>
                    <p className="text-gray-800 dark:text-gray-200">[Customer Name]</p>
                    <p className="text-gray-800 dark:text-gray-200">[Customer Email]</p>
                    <p className="text-gray-800 dark:text-gray-200">[Customer Address]</p>
                  </div>
                </div>
              </section>

              {/* License Details */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">LICENSE DETAILS</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Order Number:</span> [ORDER-XXXXX]
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Purchase Date:</span> [Date]
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">License Type:</span> [Non-Exclusive
                    / Exclusive]
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Image ID:</span> [IMAGE-ID]
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Image Title:</span> [Image Title]
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">License Fee:</span> $[Amount] USD
                  </p>
                </div>
              </section>

              {/* Terms and Conditions */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">1. GRANT OF RIGHTS</h3>

                <div className="ml-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">1.1 Non-Exclusive License</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      (Applicable if "Non-Exclusive" is selected above)
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      The Licensor grants the Licensee a non-exclusive, worldwide, perpetual license to use the licensed
                      image(s) for the purposes outlined in this agreement. The Licensor retains the right to license
                      the same image(s) to other parties.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">1.2 Exclusive License</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      (Applicable if "Exclusive" is selected above)
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      The Licensor grants the Licensee an exclusive, worldwide, perpetual license with full rights to
                      the licensed image(s). The Licensor will not license the same image(s) to any other party and
                      removes the image from public sale. The Licensee receives complete ownership rights including
                      resale, modification, and sublicensing.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">2. PERMITTED USES</h3>

                <div className="ml-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      2.1 Non-Exclusive License - Permitted Uses
                    </h4>
                    <ul className="list-disc ml-6 space-y-1 text-gray-800 dark:text-gray-200">
                      <li>Commercial and personal projects</li>
                      <li>Digital and print media</li>
                      <li>Marketing materials, websites, and social media</li>
                      <li>Product packaging and merchandise</li>
                      <li>Editorial and educational content</li>
                      <li>Presentations and reports</li>
                      <li>Unlimited reproductions within your organization</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      2.2 Exclusive License - Permitted Uses
                    </h4>
                    <p className="mb-2 text-gray-800 dark:text-gray-200">
                      All uses permitted under Non-Exclusive License, PLUS:
                    </p>
                    <ul className="list-disc ml-6 space-y-1 text-gray-800 dark:text-gray-200">
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Resale Rights:</strong> Right to resell the
                        original or modified images
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Redistribution:</strong> Right to
                        redistribute to third parties
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Sublicensing:</strong> Right to grant
                        sublicenses to others
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Derivative Works:</strong> Right to create
                        and sell derivative works
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Modification:</strong> Unlimited
                        modification and adaptation rights
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Transfer:</strong> Right to transfer
                        ownership to another party
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">3. RESTRICTIONS</h3>

                <div className="ml-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      3.1 Non-Exclusive License - Restrictions
                    </h4>
                    <ul className="list-disc ml-6 space-y-1 text-gray-800 dark:text-gray-200">
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">No Resale:</strong> You may NOT resell,
                        redistribute, or sublicense the original image files
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">No Standalone Distribution:</strong> Images
                        cannot be distributed as standalone digital products
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">No Stock Photography:</strong> Cannot be
                        used in stock photo libraries or similar services
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">No Trademark:</strong> Cannot be used as a
                        trademark or service mark
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">No Defamatory Use:</strong> Cannot be used
                        in defamatory, pornographic, or illegal contexts
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      3.2 Exclusive License - Restrictions
                    </h4>
                    <ul className="list-disc ml-6 space-y-1 text-gray-800 dark:text-gray-200">
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">No Defamatory Use:</strong> Cannot be used
                        in defamatory, pornographic, or illegal contexts
                      </li>
                      <li>
                        <strong className="text-gray-900 dark:text-gray-100">Attribution Appreciated:</strong> While not
                        required, attribution to n3uralia360.art is appreciated
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Note: Exclusive License holders have full resale, modification, and redistribution rights.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  4. INTELLECTUAL PROPERTY
                </h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">4.1</strong> The licensed images are generated
                    using proprietary mathematical algorithms and AI technology developed by n3uralia Group.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">4.2</strong> For Non-Exclusive Licenses, the
                    Licensor retains all copyright and intellectual property rights to the original images.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">4.3</strong> For Exclusive Licenses, the
                    Licensee receives full ownership rights and the Licensor transfers all commercial rights to the
                    Licensee.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">4.4</strong> The Licensee acknowledges that the
                    images are created using advanced diffusion models, normalizing flows, and attention mechanisms as
                    described in our technical documentation.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  5. DELIVERY AND TECHNICAL SPECIFICATIONS
                </h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">5.1</strong> Images are delivered in
                    high-resolution format (minimum 4K resolution) via secure download.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">5.2</strong> File formats include: JPEG, PNG,
                    and where applicable, 360° panoramic formats.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">5.3</strong> Downloads are available
                    immediately upon payment confirmation through the Licensee's account.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">5.4</strong> The Licensee is responsible for
                    backing up downloaded files.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">6. PAYMENT TERMS</h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">6.1</strong> Payment is due in full at the time
                    of purchase.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">6.2</strong> All prices are in USD and
                    processed securely through our payment provider.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">6.3</strong> License activation occurs
                    immediately upon successful payment.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">6.4</strong> Refunds are subject to our refund
                    policy available at n3uralia360.art/refund-policy.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  7. WARRANTIES AND DISCLAIMERS
                </h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">7.1</strong> The Licensor warrants that it has
                    the right to grant the licenses described herein.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">7.2</strong> Images are provided "AS IS"
                    without warranty of any kind, express or implied.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">7.3</strong> The Licensor does not warrant that
                    the images will meet the Licensee's specific requirements.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">7.4</strong> The Licensor is not liable for any
                    indirect, incidental, or consequential damages arising from the use of the licensed images.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">8. INDEMNIFICATION</h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">8.1</strong> The Licensee agrees to indemnify
                    and hold harmless the Licensor from any claims arising from the Licensee's use of the licensed
                    images.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">8.2</strong> This indemnification includes
                    legal fees and costs associated with defending such claims.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">9. TERM AND TERMINATION</h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">9.1</strong> This license is perpetual and does
                    not expire.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">9.2</strong> The Licensor may terminate this
                    agreement if the Licensee breaches any terms.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">9.3</strong> Upon termination of a
                    Non-Exclusive License, the Licensee must cease all use of the images.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">9.4</strong> Exclusive Licenses cannot be
                    terminated except in cases of illegal use.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">10. GENERAL PROVISIONS</h3>
                <div className="ml-4 space-y-2 text-gray-800 dark:text-gray-200">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">10.1 Governing Law:</strong> This agreement is
                    governed by the laws of [Jurisdiction].
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">10.2 Entire Agreement:</strong> This agreement
                    constitutes the entire agreement between the parties.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">10.3 Amendments:</strong> Any amendments must
                    be made in writing and signed by both parties.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">10.4 Severability:</strong> If any provision is
                    found invalid, the remaining provisions remain in effect.
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">10.5 Assignment:</strong> Non-Exclusive
                    Licenses may not be assigned without written consent. Exclusive Licenses may be freely assigned or
                    transferred.
                  </p>
                </div>
              </section>

              {/* Signatures */}
              <section className="signature-section mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">SIGNATURES</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="font-semibold mb-4 text-gray-900 dark:text-gray-100">LICENSOR</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Signature:</p>
                        <div className="border-b border-gray-400 dark:border-gray-600 pb-2">
                          <p className="font-serif italic text-gray-900 dark:text-gray-100">n3uralia360.art</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Date:</p>
                        <div className="border-b border-gray-400 dark:border-gray-600 pb-2 text-gray-800 dark:text-gray-200">
                          [Date]
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-4 text-gray-900 dark:text-gray-100">LICENSEE</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Signature:</p>
                        <div className="border-b border-gray-400 dark:border-gray-600 pb-2 h-8"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Printed Name:</p>
                        <div className="border-b border-gray-400 dark:border-gray-600 pb-2 text-gray-800 dark:text-gray-200">
                          [Customer Name]
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Date:</p>
                        <div className="border-b border-gray-400 dark:border-gray-600 pb-2 text-gray-800 dark:text-gray-200">
                          [Date]
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer Note */}
              <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2">
                  <strong className="text-gray-900 dark:text-gray-100">Note:</strong> This contract is automatically
                  generated upon purchase and is legally binding. A copy is sent to your email and available in your
                  account dashboard.
                </p>
                <p>For questions about this agreement, please contact us at legal@n3uralia360.art</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/licensing-terms">View Licensing Terms</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Legal Team</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
